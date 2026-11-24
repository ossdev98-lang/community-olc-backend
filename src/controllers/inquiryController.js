const db = require('../models');
const { success, error } = require('../utils/responseHandler');
const { isExpired } = require('../services/expiryService');
const { getIO } = require('../sockets');
const { notifyNewInquiry } = require('../sockets/chatSocket');

async function attachParticipantShops(conversations) {
  const items = conversations.map((conversation) => conversation.toJSON());
  const participants = items.flatMap((conversation) => [conversation.owner, conversation.interestedUser]).filter(Boolean);
  const ids = [...new Set(participants.map((participant) => participant.id).filter(Boolean))];
  const emails = [...new Set(participants.map((participant) => participant.email).filter(Boolean))];
  if (!ids.length && !emails.length) return items;

  const shops = await db.Shop.findAll({
    where: {
      [db.Sequelize.Op.or]: [
        ...(ids.length ? [{ user_id: { [db.Sequelize.Op.in]: ids } }] : []),
        ...(emails.length ? [{ email: { [db.Sequelize.Op.in]: emails } }] : []),
      ],
    },
    attributes: ['id', 'user_id', 'email', 'shop_name', 'owner_name'],
  });
  const byUserId = new Map(shops.map((shop) => [String(shop.user_id), shop.toJSON()]));
  const byEmail = new Map(shops.filter((shop) => shop.email).map((shop) => [shop.email.toLowerCase(), shop.toJSON()]));
  const findShop = (participant) => byUserId.get(String(participant.id))
    || (participant.email ? byEmail.get(participant.email.toLowerCase()) : null)
    || null;

  return items.map((conversation) => ({
    ...conversation,
    owner: conversation.owner ? { ...conversation.owner, shop: findShop(conversation.owner) } : conversation.owner,
    interestedUser: conversation.interestedUser
      ? { ...conversation.interestedUser, shop: findShop(conversation.interestedUser) }
      : conversation.interestedUser,
  }));
}

async function createInquiry(req, res) {
  try {
    const requirementId = Number(req.body.requirementId);
    const interestedUser = req.user;

    const requirement = await db.Requirement.findByPk(requirementId);
    if (!requirement) return error(res, 'Requirement not found', 404);
    if (await isExpired(requirement)) return error(res, 'Requirement expired; inquiries disabled', 400);
    if (requirement.user_id === interestedUser.id) return error(res, 'Cannot inquire your own requirement', 400);

    const existing = await db.Conversation.findOne({
      where: { requirement_id: requirementId, interested_user_id: interestedUser.id },
    });
    if (existing) return success(res, 'Conversation already exists', { conversation: existing });

    const conversation = await db.sequelize.transaction(async (transaction) => {
      const createdConversation = await db.Conversation.create({
        requirement_id: Number(requirement.id),
        owner_user_id: Number(requirement.user_id),
        interested_user_id: Number(interestedUser.id),
        status: 'ACTIVE',
        last_message_at: new Date(),
      }, { transaction });

      await db.Notification.create({
        user_id: Number(requirement.user_id),
        type: 'new_inquiry',
        title: 'New Inquiry Received',
        message: `${interestedUser.name} responded to your requirement "${requirement.title}"`,
        related_id: Number(createdConversation.id),
        related_type: 'conversation',
      }, { transaction });

      return createdConversation;
    });

    const io = getIO();
    if (io) notifyNewInquiry(io, requirement.user_id, conversation, requirement);

    return success(res, 'Inquiry created', { conversation }, 201);
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      const details = (err.errors || []).map((item) => ({ field: item.path, message: item.message }));
      console.error('Inquiry validation failed:', details);
      return error(res, 'Invalid inquiry data', 400, details);
    }
    console.error('Failed to create inquiry:', err);
    return error(res, err.message || 'Failed to create inquiry', 500);
  }
}

async function listInquiries(req, res) {
  try {
    const user = req.user;
    const conversations = await db.Conversation.findAll({
      where: { [db.Sequelize.Op.or]: [{ owner_user_id: user.id }, { interested_user_id: user.id }] },
      order: [['last_message_at', 'DESC']],
      include: [
        { model: db.Requirement, as: 'requirement', attributes: ['id', 'shop_id', 'title', 'status', 'expires_at'] },
        { model: db.User, as: 'owner', attributes: ['id', 'name', 'email'] },
        { model: db.User, as: 'interestedUser', attributes: ['id', 'name', 'email'] },
        {
          model: db.Message, as: 'messages',
          order: [['created_at', 'DESC']],
          limit: 1,
        },
      ],
    });
    return success(res, 'Inquiries fetched', { conversations: await attachParticipantShops(conversations) });
  } catch (err) {
    return error(res, err.message || 'Failed to fetch inquiries', 500);
  }
}

async function getInquiry(req, res) {
  try {
    const user = req.user;
    const conversation = await db.Conversation.findByPk(req.params.id, {
      include: [
        { model: db.Requirement, as: 'requirement' },
        { model: db.User, as: 'owner', attributes: ['id', 'name', 'email'] },
        { model: db.User, as: 'interestedUser', attributes: ['id', 'name', 'email'] },
        { model: db.Message, as: 'messages', order: [['created_at', 'ASC']] },
        { model: db.Quotation, as: 'quotations', order: [['created_at', 'ASC']] },
        { model: db.ContactShare, as: 'contactShares' },
      ],
    });
    if (!conversation) return error(res, 'Conversation not found', 404);
    if (conversation.owner_user_id !== user.id && conversation.interested_user_id !== user.id) {
      return error(res, 'Not authorized', 403);
    }
    const [enrichedConversation] = await attachParticipantShops([conversation]);
    return success(res, 'Conversation fetched', { conversation: enrichedConversation });
  } catch (err) {
    return error(res, err.message || 'Failed to fetch conversation', 500);
  }
}

async function markRead(req, res) {
  try {
    const user = req.user;
    const conversation = await db.Conversation.findByPk(req.params.id);
    if (!conversation) return error(res, 'Conversation not found', 404);
    if (conversation.owner_user_id !== user.id && conversation.interested_user_id !== user.id) {
      return error(res, 'Not authorized', 403);
    }
    await db.Message.update({ is_read: true }, { where: { conversation_id: req.params.id, sender_user_id: { [db.Sequelize.Op.ne]: user.id } } });
    return success(res, 'Messages marked read');
  } catch (err) {
    return error(res, err.message || 'Failed to mark read', 500);
  }
}

async function closeInquiry(req, res) {
  try {
    const user = req.user;
    const conversation = await db.Conversation.findByPk(req.params.id);
    if (!conversation) return error(res, 'Conversation not found', 404);
    if (conversation.owner_user_id !== user.id && conversation.interested_user_id !== user.id) {
      return error(res, 'Not authorized', 403);
    }
    await conversation.update({ status: 'CLOSED' });
    return success(res, 'Conversation closed', { conversation });
  } catch (err) {
    return error(res, err.message || 'Failed to close conversation', 500);
  }
}

module.exports = {
  createInquiry, listInquiries, getInquiry, markRead, closeInquiry,
};

const db = require('../models');
const { success, error } = require('../utils/responseHandler');
const { isExpired } = require('../services/expiryService');

async function createInquiry(req, res) {
  try {
    const { requirementId } = req.body;
    const interestedUser = req.user;

    const requirement = await db.Requirement.findByPk(requirementId);
    if (!requirement) return error(res, 'Requirement not found', 404);
    if (await isExpired(requirement)) return error(res, 'Requirement expired; inquiries disabled', 400);
    if (requirement.user_id === interestedUser.id) return error(res, 'Cannot inquire your own requirement', 400);

    const existing = await db.Conversation.findOne({
      where: { requirement_id: requirementId, interested_user_id: interestedUser.id },
    });
    if (existing) return success(res, 'Conversation already exists', { conversation: existing });

    const conversation = await db.Conversation.create({
      requirement_id: requirementId,
      owner_user_id: requirement.user_id,
      interested_user_id: interestedUser.id,
      status: 'ACTIVE',
      last_message_at: new Date(),
    });

    await db.Notification.create({
      user_id: requirement.user_id,
      type: 'new_inquiry',
      title: 'New Inquiry Received',
      message: `${interestedUser.name} responded to your requirement "${requirement.title}"`,
      related_id: conversation.id,
      related_type: 'conversation',
    });

    return success(res, 'Inquiry created', { conversation }, 201);
  } catch (err) {
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
        { model: db.Requirement, as: 'requirement', attributes: ['id', 'title', 'status', 'expires_at'] },
        { model: db.User, as: 'owner', attributes: ['id', 'name', 'email'] },
        { model: db.User, as: 'interestedUser', attributes: ['id', 'name', 'email'] },
        {
          model: db.Message, as: 'messages',
          order: [['created_at', 'DESC']],
          limit: 1,
        },
      ],
    });
    return success(res, 'Inquiries fetched', { conversations });
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
    return success(res, 'Conversation fetched', { conversation });
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

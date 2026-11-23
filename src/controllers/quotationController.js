const db = require('../models');
const { success, error } = require('../utils/responseHandler');

async function sendQuotation(req, res) {
  try {
    const { conversationId } = req.params;
    const {
      productName, modelNumber, availableQuantity, price, condition, warranty, message,
    } = req.body;
    const user = req.user;

    const conversation = await db.Conversation.findByPk(conversationId);
    if (!conversation) return error(res, 'Conversation not found', 404);
    if (conversation.owner_user_id !== user.id && conversation.interested_user_id !== user.id) {
      return error(res, 'Not authorized', 403);
    }

    const quotation = await db.Quotation.create({
      conversation_id: conversationId,
      sender_user_id: user.id,
      product_name: productName,
      model_number: modelNumber || null,
      available_quantity: parseInt(availableQuantity, 10) || 0,
      price: price ? parseFloat(price) : null,
      condition: condition || null,
      warranty: warranty || null,
      message: message || null,
    });

    await conversation.update({ last_message_at: new Date() });

    await db.Message.create({
      conversation_id: conversationId,
      sender_user_id: user.id,
      message_type: 'QUOTATION',
      message_text: null,
      attachment_path: null,
      is_read: false,
    });

    const otherUserId = conversation.owner_user_id === user.id ? conversation.interested_user_id : conversation.owner_user_id;

    await db.Notification.create({
      user_id: otherUserId,
      type: 'new_quotation',
      title: 'New Quotation',
      message: `${user.name} sent a quotation for "${conversation.requirementTitle || 'your requirement'}"`,
      related_id: quotation.id,
      related_type: 'quotation',
    });

    const full = await db.Quotation.findByPk(quotation.id, {
      include: [{ model: db.User, as: 'sender', attributes: ['id', 'name', 'email'] }],
    });
    return success(res, 'Quotation sent', { quotation: full }, 201);
  } catch (err) {
    return error(res, err.message || 'Failed to send quotation', 500);
  }
}

async function listQuotations(req, res) {
  try {
    const { conversationId } = req.params;
    const user = req.user;
    const conversation = await db.Conversation.findByPk(conversationId);
    if (!conversation) return error(res, 'Conversation not found', 404);
    if (conversation.owner_user_id !== user.id && conversation.interested_user_id !== user.id) {
      return error(res, 'Not authorized', 403);
    }
    const quotations = await db.Quotation.findAll({
      where: { conversation_id: conversationId },
      order: [['created_at', 'ASC']],
      include: [{ model: db.User, as: 'sender', attributes: ['id', 'name', 'email'] }],
    });
    return success(res, 'Quotations fetched', { quotations });
  } catch (err) {
    return error(res, err.message || 'Failed to fetch quotations', 500);
  }
}

module.exports = { sendQuotation, listQuotations };

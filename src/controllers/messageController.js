const db = require('../models');
const { success, error } = require('../utils/responseHandler');
const { getIO } = require('../sockets');
const { notifyNewMessage } = require('../sockets/chatSocket');

async function sendMessage(req, res) {
  try {
    const { id: conversationId } = req.params;
    const { content: messageText, messageType = 'TEXT' } = req.body;
    const user = req.user;

    const conversation = await db.Conversation.findByPk(conversationId);
    if (!conversation) return error(res, 'Conversation not found', 404);
    if (conversation.owner_user_id !== user.id && conversation.interested_user_id !== user.id) {
      return error(res, 'Not authorized', 403);
    }

    const attachment = req.file ? req.file.path.replace(/\\/g, '/') : null;

    const message = await db.Message.create({
      conversation_id: conversationId,
      sender_user_id: user.id,
      message_type: messageType,
      message_text: messageText || null,
      attachment_path: attachment,
      is_read: false,
    });

    await conversation.update({ last_message_at: new Date() });

    const fullMessage = await db.Message.findByPk(message.id, {
      include: [{ model: db.User, as: 'sender', attributes: ['id', 'name', 'email'] }],
    });

    const otherUserId = conversation.owner_user_id === user.id ? conversation.interested_user_id : conversation.owner_user_id;

    await db.Notification.create({
      user_id: otherUserId,
      type: 'new_message',
      title: 'New Message',
      message: `${user.name} sent you a message`,
      related_id: conversationId,
      related_type: 'conversation',
    });

    const io = getIO();
    if (io) notifyNewMessage(io, conversation, fullMessage, user);

    return success(res, 'Message sent', { message: fullMessage }, 201);
  } catch (err) {
    return error(res, err.message || 'Failed to send message', 500);
  }
}

async function listMessages(req, res) {
  try {
    const { id: conversationId } = req.params;
    const user = req.user;
    const conversation = await db.Conversation.findByPk(conversationId);
    if (!conversation) return error(res, 'Conversation not found', 404);
    if (conversation.owner_user_id !== user.id && conversation.interested_user_id !== user.id) {
      return error(res, 'Not authorized', 403);
    }
    const messages = await db.Message.findAll({
      where: { conversation_id: conversationId },
      order: [['created_at', 'ASC']],
      include: [{ model: db.User, as: 'sender', attributes: ['id', 'name', 'email'] }],
    });
    return success(res, 'Messages fetched', { messages });
  } catch (err) {
    return error(res, err.message || 'Failed to fetch messages', 500);
  }
}

module.exports = { sendMessage, listMessages };

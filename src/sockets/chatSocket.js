const db = require('../models');

function notifyNewMessage(io, conversation, message, sender) {
  const otherUserId = conversation.owner_user_id === message.sender_user_id ? conversation.interested_user_id : conversation.owner_user_id;
  io.to(`user_${otherUserId}`).emit('new_message', {
    conversationId: conversation.id,
    message,
    sender,
  });
}

function notifyNewInquiry(io, userId, conversation, requirement) {
  io.to(`user_${userId}`).emit('new_inquiry', {
    conversationId: conversation.id,
    requirement,
  });
}

function notifyNewQuotation(io, userId, quotation, conversation) {
  io.to(`user_${userId}`).emit('new_quotation', {
    conversationId: conversation.id,
    quotation,
  });
}

function notifyContactShared(io, conversation, sharedByUser, contact) {
  const participants = [conversation.owner_user_id, conversation.interested_user_id];
  participants.forEach((uid) => {
    io.to(`user_${uid}`).emit('contact_shared', {
      conversationId: conversation.id,
      sharedBy: sharedByUser,
      contact,
    });
  });
}

module.exports = {
  notifyNewMessage,
  notifyNewInquiry,
  notifyNewQuotation,
  notifyContactShared,
};

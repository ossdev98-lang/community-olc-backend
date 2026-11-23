const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const db = require('../models');

const onlineUsers = new Map(); // userId -> socketId

function initSocket(server) {
  const io = new Server(server, {
    cors: { origin: config.frontendUrl || '*', methods: ['GET', 'POST'] },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) return next(new Error('Authentication required'));
      const decoded = jwt.verify(token, config.jwt.secret);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    onlineUsers.set(socket.userId, socket.id);
    socket.join(`user_${socket.userId}`);
    io.emit('presence', { userId: socket.userId, online: true });

    socket.on('join_conversation', ({ conversationId }) => {
      socket.join(`conv_${conversationId}`);
    });

    socket.on('leave_conversation', ({ conversationId }) => {
      socket.leave(`conv_${conversationId}`);
    });

    socket.on('typing', ({ conversationId, userId, userName }) => {
      socket.to(`conv_${conversationId}`).emit('typing', { conversationId, userId, userName });
    });

    socket.on('stop_typing', ({ conversationId, userId }) => {
      socket.to(`conv_${conversationId}`).emit('stop_typing', { conversationId, userId });
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(socket.userId);
      io.emit('presence', { userId: socket.userId, online: false });
    });
  });

  return io;
}

function isOnline(userId) {
  return onlineUsers.has(userId);
}

function getSocketId(userId) {
  return onlineUsers.get(userId);
}

module.exports = { initSocket, io: null, isOnline, getSocketId, onlineUsers };

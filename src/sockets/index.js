const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const db = require('../models');

const onlineUsers = new Map(); // userId -> Set<socketId>
let ioInstance = null;

function initSocket(server) {
  const allowedOrigins = new Set([
    ...String(config.frontendUrl || '').split(',').map((origin) => origin.trim().replace(/\/+$/, '')).filter(Boolean),
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ]);
  ioInstance = new Server(server, {
    cors: {
      origin(origin, callback) {
        const isProjectPreview = /^https:\/\/community-olc-frontend-[a-z0-9-]+\.vercel\.app$/i.test(origin || '');
        callback(null, !origin || allowedOrigins.has(origin.replace(/\/+$/, '')) || isProjectPreview);
      },
      methods: ['GET', 'POST'],
    },
  });

  ioInstance.use(async (socket, next) => {
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

  ioInstance.on('connection', (socket) => {
    const userKey = String(socket.userId);
    const userSockets = onlineUsers.get(userKey) || new Set();
    const wasOffline = userSockets.size === 0;
    userSockets.add(socket.id);
    onlineUsers.set(userKey, userSockets);
    socket.join(`user_${socket.userId}`);
    if (wasOffline) ioInstance.emit('presence', { userId: socket.userId, online: true });

    socket.on('join_conversation', async ({ conversationId }) => {
      const conversation = await db.Conversation.findByPk(conversationId);
      if (conversation && [conversation.owner_user_id, conversation.interested_user_id].some((id) => String(id) === String(socket.userId))) {
        socket.join(`conv_${conversationId}`);
      }
    });

    socket.on('leave_conversation', ({ conversationId }) => {
      socket.leave(`conv_${conversationId}`);
    });

    socket.on('typing', ({ conversationId, userId, userName }) => {
      if (socket.rooms.has(`conv_${conversationId}`)) {
        socket.to(`conv_${conversationId}`).emit('typing', { conversationId, userId: socket.userId, userName });
      }
    });

    socket.on('stop_typing', ({ conversationId, userId }) => {
      if (socket.rooms.has(`conv_${conversationId}`)) {
        socket.to(`conv_${conversationId}`).emit('stop_typing', { conversationId, userId: socket.userId });
      }
    });

    socket.on('disconnect', () => {
      const activeSockets = onlineUsers.get(userKey);
      activeSockets?.delete(socket.id);
      if (activeSockets?.size === 0) {
        onlineUsers.delete(userKey);
        ioInstance.emit('presence', { userId: socket.userId, online: false });
      }
    });
  });

  return ioInstance;
}

function getIO() {
  return ioInstance;
}

function isOnline(userId) {
  return (onlineUsers.get(String(userId))?.size || 0) > 0;
}

function getSocketId(userId) {
  return onlineUsers.get(String(userId))?.values().next().value;
}

module.exports = { initSocket, getIO, isOnline, getSocketId, onlineUsers };

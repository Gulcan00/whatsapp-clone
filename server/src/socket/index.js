const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const pool = require('../db');

const onlineUsers = new Map();

function setupSocket(io, app) {
  app.set('io', io);
  app.set('onlineUsers', onlineUsers);

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Unauthorized'));
    try {
      socket.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.user.id;

    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
    onlineUsers.get(userId).add(socket.id);
    io.emit('user_online', { userId });

    // Join all conversation rooms
    const { rows } = await pool.query(
      'SELECT conversation_id FROM conversation_members WHERE user_id = $1', [userId]
    );
    for (const { conversation_id } of rows) socket.join(conversation_id);

    socket.on('send_message', async ({ conversation_id, content }) => {
      if (!conversation_id || !content) return;
      const { rows: member } = await pool.query(
        'SELECT 1 FROM conversation_members WHERE conversation_id = $1 AND user_id = $2', [conversation_id, userId]
      );
      if (!member.length) return;

      const id = uuidv4();
      await pool.query(
        'INSERT INTO messages (id, conversation_id, sender_id, content, type) VALUES ($1, $2, $3, $4, $5)',
        [id, conversation_id, userId, content, 'text']
      );
      const { rows: msgRows } = await pool.query(`
        SELECT m.id, m.content, m.type, m.created_at,
               u.id AS sender_id, u.username AS sender_username, u.avatar_url AS sender_avatar
        FROM messages m JOIN users u ON u.id = m.sender_id WHERE m.id = $1
      `, [id]);

      io.to(conversation_id).emit('new_message', { ...msgRows[0], conversation_id });
    });

    socket.on('typing', ({ conversation_id, isTyping }) => {
      socket.to(conversation_id).emit('typing', {
        userId,
        username: socket.user.username,
        isTyping,
      });
    });

    socket.on('disconnect', () => {
      const sockets = onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          onlineUsers.delete(userId);
          io.emit('user_offline', { userId });
        }
      }
    });
  });
}

module.exports = setupSocket;

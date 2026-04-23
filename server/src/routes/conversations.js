const express = require('express');
const { v4: uuidv4 } = require('uuid');
const pool = require('../db');
const auth = require('../middleware/auth');
const { upload, uploadToCloudinary } = require('../middleware/upload');

const router = express.Router();

// Get all conversations for current user
router.get('/', auth, async (req, res) => {
  const archived = req.query.archived === 'true';
  const { rows } = await pool.query(`
    SELECT c.id, c.type, c.name, c.avatar_url, c.created_at,
           lm.content AS last_message, lm.type AS last_message_type, lm.created_at AS last_message_at,
           us.username AS last_message_sender
    FROM conversations c
    JOIN conversation_members cm ON cm.conversation_id = c.id AND cm.user_id = $1 AND cm.archived = $2
    LEFT JOIN LATERAL (
      SELECT * FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1
    ) lm ON true
    LEFT JOIN users us ON us.id = lm.sender_id
    ORDER BY COALESCE(lm.created_at, c.created_at) DESC
  `, [req.user.id, archived]);

  const onlineUsers = req.app.get('onlineUsers') || new Map();

  const result = await Promise.all(rows.map(async c => {
    if (c.type !== 'direct') return c;
    const { rows: others } = await pool.query(`
      SELECT u.id, u.username, u.avatar_url
      FROM conversation_members cm JOIN users u ON u.id = cm.user_id
      WHERE cm.conversation_id = $1 AND cm.user_id != $2
    `, [c.id, req.user.id]);
    const other = others[0];
    return { ...c, other_user: other ? { ...other, online: onlineUsers.has(other.id) } : null };
  }));

  res.json(result);
});

// Get or create direct conversation
router.post('/direct', auth, async (req, res) => {
  const { user_id } = req.body;
  if (!user_id || user_id === req.user.id) return res.status(400).json({ error: 'Invalid user' });

  const { rows: existing } = await pool.query(`
    SELECT c.id FROM conversations c
    JOIN conversation_members cm1 ON cm1.conversation_id = c.id AND cm1.user_id = $1
    JOIN conversation_members cm2 ON cm2.conversation_id = c.id AND cm2.user_id = $2
    WHERE c.type = 'direct' LIMIT 1
  `, [req.user.id, user_id]);

  if (existing.length) return res.json({ id: existing[0].id });

  const id = uuidv4();
  await pool.query('INSERT INTO conversations (id, type) VALUES ($1, $2)', [id, 'direct']);
  await pool.query('INSERT INTO conversation_members (conversation_id, user_id) VALUES ($1, $2)', [id, req.user.id]);
  await pool.query('INSERT INTO conversation_members (conversation_id, user_id) VALUES ($1, $2)', [id, user_id]);
  res.status(201).json({ id });
});

// Create group
router.post('/group', auth, async (req, res) => {
  const { name, member_ids } = req.body;
  if (!name || !Array.isArray(member_ids) || member_ids.length === 0) {
    return res.status(400).json({ error: 'name and member_ids required' });
  }

  const id = uuidv4();
  await pool.query('INSERT INTO conversations (id, type, name, created_by) VALUES ($1, $2, $3, $4)', [id, 'group', name, req.user.id]);
  await pool.query('INSERT INTO conversation_members (conversation_id, user_id) VALUES ($1, $2)', [id, req.user.id]);
  for (const uid of member_ids) {
    await pool.query(
      'INSERT INTO conversation_members (conversation_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [id, uid]
    );
  }
  res.status(201).json({ id });
});

// Get messages in a conversation
router.get('/:id/messages', auth, async (req, res) => {
  const { rows: member } = await pool.query(
    'SELECT 1 FROM conversation_members WHERE conversation_id = $1 AND user_id = $2', [req.params.id, req.user.id]
  );
  if (!member.length) return res.status(403).json({ error: 'Forbidden' });

  const { rows } = await pool.query(`
    SELECT m.id, m.content, m.type, m.created_at,
           u.id AS sender_id, u.username AS sender_username, u.avatar_url AS sender_avatar
    FROM messages m JOIN users u ON u.id = m.sender_id
    WHERE m.conversation_id = $1
    ORDER BY m.created_at ASC
    LIMIT 200
  `, [req.params.id]);
  res.json(rows);
});

// Get members of a conversation
router.get('/:id/members', auth, async (req, res) => {
  const { rows: member } = await pool.query(
    'SELECT 1 FROM conversation_members WHERE conversation_id = $1 AND user_id = $2', [req.params.id, req.user.id]
  );
  if (!member.length) return res.status(403).json({ error: 'Forbidden' });

  const { rows } = await pool.query(`
    SELECT u.id, u.username, u.avatar_url
    FROM conversation_members cm JOIN users u ON u.id = cm.user_id
    WHERE cm.conversation_id = $1
  `, [req.params.id]);

  const onlineUsers = req.app.get('onlineUsers') || new Map();
  res.json(rows.map(m => ({ ...m, online: onlineUsers.has(m.id) })));
});

// Archive / unarchive
router.patch('/:id/archive', auth, async (req, res) => {
  const { archived } = req.body;
  await pool.query(
    'UPDATE conversation_members SET archived = $1 WHERE conversation_id = $2 AND user_id = $3',
    [!!archived, req.params.id, req.user.id]
  );
  res.json({ archived: !!archived });
});

// Upload image message
router.post('/:id/images', auth, upload.single('image'), async (req, res) => {
  const { rows: member } = await pool.query(
    'SELECT 1 FROM conversation_members WHERE conversation_id = $1 AND user_id = $2', [req.params.id, req.user.id]
  );
  if (!member.length) return res.status(403).json({ error: 'Forbidden' });
  if (!req.file)      return res.status(400).json({ error: 'No file uploaded' });

  try {
    const content = await uploadToCloudinary(req.file.buffer, 'pulse/chat');
    const id = uuidv4();
    await pool.query(
      'INSERT INTO messages (id, conversation_id, sender_id, content, type) VALUES ($1, $2, $3, $4, $5)',
      [id, req.params.id, req.user.id, content, 'image']
    );

    const { rows } = await pool.query(`
      SELECT m.id, m.content, m.type, m.created_at,
             u.id AS sender_id, u.username AS sender_username, u.avatar_url AS sender_avatar
      FROM messages m JOIN users u ON u.id = m.sender_id WHERE m.id = $1
    `, [id]);

    const msg = { ...rows[0], conversation_id: req.params.id };
    const io = req.app.get('io');
    if (io) io.to(req.params.id).emit('new_message', msg);

    res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ error: 'Upload failed' });
  }
});

module.exports = router;

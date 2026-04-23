const express = require('express');
const { v4: uuidv4 } = require('uuid');
const pool = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  const { rows } = await pool.query(`
    SELECT u.id, u.username, u.avatar_url, u.bio, f.id as friendship_id
    FROM friendships f
    JOIN users u ON (
      CASE WHEN f.requester_id = $1 THEN f.addressee_id ELSE f.requester_id END = u.id
    )
    WHERE (f.requester_id = $1 OR f.addressee_id = $1) AND f.status = 'accepted'
  `, [req.user.id]);

  const onlineUsers = req.app.get('onlineUsers') || new Map();
  res.json(rows.map(f => ({ ...f, online: onlineUsers.has(f.id) })));
});

router.get('/requests', auth, async (req, res) => {
  const { rows } = await pool.query(`
    SELECT f.id as friendship_id, u.id, u.username, u.avatar_url, f.created_at
    FROM friendships f
    JOIN users u ON f.requester_id = u.id
    WHERE f.addressee_id = $1 AND f.status = 'pending'
  `, [req.user.id]);
  res.json(rows);
});

router.post('/request', auth, async (req, res) => {
  const { addressee_id } = req.body;
  if (!addressee_id || addressee_id === req.user.id) return res.status(400).json({ error: 'Invalid user' });

  const { rows: target } = await pool.query('SELECT id FROM users WHERE id = $1', [addressee_id]);
  if (!target.length) return res.status(404).json({ error: 'User not found' });

  const { rows: existing } = await pool.query(
    'SELECT id, status FROM friendships WHERE (requester_id = $1 AND addressee_id = $2) OR (requester_id = $2 AND addressee_id = $1)',
    [req.user.id, addressee_id]
  );
  if (existing.length) {
    return res.status(409).json({ error: existing[0].status === 'accepted' ? 'Already friends' : 'Request already sent' });
  }

  await pool.query(
    'INSERT INTO friendships (id, requester_id, addressee_id) VALUES ($1, $2, $3)',
    [uuidv4(), req.user.id, addressee_id]
  );
  res.status(201).json({ message: 'Friend request sent' });
});

router.post('/accept/:friendshipId', auth, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM friendships WHERE id = $1', [req.params.friendshipId]);
  const f = rows[0];
  if (!f || f.addressee_id !== req.user.id) return res.status(404).json({ error: 'Request not found' });
  await pool.query("UPDATE friendships SET status = 'accepted' WHERE id = $1", [f.id]);
  res.json({ message: 'Friend request accepted' });
});

router.delete('/:friendshipId', auth, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM friendships WHERE id = $1', [req.params.friendshipId]);
  const f = rows[0];
  if (!f) return res.status(404).json({ error: 'Not found' });
  if (f.requester_id !== req.user.id && f.addressee_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  await pool.query('DELETE FROM friendships WHERE id = $1', [f.id]);
  res.json({ message: 'Removed' });
});

module.exports = router;

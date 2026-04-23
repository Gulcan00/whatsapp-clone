const express = require('express');
const { v4: uuidv4 } = require('uuid');
const pool = require('../db');
const auth = require('../middleware/auth');
const { upload, uploadToCloudinary } = require('../middleware/upload');

const router = express.Router();

router.get('/me', auth, async (req, res) => {
  const { rows } = await pool.query(
    'SELECT id, username, email, avatar_url, bio, created_at FROM users WHERE id = $1', [req.user.id]
  );
  res.json(rows[0]);
});

router.patch('/me', auth, async (req, res) => {
  const { username, bio } = req.body;
  if (username !== undefined) {
    const { rows } = await pool.query('SELECT id FROM users WHERE username = $1 AND id != $2', [username, req.user.id]);
    if (rows.length > 0) return res.status(409).json({ error: 'Username already taken' });
    await pool.query('UPDATE users SET username = $1 WHERE id = $2', [username, req.user.id]);
  }
  if (bio !== undefined) {
    await pool.query('UPDATE users SET bio = $1 WHERE id = $2', [bio, req.user.id]);
  }
  const { rows } = await pool.query('SELECT id, username, email, avatar_url, bio FROM users WHERE id = $1', [req.user.id]);
  res.json(rows[0]);
});

router.post('/me/avatar', auth, upload.single('avatar'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const avatar_url = await uploadToCloudinary(req.file.buffer, 'pulse/avatars');
    await pool.query('UPDATE users SET avatar_url = $1 WHERE id = $2', [avatar_url, req.user.id]);
    res.json({ avatar_url });
  } catch (err) {
    res.status(500).json({ error: 'Upload failed' });
  }
});

router.get('/search', auth, async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);
  const { rows } = await pool.query(
    'SELECT id, username, avatar_url FROM users WHERE username ILIKE $1 AND id != $2 LIMIT 20',
    [`%${q}%`, req.user.id]
  );
  res.json(rows);
});

router.get('/:id', auth, async (req, res) => {
  const { rows } = await pool.query('SELECT id, username, avatar_url, bio FROM users WHERE id = $1', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'User not found' });
  res.json(rows[0]);
});

module.exports = router;

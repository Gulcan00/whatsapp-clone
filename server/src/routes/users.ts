import { Router } from 'express';
import { eq, ne, ilike, and } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../db/schema';
import auth from '../middleware/auth';
import { upload, uploadToCloudinary } from '../middleware/upload';

const router = Router();

router.get('/me', auth, async (req, res) => {
  const [user] = await db.select({
    id: users.id, username: users.username, email: users.email,
    avatar_url: users.avatar_url, bio: users.bio, created_at: users.created_at,
  }).from(users).where(eq(users.id, req.user.id));
  res.json(user);
});

router.patch('/me', auth, async (req, res) => {
  const { username, bio } = req.body as { username?: string; bio?: string };
  if (username !== undefined) {
    const taken = await db.select({ id: users.id }).from(users)
      .where(and(eq(users.username, username), ne(users.id, req.user.id)));
    if (taken.length > 0) {
      res.status(409).json({ error: 'Username already taken' });
      return;
    }
    await db.update(users).set({ username }).where(eq(users.id, req.user.id));
  }
  if (bio !== undefined) {
    await db.update(users).set({ bio }).where(eq(users.id, req.user.id));
  }
  const [user] = await db.select({
    id: users.id, username: users.username, email: users.email,
    avatar_url: users.avatar_url, bio: users.bio,
  }).from(users).where(eq(users.id, req.user.id));
  res.json(user);
});

router.post('/me/avatar', auth, upload.single('avatar'), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }
  try {
    const avatar_url = await uploadToCloudinary(req.file.buffer, 'pulse/avatars');
    await db.update(users).set({ avatar_url }).where(eq(users.id, req.user.id));
    res.json({ avatar_url });
  } catch {
    res.status(500).json({ error: 'Upload failed' });
  }
});

router.get('/search', auth, async (req, res) => {
  const { q } = req.query as { q?: string };
  if (!q) {
    res.json([]);
    return;
  }
  const results = await db.select({
    id: users.id, username: users.username, avatar_url: users.avatar_url,
  }).from(users).where(and(ilike(users.username, `%${q}%`), ne(users.id, req.user.id))).limit(20);
  res.json(results);
});

router.get('/:id', auth, async (req, res) => {
  const [user] = await db.select({
    id: users.id, username: users.username, avatar_url: users.avatar_url, bio: users.bio,
  }).from(users).where(eq(users.id, req.params.id));
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json(user);
});

export default router;

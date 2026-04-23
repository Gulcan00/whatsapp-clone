import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { eq, or } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../db/schema';

const router = Router();

router.post('/register', async (req, res) => {
  const { username, email, password, bio = '' } = req.body as {
    username: string; email: string; password: string; bio?: string;
  };
  if (!username || !email || !password) {
    res.status(400).json({ error: 'All fields required' });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters' });
    return;
  }

  const existing = await db.select({ id: users.id }).from(users)
    .where(or(eq(users.email, email), eq(users.username, username)));
  if (existing.length > 0) {
    res.status(409).json({ error: 'Email or username already taken' });
    return;
  }

  const password_hash = await bcrypt.hash(password, 10);
  const id = uuidv4();
  await db.insert(users).values({ id, username, email, password_hash, bio });

  const token = jwt.sign({ id, username, email }, process.env.JWT_SECRET!, { expiresIn: '7d' });
  res.status(201).json({ token, user: { id, username, email, avatar_url: null, bio } });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  if (!email || !password) {
    res.status(400).json({ error: 'All fields required' });
    return;
  }

  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );
  res.json({ token, user: { id: user.id, username: user.username, email: user.email, avatar_url: user.avatar_url, bio: user.bio } });
});

export default router;

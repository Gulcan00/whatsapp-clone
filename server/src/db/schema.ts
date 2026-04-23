import { pgTable, text, bigint, boolean, primaryKey, unique } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { db } from './index';

const nowEpoch = sql`EXTRACT(EPOCH FROM NOW())::BIGINT`;

export const users = pgTable('users', {
  id:            text('id').primaryKey(),
  username:      text('username').notNull().unique(),
  email:         text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  avatar_url:    text('avatar_url'),
  bio:           text('bio').default(''),
  created_at:    bigint('created_at', { mode: 'number' }).notNull().default(nowEpoch),
});

export const friendships = pgTable('friendships', {
  id:           text('id').primaryKey(),
  requester_id: text('requester_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  addressee_id: text('addressee_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status:       text('status').notNull().default('pending'),
  created_at:   bigint('created_at', { mode: 'number' }).notNull().default(nowEpoch),
}, (t) => [unique().on(t.requester_id, t.addressee_id)]);

export const conversations = pgTable('conversations', {
  id:         text('id').primaryKey(),
  type:       text('type').notNull().default('direct'),
  name:       text('name'),
  avatar_url: text('avatar_url'),
  created_by: text('created_by').references(() => users.id, { onDelete: 'set null' }),
  created_at: bigint('created_at', { mode: 'number' }).notNull().default(nowEpoch),
});

export const conversationMembers = pgTable('conversation_members', {
  conversation_id: text('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  user_id:         text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  archived:        boolean('archived').notNull().default(false),
  joined_at:       bigint('joined_at', { mode: 'number' }).notNull().default(nowEpoch),
}, (t) => [primaryKey({ columns: [t.conversation_id, t.user_id] })]);

export const messages = pgTable('messages', {
  id:              text('id').primaryKey(),
  conversation_id: text('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  sender_id:       text('sender_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content:         text('content'),
  type:            text('type').notNull().default('text'),
  created_at:      bigint('created_at', { mode: 'number' }).notNull().default(nowEpoch),
});

export async function initSchema(): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      avatar_url TEXT,
      bio TEXT DEFAULT '',
      created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
    )
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS friendships (
      id TEXT PRIMARY KEY,
      requester_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      addressee_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'accepted')),
      created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
      UNIQUE(requester_id, addressee_id)
    )
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL DEFAULT 'direct' CHECK(type IN ('direct', 'group')),
      name TEXT,
      avatar_url TEXT,
      created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
      created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
    )
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS conversation_members (
      conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      archived BOOLEAN NOT NULL DEFAULT FALSE,
      joined_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
      PRIMARY KEY (conversation_id, user_id)
    )
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content TEXT,
      type TEXT NOT NULL DEFAULT 'text' CHECK(type IN ('text', 'image')),
      created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
    )
  `);
}

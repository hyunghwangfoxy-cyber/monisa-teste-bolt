import { integer, jsonb, pgTable, serial, text, timestamp, index } from 'drizzle-orm/pg-core'
import type { Preferences } from '../src/lib/preferences.js'

export const profiles = pgTable('profiles', {
  userId: text('user_id').primaryKey(),
  name: text('name').notNull(),
  bio: text('bio').notNull().default(''),
  subject: text('subject').notNull().default(''),
  avatarKey: text('avatar_key'),
  preferences: jsonb('preferences').$type<Preferences>().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const conversations = pgTable('study_conversations', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => profiles.userId, { onDelete: 'cascade' }),
  title: text('title').notNull().default('Nova conversa'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, table => [index('study_conversations_user_updated_idx').on(table.userId, table.updatedAt)])

export const messages = pgTable('study_messages', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => profiles.userId, { onDelete: 'cascade' }),
  conversationId: integer('conversation_id').references(() => conversations.id, { onDelete: 'cascade' }),
  role: text('role').$type<'user' | 'assistant'>().notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, table => [index('study_messages_user_id_idx').on(table.userId, table.id), index('study_messages_conversation_idx').on(table.conversationId, table.id)])

export const aiUsage = pgTable('ai_usage', {
  userId: text('user_id').primaryKey().references(() => profiles.userId, { onDelete: 'cascade' }),
  windowStart: timestamp('window_start', { withTimezone: true }).notNull().defaultNow(),
  requestCount: integer('request_count').notNull().default(1),
})

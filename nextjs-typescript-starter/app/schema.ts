import {
  bigint,
  boolean,
  index,
  integer,
  json,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';

// 用户表（由本项目的 Drizzle 迁移创建和管理）
export const users = pgTable(
  'User',
  {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 64 }),
    password: varchar('password', { length: 64 }),
  },
  (table) => [unique('User_email_unique').on(table.email)],
);

// 单词书表（已存在于 Supabase，此处仅做类型映射，不做迁移）
export const books = pgTable(
  'books',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    bookId: text('book_id').notNull(),
    title: text('title').notNull(),
    wordCount: integer('word_count').notNull().default(0),
    coverUrl: text('cover_url'),
    tags: text('tags').array().notNull().default([]),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    bookIdUnique: unique('books_book_id_unique').on(table.bookId),
  }),
);

// 单词表（已存在于 Supabase，字段名大小写与库中实际列一致）
export const words = pgTable('words', {
  id: bigint('id', { mode: 'number' }).primaryKey(),
  wordRank: integer('wordRank'),
  headWord: text('headWord'),
  content: json('content'),
  bookId: text('bookId'),
});

// 用户学习进度表（本次迁移新建）
// user_id 关联认证用 "User" 表（serial 主键），应用层保证完整性
export const userLearningProgress = pgTable(
  'user_learning_progress',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: integer('user_id').notNull(),
    bookId: text('book_id').notNull(),
    // 最近一次已完成学习的单词 ID（words.id），首次学习前为 null
    currentWordId: bigint('current_word_id', { mode: 'number' }),
    learnedCount: integer('learned_count').notNull().default(0),
    completed: boolean('completed').notNull().default(false),
    lastStudiedAt: timestamp('last_studied_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique('user_learning_progress_user_book_unique').on(table.userId, table.bookId),
    index('user_learning_progress_user_recent_idx').on(table.userId, table.lastStudiedAt),
    index('user_learning_progress_book_idx').on(table.bookId),
  ],
);

export type User = typeof users.$inferSelect;
export type Book = typeof books.$inferSelect;
export type Word = typeof words.$inferSelect;
export type UserLearningProgress = typeof userLearningProgress.$inferSelect;

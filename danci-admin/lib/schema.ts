import { bigint, index, integer, json, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const userRole = pgEnum("user_role", ["super_admin", "content_admin"]);
export const userStatus = pgEnum("user_status", ["active", "disabled"]);

export const users = pgTable("admin-users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRole("role").notNull().default("content_admin"),
  status: userStatus("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable("admin-session", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("admin_session_user_id_idx").on(table.userId), index("admin_session_expires_at_idx").on(table.expiresAt)]);

export const words = pgTable("words", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
  wordRank: integer("wordRank"),
  headWord: text("headWord"),
  content: json("content"),
  bookId: text("bookId"),
});

export const books = pgTable("books", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookId: text("book_id").notNull().unique(),
  title: text("title").notNull(),
  wordCount: integer("word_count").notNull().default(0),
  coverUrl: text("cover_url"),
  tags: text("tags").array().notNull().default(sql`'{}'::text[]`),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type Word = typeof words.$inferSelect;
export type Book = typeof books.$inferSelect;

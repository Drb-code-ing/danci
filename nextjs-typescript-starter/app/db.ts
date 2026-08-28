import { drizzle } from 'drizzle-orm/postgres-js';
import { asc, eq } from 'drizzle-orm';
import postgres from 'postgres';
import { genSaltSync, hashSync } from 'bcrypt-ts';
import { users, books, words } from 'app/schema';
import type { Word } from 'lib/mock-data';

const client = postgres(`${process.env.POSTGRES_URL!}?sslmode=require`);
const db = drizzle(client);

export async function getAllBooks() {
  return await db.select().from(books).orderBy(books.createdAt);
}

export async function getBookByBookId(bookId: string) {
  const rows = await db.select().from(books).where(eq(books.bookId, bookId));
  return rows[0] ?? null;
}

export async function getWordsByBook(bookId: string) {
  return await db
    .select()
    .from(words)
    .where(eq(words.bookId, bookId))
    .orderBy(asc(words.wordRank), asc(words.id));
}

// words.content 是 json 列（unknown），按导入数据的固定结构收敛为前端 Word 类型
export function mapDbWord(row: typeof words.$inferSelect): Word {
  const content = (row.content ?? {}) as Word['content'];
  return {
    id: row.id,
    wordRank: row.wordRank ?? 0,
    headWord: row.headWord ?? content?.word?.wordHead ?? '',
    bookId: row.bookId ?? '',
    content,
  };
}

export async function getUser(email: string) {
  return await db.select().from(users).where(eq(users.email, email));
}

export async function createUser(email: string, password: string) {
  const salt = genSaltSync(10);
  const hash = hashSync(password, salt);

  return await db.insert(users).values({ email, password: hash });
}

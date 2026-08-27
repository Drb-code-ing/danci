import { books } from "@/lib/schema";

export const bookFields = { id: books.id, bookId: books.bookId, title: books.title, wordCount: books.wordCount, coverUrl: books.coverUrl, tags: books.tags, createdAt: books.createdAt };

export function parseTags(raw: unknown) {
  if (typeof raw !== "string") return [];
  return [...new Set(raw.split(/[,，]/).map(tag => tag.trim()).filter(Boolean))];
}

export type BookPayload = { title: string; bookId: string; wordCount: number; coverUrl: string | null; tags: string[] };

export function parseBookPayload(body: unknown): BookPayload | null {
  if (typeof body !== "object" || body === null) return null;
  const record = body as Record<string, unknown>;
  const title = typeof record.title === "string" ? record.title.trim() : "";
  const bookId = typeof record.bookId === "string" ? record.bookId.trim() : "";
  const wordCount = Number(record.wordCount);
  const coverUrl = typeof record.coverUrl === "string" && record.coverUrl.trim() ? record.coverUrl.trim() : null;
  if (!title || !bookId || !Number.isInteger(wordCount) || wordCount < 0) return null;
  return { title, bookId, wordCount, coverUrl, tags: parseTags(record.tags) };
}

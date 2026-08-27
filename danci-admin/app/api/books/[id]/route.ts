import { and, eq, ne } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";
import { bookFields, parseBookPayload } from "@/lib/books";
import { db } from "@/lib/db";
import { books, words } from "@/lib/schema";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  const auth = await requireApiUser();
  if (auth.error) return auth.error;
  const { id } = await params;
  const payload = parseBookPayload(await request.json());
  if (!payload) return NextResponse.json({ error: "请填写有效标题、bookId，单词数量需为非负整数" }, { status: 400 });
  const duplicate = await db.select({ id: books.id }).from(books).where(and(eq(books.bookId, payload.bookId), ne(books.id, id))).limit(1);
  if (duplicate.length) return NextResponse.json({ error: "该 bookId 已存在" }, { status: 409 });
  const [book] = await db.update(books).set({ ...payload, updatedAt: new Date() }).where(eq(books.id, id)).returning(bookFields);
  if (!book) return NextResponse.json({ error: "单词书不存在" }, { status: 404 });
  return NextResponse.json({ book });
}

export async function DELETE(request: Request, { params }: Context) {
  const auth = await requireApiUser();
  if (auth.error) return auth.error;
  const { id } = await params;
  const deleted = await db.transaction(async (tx) => {
    const [book] = await tx.delete(books).where(eq(books.id, id)).returning({ id: books.id, bookId: books.bookId });
    if (!book) return null;
    await tx.delete(words).where(eq(words.bookId, book.bookId));
    return book;
  });
  if (!deleted) return NextResponse.json({ error: "单词书不存在" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

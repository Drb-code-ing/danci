import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";
import { bookFields, parseBookPayload } from "@/lib/books";
import { db } from "@/lib/db";
import { books } from "@/lib/schema";

export async function GET() {
  const auth = await requireApiUser();
  if (auth.error) return auth.error;
  return NextResponse.json({ books: await db.select(bookFields).from(books).orderBy(asc(books.createdAt)) });
}

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (auth.error) return auth.error;
  const payload = parseBookPayload(await request.json());
  if (!payload) return NextResponse.json({ error: "请填写有效标题、bookId，单词数量需为非负整数" }, { status: 400 });
  const duplicate = await db.select({ id: books.id }).from(books).where(eq(books.bookId, payload.bookId)).limit(1);
  if (duplicate.length) return NextResponse.json({ error: "该 bookId 已存在" }, { status: 409 });
  const [book] = await db.insert(books).values(payload).returning(bookFields);
  return NextResponse.json({ book }, { status: 201 });
}

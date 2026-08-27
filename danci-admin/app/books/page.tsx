import { asc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getCurrentUser, hasAdminUsers } from "@/lib/auth";
import { db } from "@/lib/db";
import { books } from "@/lib/schema";
import { AdminApp } from "../admin-app";
import { Books } from "./books";

export default async function Page() {
  if (!(await hasAdminUsers())) redirect("/signup");
  const user = await getCurrentUser();
  if (!user) redirect("/signin");
  const initialBooks = await db.select({ id: books.id, bookId: books.bookId, title: books.title, wordCount: books.wordCount, coverUrl: books.coverUrl, tags: books.tags, createdAt: books.createdAt }).from(books).orderBy(asc(books.createdAt));
  return <AdminApp section="books" user={user}><Books initialBooks={initialBooks.map(item => ({ ...item, createdAt: item.createdAt.toISOString() }))} /></AdminApp>;
}

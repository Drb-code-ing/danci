import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { createSession, hashPassword, normalizeEmail } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";

export async function POST(request: Request) {
  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? normalizeEmail(body.email) : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!name || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8) {
    return NextResponse.json({ error: "请填写有效姓名、邮箱和至少 8 位密码" }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);
  const user = await db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(392017)`);
    const existing = await tx.select({ id: users.id }).from(users).limit(1);
    if (existing.length) return null;
    const [created] = await tx.insert(users).values({ name, email, passwordHash, role: "super_admin" }).returning();
    return created;
  });
  if (!user) return NextResponse.json({ error: "系统已完成初始化，请直接登录" }, { status: 409 });
  await createSession(user.id);
  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status } }, { status: 201 });
}

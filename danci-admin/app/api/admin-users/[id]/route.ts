import { and, eq, ne, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";
import { hashPassword, normalizeEmail } from "@/lib/auth";
import { db } from "@/lib/db";
import { sessions, users } from "@/lib/schema";

const publicFields = { id: users.id, name: users.name, email: users.email, role: users.role, status: users.status, createdAt: users.createdAt };

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  const auth = await requireApiUser(true);
  if (auth.error) return auth.error;
  const { id } = await params;
  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? normalizeEmail(body.email) : "";
  const password = typeof body.password === "string" ? body.password : "";
  const role = body.role === "super_admin" ? "super_admin" : "content_admin";
  const status = body.status === "disabled" ? "disabled" : "active";
  if (!name || !/^\S+@\S+\.\S+$/.test(email) || (password && password.length < 8)) {
    return NextResponse.json({ error: "请填写有效姓名、邮箱；新密码至少 8 位" }, { status: 400 });
  }

  const passwordHash = password ? await hashPassword(password) : undefined;
  const result = await db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(392018)`);
    const [existing] = await tx.select({ id: users.id, role: users.role, status: users.status }).from(users).where(eq(users.id, id)).limit(1);
    if (!existing) return { error: "not_found" as const };

    const duplicate = await tx.select({ id: users.id }).from(users).where(and(eq(users.email, email), ne(users.id, id))).limit(1);
    if (duplicate.length) return { error: "duplicate" as const };

    const isSelf = auth.user.id === id;
    if (isSelf && existing.role === "super_admin" && role !== "super_admin") return { error: "cannot_demote_self" as const };
    if (isSelf && existing.status === "active" && status === "disabled") return { error: "cannot_disable_self" as const };
    if (!isSelf && existing.role !== "super_admin" && role === "super_admin") return { error: "cannot_promote" as const };

    const removesEnabledSuperAdmin = existing.role === "super_admin" && existing.status === "active" && (role !== "super_admin" || status !== "active");
    if (removesEnabledSuperAdmin) {
      const anotherEnabledSuperAdmin = await tx.select({ id: users.id }).from(users).where(and(
        eq(users.role, "super_admin"),
        eq(users.status, "active"),
        ne(users.id, id),
      )).limit(1);
      if (!anotherEnabledSuperAdmin.length) return { error: "last_super_admin" as const };
    }

    const values: Partial<typeof users.$inferInsert> = { name, email, role, status, updatedAt: new Date() };
    if (passwordHash) values.passwordHash = passwordHash;
    const [user] = await tx.update(users).set(values).where(eq(users.id, id)).returning(publicFields);
    if (passwordHash || status === "disabled") await tx.delete(sessions).where(eq(sessions.userId, id));
    return { user };
  });

  if (result.error === "not_found") return NextResponse.json({ error: "管理员不存在" }, { status: 404 });
  if (result.error === "duplicate") return NextResponse.json({ error: "该邮箱已存在" }, { status: 409 });
  if (result.error === "last_super_admin") return NextResponse.json({ error: "必须保留至少一位启用的超级管理员" }, { status: 400 });
  if (result.error === "cannot_demote_self") return NextResponse.json({ error: "不能将本人降级为内容管理员" }, { status: 400 });
  if (result.error === "cannot_disable_self") return NextResponse.json({ error: "不能停用本人的账号" }, { status: 400 });
  if (result.error === "cannot_promote") return NextResponse.json({ error: "不能将其他管理员设置为超级管理员" }, { status: 400 });
  return NextResponse.json({ user: result.user });
}

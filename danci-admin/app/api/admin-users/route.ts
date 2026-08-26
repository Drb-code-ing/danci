import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";
import { hashPassword, normalizeEmail } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";

const publicFields = { id: users.id, name: users.name, email: users.email, role: users.role, status: users.status, createdAt: users.createdAt };

export async function GET() {
  const auth = await requireApiUser(true);
  if (auth.error) return auth.error;
  return NextResponse.json({ users: await db.select(publicFields).from(users).orderBy(asc(users.createdAt)) });
}

export async function POST(request: Request) {
  const auth = await requireApiUser(true);
  if (auth.error) return auth.error;
  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? normalizeEmail(body.email) : "";
  const password = typeof body.password === "string" ? body.password : "";
  const role = body.role === "super_admin" ? "super_admin" : "content_admin";
  const status = body.status === "disabled" ? "disabled" : "active";
  if (!name || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8) {
    return NextResponse.json({ error: "请填写有效姓名、邮箱和至少 8 位密码" }, { status: 400 });
  }
  const duplicate = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (duplicate.length) return NextResponse.json({ error: "该邮箱已存在" }, { status: 409 });
  const [user] = await db.insert(users).values({ name, email, passwordHash: await hashPassword(password), role, status }).returning(publicFields);
  return NextResponse.json({ user }, { status: 201 });
}

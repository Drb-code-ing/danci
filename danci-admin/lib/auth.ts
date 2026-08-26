import "server-only";

import { compare, hash } from "bcrypt";
import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { db } from "@/lib/db";
import { sessions, users, type User } from "@/lib/schema";

export const SESSION_COOKIE = "danci_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export type SafeUser = Pick<User, "id" | "name" | "email" | "role" | "status">;

function digest(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function hashPassword(password: string) {
  return hash(password, 12);
}

export function verifyPassword(password: string, passwordHash: string) {
  return compare(password, passwordHash);
}

export async function hasAdminUsers() {
  await connection();
  const existing = await db.select({ id: users.id }).from(users).limit(1);
  return existing.length > 0;
}

export async function createSession(userId: string) {
  const store = await cookies();
  const currentToken = store.get(SESSION_COOKIE)?.value;
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);

  await db.transaction(async (tx) => {
    if (currentToken) await tx.delete(sessions).where(eq(sessions.tokenHash, digest(currentToken)));
    await tx.insert(sessions).values({ userId, tokenHash: digest(token), expiresAt });
  });

  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function deleteSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await db.delete(sessions).where(eq(sessions.tokenHash, digest(token)));
  store.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<SafeUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const [row] = await db.select({
    id: users.id, name: users.name, email: users.email, role: users.role, status: users.status,
  }).from(sessions).innerJoin(users, eq(sessions.userId, users.id)).where(and(
    eq(sessions.tokenHash, digest(token)),
    gt(sessions.expiresAt, new Date()),
    eq(users.status, "active"),
  )).limit(1);
  return row ?? null;
}

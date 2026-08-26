import { asc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getCurrentUser, hasAdminUsers } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { AdminApp } from "../admin-app";
import { AdminUsers } from "./admin-users";

export default async function Page() {
  if (!(await hasAdminUsers())) redirect("/signup");
  const user = await getCurrentUser();
  if (!user) redirect("/signin");
  if (user.role !== "super_admin") redirect("/books");
  const initialUsers = await db.select({ id: users.id, name: users.name, email: users.email, role: users.role, status: users.status, createdAt: users.createdAt }).from(users).orderBy(asc(users.createdAt));
  return <AdminApp section="admin-users" user={user}><AdminUsers currentUserId={user.id} initialUsers={initialUsers.map(item => ({ ...item, createdAt: item.createdAt.toISOString() }))} /></AdminApp>;
}

import "server-only";

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function requireApiUser(superAdmin = false) {
  const user = await getCurrentUser();
  if (!user) return { error: NextResponse.json({ error: "请先登录" }, { status: 401 }) };
  if (superAdmin && user.role !== "super_admin") {
    return { error: NextResponse.json({ error: "没有操作权限" }, { status: 403 }) };
  }
  return { user };
}

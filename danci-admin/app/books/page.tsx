import { redirect } from "next/navigation";
import { getCurrentUser, hasAdminUsers } from "@/lib/auth";
import { AdminApp } from "../admin-app";

export default async function Page() {
  if (!(await hasAdminUsers())) redirect("/signup");
  const user = await getCurrentUser();
  if (!user) redirect("/signin");
  return <AdminApp section="books" user={user} />;
}

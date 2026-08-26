import { redirect } from "next/navigation";
import { getCurrentUser, hasAdminUsers } from "@/lib/auth";

export default async function Home() {
  if (!(await hasAdminUsers())) redirect("/signup");
  redirect((await getCurrentUser()) ? "/books" : "/signin");
}

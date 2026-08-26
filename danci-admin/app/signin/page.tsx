import { redirect } from "next/navigation";
import { getCurrentUser, hasAdminUsers } from "@/lib/auth";
import { SignInPage } from "../auth-pages";

export default async function Page() {
  if (!(await hasAdminUsers())) redirect("/signup");
  if (await getCurrentUser()) redirect("/books");
  return <SignInPage />;
}

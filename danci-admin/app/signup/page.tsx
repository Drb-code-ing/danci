import { redirect } from "next/navigation";
import { getCurrentUser, hasAdminUsers } from "@/lib/auth";
import { SignUpPage } from "../auth-pages";

export default async function Page() {
  if (await hasAdminUsers()) {
    redirect((await getCurrentUser()) ? "/books" : "/signin");
  }
  return <SignUpPage />;
}

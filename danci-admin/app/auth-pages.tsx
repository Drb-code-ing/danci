"use client";

import { FormEvent, useState } from "react";
import { BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

async function submitAuth(url: string, body: object) {
  const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "请求失败，请稍后重试");
}

export function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(""); setPending(true);
    const form = new FormData(event.currentTarget);
    try {
      await submitAuth("/api/auth/signin", { email: form.get("email"), password: form.get("password") });
      router.replace("/books"); router.refresh();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "登录失败"); }
    finally { setPending(false); }
  };
  return <AuthPage title="登录词记后台" text="使用管理员邮箱和密码登录"><form onSubmit={submit} className="form-stack">
    <Label>邮箱<Input name="email" type="email" autoComplete="email" required /></Label>
    <Label>密码<Input name="password" type="password" autoComplete="current-password" required /></Label>
    {error && <p className="form-error">{error}</p>}<Button className="primary wide" type="submit" disabled={pending}>{pending ? "登录中..." : "登录"}</Button>
  </form><p className="auth-switch">首次使用？<Button variant="ghost" onClick={() => router.push("/signup")}>初始化管理员</Button></p></AuthPage>;
}

export function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError("");
    const form = new FormData(event.currentTarget); const password = String(form.get("password"));
    if (password !== String(form.get("confirmPassword"))) return setError("两次输入的密码不一致");
    setPending(true);
    try {
      await submitAuth("/api/auth/signup", { name: form.get("name"), email: form.get("email"), password });
      router.replace("/books"); router.refresh();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "初始化失败"); }
    finally { setPending(false); }
  };
  return <AuthPage title="初始化超级管理员" text="仅系统首个账号可通过此页面创建"><form onSubmit={submit} className="form-stack">
    <Label>姓名<Input name="name" autoComplete="name" required /></Label><Label>邮箱<Input name="email" type="email" autoComplete="email" required /></Label>
    <Label>密码<Input name="password" type="password" minLength={8} autoComplete="new-password" required /></Label><Label>确认密码<Input name="confirmPassword" type="password" minLength={8} autoComplete="new-password" required /></Label>
    {error && <p className="form-error">{error}</p>}<Button className="primary wide" type="submit" disabled={pending}>{pending ? "初始化中..." : "创建超级管理员"}</Button>
  </form><p className="auth-switch">已有账号？<Button variant="ghost" onClick={() => router.push("/signin")}>返回登录</Button></p></AuthPage>;
}

function AuthPage({ title, text, children }: { title: string; text: string; children: React.ReactNode }) {
  return <main className="login-shell"><section className="login-panel"><div className="brand-mark"><BookOpen size={24} /></div><p className="eyebrow">DANCI CONSOLE</p><h1>{title}</h1><p className="muted">{text}</p>{children}</section></main>;
}

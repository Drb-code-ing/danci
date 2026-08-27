"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, ChevronLeft, ChevronRight, LogOut, Menu, Users, X } from "lucide-react";
import type { SafeUser } from "@/lib/auth";

type Section = "books" | "admin-users";

export function AdminApp({ user, children }: { section: Section; user: SafeUser; children?: React.ReactNode }) {
  const router = useRouter(); const pathname = usePathname(); const [mobileOpen, setMobileOpen] = useState(false); const [collapsed, setCollapsed] = useState(false); const [signingOut, setSigningOut] = useState(false);
  const nav = [{ href: "/books", label: "书籍管理", icon: BookOpen }, ...(user.role === "super_admin" ? [{ href: "/admin-users", label: "用户管理", icon: Users }] : [])];
  const navigate = (href: string) => { setMobileOpen(false); router.push(href); };
  const logout = async () => { setSigningOut(true); await fetch("/api/auth/signout", { method: "POST" }); router.replace("/signin"); router.refresh(); };
  return <div className={`admin-shell ${collapsed ? "is-collapsed" : ""}`}>
    {mobileOpen && <button className="overlay" aria-label="关闭导航" onClick={() => setMobileOpen(false)} />}
    <aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}><div className="brand"><span className="brand-mark"><BookOpen size={20}/></span><span className="brand-copy"><b>词记后台</b><small>DANCI ADMIN</small></span><button className="mobile-close" aria-label="关闭导航" onClick={() => setMobileOpen(false)}><X size={19}/></button></div>
      <nav>{nav.map(({ href, label, icon: Icon }) => <button key={href} className={pathname === href ? "active" : ""} onClick={() => navigate(href)} title={label}><Icon size={19}/><span>{label}</span></button>)}</nav>
      <div className="sidebar-bottom"><span className="account-email" title={user.email}>{user.email}</span><button className="logout-button" disabled={signingOut} onClick={() => void logout()} title="退出登录" aria-label="退出登录"><LogOut size={19}/></button></div>
      <button className="collapse" aria-label={collapsed ? "展开导航" : "收起导航"} onClick={() => setCollapsed(!collapsed)}>{collapsed ? <ChevronRight size={16}/> : <ChevronLeft size={16}/>}</button>
    </aside>
    <main className="content"><header className="topbar"><button className="menu-button" aria-label="打开导航" onClick={() => setMobileOpen(true)}><Menu size={21}/></button><div><p className="eyebrow">MANAGEMENT CENTER</p><h2>{nav.find(item => item.href === pathname)?.label}</h2></div><div className="profile"><span>{user.name.slice(0, 1)}</span><div><b>{user.name}</b><small>{user.email}</small></div></div></header><div className="page-body">{children}</div></main>
  </div>;
}

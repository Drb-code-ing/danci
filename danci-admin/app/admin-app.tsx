"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, ChevronLeft, ChevronRight, LogOut, Menu, Pencil, Plus, Search, Trash2, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogCloseButton, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SafeUser } from "@/lib/auth";

export type Book = { id: number; title: string; author: string; category: string; words: number; status: "已发布" | "草稿" };
type Section = "books" | "admin-users";
const PAGE_SIZE = 5;
const seedBooks: Book[] = [
  { id: 1, title: "大学英语四级核心词汇", author: "词记教研组", category: "考试词汇", words: 1680, status: "已发布" },
  { id: 2, title: "商务英语高频词", author: "林青", category: "职场英语", words: 860, status: "已发布" },
  { id: 3, title: "每日基础英语", author: "陈语", category: "日常英语", words: 520, status: "草稿" },
];

function useLocalBooks() {
  const [books, setBooks] = useState<Book[]>(seedBooks);

  useEffect(() => {
    const restore = window.setTimeout(() => {
      const saved = localStorage.getItem("danci-books");
      if (!saved) return;

      try {
        setBooks(JSON.parse(saved) as Book[]);
      } catch {
        localStorage.removeItem("danci-books");
      }
    }, 0);

    return () => window.clearTimeout(restore);
  }, []);

  const update = (value: Book[]) => { setBooks(value); localStorage.setItem("danci-books", JSON.stringify(value)); };
  return [books, update] as const;
}

export function AdminApp({ section, user, children }: { section: Section; user: SafeUser; children?: React.ReactNode }) {
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
    <main className="content"><header className="topbar"><button className="menu-button" aria-label="打开导航" onClick={() => setMobileOpen(true)}><Menu size={21}/></button><div><p className="eyebrow">MANAGEMENT CENTER</p><h2>{nav.find(item => item.href === pathname)?.label}</h2></div><div className="profile"><span>{user.name.slice(0, 1)}</span><div><b>{user.name}</b><small>{user.email}</small></div></div></header><div className="page-body">{section === "books" ? <BooksPage/> : children}</div></main>
  </div>;
}

function BooksPage() {
  const [books, setBooks] = useLocalBooks(); const [query, setQuery] = useState(""); const [status, setStatus] = useState("全部"); const [page, setPage] = useState(1); const [editing, setEditing] = useState<Book | null | undefined>();
  const visible = useMemo(() => books.filter(book => `${book.title}${book.author}${book.category}`.toLowerCase().includes(query.toLowerCase()) && (status === "全部" || book.status === status)), [books, query, status]);
  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE)); const currentPage = Math.min(page, totalPages); const pagedBooks = visible.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const save = (book: Book) => { setBooks(editing ? books.map(item => item.id === book.id ? book : item) : [...books, book]); setEditing(undefined); };
  return <><PageHeading title="书籍管理" text="维护词书资料、词汇数量和发布状态。" action={() => setEditing(null)} actionText="新增书籍"/><section className="panel"><div className="toolbar"><div className="search"><Search size={17}/><Input placeholder="搜索书名、作者或分类..." value={query} onChange={event => { setQuery(event.target.value); setPage(1); }}/></div><AppSelect ariaLabel="筛选书籍状态" value={status} options={["全部", "已发布", "草稿"]} onValueChange={value => { setStatus(value); setPage(1); }}/><span>共 {visible.length} 本书</span></div><div className="table-wrap"><table><thead><tr><th>书籍</th><th>分类</th><th>词汇量</th><th>状态</th><th>操作</th></tr></thead><tbody>{pagedBooks.map(book => <tr key={book.id}><td><b>{book.title}</b><small>{book.author}</small></td><td>{book.category}</td><td>{book.words.toLocaleString()}</td><td><span className={`badge ${book.status === "草稿" ? "draft" : ""}`}>{book.status}</span></td><td><button className="icon-btn" aria-label="编辑书籍" onClick={() => setEditing(book)}><Pencil size={16}/></button><button className="icon-btn danger" aria-label="删除书籍" onClick={() => confirm("确定删除这本书吗？") && setBooks(books.filter(item => item.id !== book.id))}><Trash2 size={16}/></button></td></tr>)}</tbody></table>{!pagedBooks.length && <div className="empty">没有找到匹配的书籍</div>}</div><Pagination page={currentPage} totalPages={totalPages} total={visible.length} onChange={setPage}/></section>{editing !== undefined && <BookModal item={editing} nextId={Math.max(0, ...books.map(book => book.id)) + 1} onClose={() => setEditing(undefined)} onSave={save}/>}</>;
}

function AppSelect({ value, defaultValue, options, name, ariaLabel, onValueChange }: { value?: string; defaultValue?: string; options: string[]; name?: string; ariaLabel: string; onValueChange?: (value: string) => void }) { return <Select name={name} value={value} defaultValue={defaultValue} onValueChange={onValueChange}><SelectTrigger className="filter-select" aria-label={ariaLabel}><SelectValue/></SelectTrigger><SelectContent>{options.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select>; }
function PageHeading({ title, text, action, actionText }: { title: string; text: string; action: () => void; actionText: string }) { return <div className="page-heading"><div><h1>{title}</h1><p>{text}</p></div><Button className="primary" onClick={action}><Plus size={17}/>{actionText}</Button></div>; }
function Pagination({ page, totalPages, total, onChange }: { page: number; totalPages: number; total: number; onChange: (page: number) => void }) { return <div className="pagination"><span>共 {total} 条</span><div><Button variant="ghost" size="icon" className="icon-btn" aria-label="上一页" disabled={page === 1} onClick={() => onChange(page - 1)}><ChevronLeft size={16}/></Button><b>{page} / {totalPages}</b><Button variant="ghost" size="icon" className="icon-btn" aria-label="下一页" disabled={page === totalPages} onClick={() => onChange(page + 1)}><ChevronRight size={16}/></Button></div></div>; }
function BookModal({ item, nextId, onClose, onSave }: { item: Book | null; nextId: number; onClose: () => void; onSave: (book: Book) => void }) { const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const form = new FormData(event.currentTarget); onSave({ id: item?.id ?? nextId, title: String(form.get("title")).trim(), author: String(form.get("author")).trim(), category: String(form.get("category")).trim(), words: Number(form.get("words")), status: form.get("status") as Book["status"] }); }; return <Dialog open onOpenChange={open => !open && onClose()}><DialogContent><DialogHeader><DialogTitle>{item ? "编辑书籍" : "新增书籍"}</DialogTitle><DialogCloseButton/></DialogHeader><form className="form-grid" onSubmit={submit}><Label className="full">书名<Input name="title" defaultValue={item?.title} required/></Label><Label>作者<Input name="author" defaultValue={item?.author} required/></Label><Label>分类<Input name="category" defaultValue={item?.category} required/></Label><Label>词汇量<Input name="words" type="number" min="0" defaultValue={item?.words ?? 0} required/></Label><Label>状态<AppSelect name="status" ariaLabel="书籍状态" defaultValue={item?.status ?? "草稿"} options={["已发布", "草稿"]}/></Label><div className="modal-actions full"><Button type="button" variant="secondary" className="secondary" onClick={onClose}>取消</Button><Button className="primary">保存书籍</Button></div></form></DialogContent></Dialog>; }

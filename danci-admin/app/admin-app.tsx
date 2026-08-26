"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen, ChevronLeft, ChevronRight, LogOut, Menu,
  Pencil, Plus, Search, Trash2, Users, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogCloseButton, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type Book = { id: number; title: string; author: string; category: string; words: number; status: "已发布" | "草稿" };
export type Admin = { id: number; name: string; email: string; password: string; role: "超级管理员" | "内容管理员"; status: "启用" | "停用" };
type Section = "books" | "admin-users";
type Account = { name: string; email: string; password: string };

const AUTH_KEY = "danci-auth";
const ACCOUNTS_KEY = "danci-accounts";
const ADMINS_KEY = "danci-admins";
const PAGE_SIZE = 5;
const defaultAccount: Account = { name: "系统管理员", email: "admin@danci.com", password: "admin123" };

const seedBooks: Book[] = [
  { id: 1, title: "大学英语四级核心词汇", author: "词记教研组", category: "考试词汇", words: 1680, status: "已发布" },
  { id: 2, title: "商务英语高频词", author: "林青", category: "职场英语", words: 860, status: "已发布" },
  { id: 3, title: "每日基础英语", author: "陈语", category: "日常英语", words: 520, status: "草稿" },
];
const seedAdmins: Admin[] = [
  { id: 1, name: "系统管理员", email: "admin@danci.com", password: "admin123", role: "超级管理员", status: "启用" },
  { id: 2, name: "内容编辑", email: "editor@danci.com", password: "editor123", role: "内容管理员", status: "启用" },
];

function useLocalData<T>(key: string, seed: T) {
  const [data, setData] = useState(seed);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = localStorage.getItem(key);
      if (saved) setData(JSON.parse(saved) as T);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [key]);
  const update = (value: T) => { setData(value); localStorage.setItem(key, JSON.stringify(value)); };
  return [data, update] as const;
}

function getAccounts() {
  const saved = localStorage.getItem(ACCOUNTS_KEY);
  if (!saved) return [defaultAccount];
  return (JSON.parse(saved) as Array<Partial<Account>>).map(account => ({
    name: account.name || account.email?.split("@")[0] || "管理员",
    email: account.email || "",
    password: account.password || "",
  }));
}

function saveAccounts(accounts: Account[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function SignInPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (localStorage.getItem(AUTH_KEY)) router.replace("/books");
      else setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [router]);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email")).trim().toLowerCase();
    const password = String(form.get("password"));
    if (getAccounts().some(account => account.email === email && account.password === password)) {
      localStorage.setItem(AUTH_KEY, email);
      router.replace("/books");
    } else setError("邮箱或密码错误，请重新输入");
  };
  if (!ready) return <div className="loading">正在验证身份…</div>;
  return <AuthPage title="登录词记后台" text="使用管理员邮箱和密码登录">
    <form onSubmit={submit} className="form-stack">
      <Label>邮箱<Input name="email" type="email" defaultValue={defaultAccount.email} autoComplete="email" required /></Label>
      <Label>密码<Input name="password" type="password" defaultValue={defaultAccount.password} autoComplete="current-password" required /></Label>
      {error && <p className="form-error">{error}</p>}
      <Button className="primary wide" type="submit">登录</Button>
    </form>
    <p className="auth-switch">没有账号？<Button variant="ghost" onClick={() => router.push("/signup")}>立即注册</Button></p>
  </AuthPage>;
}

export function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name")).trim();
    const email = String(form.get("email")).trim().toLowerCase();
    const password = String(form.get("password"));
    const confirmPassword = String(form.get("confirmPassword"));
    if (!name) return setError("请输入姓名");
    if (!validateEmail(email)) return setError("请输入有效的邮箱地址");
    if (password.length < 6) return setError("密码至少需要 6 位");
    if (password !== confirmPassword) return setError("两次输入的密码不一致");
    const accounts = getAccounts();
    if (accounts.some(account => account.email === email)) return setError("该邮箱已注册");
    saveAccounts([...accounts, { name, email, password }]);
    const savedAdmins = localStorage.getItem(ADMINS_KEY);
    const admins = savedAdmins ? JSON.parse(savedAdmins) as Admin[] : seedAdmins;
    if (!admins.some(admin => admin.email === email)) {
      localStorage.setItem(ADMINS_KEY, JSON.stringify([...admins, { id: Math.max(0, ...admins.map(admin => admin.id)) + 1, name, email, password, role: "内容管理员", status: "启用" }]));
    }
    localStorage.setItem(AUTH_KEY, email);
    router.replace("/books");
  };
  return <AuthPage title="注册管理员账号" text="创建管理员账号后进入管理后台">
    <form onSubmit={submit} className="form-stack">
      <Label>姓名<Input name="name" autoComplete="name" required /></Label>
      <Label>邮箱<Input name="email" type="email" autoComplete="email" required /></Label>
      <Label>密码<Input name="password" type="password" minLength={6} autoComplete="new-password" required /></Label>
      <Label>确认密码<Input name="confirmPassword" type="password" minLength={6} autoComplete="new-password" required /></Label>
      {error && <p className="form-error">{error}</p>}
      <Button className="primary wide" type="submit">注册</Button>
    </form>
    <p className="auth-switch">已有账号？<Button variant="ghost" onClick={() => router.push("/signin")}>返回登录</Button></p>
  </AuthPage>;
}

function AuthPage({ title, text, children }: { title: string; text: string; children: React.ReactNode }) {
  return <main className="login-shell"><section className="login-panel">
    <div className="brand-mark"><BookOpen size={24} /></div>
    <p className="eyebrow">DANCI CONSOLE</p><h1>{title}</h1><p className="muted">{text}</p>
    {children}
  </section></main>;
}

export function AdminApp({ section }: { section: Section }) {
  const router = useRouter(); const pathname = usePathname();
  const [ready, setReady] = useState(false); const [account, setAccount] = useState<Account | null>(null); const [mobileOpen, setMobileOpen] = useState(false); const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const currentEmail = localStorage.getItem(AUTH_KEY);
      const currentAccount = currentEmail ? getAccounts().find(item => item.email === currentEmail) : undefined;
      if (!currentEmail || !currentAccount) { localStorage.removeItem(AUTH_KEY); router.replace("/signin"); }
      else { setAccount(currentAccount); setReady(true); }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [router]);
  if (!ready || !account) return <div className="loading">正在验证身份…</div>;
  const navigate = (href: string) => { setMobileOpen(false); router.push(href); };
  const logout = () => { localStorage.removeItem(AUTH_KEY); router.replace("/signin"); };
  const nav = [{ href: "/books", label: "书籍管理", icon: BookOpen }, { href: "/admin-users", label: "用户管理", icon: Users }];
  return <div className={`admin-shell ${collapsed ? "is-collapsed" : ""}`}>
    {mobileOpen && <button className="overlay" aria-label="关闭导航" onClick={() => setMobileOpen(false)} />}
    <aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}>
      <div className="brand"><span className="brand-mark"><BookOpen size={20} /></span><span className="brand-copy"><b>词记后台</b><small>DANCI ADMIN</small></span><button className="mobile-close" onClick={() => setMobileOpen(false)}><X size={19}/></button></div>
      <nav>{nav.map(({ href, label, icon: Icon }) => <button key={href} className={pathname === href ? "active" : ""} onClick={() => navigate(href)} title={label}><Icon size={19}/><span>{label}</span></button>)}</nav>
      <div className="sidebar-bottom"><span className="account-email" title={account.email}>{account.email}</span><button className="logout-button" onClick={logout} title="退出登录" aria-label="退出登录"><LogOut size={19}/></button></div>
      <button className="collapse" onClick={() => setCollapsed(!collapsed)}>{collapsed ? <ChevronRight size={16}/> : <ChevronLeft size={16}/>}</button>
    </aside>
    <main className="content"><header className="topbar"><button className="menu-button" onClick={() => setMobileOpen(true)}><Menu size={21}/></button><div><p className="eyebrow">MANAGEMENT CENTER</p><h2>{nav.find(n => n.href === pathname)?.label}</h2></div><div className="profile"><span>{account.name.slice(0, 1)}</span><div><b>{account.name}</b><small>{account.email}</small></div></div></header>
      <div className="page-body">{section === "books" ? <BooksPage /> : <AdminsPage />}</div>
    </main>
  </div>;
}

function BooksPage() {
  const [books, setBooks] = useLocalData<Book[]>("danci-books", seedBooks); const [query, setQuery] = useState(""); const [status, setStatus] = useState("全部"); const [page, setPage] = useState(1); const [editing, setEditing] = useState<Book|null|undefined>(undefined);
  const visible = useMemo(() => books.filter(book => `${book.title}${book.author}${book.category}`.toLowerCase().includes(query.toLowerCase()) && (status === "全部" || book.status === status)), [books, query, status]);
  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedBooks = visible.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const save = (book: Book) => { setBooks(editing ? books.map(item => item.id === book.id ? book : item) : [...books, book]); setEditing(undefined); };
  return <><PageHeading title="书籍管理" text="维护词书资料、词汇数量和发布状态。" action={() => setEditing(null)} actionText="新增书籍" />
    <section className="panel"><div className="toolbar"><div className="search"><Search size={17}/><Input placeholder="搜索书名、作者或分类…" value={query} onChange={event => { setQuery(event.target.value); setPage(1); }}/></div><AppSelect ariaLabel="筛选书籍状态" value={status} options={["全部", "已发布", "草稿"]} onValueChange={value => { setStatus(value); setPage(1); }} /><span>共 {visible.length} 本书</span></div><BookTable books={pagedBooks} onEdit={setEditing} onDelete={id => confirm("确定删除这本书吗？") && setBooks(books.filter(book => book.id !== id))}/><Pagination page={currentPage} totalPages={totalPages} total={visible.length} pageSize={PAGE_SIZE} onChange={setPage}/></section>
    {editing !== undefined && <BookModal item={editing} nextId={Math.max(0,...books.map(book => book.id))+1} onClose={() => setEditing(undefined)} onSave={save}/>}</>;
}
function BookTable({ books, onEdit, onDelete }: { books: Book[]; onEdit?: (book:Book)=>void; onDelete?: (id:number)=>void }) { return <div className="table-wrap"><table><thead><tr><th>书籍</th><th>分类</th><th>词汇量</th><th>状态</th>{onEdit&&<th>操作</th>}</tr></thead><tbody>{books.map(book=><tr key={book.id}><td><b>{book.title}</b><small>{book.author}</small></td><td>{book.category}</td><td>{book.words.toLocaleString()}</td><td><span className={`badge ${book.status === "草稿" ? "draft" : ""}`}>{book.status}</span></td>{onEdit&&<td><button className="icon-btn" onClick={()=>onEdit(book)}><Pencil size={16}/></button><button className="icon-btn danger" onClick={()=>onDelete?.(book.id)}><Trash2 size={16}/></button></td>}</tr>)}</tbody></table>{!books.length&&<div className="empty">没有找到匹配的书籍</div>}</div>; }

function AdminsPage() {
  const [admins, setAdmins] = useLocalData<Admin[]>(ADMINS_KEY, seedAdmins); const [query,setQuery]=useState(""); const [role,setRole]=useState("全部"); const [status,setStatus]=useState("全部"); const [page,setPage]=useState(1); const [editing,setEditing]=useState<Admin|null|undefined>(undefined); const [error,setError]=useState("");
  const normalizedAdmins = admins.map(admin => admin.email ? admin : { ...admin, email: `${(admin as Admin & { username?: string }).username || admin.name}@danci.com`, password: "admin123" });
  const visible = normalizedAdmins.filter(admin => `${admin.name}${admin.email}`.toLowerCase().includes(query.toLowerCase()) && (role === "全部" || admin.role === role) && (status === "全部" || admin.status === status));
  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedAdmins = visible.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const save = (admin:Admin) => {
    const duplicate = normalizedAdmins.some(item => item.email === admin.email && item.id !== admin.id);
    if (duplicate) return setError("该邮箱已存在");
    const nextAdmins = editing ? normalizedAdmins.map(item => item.id === admin.id ? admin : item) : [...normalizedAdmins, admin];
    setAdmins(nextAdmins);
    const previousEmail = editing?.email;
    const accounts = getAccounts().filter(account => account.email !== previousEmail && account.email !== admin.email);
    saveAccounts([...accounts, { name: admin.name, email: admin.email, password: admin.password }]);
    if (previousEmail && localStorage.getItem(AUTH_KEY) === previousEmail) localStorage.setItem(AUTH_KEY, admin.email);
    setError(""); setEditing(undefined);
  };
  const remove = (admin: Admin) => {
    if (!confirm("确定删除该管理员吗？")) return;
    setAdmins(normalizedAdmins.filter(item => item.id !== admin.id));
    saveAccounts(getAccounts().filter(account => account.email !== admin.email));
  };
  return <><PageHeading title="管理员" text="管理后台账号、角色和账号状态。" action={() => { setError(""); setEditing(null); }} actionText="新增管理员"/><section className="panel"><div className="toolbar"><div className="search"><Search size={17}/><Input placeholder="搜索姓名或邮箱…" value={query} onChange={event => { setQuery(event.target.value); setPage(1); }}/></div><AppSelect ariaLabel="筛选管理员角色" value={role} options={["全部", "超级管理员", "内容管理员"]} onValueChange={value => { setRole(value); setPage(1); }} /><AppSelect ariaLabel="筛选管理员状态" value={status} options={["全部", "启用", "停用"]} onValueChange={value => { setStatus(value); setPage(1); }} /><span>共 {visible.length} 位成员</span></div><div className="table-wrap"><table><thead><tr><th>管理员</th><th>角色</th><th>状态</th><th>操作</th></tr></thead><tbody>{pagedAdmins.map(admin=><tr key={admin.id}><td><b>{admin.name}</b><small>{admin.email}</small></td><td>{admin.role}</td><td><span className={`badge ${admin.status === "停用"?"draft":""}`}>{admin.status}</span></td><td><button className="icon-btn" onClick={()=>{ setError(""); setEditing(admin); }}><Pencil size={16}/></button><button className="icon-btn danger" disabled={admin.email===defaultAccount.email} onClick={()=>remove(admin)}><Trash2 size={16}/></button></td></tr>)}</tbody></table>{!pagedAdmins.length&&<div className="empty">没有找到匹配的管理员</div>}</div><Pagination page={currentPage} totalPages={totalPages} total={visible.length} pageSize={PAGE_SIZE} onChange={setPage}/></section>{editing!==undefined&&<AdminModal item={editing} nextId={Math.max(0,...normalizedAdmins.map(admin=>admin.id))+1} error={error} onClose={()=>setEditing(undefined)} onSave={save}/>}</>;
}
function AppSelect({ value, defaultValue, options, name, ariaLabel, onValueChange }: { value?: string; defaultValue?: string; options: string[]; name?: string; ariaLabel: string; onValueChange?: (value: string) => void }) {
  return <Select name={name} value={value} defaultValue={defaultValue} onValueChange={onValueChange}>
    <SelectTrigger className="filter-select" aria-label={ariaLabel}><SelectValue /></SelectTrigger>
    <SelectContent>{options.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
  </Select>;
}
function PageHeading({title,text,action,actionText}:{title:string;text:string;action:()=>void;actionText:string}) { return <div className="page-heading"><div><h1>{title}</h1><p>{text}</p></div><Button className="primary" onClick={action}><Plus size={17}/>{actionText}</Button></div>; }
function Pagination({ page, totalPages, total, pageSize, onChange }: { page: number; totalPages: number; total: number; pageSize: number; onChange: (page: number) => void }) { const start = total ? (page - 1) * pageSize + 1 : 0; const end = Math.min(page * pageSize, total); return <div className="pagination"><span>显示 {start}-{end}，共 {total} 条</span><div><Button variant="ghost" size="icon" className="icon-btn" aria-label="上一页" disabled={page === 1} onClick={() => onChange(page - 1)}><ChevronLeft size={16}/></Button><b>{page} / {totalPages}</b><Button variant="ghost" size="icon" className="icon-btn" aria-label="下一页" disabled={page === totalPages} onClick={() => onChange(page + 1)}><ChevronRight size={16}/></Button></div></div>; }

function Modal({title,onClose,children}:{title:string;onClose:()=>void;children:React.ReactNode}) { return <Dialog open onOpenChange={open => { if (!open) onClose(); }}><DialogContent><DialogHeader><DialogTitle>{title}</DialogTitle><DialogCloseButton /></DialogHeader>{children}</DialogContent></Dialog>; }
function BookModal({item,nextId,onClose,onSave}:{item:Book|null;nextId:number;onClose:()=>void;onSave:(book:Book)=>void}) { const submit=(event:FormEvent<HTMLFormElement>)=>{event.preventDefault();const form=new FormData(event.currentTarget);onSave({id:item?.id??nextId,title:String(form.get("title")).trim(),author:String(form.get("author")).trim(),category:String(form.get("category")).trim(),words:Number(form.get("words")),status:form.get("status") as Book["status"]})}; return <Modal title={item?"编辑书籍":"新增书籍"} onClose={onClose}><form className="form-grid" onSubmit={submit}><Label className="full">书名<Input name="title" defaultValue={item?.title} required/></Label><Label>作者<Input name="author" defaultValue={item?.author} required/></Label><Label>分类<Input name="category" defaultValue={item?.category} required/></Label><Label>词汇量<Input name="words" type="number" min="0" defaultValue={item?.words??0} required/></Label><Label>状态<AppSelect name="status" ariaLabel="书籍状态" defaultValue={item?.status??"草稿"} options={["已发布", "草稿"]}/></Label><div className="modal-actions full"><Button type="button" variant="secondary" className="secondary" onClick={onClose}>取消</Button><Button className="primary">保存书籍</Button></div></form></Modal>; }
function AdminModal({item,nextId,error,onClose,onSave}:{item:Admin|null;nextId:number;error:string;onClose:()=>void;onSave:(admin:Admin)=>void}) { const submit=(event:FormEvent<HTMLFormElement>)=>{event.preventDefault();const form=new FormData(event.currentTarget);onSave({id:item?.id??nextId,name:String(form.get("name")).trim(),email:item?.email===defaultAccount.email?item.email:String(form.get("email")).trim().toLowerCase(),password:String(form.get("password")),role:form.get("role") as Admin["role"],status:form.get("status") as Admin["status"]})}; return <Modal title={item?"编辑管理员":"新增管理员"} onClose={onClose}><form className="form-grid" onSubmit={submit}><Label>姓名<Input name="name" defaultValue={item?.name} required/></Label><Label>邮箱<Input name="email" type="email" defaultValue={item?.email} disabled={item?.email===defaultAccount.email} required/></Label><Label className="full">密码<Input name="password" type="password" minLength={6} defaultValue={item?.password} autoComplete="new-password" required/></Label><Label>角色<AppSelect name="role" ariaLabel="管理员角色" defaultValue={item?.role??"内容管理员"} options={["超级管理员", "内容管理员"]}/></Label><Label>状态<AppSelect name="status" ariaLabel="管理员状态" defaultValue={item?.status??"启用"} options={["启用", "停用"]}/></Label>{error&&<p className="form-error full">{error}</p>}<div className="modal-actions full"><Button type="button" variant="secondary" className="secondary" onClick={onClose}>取消</Button><Button className="primary">保存管理员</Button></div></form></Modal>; }

"use client";

import { FormEvent, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Pencil, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogCloseButton, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type AdminUser = { id: string; name: string; email: string; role: "super_admin" | "content_admin"; status: "active" | "disabled"; createdAt: string };
const PAGE_SIZE = 5;
const roleText = { super_admin: "超级管理员", content_admin: "内容管理员" };
const statusText = { active: "启用", disabled: "停用" };

async function request(url: string, options?: RequestInit) {
  const response = await fetch(url, options); const data = await response.json();
  if (!response.ok) throw new Error(data.error || "请求失败"); return data;
}

export function AdminUsers({ initialUsers }: { initialUsers: AdminUser[] }) {
  const [admins, setAdmins] = useState<AdminUser[]>(initialUsers); const [query, setQuery] = useState(""); const [role, setRole] = useState("all"); const [status, setStatus] = useState("all"); const [page, setPage] = useState(1); const [editing, setEditing] = useState<AdminUser | null | undefined>(); const [error, setError] = useState("");
  const load = async () => { try { setAdmins((await request("/api/admin-users")).users); } catch (caught) { setError(caught instanceof Error ? caught.message : "加载失败"); } };
  const visible = useMemo(() => admins.filter(admin => `${admin.name}${admin.email}`.toLowerCase().includes(query.toLowerCase()) && (role === "all" || admin.role === role) && (status === "all" || admin.status === status)), [admins, query, role, status]);
  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE)); const currentPage = Math.min(page, totalPages); const paged = visible.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const save = async (values: Omit<AdminUser, "createdAt"> & { password: string }) => { setError(""); try { const url = editing ? `/api/admin-users/${editing.id}` : "/api/admin-users"; await request(url, { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) }); setEditing(undefined); await load(); } catch (caught) { setError(caught instanceof Error ? caught.message : "保存失败"); } };
  return <><div className="page-heading"><div><h1>管理员</h1><p>管理后台账号、角色和账号状态。</p></div><Button className="primary" onClick={() => { setError(""); setEditing(null); }}><Plus size={17}/>新增管理员</Button></div>
    <section className="panel"><div className="toolbar"><div className="search"><Search size={17}/><Input placeholder="搜索姓名或邮箱..." value={query} onChange={event => { setQuery(event.target.value); setPage(1); }}/></div><Filter value={role} options={[{value:"all",label:"全部角色"},{value:"super_admin",label:"超级管理员"},{value:"content_admin",label:"内容管理员"}]} onChange={setRole}/><Filter value={status} options={[{value:"all",label:"全部状态"},{value:"active",label:"启用"},{value:"disabled",label:"停用"}]} onChange={setStatus}/><span>共 {visible.length} 位成员</span></div>
    <div className="table-wrap"><table><thead><tr><th>管理员</th><th>角色</th><th>状态</th><th>操作</th></tr></thead><tbody>{paged.map(admin => <tr key={admin.id}><td><b>{admin.name}</b><small>{admin.email}</small></td><td>{roleText[admin.role]}</td><td><span className={`badge ${admin.status === "disabled" ? "draft" : ""}`}>{statusText[admin.status]}</span></td><td><button className="icon-btn" aria-label="编辑管理员" onClick={() => { setError(""); setEditing(admin); }}><Pencil size={16}/></button></td></tr>)}</tbody></table>{!paged.length && <div className="empty">没有找到匹配的管理员</div>}</div>
    <div className="pagination"><span>共 {visible.length} 条</span><div><Button variant="ghost" size="icon" className="icon-btn" aria-label="上一页" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}><ChevronLeft size={16}/></Button><b>{currentPage} / {totalPages}</b><Button variant="ghost" size="icon" className="icon-btn" aria-label="下一页" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}><ChevronRight size={16}/></Button></div></div></section>
    {editing !== undefined && <AdminModal item={editing} error={error} onClose={() => setEditing(undefined)} onSave={save}/>} {editing === undefined && error && <p className="form-error">{error}</p>}</>;
}

function Filter({ value, options, onChange }: { value: string; options: { value: string; label: string }[]; onChange: (value: string) => void }) { return <Select value={value} onValueChange={onChange}><SelectTrigger className="filter-select"><SelectValue/></SelectTrigger><SelectContent>{options.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select>; }
function AdminModal({ item, error, onClose, onSave }: { item: AdminUser | null; error: string; onClose: () => void; onSave: (admin: Omit<AdminUser, "createdAt"> & { password: string }) => void }) { const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const form = new FormData(event.currentTarget); void onSave({ id: item?.id || "", name: String(form.get("name")).trim(), email: String(form.get("email")).trim(), password: String(form.get("password")), role: form.get("role") as AdminUser["role"], status: form.get("status") as AdminUser["status"] }); }; return <Dialog open onOpenChange={open => !open && onClose()}><DialogContent><DialogHeader><DialogTitle>{item ? "编辑管理员" : "新增管理员"}</DialogTitle><DialogCloseButton/></DialogHeader><form className="form-grid" onSubmit={submit}><Label>姓名<Input name="name" defaultValue={item?.name} required/></Label><Label>邮箱<Input name="email" type="email" defaultValue={item?.email} required/></Label><Label className="full">密码<Input name="password" type="password" minLength={8} required={!item} placeholder={item ? "留空则不修改" : "至少 8 位"} autoComplete="new-password"/></Label><Label>角色<FilterSelect name="role" defaultValue={item?.role || "content_admin"} options={[{value:"super_admin",label:"超级管理员"},{value:"content_admin",label:"内容管理员"}]}/></Label><Label>状态<FilterSelect name="status" defaultValue={item?.status || "active"} options={[{value:"active",label:"启用"},{value:"disabled",label:"停用"}]}/></Label>{error && <p className="form-error full">{error}</p>}<div className="modal-actions full"><Button type="button" variant="secondary" className="secondary" onClick={onClose}>取消</Button><Button className="primary">保存管理员</Button></div></form></DialogContent></Dialog>; }
function FilterSelect({ name, defaultValue, options }: { name: string; defaultValue: string; options: { value: string; label: string }[] }) { return <Select name={name} defaultValue={defaultValue}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{options.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select>; }

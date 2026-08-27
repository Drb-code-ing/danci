"use client";

import { FormEvent, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogCloseButton, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type BookItem = { id: string; bookId: string; title: string; wordCount: number; coverUrl: string | null; tags: string[]; createdAt: string };
const PAGE_SIZE = 5;

type BookFormValues = { id?: string; title: string; bookId: string; wordCount: number; coverUrl: string; tags: string };

async function request(url: string, options?: RequestInit) {
  const response = await fetch(url, options); const data = await response.json();
  if (!response.ok) throw new Error(data.error || "请求失败"); return data;
}

export function Books({ initialBooks }: { initialBooks: BookItem[] }) {
  const [books, setBooks] = useState<BookItem[]>(initialBooks); const [query, setQuery] = useState(""); const [page, setPage] = useState(1); const [editing, setEditing] = useState<BookItem | null | undefined>(); const [deleting, setDeleting] = useState<BookItem | null>(null); const [deletingInProgress, setDeletingInProgress] = useState(false); const [error, setError] = useState("");
  const load = async () => { try { setBooks((await request("/api/books")).books); } catch (caught) { setError(caught instanceof Error ? caught.message : "加载失败"); } };
  const visible = useMemo(() => books.filter(book => `${book.title}${book.bookId}`.toLowerCase().includes(query.toLowerCase())), [books, query]);
  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE)); const currentPage = Math.min(page, totalPages); const paged = visible.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const save = async (values: BookFormValues) => {
    setError("");
    try {
      await request(values.id ? `/api/books/${values.id}` : "/api/books", { method: values.id ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      setEditing(undefined); await load();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "保存失败"); }
  };
  const remove = async () => {
    if (!deleting) return;
    setDeletingInProgress(true); setError("");
    try { await request(`/api/books/${deleting.id}`, { method: "DELETE" }); setDeleting(null); await load(); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "删除失败"); }
    finally { setDeletingInProgress(false); }
  };
  return <><div className="page-heading"><div><h1>单词书管理</h1><p>维护单词书资料、词汇数量和标签。</p></div><Button className="primary" onClick={() => { setError(""); setEditing(null); }}><Plus size={17}/>新增单词书</Button></div>
    <section className="panel"><div className="toolbar"><div className="search"><Search size={17}/><Input placeholder="搜索书名或 bookId..." value={query} onChange={event => { setQuery(event.target.value); setPage(1); }}/></div><span>共 {visible.length} 本书</span></div>
    <div className="table-wrap"><table><thead><tr><th>单词书</th><th>单词数量</th><th>bookId</th><th>标签</th><th>操作</th></tr></thead><tbody>{paged.map(book => <tr key={book.id}><td><span className="book-cell"><span className="book-cover">{book.coverUrl ? <BookCover url={book.coverUrl} title={book.title}/> : <span className="book-cover-fallback">{book.title.slice(0, 1)}</span>}</span><b>{book.title}</b></span></td><td>{book.wordCount.toLocaleString()}</td><td><code>{book.bookId}</code></td><td><span className="tag-list">{book.tags.length ? book.tags.map(tag => <span key={tag} className="badge">{tag}</span>) : "-"}</span></td><td><button className="icon-btn" aria-label="编辑单词书" onClick={() => { setError(""); setEditing(book); }}><Pencil size={16}/></button><button className="icon-btn danger" aria-label="删除单词书" onClick={() => { setError(""); setDeleting(book); }}><Trash2 size={16}/></button></td></tr>)}</tbody></table>{!paged.length && <div className="empty">没有找到匹配的单词书</div>}</div>
    <div className="pagination"><span>共 {visible.length} 条</span><div><Button variant="ghost" size="icon" className="icon-btn" aria-label="上一页" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}><ChevronLeft size={16}/></Button><b>{currentPage} / {totalPages}</b><Button variant="ghost" size="icon" className="icon-btn" aria-label="下一页" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}><ChevronRight size={16}/></Button></div></div></section>
    {editing !== undefined && <BookModal item={editing} error={error} onClose={() => setEditing(undefined)} onSave={save}/>}
    <AlertDialog open={deleting !== null} onOpenChange={open => !open && !deletingInProgress && setDeleting(null)}>
      <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>删除单词书</AlertDialogTitle></AlertDialogHeader>
        <AlertDialogDescription>确定删除《{deleting?.title}》吗？该书中 {deleting ? deleting.wordCount.toLocaleString() : 0} 个单词将一并删除，此操作不可撤销。</AlertDialogDescription>
        {error && <p className="form-error">{error}</p>}
        <AlertDialogFooter><AlertDialogCancel disabled={deletingInProgress}>取消</AlertDialogCancel><AlertDialogAction disabled={deletingInProgress} onClick={event => { event.preventDefault(); void remove(); }}>{deletingInProgress ? "删除中..." : "删除"}</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    {editing === undefined && error && <p className="form-error">{error}</p>}</>;
}

function BookCover({ url, title }: { url: string; title: string }) {
  // 封面为用户填写的任意外部 URL，next/image 需要预配置域名，这里使用原生 img
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={`${title} 封面`} />;
}

function BookModal({ item, error, onClose, onSave }: { item: BookItem | null; error: string; onClose: () => void; onSave: (values: BookFormValues) => void }) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    void onSave({ id: item?.id, title: String(form.get("title")).trim(), bookId: String(form.get("bookId")).trim(), wordCount: Number(form.get("wordCount")), coverUrl: String(form.get("coverUrl")).trim(), tags: String(form.get("tags")) });
  };
  return <Dialog open onOpenChange={open => !open && onClose()}><DialogContent><DialogHeader><DialogTitle>{item ? "编辑单词书" : "新增单词书"}</DialogTitle><DialogCloseButton/></DialogHeader><form className="form-grid" onSubmit={submit}><Label className="full">标题<Input name="title" defaultValue={item?.title} required/></Label><Label>单词数量<Input name="wordCount" type="number" min="0" defaultValue={item?.wordCount ?? 0} required/></Label><Label>bookId<Input name="bookId" defaultValue={item?.bookId} required placeholder="如 PEPXiaoXue3_1"/></Label><Label className="full">封面 URL<Input name="coverUrl" type="url" defaultValue={item?.coverUrl ?? ""} placeholder="https://..."/></Label><Label className="full">标签<Input name="tags" defaultValue={item?.tags.join(", ")} placeholder="多个标签用逗号分隔，如: 小学,人教版"/></Label>{error && <p className="form-error full">{error}</p>}<div className="modal-actions full"><Button type="button" variant="secondary" className="secondary" onClick={onClose}>取消</Button><Button className="primary">保存单词书</Button></div></form></DialogContent></Dialog>;
}

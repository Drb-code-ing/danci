'use client';

import { useState } from 'react';
import { LogOut, Mail, UserRound } from 'lucide-react';
import { AppShell, PageHeader, useMockProgress, useMockUser } from '@/components/app-shell';
import { AuthModal, BookRow, getBookProgress } from '@/components/wordly-ui';
import type { Book } from '@/lib/mock-data';

export default function MyClient({ books }: { books: Book[] }) {
  const { email } = useMockUser(); const { progress } = useMockProgress(); const [open, setOpen] = useState(false);
  const started = books.filter((book) => progress[book.bookId]);
  const logout = () => { localStorage.removeItem('wordly_user'); window.location.reload(); };
  return <AppShell><PageHeader title="我的" /><div className="my-content">{email ? <><section className="profile"><div className="avatar"><UserRound size={22} /></div><div><p className="kicker">当前账户</p><strong>{email}</strong></div><button className="icon-button" onClick={logout} aria-label="退出登录"><LogOut size={19} /></button></section><section className="progress-section"><div className="section-heading"><span>学习进度</span><small>{started.length} 本已开始</small></div><div className="progress-list">{started.map((book) => <BookRow key={book.bookId} book={book} progress={getBookProgress(book, progress)} />)}</div>{started.length === 0 && <div className="empty-state">还没有学习记录<br /><span>从首页选择一本单词书开始</span></div>}</section></> : <div className="login-empty"><div className="empty-icon"><Mail size={25} /></div><h2>还没有登录</h2><p>登录后保存你的学习进度，<br />下次打开就能继续。</p><button className="primary-button" onClick={() => setOpen(true)}>登录 / 注册</button></div>}</div><AuthModal open={open} onClose={() => setOpen(false)} onSuccess={() => { setOpen(false); window.location.reload(); }} /></AppShell>;
}

'use client';

import { FormEvent, useState } from 'react';
import { ArrowRight, LockKeyhole, Mail, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { books, type Book } from '@/lib/mock-data';
import { Cover } from '@/components/app-shell';

export function BookRow({ book, progress = 0, onSelect }: { book: Book; progress?: number; onSelect?: () => void }) {
  const router = useRouter();
  const go = onSelect ?? (() => router.push(`/books/${book.bookId}`));
  return <button className="book-row" onClick={go}>
    <Cover book={book} />
    <span className="book-copy"><strong>{book.title}</strong><small>{book.wordCount} 个单词 · {book.tags.join(' / ')}</small>{progress > 0 && <span className="mini-progress"><i style={{ width: `${Math.min(progress / book.wordCount * 100, 100)}%` }} /></span>}</span>
    <ArrowRight className="row-arrow" size={18} />
  </button>;
}

export function AuthModal({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  if (!open) return null;
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!email || !password) return setError('请输入邮箱和密码');
    if (mode === 'signup' && password !== confirm) return setError('两次输入的密码不一致');
    window.localStorage.setItem('wordly_user', email);
    onSuccess();
  };
  return <div className="modal-backdrop" onClick={onClose}><section className="auth-modal" onClick={(event) => event.stopPropagation()}>
    <button className="modal-close" onClick={onClose} aria-label="关闭"><X size={18} /></button>
    <div className="modal-eyebrow">WORDLY / 账户</div><h2>{mode === 'login' ? '欢迎回来' : '创建你的账户'}</h2><p className="modal-subtitle">{mode === 'login' ? '登录后继续你的学习进度。' : '保存学习记录，随时接着学。'}</p>
    <div className="auth-tabs"><button className={mode === 'login' ? 'selected' : ''} onClick={() => { setMode('login'); setError(''); }}>登录</button><button className={mode === 'signup' ? 'selected' : ''} onClick={() => { setMode('signup'); setError(''); }}>注册</button></div>
    <form onSubmit={submit} className="auth-form"><label>邮箱<span className="field-wrap"><Mail size={16} /><input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com" /></span></label><label>密码<span className="field-wrap"><LockKeyhole size={16} /><input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="至少 6 位字符" /></span></label>{mode === 'signup' && <label>确认密码<span className="field-wrap"><LockKeyhole size={16} /><input value={confirm} onChange={(e) => setConfirm(e.target.value)} type="password" placeholder="再次输入密码" /></span></label>}{error && <p className="form-error">{error}</p>}<button className="primary-button" type="submit">{mode === 'login' ? '登录并开始学习' : '注册账户'}<ArrowRight size={16} /></button></form>
  </section></div>;
}

export const getBookProgress = (book: Book, progress: Record<string, number>) => progress[book.bookId] ?? 0;
export { books };

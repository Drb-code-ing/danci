'use client';

import { useState } from 'react';
import { BookOpen, Sparkles } from 'lucide-react';
import { AppShell, PageHeader, useMockProgress, useMockUser } from '@/components/app-shell';
import { AuthModal, BookRow, getBookProgress } from '@/components/wordly-ui';
import { books } from '@/lib/mock-data';

export default function HomePage() {
  const { email, setEmail } = useMockUser();
  const { progress } = useMockProgress();
  const [authOpen, setAuthOpen] = useState(false);
  const [target, setTarget] = useState<string | null>(null);
  const recent = books.find((book) => getBookProgress(book, progress) > 0);
  const start = (bookId: string) => { if (!email) { setTarget(bookId); setAuthOpen(true); } else window.location.href = `/books/${bookId}`; };
  return <AppShell><PageHeader title="Wordly" right={<span className="streak"><Sparkles size={15} /> 7 天</span>} /><div className="home-content"><div className="welcome-line"><div><p className="kicker">今日继续</p><h2>把一个单词，<br /><em>变成你的。</em></h2></div><div className="round-mark"><BookOpen size={21} /></div></div>{email && recent && <section className="recent-section"><div className="section-heading"><span>最近学习</span><small>继续上次进度</small></div><button className="recent-book" onClick={() => start(recent.bookId)}><div className="recent-cover" /><div><strong>{recent.title}</strong><p>{getBookProgress(recent, progress)} / {recent.wordCount} 个单词</p><span className="progress-line"><i style={{ width: `${getBookProgress(recent, progress) / recent.wordCount * 100}%` }} /></span></div><span className="continue-label">继续</span></button></section>}<section className="books-section"><div className="section-heading"><span>全部单词书</span><small>{books.length} 本可学习</small></div><div className="book-list">{books.map((book) => <BookRow key={book.bookId} book={book} progress={getBookProgress(book, progress)} onSelect={() => start(book.bookId)} />)}</div></section></div><AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onSuccess={() => { setEmail(window.localStorage.getItem('wordly_user')); setAuthOpen(false); if (target) window.location.href = `/books/${target}`; }} /></AppShell>;
}

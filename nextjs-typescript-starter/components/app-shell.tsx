'use client';

import { useEffect, useState } from 'react';
import { BookOpen, ChevronLeft, Home, UserRound } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Book } from '@/lib/mock-data';

export const useMockUser = () => {
  const [email, setEmail] = useState<string | null>(null);
  useEffect(() => setEmail(window.localStorage.getItem('wordly_user')), []);
  return { email, setEmail };
};

export const useMockProgress = () => {
  const [progress, setProgress] = useState<Record<string, number>>({});
  useEffect(() => {
    const saved = window.localStorage.getItem('wordly_progress');
    if (saved) setProgress(JSON.parse(saved));
  }, []);
  const save = (bookId: string, value: number) => {
    const next = { ...progress, [bookId]: value };
    setProgress(next);
    window.localStorage.setItem('wordly_progress', JSON.stringify(next));
  };
  return { progress, save };
};

export function BottomNav() {
  const pathname = usePathname();
  return <nav className="bottom-nav"><Link className={pathname === '/' ? 'active' : ''} href="/"><Home size={19} /><span>首页</span></Link><Link className={pathname.startsWith('/my') ? 'active' : ''} href="/my"><UserRound size={19} /><span>我的</span></Link></nav>;
}

export function AppShell({ children, showNav = true }: { children: React.ReactNode; showNav?: boolean }) {
  return <main className={showNav ? 'app-shell with-nav' : 'app-shell'}>{children}{showNav && <BottomNav />}</main>;
}

export function PageHeader({ title, back = false, right }: { title: string; back?: boolean; right?: React.ReactNode }) {
  return <header className="page-header">{back ? <button className="icon-button" onClick={() => history.back()} aria-label="返回"><ChevronLeft size={22} /></button> : <div className="brand-mark"><BookOpen size={18} /></div>}<h1>{title}</h1><div className="header-right">{right}</div></header>;
}

export function Cover({ book }: { book: Book }) {
  const url = book.coverUrl;
  const isImage = !!url && /^(https?:\/\/|\/|data:)/.test(url);
  return <div className="book-cover" style={!isImage && url ? { background: url } : url ? undefined : { background: 'linear-gradient(145deg, #d7cfc4, #a89a88)' }}>
    {isImage
      // 封面 URL 由后台任意输入，域名不固定，不适用 next/image 白名单
      // eslint-disable-next-line @next/next/no-img-element
      ? <img src={url!} alt={book.title} />
      : <><BookOpen size={25} /><span>{book.tags[0] ?? '词书'}</span></>}
  </div>;
}

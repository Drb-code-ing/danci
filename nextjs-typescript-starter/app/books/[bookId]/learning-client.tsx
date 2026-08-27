'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { AppShell, PageHeader } from '@/components/app-shell';
import type { Book, Word } from '@/lib/mock-data';

export default function LearningClient({ book, words }: { book: Book; words: Word[] }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const user = window.localStorage.getItem('wordly_user');
    if (!user) {
      router.replace('/');
      return;
    }
    const raw = JSON.parse(window.localStorage.getItem('wordly_progress') ?? '{}') as Record<string, number>;
    const saved = Math.min(raw[book.bookId] ?? 0, words.length);
    setIndex(saved);
    setDone(saved >= words.length);
    setReady(true);
    // 仅在挂载时读取一次本地进度
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persist = (value: number) => {
    const stored = JSON.parse(window.localStorage.getItem('wordly_progress') ?? '{}');
    stored[book.bookId] = value;
    window.localStorage.setItem('wordly_progress', JSON.stringify(stored));
  };

  const goNext = () => {
    const nextIndex = index + 1;
    persist(Math.min(nextIndex, words.length));
    if (nextIndex >= words.length) setDone(true);
    else setIndex(nextIndex);
  };

  const restart = () => {
    persist(0);
    setIndex(0);
    setDone(false);
  };

  if (!ready) {
    return <AppShell showNav={false}><div className="loading-view" /></AppShell>;
  }

  const current = words[Math.min(index, words.length - 1)];
  const content = current.content.word.content;
  const phonetic = content.usphone || content.ukphone;
  const sentence = content.sentence?.sentences?.[0];

  if (done) {
    return <AppShell showNav={false}>
      <PageHeader title={book.title} back />
      <div className="done-view">
        <p className="kicker">学习完成</p>
        <h2>{book.title}</h2>
        <div className="done-count">{words.length} / {words.length}</div>
        <p className="muted-line">本书已全部学完</p>
        <div className="done-actions">
          <Link className="ghost-button" href="/">返回首页</Link>
          <button className="primary-button" onClick={restart}><RotateCcw size={16} />重新学习</button>
        </div>
      </div>
    </AppShell>;
  }

  return <AppShell showNav={false}>
    <PageHeader title={book.title} back right={<span className="counter">{index + 1} / {words.length}</span>} />
    <span className="top-progress"><i style={{ width: `${(index / words.length) * 100}%` }} /></span>
    <div className="learn-main">
      <Link className="term-link" href={`/books/${book.bookId}/words/${current.id}`}>
        <h1 className="term">{current.headWord}</h1>
        {phonetic && <p className="phonetic">/{phonetic.replace(/^'|'/g, '')}/</p>}
      </Link>
      {sentence && <blockquote className="sentence-box">
        <p>{sentence.sContent}</p>
        <small>{sentence.sCn}</small>
      </blockquote>}
      <p className="hint">点击单词查看详细释义</p>
    </div>
    <div className="learn-actions">
      <button className="primary-button wide" onClick={goNext}>下一个<ArrowRight size={17} /></button>
    </div>
  </AppShell>;
}

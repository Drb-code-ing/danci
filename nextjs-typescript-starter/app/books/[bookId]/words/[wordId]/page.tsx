import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { getBook, getWords, type Word } from '@/lib/mock-data';

export default function WordDetailPage({ params }: { params: { bookId: string; wordId: string } }) {
  getBook(params.bookId);
  const list = getWords(params.bookId);
  const word: Word | undefined = list.find((item) => String(item.id) === params.wordId) ?? list[0];

  if (!word) {
    return <AppShell showNav={false}><div className="detail-content"><p className="empty-state">没有找到该单词</p></div></AppShell>;
  }

  const c = word.content?.word?.content ?? {};
  const sentences = c.sentence?.sentences ?? [];
  const synos = c.syno?.synos ?? [];
  const rels = c.relWord?.rels ?? [];
  const trans = c.trans ?? [];

  return <AppShell showNav={false}>
    <header className="page-header">
      <Link className="icon-button" href={`/books/${params.bookId}`} aria-label="返回学习"><ChevronLeft size={22} /></Link>
      <h1>单词详情</h1>
      <div className="header-right" />
    </header>
    <article className="detail-content">
      <section className="detail-hero">
        <h2>{word.headWord}</h2>
        <div className="phone-row">
          {c.usphone && <span>美 /{c.usphone}/</span>}
          {c.ukphone && <span>英 /{c.ukphone}/</span>}
        </div>
        {trans[0]?.tranCn && <p className="hero-meaning">{trans.map((t) => t.tranCn).filter(Boolean).join('；')}</p>}
      </section>

      {sentences.length > 0 && <section className="detail-block">
        <h3>例句</h3>
        {sentences.map((s, i) => <blockquote key={i} className="sentence-box plain"><p>{s.sContent}</p><small>{s.sCn}</small></blockquote>)}
      </section>}

      {trans.length > 0 && <section className="detail-block">
        <h3>英文释义</h3>
        {trans.map((t, i) => t.tranOther && <p key={i} className="plain-text">{t.tranOther}</p>)}
      </section>}

      {synos.length > 0 && <section className="detail-block">
        <h3>同近义词</h3>
        {synos.map((group, i) => <div key={i} className="relation-row">
          <span className="pos-badge">{group.pos}</span>
          <div><p>{group.tran}</p><small>{(group.hwds ?? []).map((w) => w.w).join(' · ')}</small></div>
        </div>)}
      </section>}

      {rels.length > 0 && <section className="detail-block">
        <h3>同根词</h3>
        {rels.map((group, i) => <div key={i} className="relation-row">
          <span className="pos-badge">{group.pos}</span>
          <div>{(group.words ?? []).map((w, j) => <p key={j}><strong>{w.hwd}</strong>{w.tran && <em> — {w.tran.trim()}</em>}</p>)}</div>
        </div>)}
      </section>}

      {c.remMethod?.val && <section className="memory-card">
        <h3>记忆法</h3>
        <p>{c.remMethod.val}</p>
      </section>}
    </article>
  </AppShell>;
}

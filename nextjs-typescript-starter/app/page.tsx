import { getAllBooks } from 'app/db';
import HomeClient from './home-client';

// 每次请求实时查询数据库，保证单词书列表最新
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const books = await getAllBooks();
  return <HomeClient books={books} />;
}

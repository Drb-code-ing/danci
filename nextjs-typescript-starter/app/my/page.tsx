import { getAllBooks } from 'app/db';
import MyClient from './my-client';

// 每次请求实时查询数据库，学习进度展示与 books 表保持一致
export const dynamic = 'force-dynamic';

export default async function MyPage() {
  const books = await getAllBooks();
  return <MyClient books={books} />;
}

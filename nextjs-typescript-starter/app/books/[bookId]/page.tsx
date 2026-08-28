import { redirect } from 'next/navigation';
import { getBookByBookId, getWordsByBook, mapDbWord } from 'app/db';
import LearningClient from './learning-client';

export default async function LearningPage({ params }: { params: { bookId: string } }) {
  const book = await getBookByBookId(params.bookId);
  if (!book) redirect('/');
  const list = (await getWordsByBook(params.bookId)).map(mapDbWord);
  if (!list.length) redirect('/');
  return <LearningClient book={book} words={list} />;
}

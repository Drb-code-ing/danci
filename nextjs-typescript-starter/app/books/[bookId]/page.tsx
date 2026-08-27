import { redirect } from 'next/navigation';
import { getBook, getWords } from '@/lib/mock-data';
import LearningClient from './learning-client';

export default function LearningPage({ params }: { params: { bookId: string } }) {
  const book = getBook(params.bookId); const list = getWords(params.bookId);
  if (!list.length) redirect('/');
  return <LearningClient book={book} words={list} />;
}

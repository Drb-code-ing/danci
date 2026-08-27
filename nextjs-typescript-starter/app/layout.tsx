import './globals.css';

import { GeistSans } from 'geist/font/sans';

let title = 'Wordly · H5 英语单词学习';
let description =
  '浏览单词书、卡片式背单词，随时继续你的学习进度。';

export const metadata = {
  title,
  description,
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
  metadataBase: new URL('https://nextjs-postgres-auth.vercel.app'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={GeistSans.variable}>{children}</body>
    </html>
  );
}

export type WordContent = {
  usphone?: string;
  ukphone?: string;
  trans?: { tranCn?: string; tranOther?: string }[];
  sentence?: { sentences?: { sContent?: string; sCn?: string }[] };
  syno?: { synos?: { pos?: string; tran?: string; hwds?: { w?: string }[] }[] };
  relWord?: { rels?: { pos?: string; words?: { hwd?: string; tran?: string }[] }[] };
  remMethod?: { val?: string };
};

export type Word = {
  id: number;
  wordRank: number;
  headWord: string;
  bookId: string;
  content: { word: { wordHead: string; wordId: string; content: WordContent } };
};

// 与 app/schema.ts 的 Book（books 表）字段保持一致，coverUrl 为空时用占位样式
export type Book = {
  id: string;
  bookId: string;
  title: string;
  wordCount: number;
  coverUrl: string | null;
  tags: string[];
};

// "我的"页面在接入真实数据前，先用这份 mock 书单渲染学习进度
export const books: Book[] = [
  { id: 'primary-3', bookId: 'PEPXiaoXue3_1', title: '小学英语三年级上册', wordCount: 500, coverUrl: 'linear-gradient(145deg, #ffb38a, #f36f56)', tags: ['小学', '入门'] },
  { id: 'primary-6', bookId: 'PEPXiaoXue6_1', title: '小学英语六年级上册', wordCount: 600, coverUrl: 'linear-gradient(145deg, #8bd8cf, #4c9e9a)', tags: ['小学', '进阶'] },
  { id: 'junior', bookId: 'CET4_Core', title: '大学英语四级核心词', wordCount: 800, coverUrl: 'linear-gradient(145deg, #b9a4e9, #6650a8)', tags: ['四级', '考试'] },
];

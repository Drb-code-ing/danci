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

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

export type Book = {
  id: string;
  bookId: string;
  title: string;
  wordCount: number;
  coverUrl: string;
  tags: string[];
};

const makeWord = (id: number, bookId: string, word: string, phone: string, meaning: string, example: string, translation: string): Word => ({
  id,
  wordRank: id,
  headWord: word,
  bookId,
  content: {
    word: {
      wordHead: word,
      wordId: `${bookId}_${id}`,
      content: {
        usphone: phone,
        ukphone: phone,
        trans: [{ tranCn: meaning, tranOther: `to use or describe ${word} in English` }],
        sentence: { sentences: [{ sContent: example, sCn: translation }] },
        syno: { synos: [{ pos: 'n', tran: meaning, hwds: [{ w: word === 'ruler' ? 'governor' : 'guide' }] }] },
        relWord: { rels: [{ pos: 'v', words: [{ hwd: `${word}d`, tran: `与 ${word} 相关的动词形式` }] }] },
        remMethod: { val: `把 ${word} 放进一个熟悉的生活画面里，边读边记。` },
      },
    },
  },
});

export const books: Book[] = [
  { id: 'primary-3', bookId: 'PEPXiaoXue3_1', title: '小学英语三年级上册', wordCount: 500, coverUrl: 'linear-gradient(145deg, #ffb38a, #f36f56)', tags: ['小学', '入门'] },
  { id: 'primary-6', bookId: 'PEPXiaoXue6_1', title: '小学英语六年级上册', wordCount: 600, coverUrl: 'linear-gradient(145deg, #8bd8cf, #4c9e9a)', tags: ['小学', '进阶'] },
  { id: 'junior', bookId: 'CET4_Core', title: '大学英语四级核心词', wordCount: 800, coverUrl: 'linear-gradient(145deg, #b9a4e9, #6650a8)', tags: ['四级', '考试'] },
];

export const words: Word[] = [
  makeWord(1, 'PEPXiaoXue3_1', 'ruler', "'rulɚ", '尺子；统治者', 'a 12-inch ruler', '一把12英寸的尺子'),
  makeWord(2, 'PEPXiaoXue3_1', 'school', "'skuːl", '学校', 'I walk to school every day.', '我每天走路去学校。'),
  makeWord(3, 'PEPXiaoXue3_1', 'friend', "'frend", '朋友', 'She is my best friend.', '她是我最好的朋友。'),
  makeWord(4, 'PEPXiaoXue3_1', 'window', "'wɪndoʊ", '窗户', 'Please open the window.', '请打开窗户。'),
  makeWord(5, 'PEPXiaoXue3_1', 'garden', "'gɑːrdn", '花园', 'There are flowers in the garden.', '花园里有花。'),
  makeWord(6, 'PEPXiaoXue6_1', 'journey', "'dʒɜːrni", '旅行；旅程', 'Life is a long journey.', '人生是一场漫长的旅程。'),
  makeWord(7, 'PEPXiaoXue6_1', 'discover', "dɪ'skʌvər", '发现', 'We discover something new every day.', '我们每天都会发现新事物。'),
];

export const getBook = (bookId: string) => books.find((book) => book.bookId === bookId) ?? books[0];
export const getWords = (bookId: string) => words.filter((word) => word.bookId === bookId);
export const getWord = (bookId: string, wordId: string) => getWords(bookId).find((word) => String(word.id) === wordId) ?? getWords(bookId)[0];

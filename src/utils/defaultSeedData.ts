import { supabase } from '../lib/supabase';
import { requireUserId } from '../lib/currentUser';

const SEED_KEY = 'defaultSeedData:v1';

const books = [
  {
    key: 'one-hundred-years',
    title: '百年孤独',
    author: '加西亚·马尔克斯',
    cover_url: '/image/百年孤独.png',
    status: 'reading',
    type: 'book',
    progress: 42,
    tags: ['文学', '魔幻现实主义']
  },
  {
    key: 'moon-and-sixpence',
    title: '月亮与六便士',
    author: '毛姆',
    cover_url: '/image/月亮与六便士.png',
    status: 'read',
    type: 'book',
    progress: 100,
    tags: ['文学']
  },
  {
    key: 'little-prince',
    title: '小王子',
    author: '安托万·德·圣-埃克苏佩里',
    cover_url: '/image/小王子.png',
    status: 'read',
    type: 'book',
    progress: 100,
    tags: ['童话', '哲思']
  },
  {
    key: 'walden',
    title: '瓦尔登湖',
    author: '梭罗',
    cover_url: '/image/瓦尔登湖.png',
    status: 'reading',
    type: 'book',
    progress: 28,
    tags: ['自然', '随笔']
  },
  {
    key: 'siddhartha',
    title: '悉达多',
    author: '赫尔曼·黑塞',
    cover_url: '/image/悉达多.png',
    status: 'want_to_read',
    type: 'book',
    progress: 0,
    tags: ['哲学']
  }
];

const notes = [
  {
    bookKey: 'one-hundred-years',
    content: '生命中真正重要的不是你遭遇了什么，而是你记住了哪些事，又是如何铭记的。这本书让我深刻体会到时间的循环和命运的轮回。',
    tags: ['感悟', '金句']
  },
  {
    bookKey: 'moon-and-sixpence',
    content: '我用尽了全力，过着平凡的一生。这句话让我想到艺术、欲望与现实之间永远存在的拉扯。',
    tags: ['书摘', '感悟']
  },
  {
    bookKey: 'little-prince',
    content: '真正重要的东西，用眼睛是看不见的。很多时候，阅读让我重新学会温柔地看待世界。',
    tags: ['金句', '灵感']
  },
  {
    bookKey: 'walden',
    content: '我步入丛林，因为我希望生活得有意义。独处并不是退后，而是重新听见自己。',
    tags: ['书摘', '思考']
  },
  {
    bookKey: 'siddhartha',
    content: '所有的人都曾经是小孩，虽然，只有少数的人记得。也许成长，就是在远行后重新找回自己。',
    tags: ['灵感', '感悟']
  }
];

export async function ensureDefaultSeedData() {
  if (typeof window === 'undefined') {
    return;
  }

  const userId = await requireUserId();
  const userSeedKey = `${SEED_KEY}:${userId}`;
  if (window.localStorage.getItem(userSeedKey) === 'done') {
    return;
  }

  const { count, error: countError } = await supabase
    .from('books')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);
  if (countError) throw countError;

  if ((count ?? 0) > 0) {
    window.localStorage.setItem(userSeedKey, 'done');
    return;
  }

  await addMissingDefaultSeedData(userId);
  window.localStorage.setItem(userSeedKey, 'done');
}

async function addMissingDefaultSeedData(userId: string) {
  const { data: existingBooks, error: existingBooksError } = await supabase
    .from('books')
    .select('id, title')
    .eq('user_id', userId)
    .in('title', books.map((book) => book.title));
  if (existingBooksError) throw existingBooksError;

  const existingBookTitles = new Set(existingBooks.map((book) => book.title));
  const bookRows = books
    .filter((book) => !existingBookTitles.has(book.title))
    .map((book) => ({
      user_id: userId,
      title: book.title,
      author: book.author,
      cover_url: book.cover_url,
      status: book.status,
      type: book.type,
      progress: book.progress,
      tags: [...book.tags]
    }));

  let createdBooks: Array<{ id: string; title: string }> = [];
  if (bookRows.length > 0) {
    const { data, error: booksError } = await supabase
      .from('books')
      .insert(bookRows)
      .select('id, title');
    if (booksError) throw booksError;
    createdBooks = data;
  }

  const bookIdsByTitle = new Map(
    [...existingBooks, ...createdBooks].map((book) => [book.title, book.id])
  );
  const { data: existingNotes, error: existingNotesError } = await supabase
    .from('notes')
    .select('content')
    .eq('user_id', userId)
    .in('content', notes.map((note) => note.content));
  if (existingNotesError) throw existingNotesError;

  const existingNoteContents = new Set(existingNotes.map((note) => note.content));
  const notesRows = notes
    .filter((note) => !existingNoteContents.has(note.content))
    .map((note) => {
      const sourceBook = books.find((book) => book.key === note.bookKey);
      if (!sourceBook) throw new Error(`Missing seed book for ${note.bookKey}`);
      const bookId = bookIdsByTitle.get(sourceBook.title);
      if (!bookId) throw new Error(`Missing created book for ${sourceBook.title}`);

      return {
        user_id: userId,
        book_id: bookId,
        content: note.content,
        tags: [...note.tags]
      };
    });

  if (notesRows.length > 0) {
    const { error: notesError } = await supabase.from('notes').insert(notesRows);
    if (notesError) throw notesError;
  }
}

export async function addMissingDefaultSeedDataForCurrentUser() {
  const userId = await requireUserId();
  await addMissingDefaultSeedData(userId);
}

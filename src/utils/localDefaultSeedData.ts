import type { Book } from '../data/books';
import type { Note } from '../data/notes';
import type { Collection } from '../data/collections';
import { localDataStore } from '../lib/localDataStore';

const SEED_KEY = 'local-default-seed-data:v1';

const defaultBooks: Omit<Book, 'id' | 'user_id' | 'created_at' | 'updated_at'>[] = [
  {
    title: '百年孤独',
    author: '加西亚·马尔克斯',
    cover_url: '/image/百年孤独.png',
    status: 'reading',
    type: 'book',
    progress: 42,
    tags: ['文学', '魔幻现实主义']
  },
  {
    title: '月亮与六便士',
    author: '毛姆',
    cover_url: '/image/月亮与六便士.png',
    status: 'read',
    type: 'book',
    progress: 100,
    tags: ['文学']
  },
  {
    title: '小王子',
    author: '安托万·德·圣-埃克苏佩里',
    cover_url: '/image/小王子.png',
    status: 'read',
    type: 'book',
    progress: 100,
    tags: ['童话', '哲思']
  },
  {
    title: '瓦尔登湖',
    author: '梭罗',
    cover_url: '/image/瓦尔登湖.png',
    status: 'reading',
    type: 'book',
    progress: 28,
    tags: ['自然', '随笔']
  },
  {
    title: '悉达多',
    author: '赫尔曼·黑塞',
    cover_url: '/image/悉达多.png',
    status: 'want_to_read',
    type: 'book',
    progress: 0,
    tags: ['哲学']
  },
  {
    title: '平凡的世界',
    author: '路遥',
    cover_url: '/image/平凡的世界.png',
    status: 'reading',
    type: 'book',
    progress: 65,
    tags: ['文学', '成长']
  },
  {
    title: '置身事内',
    author: '兰小欢',
    cover_url: '/image/置身事内.png',
    status: 'read',
    type: 'book',
    progress: 100,
    tags: ['经济', '社会']
  }
];



export async function ensureLocalDefaultSeedData(userId: string) {
  const userSeedKey = `${SEED_KEY}:${userId}`;
  if (localStorage.getItem(userSeedKey) === 'done') {
    return;
  }

  const existingBooks = localDataStore.getBooks(userId);
  if (existingBooks.length > 0) {
    localStorage.setItem(userSeedKey, 'done');
    return;
  }

  const books: Book[] = defaultBooks.map((book, index) => ({
    ...book,
    id: `book_${userId}_${index}`,
    user_id: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));

  localDataStore.saveBooks(userId, books);

  const bookIdMap = new Map(books.map(b => [b.title, b.id]));
  
  const notes: Note[] = [
    {
      id: `note_${userId}_1`,
      book_id: bookIdMap.get('百年孤独') || books[0].id,
      content: '生命中真正重要的不是你遭遇了什么，而是你记住了哪些事，又是如何铭记的。这本书让我深刻体会到时间的循环和命运的轮回。',
      tags: ['感悟', '金句'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: `note_${userId}_2`,
      book_id: bookIdMap.get('月亮与六便士') || books[1].id,
      content: '我用尽了全力，过着平凡的一生。这句话让我想到艺术、欲望与现实之间永远存在的拉扯。',
      tags: ['书摘', '感悟'],
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: `note_${userId}_3`,
      book_id: bookIdMap.get('小王子') || books[2].id,
      content: '真正重要的东西，用眼睛是看不见的。很多时候，阅读让我重新学会温柔地看待世界。',
      tags: ['金句', '灵感'],
      created_at: new Date(Date.now() - 172800000).toISOString(),
      updated_at: new Date(Date.now() - 172800000).toISOString()
    },
    {
      id: `note_${userId}_4`,
      book_id: bookIdMap.get('瓦尔登湖') || books[3].id,
      content: '我步入丛林，因为我希望生活得有意义。独处并不是退后，而是重新听见自己。',
      tags: ['书摘', '思考'],
      created_at: new Date(Date.now() - 259200000).toISOString(),
      updated_at: new Date(Date.now() - 259200000).toISOString()
    },
    {
      id: `note_${userId}_5`,
      book_id: bookIdMap.get('平凡的世界') || books[5].id,
      content: '其实我们每个人的生活都是一个世界，即使最平凡的人也要为他生活的那个世界而奋斗。',
      tags: ['金句', '感悟'],
      created_at: new Date(Date.now() - 345600000).toISOString(),
      updated_at: new Date(Date.now() - 345600000).toISOString()
    },
    {
      id: `note_${userId}_6`,
      book_id: bookIdMap.get('置身事内') || books[6].id,
      content: '改革的过程，不仅是经济增长的过程，也是利益格局调整的过程。',
      tags: ['书摘', '思考'],
      created_at: new Date(Date.now() - 432000000).toISOString(),
      updated_at: new Date(Date.now() - 432000000).toISOString()
    }
  ];

  localDataStore.saveNotes(userId, notes);

  const readingBookIds = books
    .filter(b => b.status === 'reading')
    .map(b => b.id);
  const classicBookIds = books
    .filter(b => b.tags?.includes('文学'))
    .map(b => b.id);

  const collections: Collection[] = [
    {
      id: `collection_${userId}_1`,
      name: '我的书架',
      description: '收藏的所有书籍',
      bookIds: books.map(b => b.id),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: `collection_${userId}_2`,
      name: '正在阅读',
      description: '当前在读的书籍',
      bookIds: readingBookIds,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: `collection_${userId}_3`,
      name: '经典文学',
      description: '值得反复阅读的经典',
      bookIds: classicBookIds,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  localDataStore.saveCollections(userId, collections);

  localStorage.setItem(userSeedKey, 'done');
}

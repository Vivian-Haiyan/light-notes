import { supabase } from '../lib/supabase';
import { requireUserId } from '../lib/currentUser';
import { createCacheEntry, readCache } from '../lib/dataCache';
import { createSignedAssetUrl, isManagedBookCoverValue } from '../lib/storage';
import { localDataStore } from '../lib/localDataStore';
import { useLocalData } from '../lib/runtimeConfig';

export interface Book {
  id: string;
  title: string;
  author: string;
  cover_url: string | null;
  cover_path?: string | null;
  status: 'want_to_read' | 'reading' | 'read' | 'shelved';
  type: 'book' | 'class';
  created_at: string;
  updated_at: string;
  progress?: number;
  rating?: number;
  tags?: string[];
}

async function toBook(row: {
  id: string;
  title: string;
  author: string | null;
  cover_url: string | null;
  status: string;
  type: string;
  created_at: string;
  updated_at: string;
  progress: number | null;
  rating: number | null;
  tags: string[];
}): Promise<Book> {
  const coverPath = isManagedBookCoverValue(row.cover_url) ? row.cover_url : null;
  return {
    id: row.id,
    title: row.title,
    author: row.author || '',
    cover_url: coverPath ? await createSignedAssetUrl('book-covers', coverPath) : row.cover_url,
    cover_path: coverPath,
    status: row.status as Book['status'],
    type: row.type as Book['type'],
    created_at: row.created_at,
    updated_at: row.updated_at,
    progress: row.progress ?? undefined,
    rating: row.rating ?? undefined,
    tags: row.tags
  };
}

const booksCache = new Map<string, ReturnType<typeof createCacheEntry<Book[]>>>();

export function clearBooksCache(userId: string) {
  booksCache.delete(userId);
}

type NewBook = Omit<Book, 'id' | 'created_at' | 'updated_at'> & { id?: string };

export async function getBooks(): Promise<Book[]> {
  const userId = await requireUserId();
  
  if (useLocalData) {
    return localDataStore.getBooks(userId);
  }

  const cachedBooks = readCache(booksCache.get(userId) ?? null);
  if (cachedBooks) {
    return cachedBooks;
  }

  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  const books = await Promise.all(data.map(toBook));
  booksCache.set(userId, createCacheEntry(books));
  return books;
}

export async function getBookById(id: string): Promise<Book | undefined> {
  const userId = await requireUserId();
  if (useLocalData) {
    return localDataStore.getBooks(userId).find((book) => book.id === id);
  }

  const cachedBooks = readCache(booksCache.get(userId) ?? null);
  if (cachedBooks) {
    return cachedBooks.find((book) => book.id === id);
  }

  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data ? toBook(data) : undefined;
}

export async function getBooksByIds(ids: string[]): Promise<Book[]> {
  if (ids.length === 0) return [];

  const userId = await requireUserId();
  if (useLocalData) {
    const books = localDataStore.getBooks(userId);
    const requestedIds = new Set(ids);
    return books.filter((book) => requestedIds.has(book.id));
  }

  const cachedBooks = readCache(booksCache.get(userId) ?? null);
  if (cachedBooks) {
    const requestedIds = new Set(ids);
    return cachedBooks.filter((book) => requestedIds.has(book.id));
  }

  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('user_id', userId)
    .in('id', ids);
  if (error) throw error;
  return Promise.all(data.map(toBook));
}

export async function addBook(book: NewBook): Promise<Book> {
  const userId = await requireUserId();
  if (useLocalData) {
    const now = new Date().toISOString();
    const createdBook: Book = {
      ...book,
      id: book.id ?? crypto.randomUUID(),
      author: book.author || '',
      cover_url: book.cover_path ?? book.cover_url,
      created_at: now,
      updated_at: now
    };
    localDataStore.saveBooks(userId, [createdBook, ...localDataStore.getBooks(userId)]);
    return createdBook;
  }

  const newBook = {
    user_id: userId,
    title: book.title,
    author: book.author || null,
    cover_url: book.cover_path ?? book.cover_url,
    status: book.status,
    type: book.type || 'book',
    progress: book.progress ?? null,
    rating: book.rating ?? null,
    tags: book.tags ?? [],
    ...(book.id ? { id: book.id } : {})
  };

  const { data, error } = await supabase
    .from('books')
    .insert(newBook)
    .select()
    .single();
  if (error) throw error;
  clearBooksCache(userId);
  return toBook(data);
}

export async function updateBook(id: string, book: Partial<Book>): Promise<Book | undefined> {
  const userId = await requireUserId();
  if (useLocalData) {
    const books = localDataStore.getBooks(userId);
    const currentBook = books.find((item) => item.id === id);
    if (!currentBook) return undefined;
    const updatedBook: Book = {
      ...currentBook,
      ...book,
      cover_url: book.cover_path ?? book.cover_url ?? currentBook.cover_url,
      updated_at: new Date().toISOString()
    };
    localDataStore.saveBooks(userId, books.map((item) => (item.id === id ? updatedBook : item)));
    return updatedBook;
  }

  const { data, error } = await supabase
    .from('books')
    .update({
      title: book.title,
      author: book.author,
      cover_url: book.cover_path ?? book.cover_url,
      status: book.status,
      type: book.type,
      progress: book.progress ?? null,
      rating: book.rating ?? null,
      tags: book.tags
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .maybeSingle();
  if (error) throw error;
  clearBooksCache(userId);
  return data ? toBook(data) : undefined;
}

export async function deleteBookById(id: string): Promise<boolean> {
  const book = await getBookById(id);
  if (!book) return false;

  const { addDeletedBook } = await import('./deletedBooks');
  const { deleteNotesByBookId } = await import('./notes');

  await addDeletedBook({
    id: book.id,
    title: book.title,
    author: book.author,
    cover_url: book.cover_path ?? book.cover_url,
    status: book.status,
    type: book.type,
    created_at: book.created_at,
    updated_at: book.updated_at,
    progress: book.progress,
    rating: book.rating,
    tags: book.tags
  });
  await deleteNotesByBookId(id);

  const userId = await requireUserId();
  if (useLocalData) {
    const books = localDataStore.getBooks(userId).filter((item) => item.id !== id);
    localDataStore.saveBooks(userId, books);
    return true;
  }

  const { error } = await supabase.from('books').delete().eq('id', id).eq('user_id', userId);
  if (error) throw error;
  clearBooksCache(userId);
  return true;
}

export async function bookExists(title: string, excludeId?: string): Promise<boolean> {
  const userId = await requireUserId();
  if (useLocalData) {
    return localDataStore
      .getBooks(userId)
      .some((book) => book.title === title && book.id !== excludeId);
  }

  let query = supabase.from('books').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('title', title);
  if (excludeId) query = query.neq('id', excludeId);
  const { count, error } = await query;
  if (error) throw error;
  return (count ?? 0) > 0;
}

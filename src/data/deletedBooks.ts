import { supabase } from '../lib/supabase';
import { requireUserId } from '../lib/currentUser';
import { createCacheEntry, readCache } from '../lib/dataCache';
import { createSignedAssetUrl, isManagedBookCoverValue } from '../lib/storage';
import { localDataStore } from '../lib/localDataStore';
import { useLocalData } from '../lib/runtimeConfig';
import { cacheManager } from '../utils/cacheManager';

export interface DeletedBook {
  id: string;
  title: string;
  author: string;
  cover_url: string | null;
  cover_path?: string | null;
  status: 'want_to_read' | 'reading' | 'read' | 'shelved';
  type: 'book' | 'class';
  created_at: string;
  updated_at: string;
  deleted_at: string;
  progress?: number;
  rating?: number;
  tags?: string[];
}

const deletedBooksCache = new Map<string, ReturnType<typeof createCacheEntry<DeletedBook[]>>>();

function clearDeletedBooksCache(userId: string) {
  deletedBooksCache.delete(userId);
  cacheManager.clear('trash');
}

async function toDeletedBook(row: {
  id: string;
  title: string;
  author: string | null;
  cover_url: string | null;
  status: string;
  type: string;
  original_created_at: string | null;
  original_updated_at: string | null;
  deleted_at: string;
  progress: number | null;
  rating: number | null;
  tags: string[];
}): Promise<DeletedBook> {
  const coverPath = isManagedBookCoverValue(row.cover_url) ? row.cover_url : null;
  return {
    id: row.id,
    title: row.title,
    author: row.author || '',
    cover_url: coverPath ? await createSignedAssetUrl('book-covers', coverPath) : row.cover_url,
    cover_path: coverPath,
    status: row.status as DeletedBook['status'],
    type: row.type as DeletedBook['type'],
    created_at: row.original_created_at || row.deleted_at,
    updated_at: row.original_updated_at || row.deleted_at,
    deleted_at: row.deleted_at,
    progress: row.progress ?? undefined,
    rating: row.rating ?? undefined,
    tags: row.tags
  };
}

export async function getDeletedBooks(): Promise<DeletedBook[]> {
  const userId = await requireUserId();

  if (useLocalData) {
    return localDataStore
      .getDeletedBooks(userId)
      .sort((a, b) => new Date(b.deleted_at).getTime() - new Date(a.deleted_at).getTime());
  }

  const cachedBooks = readCache(deletedBooksCache.get(userId) ?? null);
  if (cachedBooks) {
    return cachedBooks;
  }

  const { data, error } = await supabase
    .from('deleted_books')
    .select('*')
    .eq('user_id', userId)
    .order('deleted_at', { ascending: false });
  if (error) throw error;
  const deletedBooks = await Promise.all(data.map(toDeletedBook));
  deletedBooksCache.set(userId, createCacheEntry(deletedBooks));
  return deletedBooks;
}

export async function addDeletedBook(book: Omit<DeletedBook, 'deleted_at'>): Promise<DeletedBook> {
  const userId = await requireUserId();

  if (useLocalData) {
    const deletedBook: DeletedBook = {
      ...book,
      cover_url: book.cover_path ?? book.cover_url,
      deleted_at: new Date().toISOString()
    };
    const existingBooks = localDataStore.getDeletedBooks(userId).filter((item) => item.id !== book.id);
    localDataStore.saveDeletedBooks(userId, [deletedBook, ...existingBooks]);
    clearDeletedBooksCache(userId);
    return deletedBook;
  }

  const { data, error } = await supabase
    .from('deleted_books')
    .upsert({
      id: book.id,
      user_id: userId,
      title: book.title,
      author: book.author || null,
      cover_url: book.cover_path ?? book.cover_url,
      status: book.status,
      type: book.type,
      progress: book.progress ?? null,
      rating: book.rating ?? null,
      tags: book.tags ?? [],
      original_created_at: book.created_at,
      original_updated_at: book.updated_at
    })
    .select()
    .single();
  if (error) throw error;
  clearDeletedBooksCache(userId);
  return toDeletedBook(data);
}

export async function restoreDeletedBook(id: string): Promise<DeletedBook | undefined> {
  const userId = await requireUserId();

  if (useLocalData) {
    const deletedBooks = localDataStore.getDeletedBooks(userId);
    const restoredBook = deletedBooks.find((book) => book.id === id);
    if (!restoredBook) return undefined;
    localDataStore.saveDeletedBooks(userId, deletedBooks.filter((book) => book.id !== id));
    clearDeletedBooksCache(userId);
    return restoredBook;
  }

  const { data, error } = await supabase
    .from('deleted_books')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .maybeSingle();
  if (error) throw error;
  clearDeletedBooksCache(userId);
  return data ? toDeletedBook(data) : undefined;
}

export async function permanentlyDeleteBook(id: string): Promise<boolean> {
  const userId = await requireUserId();

  if (useLocalData) {
    localDataStore.saveDeletedBooks(
      userId,
      localDataStore.getDeletedBooks(userId).filter((book) => book.id !== id)
    );
    clearDeletedBooksCache(userId);
    return true;
  }

  const { error } = await supabase.from('deleted_books').delete().eq('id', id).eq('user_id', userId);
  if (error) throw error;
  clearDeletedBooksCache(userId);
  return true;
}

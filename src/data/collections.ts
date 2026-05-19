import { supabase } from '../lib/supabase';
import { requireUserId } from '../lib/currentUser';
import { createCacheEntry, readCache } from '../lib/dataCache';
import { localDataStore } from '../lib/localDataStore';
import { useLocalData } from '../lib/runtimeConfig';

export interface Collection {
  id: string;
  name: string;
  description: string;
  bookIds: string[];
  createdAt: string;
  updatedAt: string;
}

const collectionsCache = new Map<string, ReturnType<typeof createCacheEntry<Collection[]>>>();

export function clearCollectionsCache(userId: string) {
  collectionsCache.delete(userId);
}

async function getBookIds(collectionIds: string[]) {
  if (collectionIds.length === 0) return new Map<string, string[]>();
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('collection_books')
    .select('collection_id, book_id')
    .eq('user_id', userId)
    .in('collection_id', collectionIds);
  if (error) throw error;

  const map = new Map<string, string[]>();
  for (const item of data) {
    const current = map.get(item.collection_id) ?? [];
    current.push(item.book_id);
    map.set(item.collection_id, current);
  }
  return map;
}

function toCollection(
  row: {
    id: string;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
  },
  bookIds: string[]
): Collection {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    bookIds,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function getCollections(): Promise<Collection[]> {
  const userId = await requireUserId();

  if (useLocalData) {
    return localDataStore.getCollections(userId);
  }

  const cachedCollections = readCache(collectionsCache.get(userId) ?? null);
  if (cachedCollections) {
    return cachedCollections;
  }

  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  const ids = data.map((item) => item.id);
  const bookIds = await getBookIds(ids);
  const collections = data.map((item) => toCollection(item, bookIds.get(item.id) ?? []));
  collectionsCache.set(userId, createCacheEntry(collections));
  return collections;
}

export async function getCollectionById(id: string): Promise<Collection | undefined> {
  const userId = await requireUserId();
  if (useLocalData) {
    return localDataStore.getCollections(userId).find((collection) => collection.id === id);
  }

  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return undefined;
  const bookIds = await getBookIds([id]);
  return toCollection(data, bookIds.get(id) ?? []);
}

export async function addCollection(collection: Omit<Collection, 'id' | 'createdAt' | 'updatedAt'>): Promise<Collection> {
  const userId = await requireUserId();
  if (useLocalData) {
    const now = new Date().toISOString();
    const createdCollection: Collection = {
      ...collection,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now
    };
    localDataStore.saveCollections(userId, [createdCollection, ...localDataStore.getCollections(userId)]);
    return createdCollection;
  }

  const { data, error } = await supabase
    .from('collections')
    .insert({
      user_id: userId,
      name: collection.name,
      description: collection.description || null
    })
    .select()
    .single();
  if (error) throw error;

  if (collection.bookIds.length > 0) {
    const { error: booksError } = await supabase.from('collection_books').insert(
      collection.bookIds.map((bookId) => ({
        collection_id: data.id,
        book_id: bookId,
        user_id: userId
      }))
    );
    if (booksError) throw booksError;
  }

  clearCollectionsCache(userId);
  return toCollection(data, collection.bookIds);
}

export async function updateCollection(id: string, updates: Partial<Collection>): Promise<Collection | undefined> {
  const userId = await requireUserId();
  if (useLocalData) {
    const collections = localDataStore.getCollections(userId);
    const currentCollection = collections.find((collection) => collection.id === id);
    if (!currentCollection) return undefined;
    const updatedCollection: Collection = {
      ...currentCollection,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    localDataStore.saveCollections(
      userId,
      collections.map((collection) => (collection.id === id ? updatedCollection : collection))
    );
    return updatedCollection;
  }

  const { data, error } = await supabase
    .from('collections')
    .update({
      name: updates.name,
      description: updates.description
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .maybeSingle();
  if (error) throw error;
  if (!data) return undefined;
  const bookIds = await getBookIds([id]);
  clearCollectionsCache(userId);
  return toCollection(data, bookIds.get(id) ?? []);
}

export async function addBookToCollection(collectionId: string, bookId: string): Promise<Collection | undefined> {
  const userId = await requireUserId();
  if (useLocalData) {
    const collection = await getCollectionById(collectionId);
    if (!collection) return undefined;
    if (collection.bookIds.includes(bookId)) return collection;
    return updateCollection(collectionId, { bookIds: [...collection.bookIds, bookId] });
  }

  const { error } = await supabase
    .from('collection_books')
    .upsert({ collection_id: collectionId, book_id: bookId, user_id: userId }, { onConflict: 'collection_id,book_id' });
  if (error) throw error;
  clearCollectionsCache(userId);
  return getCollectionById(collectionId);
}

export async function removeBookFromCollection(collectionId: string, bookId: string): Promise<Collection | undefined> {
  const userId = await requireUserId();
  if (useLocalData) {
    const collection = await getCollectionById(collectionId);
    if (!collection) return undefined;
    return updateCollection(collectionId, {
      bookIds: collection.bookIds.filter((id) => id !== bookId)
    });
  }

  const { error } = await supabase
    .from('collection_books')
    .delete()
    .eq('collection_id', collectionId)
    .eq('book_id', bookId)
    .eq('user_id', userId);
  if (error) throw error;
  clearCollectionsCache(userId);
  return getCollectionById(collectionId);
}

export async function deleteCollection(id: string): Promise<boolean> {
  const userId = await requireUserId();
  if (useLocalData) {
    localDataStore.saveCollections(
      userId,
      localDataStore.getCollections(userId).filter((collection) => collection.id !== id)
    );
    return true;
  }

  const { error } = await supabase.from('collections').delete().eq('id', id).eq('user_id', userId);
  if (error) throw error;
  clearCollectionsCache(userId);
  return true;
}

export async function getCollectionsByBookId(bookId: string): Promise<Collection[]> {
  return (await getCollections()).filter((collection) => collection.bookIds.includes(bookId));
}

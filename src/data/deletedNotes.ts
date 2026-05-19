import { supabase } from '../lib/supabase';
import { requireUserId } from '../lib/currentUser';
import { createCacheEntry, readCache } from '../lib/dataCache';
import { localDataStore } from '../lib/localDataStore';
import { useLocalData } from '../lib/runtimeConfig';
import { cacheManager } from '../utils/cacheManager';

export interface DeletedNote {
  id: string;
  book_id: string;
  book_title: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

const deletedNotesCache = new Map<string, ReturnType<typeof createCacheEntry<DeletedNote[]>>>();

function clearDeletedNotesCache(userId: string) {
  deletedNotesCache.delete(userId);
  cacheManager.clear('trash');
}

function toDeletedNote(row: {
  id: string;
  book_id: string | null;
  book_title: string | null;
  content: string;
  tags: string[];
  original_created_at: string | null;
  original_updated_at: string | null;
  deleted_at: string;
}): DeletedNote {
  return {
    id: row.id,
    book_id: row.book_id || '',
    book_title: row.book_title || '未知书籍',
    content: row.content,
    tags: row.tags,
    created_at: row.original_created_at || row.deleted_at,
    updated_at: row.original_updated_at || row.deleted_at,
    deleted_at: row.deleted_at
  };
}

export async function getDeletedNotes(): Promise<DeletedNote[]> {
  const userId = await requireUserId();

  if (useLocalData) {
    return localDataStore
      .getDeletedNotes(userId)
      .sort((a, b) => new Date(b.deleted_at).getTime() - new Date(a.deleted_at).getTime());
  }

  const cachedNotes = readCache(deletedNotesCache.get(userId) ?? null);
  if (cachedNotes) {
    return cachedNotes;
  }

  const { data, error } = await supabase
    .from('deleted_notes')
    .select('*')
    .eq('user_id', userId)
    .order('deleted_at', { ascending: false });
  if (error) throw error;
  const deletedNotes = data.map(toDeletedNote);
  deletedNotesCache.set(userId, createCacheEntry(deletedNotes));
  return deletedNotes;
}

export async function addDeletedNote(note: Omit<DeletedNote, 'deleted_at'>): Promise<DeletedNote> {
  const userId = await requireUserId();

  if (useLocalData) {
    const deletedNote: DeletedNote = {
      ...note,
      deleted_at: new Date().toISOString()
    };
    const existingNotes = localDataStore.getDeletedNotes(userId).filter((item) => item.id !== note.id);
    localDataStore.saveDeletedNotes(userId, [deletedNote, ...existingNotes]);
    clearDeletedNotesCache(userId);
    return deletedNote;
  }

  const { data, error } = await supabase
    .from('deleted_notes')
    .upsert({
      id: note.id,
      user_id: userId,
      book_id: note.book_id || null,
      book_title: note.book_title || null,
      content: note.content,
      tags: note.tags,
      original_created_at: note.created_at,
      original_updated_at: note.updated_at
    })
    .select()
    .single();
  if (error) throw error;
  clearDeletedNotesCache(userId);
  return toDeletedNote(data);
}

export async function restoreDeletedNote(id: string): Promise<DeletedNote | undefined> {
  const userId = await requireUserId();

  if (useLocalData) {
    const deletedNotes = localDataStore.getDeletedNotes(userId);
    const restoredNote = deletedNotes.find((note) => note.id === id);
    if (!restoredNote) return undefined;
    localDataStore.saveDeletedNotes(userId, deletedNotes.filter((note) => note.id !== id));
    clearDeletedNotesCache(userId);
    return restoredNote;
  }

  const { data, error } = await supabase
    .from('deleted_notes')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .maybeSingle();
  if (error) throw error;
  clearDeletedNotesCache(userId);
  return data ? toDeletedNote(data) : undefined;
}

export async function permanentlyDeleteNote(id: string): Promise<boolean> {
  const userId = await requireUserId();

  if (useLocalData) {
    localDataStore.saveDeletedNotes(
      userId,
      localDataStore.getDeletedNotes(userId).filter((note) => note.id !== id)
    );
    clearDeletedNotesCache(userId);
    return true;
  }

  const { error } = await supabase.from('deleted_notes').delete().eq('id', id).eq('user_id', userId);
  if (error) throw error;
  clearDeletedNotesCache(userId);
  return true;
}

export async function getDeletedNotesByBookId(bookId: string): Promise<DeletedNote[]> {
  return (await getDeletedNotes()).filter((note) => note.book_id === bookId);
}

export async function restoreDeletedNotesByBookId(bookId: string): Promise<DeletedNote[]> {
  const notes = await getDeletedNotesByBookId(bookId);
  await Promise.all(notes.map((note) => restoreDeletedNote(note.id)));
  return notes;
}

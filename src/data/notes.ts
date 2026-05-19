import { supabase } from '../lib/supabase';
import { requireUserId } from '../lib/currentUser';
import { getBookById } from './books';
import { createCacheEntry, readCache } from '../lib/dataCache';
import { localDataStore } from '../lib/localDataStore';
import { useLocalData } from '../lib/runtimeConfig';

export interface Note {
  id: string;
  book_id: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

function toNote(row: {
  id: string;
  book_id: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}): Note {
  return row;
}

const notesCache = new Map<string, ReturnType<typeof createCacheEntry<Note[]>>>();

export function clearNotesCache(userId: string) {
  notesCache.delete(userId);
}

type NewNote = Omit<Note, 'id' | 'created_at' | 'updated_at'> & { id?: string };

export async function getNotes(): Promise<Note[]> {
  const userId = await requireUserId();

  if (useLocalData) {
    return localDataStore.getNotes(userId);
  }

  const cachedNotes = readCache(notesCache.get(userId) ?? null);
  if (cachedNotes) {
    return cachedNotes;
  }

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  const notes = data.map(toNote);
  notesCache.set(userId, createCacheEntry(notes));
  return notes;
}

export async function getNotesByBookIds(bookIds: string[]): Promise<Note[]> {
  if (bookIds.length === 0) return [];

  const userId = await requireUserId();
  if (useLocalData) {
    const requestedBookIds = new Set(bookIds);
    return localDataStore.getNotes(userId).filter((note) => requestedBookIds.has(note.book_id));
  }

  const cachedNotes = readCache(notesCache.get(userId) ?? null);
  if (cachedNotes) {
    const requestedBookIds = new Set(bookIds);
    return cachedNotes.filter((note) => requestedBookIds.has(note.book_id));
  }

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .in('book_id', bookIds)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(toNote);
}

export async function getNotesByBookId(bookId: string): Promise<Note[]> {
  const userId = await requireUserId();

  if (useLocalData) {
    return localDataStore.getNotes(userId).filter((note) => note.book_id === bookId);
  }

  const cachedNotes = readCache(notesCache.get(userId) ?? null);
  if (cachedNotes) {
    return cachedNotes.filter((note) => note.book_id === bookId);
  }

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .eq('book_id', bookId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(toNote);
}

export async function getNoteById(id: string): Promise<Note | undefined> {
  const userId = await requireUserId();

  if (useLocalData) {
    return localDataStore.getNotes(userId).find((note) => note.id === id);
  }

  const cachedNotes = readCache(notesCache.get(userId) ?? null);
  if (cachedNotes) {
    return cachedNotes.find((note) => note.id === id);
  }

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data ? toNote(data) : undefined;
}

export async function addNote(note: NewNote): Promise<Note> {
  const userId = await requireUserId();

  if (useLocalData) {
    const now = new Date().toISOString();
    const createdNote: Note = {
      ...note,
      id: note.id ?? crypto.randomUUID(),
      created_at: now,
      updated_at: now
    };
    localDataStore.saveNotes(userId, [createdNote, ...localDataStore.getNotes(userId)]);
    return createdNote;
  }

  const newNote = {
    user_id: userId,
    book_id: note.book_id,
    content: note.content,
    tags: note.tags,
    ...(note.id ? { id: note.id } : {})
  };

  const { data, error } = await supabase
    .from('notes')
    .insert(newNote)
    .select()
    .single();
  if (error) throw error;
  clearNotesCache(userId);
  return toNote(data);
}

export async function updateNote(id: string, note: Partial<Note>): Promise<Note | undefined> {
  const userId = await requireUserId();

  if (useLocalData) {
    const notes = localDataStore.getNotes(userId);
    const currentNote = notes.find((item) => item.id === id);
    if (!currentNote) return undefined;
    const updatedNote: Note = {
      ...currentNote,
      ...note,
      updated_at: new Date().toISOString()
    };
    localDataStore.saveNotes(userId, notes.map((item) => (item.id === id ? updatedNote : item)));
    return updatedNote;
  }

  const { data, error } = await supabase
    .from('notes')
    .update({
      book_id: note.book_id,
      content: note.content,
      tags: note.tags
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .maybeSingle();
  if (error) throw error;
  clearNotesCache(userId);
  return data ? toNote(data) : undefined;
}

export async function deleteNote(id: string): Promise<boolean> {
  const note = await getNoteById(id);
  if (!note) return false;

  const { addDeletedNote } = await import('./deletedNotes');
  const bookTitle = (await getBookById(note.book_id))?.title || '未知书籍';
  await addDeletedNote({
    id: note.id,
    book_id: note.book_id,
    book_title: bookTitle,
    content: note.content,
    tags: note.tags,
    created_at: note.created_at,
    updated_at: note.updated_at
  });

  const userId = await requireUserId();
  if (useLocalData) {
    localDataStore.saveNotes(userId, localDataStore.getNotes(userId).filter((item) => item.id !== id));
    return true;
  }

  const { error } = await supabase.from('notes').delete().eq('id', id).eq('user_id', userId);
  if (error) throw error;
  clearNotesCache(userId);
  return true;
}

export async function deleteNotesByBookId(bookId: string): Promise<number> {
  const notes = await getNotesByBookId(bookId);
  if (notes.length === 0) return 0;

  const { addDeletedNote } = await import('./deletedNotes');
  const bookTitle = (await getBookById(bookId))?.title || '未知书籍';
  for (const note of notes) {
    await addDeletedNote({
      id: note.id,
      book_id: note.book_id,
      book_title: bookTitle,
      content: note.content,
      tags: note.tags,
      created_at: note.created_at,
      updated_at: note.updated_at
    });
  }

  const userId = await requireUserId();
  if (useLocalData) {
    localDataStore.saveNotes(
      userId,
      localDataStore.getNotes(userId).filter((note) => note.book_id !== bookId)
    );
    return notes.length;
  }

  const { error } = await supabase.from('notes').delete().eq('book_id', bookId).eq('user_id', userId);
  if (error) throw error;
  clearNotesCache(userId);
  return notes.length;
}

export async function searchNotes(query: string): Promise<(Note & { bookTitle: string })[]> {
  const notes = (await getNotes()).filter((note) => note.content.toLowerCase().includes(query.toLowerCase()));
  return Promise.all(
    notes.map(async (note) => ({
      ...note,
      bookTitle: (await getBookById(note.book_id))?.title || '未知书籍'
    }))
  );
}

export async function getNotesByTags(tags: string[]): Promise<Note[]> {
  const notes = await getNotes();
  if (tags.length === 0) return notes;
  return notes.filter((note) => tags.some((tag) => note.tags.includes(tag)));
}

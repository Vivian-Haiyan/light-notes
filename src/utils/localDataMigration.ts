import { supabase } from '../lib/supabase';
import { requireUserId } from '../lib/currentUser';
import type { Book } from '../data/books';
import type { Note } from '../data/notes';
import type { Collection } from '../data/collections';
import type { ReadingPlan } from '../data/readingPlans';

const MIGRATION_KEY = 'supabaseMigration:v1';
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function readLocal<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T[]) : [];
  } catch {
    return [];
  }
}

function normalizeLegacyId(id: string) {
  return UUID_PATTERN.test(id) ? id : crypto.randomUUID();
}

function getMappedId(idMap: Map<string, string>, id: string) {
  return idMap.get(id) || id;
}

export async function migrateLocalDataOnce() {
  if (typeof window === 'undefined' || window.localStorage.getItem(MIGRATION_KEY) === 'done') {
    return;
  }

  const userId = await requireUserId();
  const books = readLocal<Book>('books');
  const notes = readLocal<Note>('notes');
  const collections = readLocal<Collection>('collections');
  const readingPlans = readLocal<ReadingPlan>('readingPlans');
  const bookIdMap = new Map(books.map((book) => [book.id, normalizeLegacyId(book.id)]));
  const noteIdMap = new Map(notes.map((note) => [note.id, normalizeLegacyId(note.id)]));
  const collectionIdMap = new Map(collections.map((collection) => [collection.id, normalizeLegacyId(collection.id)]));
  const readingPlanIdMap = new Map(readingPlans.map((plan) => [plan.id, normalizeLegacyId(plan.id)]));

  if (books.length > 0) {
    const { error } = await supabase.from('books').upsert(
      books.map((book) => ({
        id: getMappedId(bookIdMap, book.id),
        user_id: userId,
        title: book.title,
        author: book.author || null,
        cover_url: book.cover_url,
        status: book.status,
        type: book.type,
        progress: book.progress ?? null,
        rating: book.rating ?? null,
        tags: book.tags ?? [],
        created_at: book.created_at,
        updated_at: book.updated_at
      }))
    );
    if (error) throw error;
  }

  if (notes.length > 0) {
    const { error } = await supabase.from('notes').upsert(
      notes.map((note) => ({
        id: getMappedId(noteIdMap, note.id),
        user_id: userId,
        book_id: getMappedId(bookIdMap, note.book_id),
        content: note.content,
        tags: note.tags,
        created_at: note.created_at,
        updated_at: note.updated_at
      }))
    );
    if (error) throw error;
  }

  if (collections.length > 0) {
    const { error } = await supabase.from('collections').upsert(
      collections.map((collection) => ({
        id: getMappedId(collectionIdMap, collection.id),
        user_id: userId,
        name: collection.name,
        description: collection.description || null,
        created_at: collection.createdAt,
        updated_at: collection.updatedAt
      }))
    );
    if (error) throw error;

    const relationRows = collections.flatMap((collection) =>
      collection.bookIds.map((bookId) => ({
        collection_id: getMappedId(collectionIdMap, collection.id),
        book_id: getMappedId(bookIdMap, bookId),
        user_id: userId
      }))
    );
    if (relationRows.length > 0) {
      const { error: relationError } = await supabase
        .from('collection_books')
        .upsert(relationRows, { onConflict: 'collection_id,book_id' });
      if (relationError) throw relationError;
    }
  }

  if (readingPlans.length > 0) {
    const { error } = await supabase.from('reading_plans').upsert(
      readingPlans.map((plan) => ({
        id: getMappedId(readingPlanIdMap, plan.id),
        user_id: userId,
        book_id: plan.bookId ? getMappedId(bookIdMap, plan.bookId) : null,
        book_title: plan.bookTitle,
        start_date: plan.startDate,
        end_date: plan.endDate,
        daily_goal: plan.dailyGoal,
        goal_unit: plan.goalUnit,
        progress: plan.progress,
        status: plan.status,
        created_at: plan.createdAt,
        updated_at: plan.updatedAt
      }))
    );
    if (error) throw error;
  }

  window.localStorage.setItem(MIGRATION_KEY, 'done');
}

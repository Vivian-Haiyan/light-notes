import type { Book } from '../data/books';
import type { Note } from '../data/notes';
import type { Collection } from '../data/collections';
import type { DeletedBook } from '../data/deletedBooks';
import type { DeletedNote } from '../data/deletedNotes';

const BOOKS_KEY = 'reading-notes-books';
const NOTES_KEY = 'reading-notes-notes';
const COLLECTIONS_KEY = 'reading-notes-collections';
const DELETED_BOOKS_KEY = 'reading-notes-deleted-books';
const DELETED_NOTES_KEY = 'reading-notes-deleted-notes';

export interface LocalData {
  books: Book[];
  notes: Note[];
  collections: Collection[];
  deletedBooks: DeletedBook[];
  deletedNotes: DeletedNote[];
}

export const localDataStore = {
  getBooks: (userId: string): Book[] => {
    const key = `${BOOKS_KEY}:${userId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },

  saveBooks: (userId: string, books: Book[]): void => {
    const key = `${BOOKS_KEY}:${userId}`;
    localStorage.setItem(key, JSON.stringify(books));
  },

  getNotes: (userId: string): Note[] => {
    const key = `${NOTES_KEY}:${userId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },

  saveNotes: (userId: string, notes: Note[]): void => {
    const key = `${NOTES_KEY}:${userId}`;
    localStorage.setItem(key, JSON.stringify(notes));
  },

  getCollections: (userId: string): Collection[] => {
    const key = `${COLLECTIONS_KEY}:${userId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },

  saveCollections: (userId: string, collections: Collection[]): void => {
    const key = `${COLLECTIONS_KEY}:${userId}`;
    localStorage.setItem(key, JSON.stringify(collections));
  },

  getDeletedBooks: (userId: string): DeletedBook[] => {
    const key = `${DELETED_BOOKS_KEY}:${userId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },

  saveDeletedBooks: (userId: string, deletedBooks: DeletedBook[]): void => {
    const key = `${DELETED_BOOKS_KEY}:${userId}`;
    localStorage.setItem(key, JSON.stringify(deletedBooks));
  },

  getDeletedNotes: (userId: string): DeletedNote[] => {
    const key = `${DELETED_NOTES_KEY}:${userId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },

  saveDeletedNotes: (userId: string, deletedNotes: DeletedNote[]): void => {
    const key = `${DELETED_NOTES_KEY}:${userId}`;
    localStorage.setItem(key, JSON.stringify(deletedNotes));
  },

  getAllData: (userId: string): LocalData => {
    return {
      books: localDataStore.getBooks(userId),
      notes: localDataStore.getNotes(userId),
      collections: localDataStore.getCollections(userId),
      deletedBooks: localDataStore.getDeletedBooks(userId),
      deletedNotes: localDataStore.getDeletedNotes(userId)
    };
  },

  clearAll: (userId: string): void => {
    localStorage.removeItem(`${BOOKS_KEY}:${userId}`);
    localStorage.removeItem(`${NOTES_KEY}:${userId}`);
    localStorage.removeItem(`${COLLECTIONS_KEY}:${userId}`);
    localStorage.removeItem(`${DELETED_BOOKS_KEY}:${userId}`);
    localStorage.removeItem(`${DELETED_NOTES_KEY}:${userId}`);
  }
};

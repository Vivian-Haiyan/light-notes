import { getBooks, type Book, clearBooksCache } from '../data/books';
import { getNotes, type Note, clearNotesCache } from '../data/notes';
import { getCollections, type Collection, clearCollectionsCache } from '../data/collections';
import { localDataStore } from './localDataStore';
import { cacheManager } from '../utils/cacheManager';
import { requireUserId } from './currentUser';
import { ensureLocalDefaultSeedData } from '../utils/localDefaultSeedData';
import { useLocalData } from './runtimeConfig';

export interface AppData {
  books: Book[];
  notes: Note[];
  collections: Collection[];
  notesCount: Record<string, number>;
  notesByBook: Record<string, Note[]>;
}

export function groupNotesByBook(books: Book[], notes: Note[]) {
  const notesByBook: Record<string, Note[]> = {};
  const notesCount: Record<string, number> = {};

  for (const note of notes) {
    const bookNotes = notesByBook[note.book_id] ?? [];
    bookNotes.push(note);
    notesByBook[note.book_id] = bookNotes;
  }

  for (const book of books) {
    notesCount[book.id] = notesByBook[book.id]?.length ?? 0;
  }

  return { notesByBook, notesCount };
}

type DataSubscriber = (data: AppData) => void;

class GlobalDataStore {
  private data: AppData | null = null;
  private loading: boolean = false;
  private subscribers: Set<DataSubscriber> = new Set();
  private initialized: boolean = false;

  async initialize(): Promise<AppData | null> {
    if (this.data) {
      return this.data;
    }

    if (this.loading) {
      return new Promise<AppData | null>((resolve) => {
        const checkData = () => {
          if (this.data) {
            resolve(this.data);
          } else if (!this.loading) {
            // 如果 loading 变为 false 但 data 仍为 null，说明初始化失败
            resolve(null);
          } else {
            setTimeout(checkData, 100);
          }
        };
        checkData();
      });
    }

    this.loading = true;
    
    try {
      let books: Book[];
      let notes: Note[];
      let collections: Collection[];

      if (useLocalData) {
        const userId = await requireUserId();
        await ensureLocalDefaultSeedData(userId);
        
        books = localDataStore.getBooks(userId);
        notes = localDataStore.getNotes(userId);
        collections = localDataStore.getCollections(userId);
      } else {
        [books, notes, collections] = await Promise.all([
          getBooks(),
          getNotes(),
          getCollections()
        ]);
      }

      const { notesByBook, notesCount } = groupNotesByBook(books, notes);

      this.data = { books, notes, collections, notesCount, notesByBook };
      this.initialized = true;
      
      cacheManager.set('books', {
        books,
        notesCount,
        allNotes: notesByBook
      }, 30 * 60);

      cacheManager.set('collections', collections, 30 * 60);

      this.notifySubscribers();
      
      return this.data;
    } catch (error) {
      console.error('GlobalDataStore initialization failed:', error);
      // 即使失败也停止 loading
      this.loading = false;
      return null;
    } finally {
      this.loading = false;
    }
  }

  getData(): AppData | null {
    return this.data;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  isLoading(): boolean {
    return this.loading;
  }

  subscribe(subscriber: DataSubscriber): () => void {
    this.subscribers.add(subscriber);
    if (this.data) {
      subscriber(this.data);
    }
    return () => {
      this.subscribers.delete(subscriber);
    };
  }

  private notifySubscribers() {
    if (this.data) {
      // 创建一个新的对象引用，确保 React 能检测到变化
      const newData = { ...this.data };
      this.subscribers.forEach(sub => sub(newData));
    }
  }

  async refreshBooks(): Promise<void> {
    try {
      const userId = await requireUserId();
      cacheManager.clear('books');
      
      let books: Book[];
      let notes: Note[];
      let collections: Collection[];

      if (useLocalData) {
        books = localDataStore.getBooks(userId);
        notes = localDataStore.getNotes(userId);
        collections = localDataStore.getCollections(userId);
      } else {
        clearBooksCache(userId);
        books = await getBooks();
        notes = await getNotes();
        collections = await getCollections();
      }
      
      const { notesByBook, notesCount } = groupNotesByBook(books, notes);

      if (!this.data) {
        this.data = { books, notes, collections, notesCount, notesByBook };
        this.initialized = true;
      } else {
        this.data = { ...this.data, books: [...books], notes: [...notes], collections: [...collections], notesByBook: { ...notesByBook }, notesCount: { ...notesCount } };
      }
      
      cacheManager.set('books', {
        books,
        notesCount: this.data.notesCount,
        allNotes: this.data.notesByBook
      }, 30 * 60);
      
      this.notifySubscribers();
    } catch (error) {
      console.error('refreshBooks failed:', error);
    }
  }

  async refreshNotes(): Promise<void> {
    if (!this.data) return;
    
    try {
      const userId = await requireUserId();
      cacheManager.clear('books');
      clearNotesCache(userId);
      const notes = await getNotes();
      const { notesByBook, notesCount } = groupNotesByBook(this.data.books, notes);

      this.data = { 
        ...this.data, 
        notes: [...notes], 
        notesByBook: { ...notesByBook }, 
        notesCount: { ...notesCount }
      };
      
      cacheManager.set('books', {
        books: this.data.books,
        notesCount,
        allNotes: notesByBook
      }, 30 * 60);
      
      this.notifySubscribers();
    } catch (error) {
      console.error('refreshNotes failed:', error);
    }
  }

  async refreshCollections(): Promise<void> {
    if (!this.data) return;
    
    try {
      const userId = await requireUserId();
      cacheManager.clear('collections');
      clearCollectionsCache(userId);
      const collections = await getCollections();
      this.data = { ...this.data, collections: [...collections] };
      
      cacheManager.set('collections', collections, 30 * 60);
      
      this.notifySubscribers();
    } catch (error) {
      console.error('refreshCollections failed:', error);
    }
  }

  async refreshAll(): Promise<void> {
    try {
      const userId = await requireUserId();
      cacheManager.clearAll();
      clearBooksCache(userId);
      clearNotesCache(userId);
      clearCollectionsCache(userId);
    } catch (e) {
      console.error('Failed to clear caches:', e);
    }
    const oldData = this.data;
    this.data = null;
    this.initialized = false;
    // 先通知订阅者数据被清除（可选，但能提供更好的用户体验）
    if (oldData) {
      this.notifySubscribers();
    }
    await this.initialize();
  }

  clearCache(): void {
    this.data = null;
    this.initialized = false;
    cacheManager.clearAll();
  }
}

export const globalDataStore = new GlobalDataStore();

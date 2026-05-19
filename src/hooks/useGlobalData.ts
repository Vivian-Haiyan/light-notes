import { useState, useEffect, useCallback, useRef } from 'react';
import { globalDataStore, type AppData } from '../lib/globalDataStore';

export function useGlobalData() {
  const [data, setData] = useState<AppData | null>(() => globalDataStore.getData());
  const [loading, setLoading] = useState(!globalDataStore.isInitialized() && !globalDataStore.isLoading());
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // 确保只订阅一次
    if (!unsubscribeRef.current) {
      unsubscribeRef.current = globalDataStore.subscribe((newData) => {
        setData(newData);
        setLoading(false);
      });
    }

    if (globalDataStore.isInitialized()) {
      setData(globalDataStore.getData());
      setLoading(false);
    } else if (!globalDataStore.isLoading()) {
      const init = async () => {
        try {
          await globalDataStore.initialize();
        } catch (error) {
          console.error('Failed to initialize global data:', error);
        } finally {
          setLoading(false);
        }
      };
      init();
    }

    return () => {
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
    };
  }, []);

  const refresh = useCallback(async () => {
    await globalDataStore.refreshAll();
  }, []);

  const refreshBooks = useCallback(async () => {
    await globalDataStore.refreshBooks();
  }, []);

  const refreshNotes = useCallback(async () => {
    await globalDataStore.refreshNotes();
  }, []);

  const refreshCollections = useCallback(async () => {
    await globalDataStore.refreshCollections();
  }, []);

  return {
    data,
    loading,
    refresh,
    refreshBooks,
    refreshNotes,
    refreshCollections
  };
}

export function useBooks() {
  const { data, loading, refreshBooks } = useGlobalData();
  
  return {
    books: data?.books ?? [],
    notesCount: data?.notesCount ?? {},
    notesByBook: data?.notesByBook ?? {},
    loading,
    refresh: refreshBooks
  };
}

export function useCollections() {
  const { data, loading, refreshCollections } = useGlobalData();
  
  return {
    collections: data?.collections ?? [],
    loading,
    refresh: refreshCollections
  };
}

export function useNotes() {
  const { data, loading, refreshNotes } = useGlobalData();
  
  return {
    notes: data?.notes ?? [],
    notesByBook: data?.notesByBook ?? {},
    loading,
    refresh: refreshNotes
  };
}

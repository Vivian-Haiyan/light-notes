import { describe, expect, it } from 'vitest';
import type { Book } from '../../data/books';
import type { Note } from '../../data/notes';
import { groupNotesByBook } from '../globalDataStore';

const books: Book[] = [
  {
    id: 'book-1',
    title: '小王子',
    author: '',
    cover_url: null,
    status: 'reading',
    type: 'book',
    created_at: '2026-05-18T00:00:00.000Z',
    updated_at: '2026-05-18T00:00:00.000Z'
  },
  {
    id: 'book-2',
    title: '瓦尔登湖',
    author: '',
    cover_url: null,
    status: 'want_to_read',
    type: 'book',
    created_at: '2026-05-18T00:00:00.000Z',
    updated_at: '2026-05-18T00:00:00.000Z'
  }
];

const notes: Note[] = [
  {
    id: 'note-1',
    book_id: 'book-1',
    content: '第一条',
    tags: [],
    created_at: '2026-05-18T00:00:00.000Z',
    updated_at: '2026-05-18T00:00:00.000Z'
  },
  {
    id: 'note-2',
    book_id: 'book-1',
    content: '第二条',
    tags: [],
    created_at: '2026-05-18T00:00:00.000Z',
    updated_at: '2026-05-18T00:00:00.000Z'
  }
];

describe('groupNotesByBook', () => {
  it('groups notes and produces zero counts for books without notes', () => {
    expect(groupNotesByBook(books, notes)).toEqual({
      notesByBook: {
        'book-1': notes
      },
      notesCount: {
        'book-1': 2,
        'book-2': 0
      }
    });
  });
});

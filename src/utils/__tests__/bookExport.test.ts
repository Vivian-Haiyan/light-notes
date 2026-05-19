import { describe, expect, it } from 'vitest';
import type { Book } from '../../data/books';
import type { Note } from '../../data/notes';
import { buildBookExportRows, buildShareImageLayout } from '../bookExport';

const books: Book[] = [
  {
    id: 'book-1',
    title: '小王子',
    author: '圣埃克苏佩里',
    cover_url: null,
    status: 'read',
    type: 'book',
    created_at: '2026-05-18T00:00:00.000Z',
    updated_at: '2026-05-18T00:00:00.000Z'
  }
];

const notes: Record<string, Note[]> = {
  'book-1': [
    {
      id: 'note-1',
      book_id: 'book-1',
      content: '真正重要的东西，用眼睛是看不见的。',
      tags: ['金句'],
      created_at: '2026-05-18T00:00:00.000Z',
      updated_at: '2026-05-18T00:00:00.000Z'
    }
  ]
};

describe('bookExport', () => {
  it('builds structured export rows with notes', () => {
    expect(buildBookExportRows(books, notes)).toEqual([
      {
        id: 'book-1',
        title: '小王子',
        author: '圣埃克苏佩里',
        status: 'read',
        cover_url: null,
        notes: notes['book-1']
      }
    ]);
  });

  it('builds a vertical image layout model from selected books', () => {
    expect(buildShareImageLayout(books, notes)).toEqual({
      width: 1200,
      padding: 72,
      titleHeight: 92,
      cardGap: 32,
      cardHeight: 300,
      footerHeight: 56,
      totalHeight: 592,
      cards: [
        {
          id: 'book-1',
          title: '小王子',
          author: '圣埃克苏佩里',
          status: 'read',
          notePreview: '真正重要的东西，用眼睛是看不见的。'
        }
      ]
    });
  });
});

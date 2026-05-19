import { describe, expect, it } from 'vitest';
import { buildBookDraftFromFile, getAuthorFromFileName, getTitleFromFileName } from '../bookImport';

describe('bookImport', () => {
  it('derives a clean title from a file name', () => {
    expect(getTitleFromFileName('  百年孤独 - 加西亚·马尔克斯.pdf  ')).toBe('百年孤独');
    expect(getTitleFromFileName('little-prince_cover.png')).toBe('little prince');
  });

  it('derives the author from a conventional file name when present', () => {
    expect(getAuthorFromFileName('百年孤独 - 加西亚·马尔克斯.pdf')).toBe('加西亚·马尔克斯');
    expect(getAuthorFromFileName('置身事内.pdf')).toBe('');
  });

  it('builds an editable image draft with the image as the default cover', async () => {
    const file = new File(['image'], '小王子.jpg', { type: 'image/jpeg' });
    const draft = await buildBookDraftFromFile(file);

    expect(draft).toMatchObject({
      title: '小王子',
      author: '',
      status: 'want_to_read',
      type: 'book',
      sourceKind: 'image'
    });
    expect(draft.coverUrl).toContain('data:image/jpeg;base64,');
    expect(draft.coverFile).toBe(file);
  });

  it('builds a pdf draft even when only the file name is available', async () => {
    const file = new File(['pdf'], '置身事内 - 兰小欢.pdf', { type: 'application/pdf' });
    const draft = await buildBookDraftFromFile(file);

    expect(draft).toEqual({
      title: '置身事内',
      author: '兰小欢',
      coverUrl: '',
      coverFile: null,
      status: 'want_to_read',
      type: 'book',
      sourceKind: 'pdf'
    });
  });
});

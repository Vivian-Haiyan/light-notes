import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('BooksPage export loading', () => {
  it('loads export helpers dynamically instead of statically', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/pages/BooksPage.tsx'), 'utf8');

    expect(source).not.toContain("from '../utils/bookExport'");
    expect(source).toContain("await import('../utils/bookExport')");
  });
});

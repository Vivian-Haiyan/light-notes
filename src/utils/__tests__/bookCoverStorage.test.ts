import { describe, expect, it } from 'vitest';
import { buildBookCoverPath, isManagedBookCoverValue } from '../../lib/storage';

describe('book cover storage', () => {
  it('builds user-owned book cover paths with sanitized names', () => {
    expect(buildBookCoverPath('user-123', '我的 封面.png', 1716000000000)).toBe(
      'user-123/covers/1716000000000-_____.png'
    );
  });

  it('distinguishes stored cover paths from display URLs', () => {
    expect(isManagedBookCoverValue('user-123/covers/cover.png')).toBe(true);
    expect(isManagedBookCoverValue('https://example.com/cover.png')).toBe(false);
    expect(isManagedBookCoverValue('data:image/png;base64,abc')).toBe(false);
    expect(isManagedBookCoverValue('/image/default.png')).toBe(false);
  });
});

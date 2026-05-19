import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('deployment config', () => {
  it('rewrites Vercel SPA routes to index.html', () => {
    const vercelConfig = JSON.parse(readFileSync(resolve(process.cwd(), 'vercel.json'), 'utf8')) as {
      rewrites?: Array<{ source: string; destination: string }>;
    };

    expect(vercelConfig.rewrites).toContainEqual({
      source: '/(.*)',
      destination: '/index.html'
    });
  });

  it('ignores local artifacts and environment files', () => {
    const gitignore = readFileSync(resolve(process.cwd(), '.gitignore'), 'utf8');

    expect(gitignore).toContain('node_modules/');
    expect(gitignore).toContain('dist/');
    expect(gitignore).toContain('.env');
    expect(gitignore).toContain('*.log');
    expect(gitignore).toContain('*.timestamp-*.mjs');
    expect(gitignore).toContain('output/');
  });

  it('does not enable mock auth or local data by default in production builds', () => {
    const runtimeConfig = readFileSync(resolve(process.cwd(), 'src/lib/runtimeConfig.ts'), 'utf8');
    const userStore = readFileSync(resolve(process.cwd(), 'src/store/useUserStore.ts'), 'utf8');
    const globalDataStore = readFileSync(resolve(process.cwd(), 'src/lib/globalDataStore.ts'), 'utf8');

    expect(runtimeConfig).toContain('import.meta.env.DEV');
    expect(runtimeConfig).toContain("VITE_USE_MOCK_AUTH === 'true'");
    expect(runtimeConfig).toContain("VITE_USE_LOCAL_DATA === 'true'");
    expect(userStore).not.toContain('USE_MOCK_AUTH = true');
    expect(globalDataStore).not.toContain('USE_LOCAL_STORAGE = true');
  });
});

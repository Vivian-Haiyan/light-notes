import { describe, expect, it } from 'vitest';
import { getManualChunkName } from '../manualChunks';

describe('getManualChunkName', () => {
  it('separates heavyweight vendors into stable chunks', () => {
    expect(getManualChunkName('D:/repo/node_modules/react/index.js')).toBe('vendor-react');
    expect(getManualChunkName('D:/repo/node_modules/react-dom/index.js')).toBe('vendor-react');
    expect(getManualChunkName('D:/repo/node_modules/antd/es/button/index.js')).toBe('vendor-antd');
    expect(getManualChunkName('D:/repo/node_modules/@ant-design/icons/es/icons/index.js')).toBe('vendor-antd');
    expect(getManualChunkName('D:/repo/node_modules/@supabase/supabase-js/dist/main/index.js')).toBe('vendor-supabase');
    expect(getManualChunkName('D:/repo/node_modules/recharts/es6/index.js')).toBe('vendor-recharts');
    expect(getManualChunkName('D:/repo/node_modules/pdf-lib/es/index.js')).toBe('vendor-pdf');
  });
});

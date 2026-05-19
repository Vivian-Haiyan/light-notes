export function getManualChunkName(id: string) {
  if (!id.includes('node_modules')) return undefined;
  if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/scheduler/')) return 'vendor-react';
  if (id.includes('/antd/') || id.includes('/@ant-design/')) return 'vendor-antd';
  if (id.includes('/@supabase/')) return 'vendor-supabase';
  if (id.includes('/recharts/')) return 'vendor-recharts';
  if (id.includes('/pdf-lib/')) return 'vendor-pdf';
  return undefined;
}

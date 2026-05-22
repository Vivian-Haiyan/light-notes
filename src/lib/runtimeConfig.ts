const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const hasSupabaseConfig = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

const configValue = import.meta.env.VITE_USE_MOCK_AUTH;
export const useMockAuth = configValue === 'true' || configValue === 'auto';

const dataConfigValue = import.meta.env.VITE_USE_LOCAL_DATA;
export const useLocalData = dataConfigValue === 'true' || dataConfigValue === 'auto';

export async function testSupabaseConnection(): Promise<boolean> {
  if (!hasSupabaseConfig) {
    return false;
  }
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.warn('Supabase connection test failed:', error);
    return false;
  }
}

let connectionTested = false;
let supabaseAvailable = false;

export async function getSupabaseAvailability(): Promise<boolean> {
  if (connectionTested) {
    return supabaseAvailable;
  }
  
  supabaseAvailable = await testSupabaseConnection();
  connectionTested = true;
  
  return supabaseAvailable;
}

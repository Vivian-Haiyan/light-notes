import { supabase } from './supabase';
import { useMockAuth } from './runtimeConfig';

export async function requireUserId() {
  const mockUserId = useMockAuth ? localStorage.getItem('reading-notes-mock-user') : null;
  if (mockUserId) {
    const userData = JSON.parse(mockUserId);
    return userData.id;
  }

  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error('User is not authenticated');
  return data.user.id;
}

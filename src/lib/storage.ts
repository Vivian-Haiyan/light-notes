import { supabase } from './supabase';
import { requireUserId } from './currentUser';

export function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

type PrivateAssetBucket = 'avatars' | 'card-backgrounds' | 'book-covers';

export function buildBookCoverPath(userId: string, fileName: string, timestamp = Date.now()) {
  return `${userId}/covers/${timestamp}-${sanitizeFileName(fileName)}`;
}

export function isManagedBookCoverValue(value: string | null | undefined) {
  return Boolean(value && !/^(?:https?:|data:|\/)/i.test(value));
}

export async function createSignedAssetUrl(bucket: PrivateAssetBucket, path: string | null) {
  if (!path) return null;
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60 * 24 * 7);
  if (error) throw error;
  return data.signedUrl;
}

export async function uploadAvatarFile(file: File) {
  const userId = await requireUserId();
  const ext = file.name.split('.').pop() || 'png';
  const path = `${userId}/avatar.${sanitizeFileName(ext)}`;
  const { error } = await supabase.storage.from('avatars').upload(path, file, {
    cacheControl: '3600',
    upsert: true
  });
  if (error) throw error;
  return {
    path,
    url: await createSignedAssetUrl('avatars', path)
  };
}

export async function uploadCardBackgroundFile(scope: string, cardKey: string, file: File) {
  const userId = await requireUserId();
  const safeScope = sanitizeFileName(scope);
  const safeKey = sanitizeFileName(cardKey);
  const safeName = sanitizeFileName(file.name);
  const path = `${userId}/${safeScope}/${safeKey}-${Date.now()}-${safeName}`;
  const { error } = await supabase.storage.from('card-backgrounds').upload(path, file, {
    cacheControl: '3600',
    upsert: true
  });
  if (error) throw error;
  return {
    path,
    url: await createSignedAssetUrl('card-backgrounds', path)
  };
}

export async function uploadBookCoverFile(file: File) {
  const userId = await requireUserId();
  const path = buildBookCoverPath(userId, file.name);
  const { error } = await supabase.storage.from('book-covers').upload(path, file, {
    cacheControl: '3600',
    upsert: false
  });
  if (error) throw error;
  return {
    path,
    url: await createSignedAssetUrl('book-covers', path)
  };
}

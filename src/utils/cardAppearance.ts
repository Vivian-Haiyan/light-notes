import { supabase } from '../lib/supabase';
import { requireUserId } from '../lib/currentUser';
import { createSignedAssetUrl } from '../lib/storage';
import { localAppearanceStore } from '../lib/localAppearanceStore';
import { useLocalData } from '../lib/runtimeConfig';

export interface CardAppearance {
  themeColor?: string;
  backgroundImage?: string;
  backgroundImagePath?: string;
}

export const cardThemePresets = [
  { id: 'paper', label: '纸白', background: '#FFFDF7', accent: '#D7B98E' },
  { id: 'sage', label: '鼠尾草', background: '#EEF5EA', accent: '#88A67D' },
  { id: 'mist', label: '雾蓝', background: '#EEF5FB', accent: '#7EA4C5' },
  { id: 'lavender', label: '薰衣草', background: '#F4EEFA', accent: '#A88BC4' },
  { id: 'peach', label: '蜜桃', background: '#FFF0E8', accent: '#D59673' }
];

export async function loadCardAppearances(scope: string): Promise<Record<string, CardAppearance>> {
  const userId = await requireUserId();
  
  if (useLocalData) {
    return localAppearanceStore.loadCardAppearances(scope, userId);
  }

  const { data, error } = await supabase
    .from('card_appearances')
    .select('card_key, theme_color, background_image_url')
    .eq('user_id', userId)
    .eq('scope', scope);
  if (error) throw error;

  const entries = await Promise.all(
    data.map(async (item) => [
      item.card_key,
      {
        themeColor: item.theme_color || undefined,
        backgroundImagePath: item.background_image_url || undefined,
        backgroundImage: (await createSignedAssetUrl('card-backgrounds', item.background_image_url)) || undefined
      } satisfies CardAppearance
    ] as const)
  );
  return Object.fromEntries(entries);
}

export async function saveCardAppearance(scope: string, cardKey: string, appearance: CardAppearance) {
  const userId = await requireUserId();
  
  if (useLocalData) {
    localAppearanceStore.saveCardAppearance(scope, cardKey, appearance, userId);
    return;
  }

  if (!appearance.themeColor && !appearance.backgroundImage) {
    const { error } = await supabase
      .from('card_appearances')
      .delete()
      .eq('user_id', userId)
      .eq('scope', scope)
      .eq('card_key', cardKey);
    if (error) throw error;
    return;
  }

  const { error } = await supabase
    .from('card_appearances')
    .upsert(
      {
        user_id: userId,
        scope,
        card_key: cardKey,
        theme_color: appearance.themeColor || null,
        background_image_url: appearance.backgroundImagePath || null
      },
      { onConflict: 'user_id,scope,card_key' }
    );
  if (error) throw error;
}

export function getCardPreset(themeColor?: string) {
  return cardThemePresets.find((preset) => preset.id === themeColor) ?? cardThemePresets[0];
}

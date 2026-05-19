import type { CardAppearance } from '../utils/cardAppearance';

const APPEARANCES_KEY = 'reading-notes-card-appearances';

export const localAppearanceStore = {
  loadCardAppearances: (scope: string, userId: string): Record<string, CardAppearance> => {
    const key = `${APPEARANCES_KEY}:${userId}:${scope}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : {};
  },

  saveCardAppearance: (scope: string, cardKey: string, appearance: CardAppearance, userId: string): void => {
    const key = `${APPEARANCES_KEY}:${userId}:${scope}`;
    const existing = localAppearanceStore.loadCardAppearances(scope, userId);
    
    if (!appearance.themeColor && !appearance.backgroundImage) {
      delete existing[cardKey];
    } else {
      existing[cardKey] = appearance;
    }
    
    localStorage.setItem(key, JSON.stringify(existing));
  },

  clearCardAppearances: (scope: string, userId: string): void => {
    const key = `${APPEARANCES_KEY}:${userId}:${scope}`;
    localStorage.removeItem(key);
  }
};

const THEME_KEY = 'themeColor';

export type ThemeColor = '森绿' | '海蓝' | '暖橙' | '薰衣草';

export const themeColors: ThemeColor[] = ['森绿', '海蓝', '暖橙', '薰衣草'];

export const pageKeyMap: Record<string, string> = {
  books: '1',
  bookDetail: '2',
  noteEdit: '3',
  highlights: '4',
  inspirations: '5',
  readingPlans: '6',
  collections: '7',
  tags: '8',
  trash: '8',
  stats: '8',
};

export function getThemeColor(): ThemeColor {
  if (typeof window === 'undefined') return '森绿';
  const stored = localStorage.getItem(THEME_KEY);
  if (stored && themeColors.includes(stored as ThemeColor)) {
    return stored as ThemeColor;
  }
  return '森绿';
}

export function setThemeColor(theme: ThemeColor): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(THEME_KEY, theme);
  window.dispatchEvent(new CustomEvent('themeChange', { detail: theme }));
}

const imageCache = new Map<string, boolean>();
const preloadedImages = new Set<string>();

export function preloadAllBackgroundImages(): void {
  const themes: ThemeColor[] = ['森绿', '海蓝', '暖橙', '薰衣草'];
  const pageKeys = ['1', '2', '3', '4', '5', '6', '7', '8'];
  
  themes.forEach(theme => {
    if (theme === '森绿') {
      pageKeys.forEach(key => {
        const path = `/image/${key}.${key === '1' ? 'jpg' : 'png'}`;
        preloadImage(path);
      });
    } else {
      const path = `/image/${theme}.png`;
      preloadImage(path);
    }
  });
}

function preloadImage(url: string): void {
  if (preloadedImages.has(url)) return;
  
  preloadedImages.add(url);
  const img = new Image();
  img.src = url;
  img.onload = () => {
    imageCache.set(url, true);
  };
  img.onerror = () => {
    imageCache.set(url, false);
  };
}

function checkImageExists(url: string): Promise<boolean> {
  if (imageCache.has(url)) {
    return Promise.resolve(imageCache.get(url)!);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      imageCache.set(url, true);
      resolve(true);
    };
    img.onerror = () => {
      imageCache.set(url, false);
      resolve(false);
    };
    img.src = url;
  });
}

export async function getBackgroundImage(pageKey: string): Promise<string> {
  const theme = getThemeColor();
  const imagePath = theme === '森绿'
    ? `/image/${pageKey}.${pageKey === '1' ? 'jpg' : 'png'}`
    : `/image/${theme}.png`;

  if (preloadedImages.has(imagePath)) {
    return imagePath;
  }
  
  return await checkImageExists(imagePath) ? imagePath : '';
}

export function getBackgroundImageSync(pageKey: string): string {
  const theme = getThemeColor();
  return theme === '森绿'
    ? `/image/${pageKey}.${pageKey === '1' ? 'jpg' : 'png'}`
    : `/image/${theme}.png`;
}

export const fallbackBackground = 'linear-gradient(135deg, #FAFAFA 0%, #F5F5E9 50%, #E8F5E9 100%)';

export const themeBackgrounds: Record<ThemeColor, string> = {
  森绿: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 50%, #A5D6A7 100%)',
  海蓝: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 50%, #90CAF9 100%)',
  暖橙: 'linear-gradient(135deg, #FFF8E1 0%, #FFECB3 50%, #FFE082 100%)',
  薰衣草: 'linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 50%, #CE93D8 100%)',
};

export const themeSidebarPalettes: Record<ThemeColor, {
  background: string;
  border: string;
  hover: string;
  selected: string;
  accent: string;
}> = {
  森绿: {
    background: 'linear-gradient(180deg, rgba(248, 252, 248, 0.96) 0%, rgba(235, 247, 235, 0.98) 100%)',
    border: 'rgba(107, 142, 107, 0.16)',
    hover: 'rgba(129, 199, 132, 0.14)',
    selected: 'rgba(129, 199, 132, 0.2)',
    accent: '#5E8D63',
  },
  海蓝: {
    background: 'linear-gradient(180deg, rgba(247, 251, 255, 0.96) 0%, rgba(231, 243, 255, 0.98) 100%)',
    border: 'rgba(66, 165, 245, 0.16)',
    hover: 'rgba(66, 165, 245, 0.14)',
    selected: 'rgba(66, 165, 245, 0.2)',
    accent: '#2F7FC0',
  },
  暖橙: {
    background: 'linear-gradient(180deg, rgba(255, 251, 246, 0.96) 0%, rgba(255, 240, 220, 0.98) 100%)',
    border: 'rgba(255, 167, 38, 0.18)',
    hover: 'rgba(255, 167, 38, 0.14)',
    selected: 'rgba(255, 167, 38, 0.2)',
    accent: '#D77A1E',
  },
  薰衣草: {
    background: 'linear-gradient(180deg, rgba(253, 249, 255, 0.96) 0%, rgba(244, 235, 250, 0.98) 100%)',
    border: 'rgba(171, 71, 188, 0.18)',
    hover: 'rgba(171, 71, 188, 0.14)',
    selected: 'rgba(171, 71, 188, 0.2)',
    accent: '#8F4FA4',
  },
};

export const themeOverlayColors: Record<ThemeColor, string> = {
  森绿: 'rgba(255, 255, 255, 0.25)',
  海蓝: 'rgba(255, 255, 255, 0.3)',
  暖橙: 'rgba(255, 255, 255, 0.35)',
  薰衣草: 'rgba(255, 255, 255, 0.3)',
};

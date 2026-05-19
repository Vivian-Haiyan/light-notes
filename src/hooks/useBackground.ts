import { useState, useEffect, useCallback } from 'react';
import {
  getBackgroundImage,
  getThemeColor,
  themeBackgrounds,
  themeOverlayColors,
  type ThemeColor
} from '../utils/backgroundManager';

export function useBackground(pageKey: string) {
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const [theme, setTheme] = useState<ThemeColor>('森绿');
  const [isLoading, setIsLoading] = useState(true);

  const updateBackground = useCallback(async () => {
    setIsLoading(true);
    const currentTheme = getThemeColor();
    setTheme(currentTheme);
    
    const bgImage = await getBackgroundImage(pageKey);
    setBackgroundImage(bgImage);
    setIsLoading(false);
  }, [pageKey]);

  useEffect(() => {
    updateBackground();

    const handleThemeChange = () => {
      updateBackground();
    };

    window.addEventListener('themeChange', handleThemeChange);
    return () => {
      window.removeEventListener('themeChange', handleThemeChange);
    };
  }, [updateBackground]);

  const backgroundStyle = backgroundImage
    ? `url(${backgroundImage})`
    : themeBackgrounds[theme];

  const overlayColor = themeOverlayColors[theme];

  return {
    backgroundImage,
    backgroundStyle,
    overlayColor,
    theme,
    isLoading,
    refresh: updateBackground
  };
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeColor>(() => getThemeColor());

  useEffect(() => {
    const handleThemeChange = () => {
      setThemeState(getThemeColor());
    };

    window.addEventListener('themeChange', handleThemeChange);
    return () => {
      window.removeEventListener('themeChange', handleThemeChange);
    };
  }, []);

  return { theme };
}

import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import {
  getBackgroundImageSync,
  getThemeColor,
  themeOverlayColors,
  pageKeyMap,
  type ThemeColor
} from '../utils/backgroundManager';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const [theme, setTheme] = useState<ThemeColor>(() => getThemeColor());

  const getPageKey = useCallback((pathname: string): string => {
    if (pathname === '/books' || pathname === '/') return pageKeyMap.books;
    if (pathname.startsWith('/books/')) return pageKeyMap.bookDetail;
    if (pathname === '/notes/new') return pageKeyMap.noteEdit;
    if (pathname.startsWith('/notes/') && pathname.endsWith('/edit')) return pageKeyMap.noteEdit;
    if (pathname.startsWith('/search')) return pageKeyMap.books;
    if (pathname === '/highlights') return pageKeyMap.highlights;
    if (pathname === '/inspirations') return pageKeyMap.inspirations;
    if (pathname === '/reading-plans') return pageKeyMap.readingPlans;
    if (pathname === '/collections') return pageKeyMap.collections;
    if (pathname.startsWith('/collections/')) return pageKeyMap.collections;
    if (pathname === '/tags') return pageKeyMap.tags;
    if (pathname === '/trash') return pageKeyMap.trash;
    if (pathname === '/stats') return pageKeyMap.stats;
    if (pathname === '/settings') return pageKeyMap.books;
    if (pathname === '/profile') return pageKeyMap.books;
    return pageKeyMap.books;
  }, []);

  useEffect(() => {
    const handleThemeChange = () => {
      setTheme(getThemeColor());
    };
    window.addEventListener('themeChange', handleThemeChange);
    return () => {
      window.removeEventListener('themeChange', handleThemeChange);
    };
  }, []);

  const pageKey = getPageKey(location.pathname);
  const bgImage = getBackgroundImageSync(pageKey);
  const backgroundStyle = `url(${bgImage})`;
  const overlayColor = themeOverlayColors[theme];

  return (
    <div className="page-layout" style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      width: '100%',
      overflowX: 'hidden'
    }}>
      <Sidebar />
      <main
        className="main-content"
        style={{
          flex: 1,
          minWidth: 0,
          minHeight: '100vh',
          marginLeft: '220px',
          position: 'relative',
          backgroundImage: backgroundStyle,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          overflowX: 'hidden'
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: overlayColor,
            pointerEvents: 'none'
          }}
        />
        <div
          style={{ position: 'relative', zIndex: 1 }}
        >
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;

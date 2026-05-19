import { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Layout from './components/Layout';
import { useUserStore } from './store/useUserStore';
import { preloadAllBackgroundImages } from './utils/backgroundManager';
import { globalDataStore } from './lib/globalDataStore';

import {
  BooksPageSkeleton,
  BookDetailPageSkeleton,
  NoteEditPageSkeleton,
  SearchPageSkeleton,
  HighlightsPageSkeleton,
  InspirationsPageSkeleton,
  TagsPageSkeleton,
  StatsPageSkeleton,
  TrashPageSkeleton,
  CollectionsPageSkeleton,
  ReadingPlansPageSkeleton,
  ProfilePageSkeleton,
} from './components/skeletons';

const BooksPage = lazy(() => import('./pages/BooksPage'));
const BookDetailPage = lazy(() => import('./pages/BookDetailPage'));
const NoteEditPage = lazy(() => import('./pages/NoteEditPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const StatsPage = lazy(() => import('./pages/StatsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const InspirationsPage = lazy(() => import('./pages/InspirationsPage'));
const ReadingPlansPage = lazy(() => import('./pages/ReadingPlansPage'));
const CollectionsPage = lazy(() => import('./pages/CollectionsPage'));
const CollectionDetailPage = lazy(() => import('./pages/CollectionDetailPage'));
const TagsPage = lazy(() => import('./pages/TagsPage'));
const TrashPage = lazy(() => import('./pages/TrashPage'));
const HighlightsPage = lazy(() => import('./pages/HighlightsPage'));

function App() {
  const initUser = useUserStore((state) => state.initUser);
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);

  useEffect(() => {
    initUser();

    preloadAllBackgroundImages();
  }, [initUser]);

  useEffect(() => {
    if (!isLoggedIn) return;

    globalDataStore.initialize().catch(() => {
      console.log('Preload failed, will load on demand');
    });
  }, [isLoggedIn]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        <Route 
          path="/books" 
          element={
            <Layout>
              <Suspense fallback={<BooksPageSkeleton />}>
                <BooksPage />
              </Suspense>
            </Layout>
          } 
        />
        
        <Route 
          path="/books/:id" 
          element={
            <Layout>
              <Suspense fallback={<BookDetailPageSkeleton />}>
                <BookDetailPage />
              </Suspense>
            </Layout>
          } 
        />
        
        <Route 
          path="/notes/new" 
          element={
            <Layout>
              <Suspense fallback={<NoteEditPageSkeleton />}>
                <NoteEditPage />
              </Suspense>
            </Layout>
          } 
        />
        
        <Route 
          path="/notes/:id/edit" 
          element={
            <Layout>
              <Suspense fallback={<NoteEditPageSkeleton />}>
                <NoteEditPage />
              </Suspense>
            </Layout>
          } 
        />
        
        <Route 
          path="/search" 
          element={
            <Layout>
              <Suspense fallback={<SearchPageSkeleton />}>
                <SearchPage />
              </Suspense>
            </Layout>
          } 
        />
        
        <Route 
          path="/stats" 
          element={
            <Layout>
              <Suspense fallback={<StatsPageSkeleton />}>
                <StatsPage />
              </Suspense>
            </Layout>
          } 
        />
        
        <Route 
          path="/profile" 
          element={
            <Layout>
              <Suspense fallback={<ProfilePageSkeleton />}>
                <ProfilePage />
              </Suspense>
            </Layout>
          } 
        />
        
        <Route 
          path="/settings" 
          element={
            <Layout>
              <Suspense fallback={<NoteEditPageSkeleton />}>
                <SettingsPage />
              </Suspense>
            </Layout>
          } 
        />
        
        <Route 
          path="/inspirations" 
          element={
            <Layout>
              <Suspense fallback={<InspirationsPageSkeleton />}>
                <InspirationsPage />
              </Suspense>
            </Layout>
          } 
        />
        
        <Route 
          path="/reading-plans" 
          element={
            <Layout>
              <Suspense fallback={<ReadingPlansPageSkeleton />}>
                <ReadingPlansPage />
              </Suspense>
            </Layout>
          } 
        />
        
        <Route 
          path="/collections" 
          element={
            <Layout>
              <Suspense fallback={<CollectionsPageSkeleton />}>
                <CollectionsPage />
              </Suspense>
            </Layout>
          } 
        />
        
        <Route 
          path="/collections/:id" 
          element={
            <Layout>
              <Suspense fallback={<CollectionsPageSkeleton />}>
                <CollectionDetailPage />
              </Suspense>
            </Layout>
          } 
        />
        
        <Route 
          path="/tags" 
          element={
            <Layout>
              <Suspense fallback={<TagsPageSkeleton />}>
                <TagsPage />
              </Suspense>
            </Layout>
          } 
        />
        
        <Route 
          path="/trash" 
          element={
            <Layout>
              <Suspense fallback={<TrashPageSkeleton />}>
                <TrashPage />
              </Suspense>
            </Layout>
          } 
        />
        
        <Route 
          path="/highlights" 
          element={
            <Layout>
              <Suspense fallback={<HighlightsPageSkeleton />}>
                <HighlightsPage />
              </Suspense>
            </Layout>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

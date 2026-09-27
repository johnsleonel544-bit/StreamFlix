import { AuthProvider, useAuth } from '@/lib/auth';
import { useRoute, navigate } from '@/lib/router';
import { Sidebar, Header, MobileNav } from '@/components/Layout';
import { HomePage } from '@/pages/HomePage';
import { SearchPage } from '@/pages/SearchPage';
import { BrowsePage } from '@/pages/BrowsePage';
import { MyListPage, HistoryPage } from '@/pages/MyListPage';
import { PlayerPage } from '@/pages/PlayerPage';
import { AuthPage } from '@/pages/AuthPage';
import { useEffect, useState } from 'react';

function AppContent() {
  const route = useRoute();
  const { user, loading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // Update search query from URL
  useEffect(() => {
    if (route.page === 'search' && route.params.q) {
      setSearchQuery(decodeURIComponent(route.params.q));
    }
  }, [route.page, route.params.q]);

  // Pages that require auth
  const authRequiredPages = ['mylist', 'history'];
  const needsAuth = authRequiredPages.includes(route.page) && !user && !authLoading;

  const renderPage = () => {
    if (needsAuth) return <AuthPage />;
    switch (route.page) {
      case 'home':
        return <HomePage />;
      case 'search':
        return <SearchPage query={searchQuery} />;
      case 'movies':
        return <BrowsePage mediaType="movie" />;
      case 'tv':
        return <BrowsePage mediaType="tv" />;
      case 'mylist':
        return <MyListPage />;
      case 'history':
        return <HistoryPage />;
      case 'player': {
        const id = parseInt(route.params.id, 10);
        const type = route.params.type === 'tv' ? 'tv' : 'movie';
        if (!id) return <HomePage />;
        return <PlayerPage mediaType={type} tmdbId={id} />;
      }
      default:
        return <HomePage />;
    }
  };

  const isPlayerPage = route.page === 'player';

  return (
    <div className="min-h-screen bg-[#070c12] text-white">
      {!isPlayerPage && <Sidebar />}
      {!isPlayerPage && <Header onSearch={setSearchQuery} />}
      <main className={`pb-14 ${isPlayerPage ? '' : 'lg:ml-[184px] lg:pt-[72px]'}`}>
        {renderPage()}
      </main>
      {!isPlayerPage && <MobileNav />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

import {
  Bell,
  ChevronDown,
  Grid2X2,
  Flame,
  Home,
  ListPlus,
  LogOut,
  Play,
  Search,
  Tv,
  User,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { navigate, useRoute } from '@/lib/router';

const navItems = [
  { label: 'Home', icon: Home, page: 'home' },
  { label: 'Movies', icon: Grid2X2, page: 'movies' },
  { label: 'TV Shows', icon: Tv, page: 'tv' },
  { label: 'New & Popular', icon: Flame, page: 'movies' },
  { label: 'My List', icon: ListPlus, page: 'mylist' },
];

export function Sidebar() {
  const route = useRoute();
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[184px] border-r border-white/[0.06] bg-[#080d13] lg:block">
      <div className="flex h-[72px] items-center px-5">
        <button onClick={() => navigate('/')} className="block">
          <img src="/logo-transparent.png" alt="StreamFlix" className="brand-logo" />
        </button>
      </div>
      <nav className="mt-3 space-y-1 px-2">
        {navItems.map(({ label, icon: Icon, page }) => (
          <button
            key={label}
            onClick={() => navigate(page === 'home' ? '/' : `/${page === 'New & Popular' ? 'movies' : page}`)}
            className={`nav-item ${route.page === page ? 'nav-item-active' : ''}`}
          >
            <Icon size={18} strokeWidth={route.page === page ? 2.4 : 1.8} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
      <div className="absolute bottom-7 left-6 right-6 border-t border-white/[0.08] pt-5 text-[11px] leading-5 text-slate-500">
        <p>© 2024 StreamFlix</p>
        <p>All rights reserved.</p>
      </div>
    </aside>
  );
}

export function Header({ onSearch }: { onSearch: (query: string) => void }) {
  const route = useRoute();
  const { user, signOut } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    if (value.trim()) {
      navigate(`/search?q=${encodeURIComponent(value)}`);
      onSearch(value);
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-20 flex h-[72px] items-center justify-between border-b border-white/[0.06] bg-[#080d13]/95 px-5 backdrop-blur-xl lg:left-[184px] lg:px-10">
      <div className="flex h-full items-center gap-7 lg:gap-10">
        <button onClick={() => navigate('/')} className="lg:hidden">
          <img src="/logo-transparent.png" alt="StreamFlix" className="brand-logo-sm" />
        </button>
        <div className="hidden h-full items-center gap-8 text-[13px] text-slate-400 sm:flex">
          {[
            { label: 'Home', page: 'home', path: '/' },
            { label: 'Movies', page: 'movies', path: '/movies' },
            { label: 'TV Shows', page: 'tv', path: '/tv' },
            { label: 'My List', page: 'mylist', path: '/mylist' },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`top-link ${route.page === item.page ? 'top-link-active' : ''}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Mobile search */}
        {searchOpen ? (
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search..."
              className="h-10 w-40 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 text-[13px] text-white outline-none placeholder:text-slate-500 focus:border-white/20"
            />
            <button onClick={() => { setSearchOpen(false); setSearchValue(''); }} className="icon-button">
              <X size={18} />
            </button>
          </div>
        ) : (
          <button onClick={() => setSearchOpen(true)} className="icon-button md:hidden" aria-label="Search">
            <Search size={19} />
          </button>
        )}
        {/* Desktop search */}
        <label className="search-box hidden md:flex">
          <Search size={16} className="text-slate-400" />
          <input
            aria-label="Search movies"
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search for movies, shows, actors..."
          />
        </label>
        <button className="icon-button" aria-label="Notifications">
          <Bell size={19} />
        </button>
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="profile-button"
            aria-label="Profile"
          >
            <div className="grid h-8 w-8 place-items-center rounded-full bg-[#f52432] text-sm font-bold text-white ring-1 ring-white/15">
              {user?.email?.[0]?.toUpperCase() ?? 'G'}
            </div>
            <ChevronDown size={14} />
          </button>
          {profileOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
              <div className="absolute right-0 top-12 z-20 w-56 overflow-hidden rounded-lg border border-white/10 bg-[#0d1117] shadow-2xl">
                <div className="border-b border-white/[0.06] px-4 py-3">
                  <p className="truncate text-xs text-slate-500">Signed in as</p>
                  <p className="truncate text-sm font-semibold text-white">{user?.email ?? 'Guest'}</p>
                </div>
                <button
                  onClick={() => { navigate('/mylist'); setProfileOpen(false); }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
                >
                  <ListPlus size={16} /> My List
                </button>
                <button
                  onClick={() => { navigate('/history'); setProfileOpen(false); }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
                >
                  <Play size={16} /> Watch History
                </button>
                {user && (
                  <button
                    onClick={() => { signOut(); setProfileOpen(false); navigate('/'); }}
                    className="flex w-full items-center gap-3 border-t border-white/[0.06] px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function MobileNav() {
  const route = useRoute();
  return (
    <nav className="mobile-nav fixed bottom-0 left-0 right-0 z-30 flex justify-around border-t border-white/[0.08] bg-[#080d13]/95 px-2 py-3 backdrop-blur-xl lg:hidden">
      {navItems.slice(0, 5).map(({ label, icon: Icon, page }) => (
        <button
          key={label}
          onClick={() => navigate(page === 'home' ? '/' : `/${page}`)}
          className={route.page === page ? 'mobile-nav-active' : ''}
        >
          <Icon size={19} />
          <span>{label === 'New & Popular' ? 'Popular' : label}</span>
        </button>
      ))}
    </nav>
  );
}

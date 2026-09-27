import { useEffect, useState } from 'react';

export interface Route {
  page: string;
  params: Record<string, string>;
}

function parseHash(): Route {
  const hash = window.location.hash.slice(1) || '/';
  const [path, queryString] = hash.split('?');
  const parts = path.split('/').filter(Boolean);
  const params: Record<string, string> = {};
  if (queryString) {
    new URLSearchParams(queryString).forEach((value, key) => {
      params[key] = value;
    });
  }

  if (parts.length === 0) return { page: 'home', params };
  if (parts[0] === 'search') return { page: 'search', params };
  if (parts[0] === 'movies') return { page: 'movies', params };
  if (parts[0] === 'tv') return { page: 'tv', params };
  if (parts[0] === 'mylist') return { page: 'mylist', params };
  if (parts[0] === 'history') return { page: 'history', params };
  if (parts[0] === 'player') {
    return {
      page: 'player',
      params: { ...params, type: parts[1] || params.type || 'movie', id: parts[2] || params.id || '' },
    };
  }
  return { page: 'home', params };
}

export function navigate(path: string) {
  window.location.hash = path;
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(parseHash());
  useEffect(() => {
    const handler = () => {
      setRoute(parseHash());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);
  return route;
}

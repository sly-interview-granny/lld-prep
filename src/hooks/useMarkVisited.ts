import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useVisitedPages } from '../hooks/useVisitedPages';

/** Marks the current route (path + hash + search) as visited on navigation. */
export function useMarkVisited() {
  const location = useLocation();
  const { markVisited } = useVisitedPages();

  useEffect(() => {
    const path = `${location.pathname}${location.search}${location.hash}`;
    markVisited(path);

    if (location.hash) {
      markVisited(location.pathname);
    }
  }, [location.pathname, location.search, location.hash, markVisited]);
}

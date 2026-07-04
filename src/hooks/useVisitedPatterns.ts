import { useCallback, useEffect, useState } from 'react';
import {
  loadVisitedPatterns,
  VISITED_PATTERNS_EVENT,
  markPatternVisited,
} from '../utils/visitedPatterns';

export function useVisitedPatterns() {
  const [visited, setVisited] = useState<Set<string>>(() =>
    loadVisitedPatterns(),
  );

  useEffect(() => {
    const sync = () => setVisited(loadVisitedPatterns());
    window.addEventListener(VISITED_PATTERNS_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(VISITED_PATTERNS_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const markVisited = useCallback((slug: string) => {
    if (markPatternVisited(slug)) {
      setVisited(loadVisitedPatterns());
    }
  }, []);

  const isVisited = useCallback(
    (slug: string) => visited.has(slug),
    [visited],
  );

  return { visited, markVisited, isVisited };
}

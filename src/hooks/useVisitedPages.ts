import { useCallback, useEffect, useState } from 'react';
import {
  VISITED_PAGES_EVENT,
  VISITED_PAGES_KEY,
} from '../context/VisitedContext';

function readVisited(): Set<string> {
  try {
    const raw = localStorage.getItem(VISITED_PAGES_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(
      parsed.filter((item): item is string => typeof item === 'string'),
    );
  } catch {
    return new Set();
  }
}

export function markPageVisited(path: string): void {
  const visited = readVisited();
  if (visited.has(path)) return;
  visited.add(path);
  localStorage.setItem(VISITED_PAGES_KEY, JSON.stringify([...visited]));
  window.dispatchEvent(new Event(VISITED_PAGES_EVENT));
}

/** Generic visited-page hook keyed by full route paths (section + anchor). */
export function useVisitedPages() {
  const [visited, setVisited] = useState(() => readVisited());

  useEffect(() => {
    const sync = () => setVisited(readVisited());
    window.addEventListener(VISITED_PAGES_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(VISITED_PAGES_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const markVisited = useCallback((path: string) => {
    markPageVisited(path);
    setVisited(readVisited());
  }, []);

  const isVisited = useCallback(
    (path: string) => visited.has(path),
    [visited],
  );

  const countVisited = useCallback(
    (paths: string[]) => paths.filter((path) => visited.has(path)).length,
    [visited],
  );

  return { isVisited, markVisited, countVisited, visited };
}

import { useCallback, useState } from 'react';

export const VISITED_STORAGE_KEY = 'lld-prep-visited';

function readVisited(): Set<string> {
  try {
    const raw = localStorage.getItem(VISITED_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((item): item is string => typeof item === 'string'));
  } catch {
    return new Set();
  }
}

export function markPageVisited(path: string): void {
  const visited = readVisited();
  if (visited.has(path)) return;
  visited.add(path);
  localStorage.setItem(VISITED_STORAGE_KEY, JSON.stringify([...visited]));
}

export function useVisitedPages() {
  const [visited, setVisited] = useState(() => readVisited());

  const refresh = useCallback(() => {
    setVisited(readVisited());
  }, []);

  const markVisited = useCallback(
    (path: string) => {
      markPageVisited(path);
      refresh();
    },
    [refresh],
  );

  const isVisited = useCallback((path: string) => visited.has(path), [visited]);

  return { isVisited, markVisited, refresh };
}

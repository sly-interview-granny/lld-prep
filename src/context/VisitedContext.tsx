import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useLocation } from 'react-router-dom';

export const VISITED_PAGES_KEY = 'lld-prep-visited';
export const VISITED_PAGES_EVENT = 'lld-prep-visited-changed';

function loadVisited(): Set<string> {
  try {
    const raw = localStorage.getItem(VISITED_PAGES_KEY);
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? new Set(parsed.filter((item): item is string => typeof item === 'string'))
      : new Set();
  } catch {
    return new Set();
  }
}

function saveVisited(visited: Set<string>) {
  localStorage.setItem(VISITED_PAGES_KEY, JSON.stringify([...visited]));
}

interface VisitedContextValue {
  isVisited: (path: string) => boolean;
  markVisited: (path: string) => void;
  countVisited: (paths: string[]) => number;
}

const VisitedContext = createContext<VisitedContextValue | null>(null);

export function VisitedProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [visited, setVisited] = useState(loadVisited);

  const fullPath = `${location.pathname}${location.search}${location.hash}`;

  const markVisited = useCallback((path: string) => {
    setVisited((prev) => {
      if (prev.has(path)) return prev;
      const next = new Set(prev);
      next.add(path);
      saveVisited(next);
      window.dispatchEvent(new Event(VISITED_PAGES_EVENT));
      return next;
    });
  }, []);

  useEffect(() => {
    markVisited(fullPath);
  }, [fullPath, markVisited]);

  useEffect(() => {
    const sync = () => setVisited(loadVisited());
    window.addEventListener(VISITED_PAGES_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(VISITED_PAGES_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const isVisited = useCallback(
    (path: string) => visited.has(path),
    [visited],
  );

  const countVisited = useCallback(
    (paths: string[]) => paths.filter((path) => visited.has(path)).length,
    [visited],
  );

  return (
    <VisitedContext.Provider value={{ isVisited, markVisited, countVisited }}>
      {children}
    </VisitedContext.Provider>
  );
}

export function useVisited() {
  const ctx = useContext(VisitedContext);
  if (!ctx) {
    throw new Error('useVisited must be used within VisitedProvider');
  }
  return ctx;
}

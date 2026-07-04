import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useLocation } from 'react-router-dom';

const STORAGE_KEY = 'lld-prep-visited';

function loadVisited(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function saveVisited(visited: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...visited]));
}

interface VisitedContextValue {
  isVisited: (path: string) => boolean;
}

const VisitedContext = createContext<VisitedContextValue | null>(null);

export function VisitedProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [visited, setVisited] = useState(loadVisited);

  const fullPath = `${location.pathname}${location.search}${location.hash}`;

  useEffect(() => {
    setVisited((prev) => {
      if (prev.has(fullPath)) return prev;
      const next = new Set(prev);
      next.add(fullPath);
      saveVisited(next);
      return next;
    });
  }, [fullPath]);

  const isVisited = useCallback(
    (path: string) => visited.has(path),
    [visited],
  );

  return (
    <VisitedContext.Provider value={{ isVisited }}>
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

const STORAGE_KEY = 'lld-prep-visited-patterns';
export const VISITED_PATTERNS_EVENT = 'lld-prep-visited-patterns-changed';

function readSlugs(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : [];
  } catch {
    return [];
  }
}

export function loadVisitedPatterns(): Set<string> {
  return new Set(readSlugs());
}

export function saveVisitedPatterns(slugs: Set<string>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...slugs]));
}

export function markPatternVisited(slug: string): boolean {
  const visited = loadVisitedPatterns();
  if (visited.has(slug)) return false;
  visited.add(slug);
  saveVisitedPatterns(visited);
  window.dispatchEvent(new Event(VISITED_PATTERNS_EVENT));
  return true;
}

import { useState } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search patterns…',
}: SearchBarProps) {
  return (
    <div className="search-bar">
      <input
        type="search"
        className="search-bar__input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search patterns"
      />
      {value && (
        <button
          type="button"
          className="search-bar__clear"
          onClick={() => onChange('')}
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>
  );
}

export function useSearchFilter<T>(
  items: T[],
  query: string,
  getSearchText: (item: T) => string,
): T[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return items;
  return items.filter((item) =>
    getSearchText(item).toLowerCase().includes(normalized),
  );
}

export function useSearchState(initial = '') {
  const [query, setQuery] = useState(initial);
  return { query, setQuery };
}

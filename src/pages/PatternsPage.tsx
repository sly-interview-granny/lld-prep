import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  patterns,
  type PatternCategory,
} from '../content/patterns';
import { PatternCard } from '../components/PatternCard';
import { SearchBar, useSearchState } from '../components/SearchBar';

const categories: PatternCategory[] = [
  'Creational',
  'Structural',
  'Behavioural',
];

export function PatternsPage() {
  const { query, setQuery } = useSearchState();
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');

  const filtered = useMemo(() => {
    let result = patterns;

    if (categoryFilter) {
      const normalized = categoryFilter.toLowerCase();
      result = result.filter(
        (p) => p.category.toLowerCase() === normalized,
      );
    }

    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.slug.includes(q),
      );
    }

    return result;
  }, [query, categoryFilter]);

  const grouped = useMemo(() => {
    const groups: Record<PatternCategory, typeof patterns> = {
      Creational: [],
      Structural: [],
      Behavioural: [],
    };
    for (const pattern of filtered) {
      groups[pattern.category].push(pattern);
    }
    return groups;
  }, [filtered]);

  const activeCategory = categoryFilter
    ? (categoryFilter.charAt(0).toUpperCase() +
        categoryFilter.slice(1)) as PatternCategory
    : null;

  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">Design Patterns</h1>
        <p className="page__subtitle">
          {activeCategory
            ? `${activeCategory} patterns (${filtered.length})`
            : `${patterns.length} patterns — search or browse by category`}
        </p>
      </header>

      <div className="patterns-toolbar">
        <SearchBar value={query} onChange={setQuery} />
        <div className="category-filters">
          <Link
            to="/patterns"
            className={`category-filter${!activeCategory ? ' category-filter--active' : ''}`}
          >
            All
          </Link>
          {categories.map((category) => (
            <Link
              key={category}
              to={`/patterns?category=${category.toLowerCase()}`}
              className={`category-filter category-filter--${category.toLowerCase()}${activeCategory === category ? ' category-filter--active' : ''}`}
            >
              {category}
            </Link>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="empty-state">No patterns match your search.</p>
      ) : (
        categories.map((category) => {
          const items = grouped[category];
          if (items.length === 0) return null;
          return (
            <section key={category} className="pattern-group">
              <h2 className="section-title">
                <span
                  className={`category-badge category-badge--${category.toLowerCase()}`}
                >
                  {category}
                </span>
                <span className="pattern-group__count">{items.length}</span>
              </h2>
              <div className="pattern-grid">
                {items.map((pattern) => (
                  <PatternCard
                    key={pattern.slug}
                    slug={pattern.slug}
                    name={pattern.name}
                    category={pattern.category}
                  />
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}

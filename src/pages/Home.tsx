import { Link } from 'react-router-dom';
import { patternCategoryCounts, patterns } from '../content/patterns';

const sections = [
  {
    to: '/oop',
    title: 'OOP Concepts',
    description: 'Four pillars: Abstraction, Polymorphism, Inheritance, Encapsulation.',
    count: 4,
  },
  {
    to: '/relationships',
    title: 'Class Relationships',
    description: 'IS-A, USES-A, HAS-A, and PART-OF relationships between objects.',
    count: 4,
  },
  {
    to: '/solid',
    title: 'SOLID Principles',
    description: 'Five design principles for maintainable object-oriented code.',
    count: 5,
  },
  {
    to: '/patterns',
    title: 'Design Patterns',
    description: '29 patterns across Creational, Structural, and Behavioural categories.',
    count: patterns.length,
  },
];

export function Home() {
  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">LLD Prep</h1>
        <p className="page__subtitle">
          Quick-reference guide for Low-Level Design interview prep.
        </p>
      </header>

      <div className="dashboard-grid">
        {sections.map(({ to, title, description, count }) => (
          <Link key={to} to={to} className="dashboard-card">
            <h2 className="dashboard-card__title">{title}</h2>
            <p className="dashboard-card__description">{description}</p>
            <span className="dashboard-card__count">{count} topics</span>
          </Link>
        ))}
      </div>

      <section className="pattern-summary">
        <h2 className="section-title">Patterns by Category</h2>
        <div className="pattern-summary__grid">
          {(Object.entries(patternCategoryCounts) as [string, number][]).map(
            ([category, count]) => (
              <Link
                key={category}
                to={`/patterns?category=${category.toLowerCase()}`}
                className="pattern-summary__item"
              >
                <span
                  className={`category-badge category-badge--${category.toLowerCase()}`}
                >
                  {category}
                </span>
                <span className="pattern-summary__count">{count} patterns</span>
              </Link>
            ),
          )}
        </div>
      </section>
    </div>
  );
}

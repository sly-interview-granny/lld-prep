import { NavLink } from 'react-router-dom';
import type { PatternCategory } from '../content/patterns';
import { getPatternsByCategory } from '../content/patterns';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const mainNav = [
  { to: '/', label: 'Home', end: true },
  { to: '/oop', label: 'OOP Concepts' },
  { to: '/relationships', label: 'Relationships' },
  { to: '/solid', label: 'SOLID' },
  { to: '/patterns', label: 'All Patterns' },
];

const categories: PatternCategory[] = [
  'Creational',
  'Structural',
  'Behavioural',
];

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {open && (
        <button
          type="button"
          className="sidebar-overlay"
          onClick={onClose}
          aria-label="Close navigation"
        />
      )}
      <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}>
        <div className="sidebar__brand">
          <NavLink to="/" className="sidebar__logo" onClick={onClose}>
            LLD Prep
          </NavLink>
        </div>

        <nav className="sidebar__nav" aria-label="Main navigation">
          <ul className="sidebar__list">
            {mainNav.map(({ to, label, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
                  }
                  onClick={onClose}
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar__section">
          <p className="sidebar__section-title">Patterns by Category</p>
          <ul className="sidebar__list sidebar__list--compact">
            {categories.map((category) => (
              <li key={category}>
                <NavLink
                  to={`/patterns?category=${category.toLowerCase()}`}
                  className="sidebar__link sidebar__link--sub"
                  onClick={onClose}
                >
                  {category}
                  <span className="sidebar__count">
                    {getPatternsByCategory(category).length}
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </>
  );
}

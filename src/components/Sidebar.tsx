import { NavLink, useLocation, useParams, useSearchParams } from 'react-router-dom';
import type { PatternCategory } from '../content/patterns';
import { useVisitedPages } from '../hooks/useVisitedPages';
import {
  getPatternNavByCategory,
  oopNavItems,
  patternCategories,
  patternCategoryNavItems,
  relationshipNavItems,
  solidNavItems,
} from '../lib/sectionNav';

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

interface VisitedIndicatorProps {
  visited: boolean;
}

function VisitedIndicator({ visited }: VisitedIndicatorProps) {
  return (
    <span
      className={`sidebar__progress${visited ? ' sidebar__progress--visited' : ''}`}
      aria-hidden="true"
      title={visited ? 'Visited' : 'Not visited'}
    />
  );
}

interface SubNavLinkProps {
  to: string;
  label: string;
  isActive: boolean;
  visited: boolean;
  onClose: () => void;
  meta?: string;
}

function SubNavLink({
  to,
  label,
  isActive,
  visited,
  onClose,
  meta,
}: SubNavLinkProps) {
  return (
    <li>
      <NavLink
        to={to}
        className={`sidebar__link sidebar__link--sub${
          isActive ? ' sidebar__link--active' : ''
        }`}
        onClick={onClose}
      >
        <span className="sidebar__link-label">
          <VisitedIndicator visited={visited} />
          <span>{label}</span>
        </span>
        {meta && <span className="sidebar__count">{meta}</span>}
      </NavLink>
    </li>
  );
}

function SectionSubNav({ onClose }: { onClose: () => void }) {
  const { pathname, hash } = useLocation();
  const [searchParams] = useSearchParams();
  const { slug } = useParams<{ slug: string }>();
  const { isVisited } = useVisitedPages();

  const currentHash = hash.replace('#', '').toLowerCase();
  const categoryFilter = searchParams.get('category');

  if (pathname === '/oop') {
    return (
      <div className="sidebar__section sidebar__section--subnav">
        <p className="sidebar__section-title">In this section</p>
        <ul className="sidebar__list sidebar__list--compact">
          {oopNavItems.map((item) => (
            <SubNavLink
              key={item.hash}
              to={item.path}
              label={item.label}
              isActive={currentHash === item.hash}
              visited={isVisited(item.path) || isVisited('/oop')}
              onClose={onClose}
            />
          ))}
        </ul>
      </div>
    );
  }

  if (pathname === '/relationships') {
    return (
      <div className="sidebar__section sidebar__section--subnav">
        <p className="sidebar__section-title">In this section</p>
        <ul className="sidebar__list sidebar__list--compact">
          {relationshipNavItems.map((item) => (
            <SubNavLink
              key={item.hash}
              to={item.path}
              label={item.label}
              isActive={currentHash === item.hash}
              visited={isVisited(item.path) || isVisited('/relationships')}
              onClose={onClose}
              meta={item.tag}
            />
          ))}
        </ul>
      </div>
    );
  }

  if (pathname === '/solid') {
    return (
      <div className="sidebar__section sidebar__section--subnav">
        <p className="sidebar__section-title">In this section</p>
        <ul className="sidebar__list sidebar__list--compact">
          {solidNavItems.map((item) => (
            <SubNavLink
              key={item.hash}
              to={item.path}
              label={`${item.letter} — ${item.label}`}
              isActive={currentHash === item.hash}
              visited={isVisited(item.path) || isVisited('/solid')}
              onClose={onClose}
            />
          ))}
        </ul>
      </div>
    );
  }

  if (pathname === '/patterns') {
    return (
      <div className="sidebar__section sidebar__section--subnav">
        <p className="sidebar__section-title">Browse by category</p>
        <ul className="sidebar__list sidebar__list--compact">
          <SubNavLink
            to="/patterns"
            label="All patterns"
            isActive={!categoryFilter}
            visited={isVisited('/patterns')}
            onClose={onClose}
          />
          {patternCategoryNavItems.map((item) => {
            const normalized = item.category.toLowerCase();
            return (
              <SubNavLink
                key={item.category}
                to={item.path}
                label={item.label}
                isActive={categoryFilter?.toLowerCase() === normalized}
                visited={isVisited(item.path)}
                onClose={onClose}
                meta={String(item.count)}
              />
            );
          })}
        </ul>
      </div>
    );
  }

  if (pathname.startsWith('/patterns/') && slug) {
    const grouped = getPatternNavByCategory();

    return (
      <div className="sidebar__section sidebar__section--subnav">
        <p className="sidebar__section-title">All patterns</p>
        {patternCategories.map((category) => (
          <div key={category} className="sidebar__group">
            <p
              className={`sidebar__group-title sidebar__group-title--${category.toLowerCase()}`}
            >
              {category}
            </p>
            <ul className="sidebar__list sidebar__list--compact">
              {grouped[category as PatternCategory].map((item) => (
                <SubNavLink
                  key={item.slug}
                  to={item.path}
                  label={item.label}
                  isActive={slug === item.slug}
                  visited={isVisited(item.path)}
                  onClose={onClose}
                />
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  }

  return null;
}

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

        <SectionSubNav onClose={onClose} />
      </aside>
    </>
  );
}

import { NavLink, useLocation, useParams } from 'react-router-dom';
import { useActiveSection } from '../context/ActiveSectionContext';
import {
  getSectionKey,
  getSectionNav,
  getSectionTitle,
  isSectionNavItemActive,
  type SectionNavItem,
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

function SectionNavLink({
  item,
  isActive,
  onClose,
}: {
  item: SectionNavItem;
  isActive: boolean;
  onClose: () => void;
}) {
  return (
    <NavLink
      to={item.to}
      className={`sidebar__link sidebar__link--sub sidebar__link--pattern${
        isActive ? ' sidebar__link--active' : ''
      }`}
      onClick={onClose}
    >
      {item.label}
    </NavLink>
  );
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation();
  const { slug: activeSlug } = useParams<{ slug: string }>();
  const activeSection = useActiveSection();

  const section = getSectionKey(location.pathname);
  const sectionNav = section ? getSectionNav(section, { activeSlug }) : [];

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

        {section && sectionNav.length > 0 && (
          <div className="sidebar__section sidebar__section--subnav">
            <p className="sidebar__section-title">{getSectionTitle(section)}</p>
            {sectionNav.map((group) => (
              <div key={group.title ?? 'default'} className="sidebar__group">
                {group.title && (
                  <p
                    className={`sidebar__group-title${
                      group.titleClassName ? ` ${group.titleClassName}` : ''
                    }`}
                  >
                    {group.title}
                  </p>
                )}
                <ul className="sidebar__list sidebar__list--compact">
                  {group.items.map((item) => {
                    const active = isSectionNavItemActive(
                      item,
                      location.pathname,
                      location.search,
                      location.hash,
                      activeSlug,
                      activeSection?.activeSectionId,
                    );

                    return (
                      <li key={item.matchPath}>
                        <SectionNavLink
                          item={item}
                          isActive={active}
                          onClose={onClose}
                        />
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </aside>
    </>
  );
}

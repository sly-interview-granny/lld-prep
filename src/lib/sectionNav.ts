import { oopConcepts } from '../content/oop';
import { relationships } from '../content/relationships';
import { solidPrinciples } from '../content/solid';
import {
  getPatternsByCategory,
  type PatternCategory,
} from '../content/patterns';

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** @deprecated Use slugify */
export const slugifyTitle = slugify;

export type SectionKey = 'oop' | 'relationships' | 'solid' | 'patterns';

export const patternCategories: PatternCategory[] = [
  'Creational',
  'Structural',
  'Behavioural',
];

export const oopNavItems = oopConcepts.map((concept) => {
  const hash = slugify(concept.title);
  return { hash, path: `/oop#${hash}`, label: concept.title };
});

export const relationshipNavItems = relationships.map((rel) => {
  const hash = slugify(rel.title);
  return {
    hash,
    path: `/relationships#${hash}`,
    label: rel.title,
    tag: rel.tag,
  };
});

export const solidNavItems = solidPrinciples.map((principle) => ({
  hash: principle.letter.toLowerCase(),
  path: `/solid#${principle.letter.toLowerCase()}`,
  label: principle.title,
  letter: principle.letter,
}));

export const patternCategoryNavItems = patternCategories.map((category) => ({
  category,
  label: category,
  path: `/patterns?category=${category.toLowerCase()}`,
  count: getPatternsByCategory(category).length,
}));

export function getPatternNavByCategory(): Record<
  PatternCategory,
  { slug: string; path: string; label: string }[]
> {
  return {
    Creational: getPatternsByCategory('Creational').map((p) => ({
      slug: p.slug,
      path: `/patterns/${p.slug}`,
      label: p.name,
    })),
    Structural: getPatternsByCategory('Structural').map((p) => ({
      slug: p.slug,
      path: `/patterns/${p.slug}`,
      label: p.name,
    })),
    Behavioural: getPatternsByCategory('Behavioural').map((p) => ({
      slug: p.slug,
      path: `/patterns/${p.slug}`,
      label: p.name,
    })),
  };
}

export function getSectionKey(pathname: string): SectionKey | null {
  if (pathname.startsWith('/patterns')) return 'patterns';
  if (pathname === '/oop') return 'oop';
  if (pathname === '/relationships') return 'relationships';
  if (pathname === '/solid') return 'solid';
  return null;
}

export interface SectionNavItem {
  label: string;
  to: string;
  matchPath: string;
}

export interface SectionNavGroup {
  title?: string;
  titleClassName?: string;
  items: SectionNavItem[];
}

const sectionTitles: Record<SectionKey, string> = {
  oop: 'OOP Concepts',
  relationships: 'Relationships',
  solid: 'SOLID Principles',
  patterns: 'Design Patterns',
};

export function getSectionTitle(section: SectionKey): string {
  return sectionTitles[section];
}

export function getSectionNav(
  section: SectionKey,
  options: { activeSlug?: string } = {},
): SectionNavGroup[] {
  switch (section) {
    case 'oop':
      return [
        {
          items: oopConcepts.map((concept) => {
            const hash = slugify(concept.title);
            return {
              label: concept.title,
              to: `/oop#${hash}`,
              matchPath: `/oop#${hash}`,
            };
          }),
        },
      ];

    case 'relationships':
      return [
        {
          items: relationships.map((rel) => {
            const hash = slugify(rel.title);
            return {
              label: rel.title,
              to: `/relationships#${hash}`,
              matchPath: `/relationships#${hash}`,
            };
          }),
        },
      ];

    case 'solid':
      return [
        {
          items: solidPrinciples.map((principle) => {
            const hash = principle.letter.toLowerCase();
            return {
              label: `${principle.letter} — ${principle.title}`,
              to: `/solid#${hash}`,
              matchPath: `/solid#${hash}`,
            };
          }),
        },
      ];

    case 'patterns':
      if (options.activeSlug) {
        return patternCategories.map((category) => ({
          title: category,
          titleClassName: `sidebar__group-title--${category.toLowerCase()}`,
          items: getPatternsByCategory(category).map((pattern) => ({
            label: pattern.name,
            to: `/patterns/${pattern.slug}`,
            matchPath: `/patterns/${pattern.slug}`,
          })),
        }));
      }

      return [
        {
          items: [
            {
              label: 'All Patterns',
              to: '/patterns',
              matchPath: '/patterns',
            },
            ...patternCategories.map((category) => ({
              label: category,
              to: `/patterns?category=${category.toLowerCase()}`,
              matchPath: `/patterns?category=${category.toLowerCase()}`,
            })),
          ],
        },
      ];

    default:
      return [];
  }
}

export function isSectionNavItemActive(
  item: SectionNavItem,
  pathname: string,
  search: string,
  hash: string,
  activeSlug?: string,
  activeSectionId?: string | null,
): boolean {
  const fullPath = `${pathname}${search}${hash}`;

  if (activeSlug) {
    return item.matchPath === `/patterns/${activeSlug}`;
  }

  if (item.matchPath === '/patterns') {
    return pathname === '/patterns' && !search && !hash;
  }

  if (item.matchPath.includes('#')) {
    const [, itemHash] = item.matchPath.split('#');
    if (hash) {
      return fullPath === item.matchPath;
    }
    if (activeSectionId) {
      return activeSectionId === itemHash;
    }
    return false;
  }

  if (item.matchPath.includes('?')) {
    return fullPath === item.matchPath;
  }

  return pathname === item.matchPath;
}

export function getSectionProgressPaths(section: SectionKey): string[] {
  switch (section) {
    case 'oop':
      return oopNavItems.map((item) => item.path);
    case 'relationships':
      return relationshipNavItems.map((item) => item.path);
    case 'solid':
      return solidNavItems.map((item) => item.path);
    case 'patterns':
      return Object.values(getPatternNavByCategory())
        .flat()
        .map((item) => item.path);
    default:
      return [];
  }
}

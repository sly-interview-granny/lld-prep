import { oopConcepts } from '../content/oop';
import { relationships } from '../content/relationships';
import { solidPrinciples } from '../content/solid';
import {
  patterns,
  type PatternCategory,
  getPatternsByCategory,
} from '../content/patterns';

export const patternCategories: PatternCategory[] = [
  'Creational',
  'Structural',
  'Behavioural',
];

export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export const oopNavItems = oopConcepts.map((concept) => ({
  label: concept.title,
  path: `/oop#${slugifyTitle(concept.title)}`,
  hash: slugifyTitle(concept.title),
}));

export const relationshipNavItems = relationships.map((rel) => ({
  label: rel.title,
  path: `/relationships#${slugifyTitle(rel.title)}`,
  hash: slugifyTitle(rel.title),
  tag: rel.tag,
}));

export const solidNavItems = solidPrinciples.map((principle) => ({
  label: principle.title,
  path: `/solid#${principle.letter.toLowerCase()}`,
  hash: principle.letter.toLowerCase(),
  letter: principle.letter,
}));

export const patternCategoryNavItems = patternCategories.map((category) => ({
  label: category,
  path: `/patterns?category=${category.toLowerCase()}`,
  category,
  count: getPatternsByCategory(category).length,
}));

export const patternNavItems = patterns.map((pattern) => ({
  label: pattern.name,
  path: `/patterns/${pattern.slug}`,
  slug: pattern.slug,
  category: pattern.category,
}));

export function getPatternNavByCategory(): Record<PatternCategory, typeof patternNavItems> {
  const grouped: Record<PatternCategory, typeof patternNavItems> = {
    Creational: [],
    Structural: [],
    Behavioural: [],
  };
  for (const item of patternNavItems) {
    grouped[item.category].push(item);
  }
  return grouped;
}

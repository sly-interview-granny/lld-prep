export type PatternCategory = 'Creational' | 'Structural' | 'Behavioural';

export interface Pattern {
  slug: string;
  name: string;
  category: PatternCategory;
  intent?: string;
  whenToUse?: string;
  example?: string;
  code?: string;
}

export const patterns: Pattern[] = [
  // Creational (6)
  { slug: 'singleton', name: 'Singleton', category: 'Creational' },
  { slug: 'builder', name: 'Builder', category: 'Creational' },
  { slug: 'factory', name: 'Factory', category: 'Creational' },
  { slug: 'abstract-factory', name: 'Abstract Factory', category: 'Creational' },
  { slug: 'object-pool', name: 'Object Pool', category: 'Creational' },
  { slug: 'prototype', name: 'Prototype', category: 'Creational' },
  // Structural (7)
  { slug: 'decorator', name: 'Decorator', category: 'Structural' },
  { slug: 'proxy', name: 'Proxy', category: 'Structural' },
  { slug: 'composite', name: 'Composite', category: 'Structural' },
  { slug: 'adapter', name: 'Adapter', category: 'Structural' },
  { slug: 'bridge', name: 'Bridge', category: 'Structural' },
  { slug: 'facade', name: 'Facade', category: 'Structural' },
  { slug: 'flyweight', name: 'Flyweight', category: 'Structural' },
  // Behavioural (12)
  { slug: 'state', name: 'State', category: 'Behavioural' },
  { slug: 'strategy', name: 'Strategy', category: 'Behavioural' },
  { slug: 'observer', name: 'Observer', category: 'Behavioural' },
  {
    slug: 'chain-of-responsibility',
    name: 'Chain of Responsibility',
    category: 'Behavioural',
  },
  { slug: 'template', name: 'Template', category: 'Behavioural' },
  { slug: 'iterator', name: 'Iterator', category: 'Behavioural' },
  { slug: 'interpreter', name: 'Interpreter', category: 'Behavioural' },
  { slug: 'command', name: 'Command', category: 'Behavioural' },
  { slug: 'visitor', name: 'Visitor', category: 'Behavioural' },
  { slug: 'mediator', name: 'Mediator', category: 'Behavioural' },
  { slug: 'memento', name: 'Memento', category: 'Behavioural' },
  { slug: 'null-object', name: 'Null Object', category: 'Behavioural' },
];

export function getPatternBySlug(slug: string): Pattern | undefined {
  return patterns.find((p) => p.slug === slug);
}

export function getPatternsByCategory(category: PatternCategory): Pattern[] {
  return patterns.filter((p) => p.category === category);
}

export const patternCategoryCounts: Record<PatternCategory, number> = {
  Creational: patterns.filter((p) => p.category === 'Creational').length,
  Structural: patterns.filter((p) => p.category === 'Structural').length,
  Behavioural: patterns.filter((p) => p.category === 'Behavioural').length,
};

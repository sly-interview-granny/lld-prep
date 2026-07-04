export interface Relationship {
  title: string;
  tag: string;
  description: string;
}

export const relationships: Relationship[] = [
  {
    title: 'Inheritance',
    tag: 'IS-A',
    description:
      'A strict parent-child relationship where a subclass permanently copies the structure and behavior of a superclass.',
  },
  {
    title: 'Association',
    tag: 'USES-A',
    description:
      'A loose relationship where two completely independent objects interact with each other without any ownership.',
  },
  {
    title: 'Aggregation',
    tag: 'HAS-A',
    description:
      'A weak whole-part relationship where a container references external objects that survive even if the container is destroyed.',
  },
  {
    title: 'Composition',
    tag: 'PART-OF',
    description:
      'A strong whole-part relationship where a container exclusively owns its components, meaning they die if the container is destroyed.',
  },
];

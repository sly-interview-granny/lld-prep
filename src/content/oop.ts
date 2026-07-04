export interface Concept {
  title: string;
  description: string;
  tag?: string;
}

export const oopConcepts: Concept[] = [
  {
    title: 'Abstraction',
    description:
      'Hides unnecessary details to reduce complexity.',
  },
  {
    title: 'Polymorphism',
    description:
      'Allows one interface to be used for general activities (flexibility).',
  },
  {
    title: 'Inheritance',
    description:
      'Shares code across related classes (reusability).',
  },
  {
    title: 'Encapsulation',
    description:
      "Restricts direct access to data to protect an object's state",
  },
];

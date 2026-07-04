export interface SolidPrinciple {
  letter: string;
  title: string;
  description: string;
}

export const solidPrinciples: SolidPrinciple[] = [
  {
    letter: 'S',
    title: 'Single Responsibility Principle',
    description: 'A class should have only 1 responsibility.',
  },
  {
    letter: 'O',
    title: 'Open/Close principle',
    description: 'Open for extension but closed for modification.',
  },
  {
    letter: 'L',
    title: 'Liskov Substitution Principle',
    description:
      'Our code should extend the capability of parent class, not narrow it down.',
  },
  {
    letter: 'I',
    title: 'Interface Segregation Principle',
    description:
      'Clients should not be forced to depend on methods they do not use; prefer small, focused interfaces.',
  },
  {
    letter: 'D',
    title: 'Dependency Inversion Principle',
    description:
      'High-level modules should depend on abstractions, not concrete implementations.',
  },
];

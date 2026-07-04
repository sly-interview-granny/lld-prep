import { ConceptCard, ConceptGrid } from '../components/ConceptCard';
import { oopConcepts } from '../content/oop';
import { slugifyTitle } from '../lib/sectionNav';

export function OopPage() {
  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">OOP Concepts</h1>
        <p className="page__subtitle">
          The four pillars of object-oriented programming — definitions, examples,
          and interview talking points.
        </p>
      </header>

      <ConceptGrid>
        {oopConcepts.map((concept) => (
          <ConceptCard
            key={concept.title}
            id={slugifyTitle(concept.title)}
            {...concept}
          />
        ))}
      </ConceptGrid>
    </div>
  );
}

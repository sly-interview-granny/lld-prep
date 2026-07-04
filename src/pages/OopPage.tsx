import { ConceptCard, ConceptGrid } from '../components/ConceptCard';
import { oopConcepts } from '../content/oop';
import { useSectionScrollSpy } from '../hooks/useSectionScrollSpy';
import { slugify } from '../lib/sectionNav';

export function OopPage() {
  const sectionIds = oopConcepts.map((concept) => slugify(concept.title));
  useSectionScrollSpy(sectionIds, '/oop');

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
            id={slugify(concept.title)}
            {...concept}
          />
        ))}
      </ConceptGrid>
    </div>
  );
}

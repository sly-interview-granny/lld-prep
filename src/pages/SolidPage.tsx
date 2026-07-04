import { ConceptCard, ConceptGrid } from '../components/ConceptCard';
import { solidPrinciples } from '../content/solid';
import { useSectionScrollSpy } from '../hooks/useSectionScrollSpy';

export function SolidPage() {
  const sectionIds = solidPrinciples.map(({ letter }) => letter.toLowerCase());
  useSectionScrollSpy(sectionIds, '/solid');

  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">SOLID Principles</h1>
        <p className="page__subtitle">
          Five principles for maintainable, extensible code — with violations,
          fixes, and what to say in interviews.
        </p>
      </header>

      <ConceptGrid>
        {solidPrinciples.map(({ letter, ...principle }) => (
          <ConceptCard
            key={letter}
            id={letter.toLowerCase()}
            badge={letter}
            {...principle}
          />
        ))}
      </ConceptGrid>
    </div>
  );
}

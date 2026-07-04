import { ConceptCard, ConceptGrid } from '../components/ConceptCard';
import { solidPrinciples } from '../content/solid';

export function SolidPage() {
  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">SOLID Principles</h1>
        <p className="page__subtitle">
          Five principles for writing maintainable, extensible code.
        </p>
      </header>

      <ConceptGrid>
        {solidPrinciples.map((principle) => (
          <ConceptCard
            key={principle.letter}
            badge={principle.letter}
            title={principle.title}
            description={principle.description}
          />
        ))}
      </ConceptGrid>
    </div>
  );
}

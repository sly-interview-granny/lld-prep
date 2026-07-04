import { ConceptCard, ConceptGrid } from '../components/ConceptCard';
import { relationships } from '../content/relationships';

export function RelationshipsPage() {
  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">Class Relationships</h1>
        <p className="page__subtitle">
          How objects relate to each other in object-oriented design.
        </p>
      </header>

      <ConceptGrid>
        {relationships.map((rel) => (
          <ConceptCard
            key={rel.title}
            title={rel.title}
            tag={rel.tag}
            description={rel.description}
          />
        ))}
      </ConceptGrid>
    </div>
  );
}

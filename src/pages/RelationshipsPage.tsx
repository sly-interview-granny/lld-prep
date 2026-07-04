import { ConceptCard, ConceptGrid } from '../components/ConceptCard';
import { relationships } from '../content/relationships';
import { useSectionScrollSpy } from '../hooks/useSectionScrollSpy';
import { slugify } from '../lib/sectionNav';

export function RelationshipsPage() {
  const sectionIds = relationships.map((rel) => slugify(rel.title));
  useSectionScrollSpy(sectionIds, '/relationships');

  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">Class Relationships</h1>
        <p className="page__subtitle">
          How objects relate to each other — IS-A, HAS-A, and USES-A with UML
          intuition and interview examples.
        </p>
      </header>

      <ConceptGrid>
        {relationships.map((rel) => (
          <ConceptCard
            key={rel.title}
            id={slugify(rel.title)}
            {...rel}
          />
        ))}
      </ConceptGrid>
    </div>
  );
}

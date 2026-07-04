import { ReactNode } from 'react';

interface ConceptCardProps {
  title: string;
  description: string;
  tag?: string;
  badge?: string;
}

export function ConceptCard({ title, description, tag, badge }: ConceptCardProps) {
  return (
    <article className="concept-card">
      <header className="concept-card__header">
        {badge && <span className="concept-card__badge">{badge}</span>}
        <h2 className="concept-card__title">{title}</h2>
        {tag && <span className="concept-card__tag">{tag}</span>}
      </header>
      <p className="concept-card__description">{description}</p>
    </article>
  );
}

interface ConceptGridProps {
  children: ReactNode;
}

export function ConceptGrid({ children }: ConceptGridProps) {
  return <div className="concept-grid">{children}</div>;
}

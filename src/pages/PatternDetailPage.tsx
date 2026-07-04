import { Link, useParams } from 'react-router-dom';
import { getPatternBySlug } from '../content/patterns';

interface ScaffoldSectionProps {
  title: string;
  content?: string;
}

function ScaffoldSection({ title, content }: ScaffoldSectionProps) {
  return (
    <section className="scaffold-section">
      <h2 className="scaffold-section__title">{title}</h2>
      {content ? (
        <p className="scaffold-section__content">{content}</p>
      ) : (
        <p className="scaffold-section__placeholder">Add notes</p>
      )}
    </section>
  );
}

export function PatternDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const pattern = slug ? getPatternBySlug(slug) : undefined;

  if (!pattern) {
    return (
      <div className="page">
        <header className="page__header">
          <h1 className="page__title">Pattern Not Found</h1>
          <p className="page__subtitle">
            No pattern matches &ldquo;{slug}&rdquo;.
          </p>
        </header>
        <Link to="/patterns" className="back-link">
          ← Back to patterns
        </Link>
      </div>
    );
  }

  return (
    <div className="page">
      <Link to="/patterns" className="back-link">
        ← Back to patterns
      </Link>

      <header className="page__header pattern-detail__header">
        <span
          className={`category-badge category-badge--${pattern.category.toLowerCase()}`}
        >
          {pattern.category}
        </span>
        <h1 className="page__title">{pattern.name}</h1>
      </header>

      <div className="scaffold-sections">
        <ScaffoldSection title="Intent" content={pattern.intent} />
        <ScaffoldSection title="When to use" content={pattern.whenToUse} />
        <ScaffoldSection
          title="Real-world example"
          content={pattern.example}
        />
        <ScaffoldSection title="Code snippet" content={pattern.code} />
      </div>
    </div>
  );
}

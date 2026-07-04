import { Link, useParams } from 'react-router-dom';
import { CodeTabs } from '../components/CodeTabs';
import { getAdjacentPatterns, getPatternBySlug } from '../content/patterns';

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

interface CodeSectionProps {
  python?: string;
  java?: string;
}

function CodeSection({ python, java }: CodeSectionProps) {
  const hasCode = Boolean(python?.trim() || java?.trim());

  return (
    <section className="scaffold-section">
      <h2 className="scaffold-section__title">Code</h2>
      {hasCode ? (
        <CodeTabs python={python} java={java} variant="scaffold" />
      ) : (
        <p className="scaffold-section__placeholder">Add notes</p>
      )}
    </section>
  );
}

interface InterviewTipsSectionProps {
  tips?: string[];
}

function InterviewTipsSection({ tips }: InterviewTipsSectionProps) {
  if (!tips?.length) return null;

  return (
    <section className="scaffold-section">
      <h2 className="scaffold-section__title">Interview tips</h2>
      <ul className="scaffold-section__tips">
        {tips.map((tip) => (
          <li key={tip}>{tip}</li>
        ))}
      </ul>
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

  const { prev, next } = getAdjacentPatterns(pattern.slug);

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
        <CodeSection
          python={pattern.codePython}
          java={pattern.codeJava}
        />
        <InterviewTipsSection tips={pattern.interviewTips} />
      </div>

      {(prev || next) && (
        <nav className="pattern-detail-nav" aria-label="Pattern navigation">
          {prev ? (
            <Link to={`/patterns/${prev.slug}`} className="pattern-detail-nav__link">
              <span className="pattern-detail-nav__label">Previous</span>
              <span className="pattern-detail-nav__name">{prev.name}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              to={`/patterns/${next.slug}`}
              className="pattern-detail-nav__link pattern-detail-nav__link--next"
            >
              <span className="pattern-detail-nav__label">Next</span>
              <span className="pattern-detail-nav__name">{next.name}</span>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}

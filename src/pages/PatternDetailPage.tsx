import { Link, useParams } from 'react-router-dom';
import { CodeTabs } from '../components/CodeTabs';
import { getAdjacentPatterns, getPatternBySlug } from '../content/patterns';

interface TextSectionProps {
  title: string;
  content?: string;
}

function TextSection({ title, content }: TextSectionProps) {
  if (!content?.trim()) return null;

  return (
    <section className="scaffold-section">
      <h2 className="scaffold-section__title">{title}</h2>
      <p className="scaffold-section__content">{content}</p>
    </section>
  );
}

interface ListSectionProps {
  title: string;
  items?: string[];
  variant?: 'default' | 'avoid' | 'mistakes';
}

function ListSection({ title, items, variant = 'default' }: ListSectionProps) {
  if (!items?.length) return null;

  const listClass =
    variant === 'avoid'
      ? 'scaffold-section__tips scaffold-section__tips--avoid'
      : variant === 'mistakes'
        ? 'scaffold-section__tips scaffold-section__tips--mistakes'
        : 'scaffold-section__tips';

  return (
    <section className="scaffold-section">
      <h2 className="scaffold-section__title">{title}</h2>
      <ul className={listClass}>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

interface InsightSectionProps {
  insight?: string;
}

function InsightSection({ insight }: InsightSectionProps) {
  if (!insight?.trim()) return null;

  return (
    <section className="scaffold-section scaffold-section--insight">
      <h2 className="scaffold-section__title">Key insight</h2>
      <p className="scaffold-section__insight">{insight}</p>
    </section>
  );
}

interface CodeSectionProps {
  python?: string;
  java?: string;
}

function CodeSection({ python, java }: CodeSectionProps) {
  const hasCode = Boolean(python?.trim() || java?.trim());
  if (!hasCode) return null;

  return (
    <section className="scaffold-section">
      <h2 className="scaffold-section__title">Code</h2>
      <CodeTabs python={python} java={java} variant="scaffold" />
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
        <TextSection title="Intent" content={pattern.intent} />
        <ListSection title="When to use" items={pattern.whenToUse} />
        <ListSection
          title="When not to use"
          items={pattern.whenToAvoid}
          variant="avoid"
        />
        <TextSection title="Real-world example" content={pattern.example} />
        <InsightSection insight={pattern.keyInsight} />
        <ListSection
          title="Common mistakes"
          items={pattern.commonMistakes}
          variant="mistakes"
        />
        <CodeSection
          python={pattern.codePython}
          java={pattern.codeJava}
        />
        <ListSection title="Interview tips" items={pattern.interviewTips} />
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

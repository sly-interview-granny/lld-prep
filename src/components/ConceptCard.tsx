import { ReactNode } from 'react';
import { CodeTabs } from './CodeTabs';
import { MarkdownContent } from './MarkdownContent';

export interface ConceptCardProps {
  id?: string;
  title: string;
  description: string;
  body?: string;
  definition: string;
  analogy: string;
  whenAsked: string;
  detailedExample?: string;
  codePython: string;
  codeJava: string;
  interviewTips: string[];
  commonMistakes?: string[];
  tag?: string;
  badge?: string;
}

interface ConceptSectionProps {
  title: string;
  children: ReactNode;
}

function ConceptSection({ title, children }: ConceptSectionProps) {
  return (
    <section className="concept-card__section">
      <h3 className="concept-card__section-title">{title}</h3>
      <div className="concept-card__section-body">{children}</div>
    </section>
  );
}

function SupplementList({
  title,
  items,
  variant = 'default',
}: {
  title: string;
  items: string[];
  variant?: 'default' | 'mistakes';
}) {
  const listClass =
    variant === 'mistakes'
      ? 'concept-card__tips concept-card__tips--mistakes'
      : 'concept-card__tips';

  return (
    <ConceptSection title={title}>
      <ul className={listClass}>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </ConceptSection>
  );
}

export function ConceptCard({
  id,
  title,
  description,
  body,
  definition,
  analogy,
  whenAsked,
  detailedExample,
  codePython,
  codeJava,
  interviewTips,
  commonMistakes,
  tag,
  badge,
}: ConceptCardProps) {
  const hasRichBody = Boolean(body?.trim());

  return (
    <article className="concept-card" id={id}>
      <header className="concept-card__header">
        {badge && <span className="concept-card__badge">{badge}</span>}
        <h2 className="concept-card__title">{title}</h2>
        {tag && <span className="concept-card__tag">{tag}</span>}
      </header>
      <p className="concept-card__description">{description}</p>

      {hasRichBody ? (
        <>
          <div className="concept-card__body">
            <MarkdownContent content={body!} />
          </div>
          <div className="concept-card__sections concept-card__sections--supplement">
            <SupplementList title="Interview tips" items={interviewTips} />
            {commonMistakes && commonMistakes.length > 0 && (
              <SupplementList
                title="Common mistakes"
                items={commonMistakes}
                variant="mistakes"
              />
            )}
          </div>
        </>
      ) : (
        <div className="concept-card__sections">
          <ConceptSection title="Definition">
            <p className="concept-card__text">{definition}</p>
          </ConceptSection>

          <ConceptSection title="Real-world analogy">
            <p className="concept-card__text">{analogy}</p>
          </ConceptSection>

          {detailedExample && (
            <ConceptSection title="Software example">
              <p className="concept-card__text">{detailedExample}</p>
            </ConceptSection>
          )}

          <ConceptSection title="When interviewers ask">
            <p className="concept-card__text">{whenAsked}</p>
          </ConceptSection>

          <ConceptSection title="Code">
            <CodeTabs python={codePython} java={codeJava} />
          </ConceptSection>

          <SupplementList title="Interview tips" items={interviewTips} />
          {commonMistakes && commonMistakes.length > 0 && (
            <SupplementList
              title="Common mistakes"
              items={commonMistakes}
              variant="mistakes"
            />
          )}
        </div>
      )}
    </article>
  );
}

interface ConceptGridProps {
  children: ReactNode;
}

export function ConceptGrid({ children }: ConceptGridProps) {
  return <div className="concept-grid">{children}</div>;
}

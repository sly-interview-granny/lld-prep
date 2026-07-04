import { CodeTabs } from './CodeTabs';
import { ReactNode } from 'react';

export interface ConceptCardProps {
  id?: string;
  title: string;
  description: string;
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

export function ConceptCard({
  id,
  title,
  description,
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
  return (
    <article className="concept-card" id={id}>
      <header className="concept-card__header">
        {badge && <span className="concept-card__badge">{badge}</span>}
        <h2 className="concept-card__title">{title}</h2>
        {tag && <span className="concept-card__tag">{tag}</span>}
      </header>
      <p className="concept-card__description">{description}</p>

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

        <ConceptSection title="Interview tips">
          <ul className="concept-card__tips">
            {interviewTips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </ConceptSection>

        {commonMistakes && commonMistakes.length > 0 && (
          <ConceptSection title="Common mistakes">
            <ul className="concept-card__tips concept-card__tips--mistakes">
              {commonMistakes.map((mistake) => (
                <li key={mistake}>{mistake}</li>
              ))}
            </ul>
          </ConceptSection>
        )}
      </div>
    </article>
  );
}

interface ConceptGridProps {
  children: ReactNode;
}

export function ConceptGrid({ children }: ConceptGridProps) {
  return <div className="concept-grid">{children}</div>;
}

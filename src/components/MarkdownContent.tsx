import { Fragment, type ReactNode } from 'react';
import { CodeTabs } from './CodeTabs';

type Segment =
  | { type: 'h3'; text: string }
  | { type: 'h4'; text: string; step?: string }
  | { type: 'hr' }
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'code-tabs'; java: string; python: string; antiPattern?: boolean }
  | { type: 'code'; lang?: string; code: string };

function parseCodeTabs(raw: string): { python: string; java: string } {
  const pythonMatch = raw.match(/@python\s*\n([\s\S]*?)(?=@java\s*\n|$)/);
  const javaMatch = raw.match(/@java\s*\n([\s\S]*?)$/);

  return {
    python: pythonMatch?.[1]?.trimEnd() ?? '',
    java: javaMatch?.[1]?.trimEnd() ?? '',
  };
}

function isAntiPatternCode(code: string): boolean {
  const firstLine = code.split('\n')[0]?.toLowerCase() ?? '';
  return firstLine.includes('anti-pattern');
}

function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} className="pattern-body__inline-code">
          {part.slice(1, -1)}
        </code>
      );
    }
    return <Fragment key={index}>{part}</Fragment>;
  });
}

function parseMarkdown(markdown: string): Segment[] {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const segments: Segment[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    if (trimmed === '---') {
      segments.push({ type: 'hr' });
      index += 1;
      continue;
    }

    if (line.startsWith('### ')) {
      segments.push({ type: 'h3', text: line.slice(4).trim() });
      index += 1;
      continue;
    }

    if (line.startsWith('#### ')) {
      const heading = line.slice(5).trim();
      const stepMatch = heading.match(/^Step (\d+):\s*(.*)$/);
      segments.push(
        stepMatch
          ? { type: 'h4', step: stepMatch[1], text: stepMatch[2] }
          : { type: 'h4', text: heading },
      );
      index += 1;
      continue;
    }

    if (line.startsWith('```')) {
      const lang = line.slice(3).trim() || undefined;
      const codeLines: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].startsWith('```')) {
        codeLines.push(lines[index]);
        index += 1;
      }
      index += 1;

      const code = codeLines.join('\n').trimEnd();

      if (lang === 'codetabs' || lang === 'anti-pattern-codetabs') {
        const tabs = parseCodeTabs(code);
        segments.push({
          type: 'code-tabs',
          java: tabs.java,
          python: tabs.python,
          antiPattern: lang === 'anti-pattern-codetabs',
        });
        continue;
      }

      if (index < lines.length && lines[index].startsWith('```')) {
        const nextLang = lines[index].slice(3).trim();
        const isPair =
          (lang === 'java' && nextLang === 'python') ||
          (lang === 'python' && nextLang === 'java');

        if (isPair) {
          const nextCodeLines: string[] = [];
          index += 1;
          while (index < lines.length && !lines[index].startsWith('```')) {
            nextCodeLines.push(lines[index]);
            index += 1;
          }
          index += 1;
          const nextCode = nextCodeLines.join('\n').trimEnd();
          const java = lang === 'java' ? code : nextCode;
          const python = lang === 'java' ? nextCode : code;
          segments.push({
            type: 'code-tabs',
            java,
            python,
            antiPattern: isAntiPatternCode(java) || isAntiPatternCode(python),
          });
          continue;
        }
      }

      segments.push({ type: 'code', lang, code });
      continue;
    }

    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      const items: string[] = [];
      while (index < lines.length) {
        const current = lines[index].trim();
        if (current.startsWith('* ') || current.startsWith('- ')) {
          items.push(current.slice(2).trim());
          index += 1;
          continue;
        }
        break;
      }
      segments.push({ type: 'ul', items });
      continue;
    }

    const paragraphLines: string[] = [line.trim()];
    index += 1;
    while (index < lines.length) {
      const next = lines[index].trim();
      if (
        !next ||
        next === '---' ||
        next.startsWith('### ') ||
        next.startsWith('#### ') ||
        next.startsWith('```') ||
        next.startsWith('* ') ||
        next.startsWith('- ')
      ) {
        break;
      }
      paragraphLines.push(next);
      index += 1;
    }
    segments.push({ type: 'p', text: paragraphLines.join(' ') });
  }

  return segments;
}

function CodeTabsBlock({
  java,
  python,
  antiPattern,
}: {
  java: string;
  python: string;
  antiPattern?: boolean;
}) {
  return (
    <div
      className={`pattern-body__code${antiPattern ? ' pattern-body__code--anti-pattern' : ''}`}
    >
      {antiPattern && (
        <div className="pattern-body__anti-pattern-label">Anti-pattern</div>
      )}
      <CodeTabs java={java} python={python} variant="scaffold" />
    </div>
  );
}

export interface MarkdownContentProps {
  content: string;
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  const segments = parseMarkdown(content);

  return (
    <article className="pattern-body">
      {segments.map((segment, index) => {
        switch (segment.type) {
          case 'h3':
            return (
              <h3 key={index} className="pattern-body__heading">
                {renderInline(segment.text)}
              </h3>
            );
          case 'h4':
            return (
              <h4 key={index} className="pattern-body__subheading">
                {segment.step ? (
                  <>
                    <span className="pattern-body__step-badge">Step {segment.step}</span>
                    <span>{renderInline(segment.text)}</span>
                  </>
                ) : (
                  renderInline(segment.text)
                )}
              </h4>
            );
          case 'hr':
            return <hr key={index} className="pattern-body__divider" />;
          case 'p':
            return (
              <p key={index} className="pattern-body__paragraph">
                {renderInline(segment.text)}
              </p>
            );
          case 'ul':
            return (
              <ul key={index} className="pattern-body__list">
                {segment.items.map((item) => (
                  <li key={item}>{renderInline(item)}</li>
                ))}
              </ul>
            );
          case 'code-tabs':
            return (
              <CodeTabsBlock
                key={index}
                java={segment.java}
                python={segment.python}
                antiPattern={segment.antiPattern}
              />
            );
          case 'code':
            return (
              <pre key={index} className="scaffold-section__code pattern-body__code">
                <code>{segment.code}</code>
              </pre>
            );
          default:
            return null;
        }
      })}
    </article>
  );
}

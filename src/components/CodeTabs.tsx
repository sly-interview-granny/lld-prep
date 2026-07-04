import { useId, useState } from 'react';

type CodeTab = 'python' | 'java';

export interface CodeTabsProps {
  python?: string;
  java?: string;
  variant?: 'card' | 'scaffold';
}

export function CodeTabs({
  python,
  java,
  variant = 'card',
}: CodeTabsProps) {
  const baseId = useId();
  const hasPython = Boolean(python?.trim());
  const hasJava = Boolean(java?.trim());

  const [activeTab, setActiveTab] = useState<CodeTab>('python');

  if (!hasPython && !hasJava) {
    return null;
  }

  const codeClass =
    variant === 'card' ? 'concept-card__code' : 'scaffold-section__code';

  if (!hasPython || !hasJava) {
    const singleCode = hasPython ? python : java;
    return (
      <pre className={codeClass}>
        <code>{singleCode}</code>
      </pre>
    );
  }

  const pythonTabId = `${baseId}-python-tab`;
  const javaTabId = `${baseId}-java-tab`;
  const panelId = `${baseId}-panel`;
  const activeTabId = activeTab === 'python' ? pythonTabId : javaTabId;
  const activeCode = activeTab === 'python' ? python : java;

  return (
    <div className="code-tabs">
      <div
        role="tablist"
        aria-label="Code language"
        className="code-tabs__list"
      >
        <button
          type="button"
          role="tab"
          id={pythonTabId}
          className={`code-tabs__tab${activeTab === 'python' ? ' code-tabs__tab--active' : ''}`}
          aria-selected={activeTab === 'python'}
          aria-controls={panelId}
          tabIndex={activeTab === 'python' ? 0 : -1}
          onClick={() => setActiveTab('python')}
        >
          Python
        </button>
        <button
          type="button"
          role="tab"
          id={javaTabId}
          className={`code-tabs__tab${activeTab === 'java' ? ' code-tabs__tab--active' : ''}`}
          aria-selected={activeTab === 'java'}
          aria-controls={panelId}
          tabIndex={activeTab === 'java' ? 0 : -1}
          onClick={() => setActiveTab('java')}
        >
          Java
        </button>
      </div>
      <div
        role="tabpanel"
        id={panelId}
        aria-labelledby={activeTabId}
        className="code-tabs__panel"
      >
        <pre className={codeClass}>
          <code>{activeCode}</code>
        </pre>
      </div>
    </div>
  );
}

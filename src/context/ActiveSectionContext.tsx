import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react';

interface ActiveSectionContextValue {
  activeSectionId: string | null;
  setActiveSectionId: (id: string | null) => void;
}

const ActiveSectionContext = createContext<ActiveSectionContextValue | null>(
  null,
);

export function ActiveSectionProvider({ children }: { children: ReactNode }) {
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  return (
    <ActiveSectionContext.Provider
      value={{ activeSectionId, setActiveSectionId }}
    >
      {children}
    </ActiveSectionContext.Provider>
  );
}

export function useActiveSection() {
  return useContext(ActiveSectionContext);
}

import { useEffect } from 'react';
import { useActiveSection } from '../context/ActiveSectionContext';

/** Tracks which anchor section is in view for sidebar highlighting. */
export function useSectionScrollSpy(
  sectionIds: string[],
  _basePath: string,
) {
  const activeSection = useActiveSection();
  const setActiveSectionId = activeSection?.setActiveSectionId;

  useEffect(() => {
    if (!setActiveSectionId) return;

    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top - b.boundingClientRect.top,
          );

        if (visible.length === 0) return;

        setActiveSectionId(visible[0].target.id);
      },
      { rootMargin: '-15% 0px -55% 0px', threshold: 0 },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [sectionIds, setActiveSectionId]);

  useEffect(() => {
    return () => setActiveSectionId?.(null);
  }, [setActiveSectionId]);
}

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useActiveSection } from '../context/ActiveSectionContext';

function scrollToSectionId(id: string) {
  const element = document.getElementById(id);
  if (!element) return false;

  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return true;
}

/** Tracks which anchor section is in view and scrolls to hash targets. */
export function useSectionScrollSpy(
  sectionIds: string[],
  basePath: string,
) {
  const location = useLocation();
  const activeSection = useActiveSection();
  const setActiveSectionId = activeSection?.setActiveSectionId;

  useEffect(() => {
    if (!location.hash || location.pathname !== basePath) return;

    const id = decodeURIComponent(location.hash.slice(1));
    if (!sectionIds.includes(id)) return;

    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (scrollToSectionId(id)) {
          setActiveSectionId?.(id);
        }
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [location.hash, location.pathname, basePath, sectionIds, setActiveSectionId]);

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

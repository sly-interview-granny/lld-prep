import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Reset scroll when route changes, but not for hash-only navigation on the same page. */
export function ScrollToTop() {
  const location = useLocation();
  const scrollKey = `${location.pathname}${location.search}`;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [scrollKey]);

  return null;
}

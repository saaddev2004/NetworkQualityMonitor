import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * Guarantees that every page navigation (via sidebar, dashboard cards,
 * back/forward buttons, or deep links) resets the scroll position to the top.
 * Resets both standard window/document scrolling and any nested workspace containers.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // 1. Reset window and document root scroll
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }

    // 2. Reset nested application content container
    const content = document.querySelector('.app-content');
    if (content) {
      content.scrollTop = 0;
    }

    const container = document.querySelector('.app-container');
    if (container) {
      container.scrollTop = 0;
    }
  }, [pathname]);

  return null;
}

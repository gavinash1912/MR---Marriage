import { useEffect } from 'react';

export function useScrollReveal() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const revealItems = new WeakSet();

    if (prefersReducedMotion || !window.IntersectionObserver) {
      document.querySelectorAll('[data-reveal]').forEach(item => item.classList.add('is-revealed'));

      const mutationObserver = new MutationObserver(() => {
        document.querySelectorAll('[data-reveal]').forEach(item => item.classList.add('is-revealed'));
      });

      mutationObserver.observe(document.body, { childList: true, subtree: true });
      return () => mutationObserver.disconnect();
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      });
    }, {
      rootMargin: '0px 0px -12% 0px',
      threshold: 0.16,
    });

    const observeRevealItems = () => {
      document.querySelectorAll('[data-reveal]').forEach((item) => {
        if (revealItems.has(item)) return;

        revealItems.add(item);
        observer.observe(item);
      });
    };

    observeRevealItems();

    const mutationObserver = new MutationObserver(observeRevealItems);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutationObserver.disconnect();
      observer.disconnect();
    };
  }, []);
}

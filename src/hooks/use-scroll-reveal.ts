'use client';

import { useEffect, useRef } from 'react';

export function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reveal = () => {
      // Reveal the section itself
      el.classList.add('revealed');

      // Reveal stagger children if present
      const staggerItems = el.querySelectorAll('.stagger-item');
      staggerItems.forEach((item) => {
        item.classList.add('revealed');
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            reveal();
            // Don't unobserve — keep watching for dynamically added children
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    observer.observe(el);

    // Also use MutationObserver to catch dynamically added .stagger-item elements
    const mutationObserver = new MutationObserver(() => {
      // If section is already revealed, reveal any new stagger items
      if (el.classList.contains('revealed')) {
        const staggerItems = el.querySelectorAll('.stagger-item:not(.revealed)');
        staggerItems.forEach((item) => {
          item.classList.add('revealed');
        });
      }
    });

    mutationObserver.observe(el, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return ref;
}

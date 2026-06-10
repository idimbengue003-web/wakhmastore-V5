'use client';

import { useEffect, useRef } from 'react';

export function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Reveal the section itself
            entry.target.classList.add('revealed');

            // Reveal stagger children if present
            const staggerItems = entry.target.querySelectorAll('.stagger-item');
            staggerItems.forEach((item) => {
              item.classList.add('revealed');
            });

            // Once revealed, stop observing
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return ref;
}

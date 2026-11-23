'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const [navProgress, setNavProgress] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  // When pathname or searchParams change, the navigation has completed
  useEffect(() => {
    if (isNavigating) {
      setNavProgress(100);
      const timer = setTimeout(() => {
        setIsNavigating(false);
        setNavProgress(0);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  // Intercept internal link clicks to give instant, 0ms visual feedback
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      const isTargetBlank = target.getAttribute('target') === '_blank';

      // Only trigger for internal application links
      if (
        href &&
        href.startsWith('/') &&
        !href.startsWith('//') &&
        !isTargetBlank &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey &&
        !e.altKey
      ) {
        // If clicking the current path, no navigation needed
        const currentFull = window.location.pathname + window.location.search;
        if (href === currentFull) return;

        setIsNavigating(true);
        setNavProgress(25);
        const timer1 = setTimeout(() => setNavProgress(65), 150);
        const timer2 = setTimeout(() => setNavProgress(85), 400);

        return () => {
          clearTimeout(timer1);
          clearTimeout(timer2);
        };
      }
    };

    document.addEventListener('click', handleDocumentClick, { capture: true });
    return () => {
      document.removeEventListener('click', handleDocumentClick, { capture: true });
    };
  }, []);

  // Track window scroll progress in real time across the page
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        const pct = Math.min(100, Math.max(0, (scrollY / scrollHeight) * 100));
        setScrollProgress(pct);
      } else {
        setScrollProgress(0);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [pathname]);

  const activeProgress = isNavigating ? navProgress : scrollProgress;
  const isVisible = isNavigating || scrollProgress > 0;

  if (!isVisible) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-[2.5px] z-[99999] pointer-events-none overflow-hidden bg-transparent"
    >
      <div
        className="h-full bg-gradient-to-r from-oxblood via-gold to-oxblood transition-all duration-150 ease-out shadow-[0_0_8px_rgba(84,18,27,0.6)]"
        style={{
          width: `${activeProgress}%`,
          opacity: isNavigating && navProgress === 100 ? 0 : 1,
          transition: isNavigating
            ? navProgress === 100
              ? 'width 200ms ease-out, opacity 300ms ease-in'
              : 'width 300ms cubic-bezier(0.4, 0, 0.2, 1)'
            : 'width 100ms ease-out',
        }}
      />
    </div>
  );
}

'use client';

import React, { useEffect, useRef, useState } from 'react';

export type ScrollAnimation = 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'fade';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  animation?: ScrollAnimation;
  delay?: number;       // in milliseconds
  duration?: number;    // in milliseconds (default: 750ms)
  threshold?: number;  // 0 to 1 (default: 0.12)
  once?: boolean;       // default: true
  as?: React.ElementType;
}

export function ScrollReveal({
  children,
  className = '',
  animation = 'slide-up',
  delay = 0,
  duration = 750,
  threshold = 0.12,
  once = true,
  as: Component = 'div',
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // If IntersectionObserver is unavailable, display immediately
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const currentElement = elementRef.current;
    if (!currentElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (once) {
              observer.unobserve(entry.target);
            }
          } else if (!once) {
            setIsVisible(false);
          }
        });
      },
      {
        threshold,
        rootMargin: '0px 0px -40px 0px', // triggers slightly before scrolling fully into view
      }
    );

    observer.observe(currentElement);

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [threshold, once]);

  const animationClass = {
    'slide-up': 'reveal-slide-up',
    'slide-down': 'reveal-slide-down',
    'slide-left': 'reveal-slide-left',
    'slide-right': 'reveal-slide-right',
    'fade': 'reveal-fade',
  }[animation];

  return (
    <Component
      ref={elementRef}
      className={`reveal-init ${animationClass} ${isVisible ? 'reveal-visible' : ''} ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </Component>
  );
}

/**
 * Convenience wrapper to stagger reveal animation across multiple children.
 */
interface StaggerProps {
  children: React.ReactNode[];
  className?: string;
  staggerDelay?: number; // ms between each item (default 60ms)
  baseDelay?: number;    // starting delay (default 0ms)
  animation?: ScrollAnimation;
  duration?: number;
}

export function ScrollRevealStagger({
  children,
  className = '',
  staggerDelay = 70,
  baseDelay = 0,
  animation = 'slide-up',
  duration = 750,
}: StaggerProps) {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <ScrollReveal
          key={index}
          animation={animation}
          delay={baseDelay + index * staggerDelay}
          duration={duration}
        >
          {child}
        </ScrollReveal>
      ))}
    </div>
  );
}

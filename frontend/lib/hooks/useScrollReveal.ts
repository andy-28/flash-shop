"use client";

import { useEffect, useRef, useState } from "react";

interface UseScrollRevealOptions {
  threshold?: number;
  triggerOnce?: boolean;
}

export function useScrollReveal(options?: UseScrollRevealOptions) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (options?.triggerOnce !== false) {
            observer.unobserve(element);
          }
        } else if (options?.triggerOnce === false) {
          setIsVisible(false);
        }
      },
      { threshold: options?.threshold ?? 0.1 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [options?.threshold, options?.triggerOnce]);

  return { ref, isVisible };
}

"use client";

import { useEffect, useState, RefObject } from "react";

export interface UseReplayOnScrollOptions {
  rootMargin?: string;
}

/**
 * Reusable hook that tracks when a section enters or completely leaves the viewport.
 * - Single IntersectionObserver with thresholds [0, 0.05, 0.2] that remains active until unmount.
 * - play = true when entered: intersectionRatio >= 0.2 OR intersectionRect.height >= 0.2 * window.innerHeight.
 * - play = false only when completely out of the viewport (entry.isIntersecting === false).
 * - Immediately returns true and never resets if prefers-reduced-motion is active.
 */
export function useReplayOnScroll(
  ref: RefObject<HTMLElement | null>,
  options?: UseReplayOnScrollOptions
): boolean {
  const [play, setPlay] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      setPlay(true);
      return;
    }

    const handleMotionChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setPlay(true);
      }
    };
    mediaQuery.addEventListener("change", handleMotionChange);

    const el = ref.current;
    if (!el) {
      return () => {
        mediaQuery.removeEventListener("change", handleMotionChange);
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;

        // Check reduced motion preference dynamically
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          setPlay(true);
          return;
        }

        // Set play = false only when completely out of the viewport
        if (!entry.isIntersecting) {
          setPlay(false);
          return;
        }

        // Set play = true when the section enters the viewport:
        // Responsive for both mobile and desktop (works on tall sections with low intersection ratios)
        const isEntered =
          entry.isIntersecting &&
          (entry.intersectionRatio >= 0.05 ||
            entry.intersectionRect.height >= 24 ||
            entry.boundingClientRect.top < window.innerHeight * 0.95);

        if (isEntered) {
          setPlay(true);
        }
      },
      {
        threshold: [0, 0.05, 0.1, 0.2],
        rootMargin: options?.rootMargin || "0px 0px -4% 0px",
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener("change", handleMotionChange);
    };
  }, [ref, options?.rootMargin]);

  return play;
}

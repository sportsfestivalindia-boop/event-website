"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * ScrollTopOnLoad ensures the page always begins at the top on every load or reload:
 * - sets history.scrollRestoration = "manual"
 * - scrolls to (0, 0)
 * - removes any initial URL #hash (initial load only) so later clicks on navbar anchor links function normally
 * - resets scroll to (0, 0) on bfcache restoration ("pageshow" with event.persisted === true)
 */
export function ScrollTopOnLoad() {
  const initialRef = useRef(true);

  useIsomorphicLayoutEffect(() => {
    if (typeof window === "undefined") return;

    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);

    // Initial load only: remove any #hash from URL to prevent browser anchor jumps
    if (initialRef.current) {
      initialRef.current = false;
      if (window.location.hash) {
        history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    }
  }, []);

  useEffect(() => {
    // Handle back/forward cache (bfcache) navigation
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        if ("scrollRestoration" in history) {
          history.scrollRestoration = "manual";
        }
        window.scrollTo(0, 0);
      }
    };

    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  return null;
}

export default ScrollTopOnLoad;

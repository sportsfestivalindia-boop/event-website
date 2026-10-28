"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const VIDEO_URL = "https://res.cloudinary.com/jxvpizz0/video/upload/f_auto,q_auto/v1793168532/BULL_LOADING.mp4";
const VIDEO_FALLBACK_URL = "https://res.cloudinary.com/jxvpizz0/video/upload/v1793168532/BULL_LOADING.mp4";

if (typeof window !== "undefined") {
  (window as any).__hasBullIntro = true;
}

export function BullIntro() {
  const [isMounted, setIsMounted] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const touchStartY = useRef<number | null>(null);
  const exitTriggered = useRef(false);

  const handleDismiss = useCallback(() => {
    if (exitTriggered.current) return;
    exitTriggered.current = true;
    (window as any).__introDismissed = true;

    // Immediately BEFORE dispatching "intro-dismissed" call window.scrollTo(0, 0), then unlock the scroll
    window.scrollTo(0, 0);
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";

    // Notify Hero video so it starts playback from 0:00 as intro leaves
    window.dispatchEvent(new CustomEvent("intro-dismissed"));

    if (reducedMotion) {
      setIsMounted(false);
      return;
    }

    setIsExiting(true);
    // Guarantee cleanup even if onTransitionEnd does not fire
    setTimeout(() => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      setIsMounted(false);
    }, 850);
  }, [reducedMotion]);

  // Video play helper ensuring muted properties are set at the DOM level
  const startVideoPlayback = useCallback((video: HTMLVideoElement) => {
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.currentTime = 0;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn("Bull intro play prevented, retrying on user touch:", err);
      });
    }
  }, []);

  // Callback ref so we play immediately when the element attaches to the DOM
  const setVideoRef = useCallback(
    (el: HTMLVideoElement | null) => {
      videoRef.current = el;
      if (el) {
        startVideoPlayback(el);
      }
    },
    [startVideoPlayback]
  );

  useEffect(() => {
    setIsMounted(true);
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches) {
      setReducedMotion(true);
    }

    // If ref already exists, trigger playback
    if (videoRef.current) {
      startVideoPlayback(videoRef.current);
    }

    // Safety fallback: dismiss after 10s so user is never trapped if video cannot finish
    const safetyTimer = setTimeout(() => {
      handleDismiss();
    }, 10000);

    return () => {
      clearTimeout(safetyTimer);
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [handleDismiss, startVideoPlayback]);

  // Keyboard skip listener
  useEffect(() => {
    if (!isMounted || isExiting) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "PageDown", "Enter", "Escape", " "].includes(e.key)) {
        e.preventDefault();
        handleDismiss();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMounted, isExiting, handleDismiss]);

  // Touch swipe-up handling (deliberate swipe > 70px)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;
    if (diff > 70) {
      handleDismiss();
    }
    touchStartY.current = null;
  };

  // Mouse wheel / trackpad scrolling handling (deliberate scroll > 80px)
  const handleWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaY) > 80 || Math.abs(e.deltaX) > 80) {
      handleDismiss();
    }
  };

  if (!isMounted) return null;

  return (
    <div
      id="bull-intro"
      role="dialog"
      aria-label="Sports Festival India Intro"
      aria-modal="true"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
      onTransitionEnd={(e) => {
        if (e.target === e.currentTarget) {
          document.documentElement.style.overflow = "";
          document.body.style.overflow = "";
          setIsMounted(false);
        }
      }}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100svh",
        zIndex: 99999,
        backgroundColor: "#000000",
        overflow: "hidden",
        userSelect: "none",
        cursor: "default",
        transform: isExiting ? "translateY(-100%)" : "translateY(0)",
        transition: reducedMotion
          ? "opacity 300ms ease"
          : "transform 800ms cubic-bezier(0.16, 1, 0.3, 1)",
        opacity: reducedMotion && isExiting ? 0 : 1,
      }}
    >
      <video
        ref={setVideoRef}
        src={VIDEO_URL}
        playsInline
        muted
        autoPlay
        preload="auto"
        onCanPlay={(e) => {
          const v = e.currentTarget;
          v.muted = true;
          v.defaultMuted = true;
          if (v.paused) {
            v.play().catch(() => {});
          }
        }}
        onEnded={handleDismiss}
        onError={(e) => {
          console.warn("Video primary URL error, trying fallback:", e);
          const v = e.currentTarget;
          if (v.src !== VIDEO_FALLBACK_URL) {
            v.src = VIDEO_FALLBACK_URL;
            v.play().catch(() => {});
          } else {
            setTimeout(handleDismiss, 1000);
          }
        }}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
          backgroundColor: "#000000",
          pointerEvents: "none",
          display: "block",
        }}
      />

      {/* Sleek Skip Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleDismiss();
        }}
        className="absolute top-5 right-5 sm:top-8 sm:right-8 z-20 flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/20 bg-black/60 backdrop-blur-md text-white/90 hover:text-yellow hover:border-yellow/50 transition-all duration-200 text-xs font-bold uppercase tracking-wider cursor-pointer"
        aria-label="Skip Intro"
      >
        <span>Skip</span>
        <span aria-hidden="true">›</span>
      </button>
    </div>
  );
}

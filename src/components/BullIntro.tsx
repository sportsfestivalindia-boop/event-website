"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const SHOW_EVERY_LOAD = true;

const VIDEO_URL = "https://res.cloudinary.com/jxvpizz0/video/upload/f_auto,q_auto/v1793168532/BULL_LOADING.mp4";
const VIDEO_FALLBACK_URL = "https://res.cloudinary.com/jxvpizz0/video/upload/v1793168532/BULL_LOADING.mp4";

if (typeof window !== "undefined") {
  (window as any).__hasBullIntro = true;
}

export function BullIntro() {
  const [isMounted, setIsMounted] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const exitTriggered = useRef(false);

  const handleDismiss = useCallback(() => {
    if (exitTriggered.current) return;
    exitTriggered.current = true;
    (window as any).__introDismissed = true;

    try {
      sessionStorage.setItem("introSeen", "true");
    } catch {}

    // Immediately BEFORE dispatching "intro-dismissed" call window.scrollTo(0, 0), then unlock the scroll
    window.scrollTo(0, 0);
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";

    // Dispatch event contract exactly once
    window.dispatchEvent(new CustomEvent("intro-dismissed"));

    setIsExiting(true);
    // 0.3s fade-out before unmounting
    setTimeout(() => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      setIsMounted(false);
    }, 300);
  }, []);

  // Video play helper ensuring muted properties are set at DOM level
  const startVideoPlayback = useCallback((video: HTMLVideoElement) => {
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.currentTime = 0;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn("Bull intro play prevented:", err);
      });
    }
  }, []);

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
    // If SHOW_EVERY_LOAD is false, show once per session using sessionStorage
    if (!SHOW_EVERY_LOAD) {
      try {
        if (sessionStorage.getItem("introSeen") === "true") {
          (window as any).__introDismissed = true;
          window.scrollTo(0, 0);
          document.documentElement.style.overflow = "";
          document.body.style.overflow = "";
          window.dispatchEvent(new CustomEvent("intro-dismissed"));
          return;
        }
      } catch {}
    }

    // prefers-reduced-motion: do NOT show the popup at all; dispatch "intro-dismissed" right after mount
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches) {
      (window as any).__introDismissed = true;
      window.scrollTo(0, 0);
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      window.dispatchEvent(new CustomEvent("intro-dismissed"));
      return;
    }

    setIsMounted(true);
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    // Trigger enter animation on next frame
    const raf = requestAnimationFrame(() => {
      setHasEntered(true);
    });

    if (videoRef.current) {
      startVideoPlayback(videoRef.current);
    }

    // Safety fallback: dismiss after 8s so user is never trapped
    const safetyTimer = setTimeout(() => {
      handleDismiss();
    }, 8000);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(safetyTimer);
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [handleDismiss, startVideoPlayback]);

  // Keyboard listener: close on Escape, Enter, Space
  useEffect(() => {
    if (!isMounted || isExiting) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleDismiss();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMounted, isExiting, handleDismiss]);

  if (!isMounted) return null;

  return (
    <div
      id="bull-intro"
      role="dialog"
      aria-label="Sports Festival India Intro"
      aria-modal="true"
      onClick={(e) => {
        // Close on backdrop click (clicking outside dialog card)
        if (e.target === e.currentTarget) {
          handleDismiss();
        }
      }}
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm select-none cursor-default transition-opacity duration-300"
      style={{
        opacity: isExiting ? 0 : 1,
      }}
    >
      {/* Centered Dialog Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-[min(92vw,420px)] sm:w-[min(92vw,640px)] aspect-video rounded-3xl overflow-hidden bg-black border border-white/12 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_50px_rgba(255,106,0,0.18)]"
        style={{
          transform: isExiting
            ? "scale(0.98)"
            : hasEntered
            ? "scale(1)"
            : "scale(0.96)",
          opacity: isExiting ? 0 : hasEntered ? 1 : 0,
          transition: isExiting
            ? "transform 300ms cubic-bezier(0.16, 1, 0.3, 1), opacity 300ms ease"
            : "transform 350ms cubic-bezier(0.16, 1, 0.3, 1), opacity 350ms ease",
        }}
      >
        {/* Intro Video - Original Aspect Ratio */}
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
          className="size-full object-cover object-center bg-black block pointer-events-none"
        />

        {/* SKIP Button inside card at top right (min tap size 44px) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[44px] min-w-[44px] rounded-full border border-white/20 bg-black/60 backdrop-blur-md text-white/90 hover:text-yellow hover:border-yellow/50 transition-all duration-200 text-xs font-bold uppercase tracking-wider cursor-pointer active:scale-95 shadow-md"
          aria-label="Skip Intro"
        >
          <span>Skip</span>
          <span aria-hidden="true">›</span>
        </button>

        {/* 2px Gradient Progress Line along bottom edge */}
        <div
          aria-hidden="true"
          className="absolute bottom-0 inset-x-0 h-[2px] pointer-events-none z-20 origin-left"
          style={{
            background: "linear-gradient(135deg, #FFE600, #FF9A00, #FF6A00)",
            animation: "bull-progress 5.2s linear forwards",
          }}
        />

        <style>{`
          @keyframes bull-progress {
            0% { transform: scaleX(0); }
            100% { transform: scaleX(1); }
          }
        `}</style>
      </div>
    </div>
  );
}


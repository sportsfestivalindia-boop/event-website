"use client";

import { useEffect, useRef, useState } from "react";

export function HeroVideo({ active }: { active?: boolean }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // React muted bug fix
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    // Controlled by active prop if supplied
    if (active !== undefined) {
      if (active) {
        video.currentTime = 0;
        video
          .play()
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.error("Hero video play failed:", err);
            setIsPlaying(true);
          });
      } else {
        video.pause();
        setIsPlaying(false);
      }
      return;
    }

    const startPlayback = () => {
      video.currentTime = 0;
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.error("Hero video play failed:", err);
          setIsPlaying(true);
        });
    };

    // Check if intro was already dismissed in this session
    if (typeof window !== "undefined" && (window as any).__introDismissed) {
      startPlayback();
      return;
    }

    const hasIntro =
      typeof window !== "undefined" &&
      ((window as any).__hasBullIntro || document.getElementById("bull-intro"));

    // If there is truly no intro, play immediately
    if (!hasIntro) {
      startPlayback();
      return;
    }

    // Intro is present or mounting: wait for dismissal
    video.pause();

    const onIntroDismissed = () => startPlayback();
    window.addEventListener("intro-dismissed", onIntroDismissed, { once: true });

    // Fallback: if intro is removed from DOM
    const observer = new MutationObserver(() => {
      if (!document.getElementById("bull-intro") && (window as any).__introDismissed) {
        observer.disconnect();
        startPlayback();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("intro-dismissed", onIntroDismissed);
      observer.disconnect();
    };
  }, [active]);

  return (
    <video
      ref={videoRef}
      src="https://res.cloudinary.com/jxvpizz0/video/upload/v1793168732/hero_section_video.mp4"
      muted
      playsInline
      preload="auto"
      onError={(e) => console.error("Hero video error:", e.currentTarget.error)}
      className={`size-full object-contain sm:object-cover sm:object-[75%_center] lg:object-[82%_center] transition-all duration-1000 ease-out ${
        isPlaying ? "opacity-100 scale-100 filter-none" : "opacity-40 scale-[1.03] blur-[1px]"
      }`}
    />
  );
}
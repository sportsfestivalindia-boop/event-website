"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

// Editable UI copy dictionary
export const COPY = {
  title: "REGISTER NOW — FROM ₹600",
  buttonLabel: "REGISTER NOW",
  step1: "1. Athlete Details",
  step2: "2. Championship Category",
  successTitle: "ENTRY DETAILS SAVED!",
  successMessage: "Your entry is pre-filled. Complete your registration and secure your athlete slot now.",
  successButton: "Proceed to Finish Entry",
  errorTitle: "Submission Error",
  errorMessage: "Something went wrong while submitting. Please try again.",
  whatsappPrompt: "Need help registering? Chat with our team on WhatsApp",
};

// Lazy load modal dialog for optimal page load performance
const RegisterFormModal = dynamic(() => import("./RegisterFormModal"), {
  ssr: false,
});

export function RegisterPopup() {
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timerStartedRef = useRef(false);
  const triggerBtnRef = useRef<HTMLButtonElement | null>(null);

  // Directly open popup modal in centre 3000ms after hero is loaded / intro is dismissed
  const startTimer = useCallback(() => {
    if (timerStartedRef.current) return;
    timerStartedRef.current = true;

    timerRef.current = setTimeout(() => {
      try {
        if (sessionStorage.getItem("regPopupDismissed") === "true") {
          return;
        }
      } catch {}

      setIsModalOpen(true);
    }, 3000);
  }, []);

  // Sync with BullIntro dismissal & Hero start logic
  useEffect(() => {
    // Only run on the home page
    if (pathname !== "/") return;

    // Check if user previously dismissed in this browser session
    try {
      if (sessionStorage.getItem("regPopupDismissed") === "true") {
        return;
      }
    } catch {}

    // Check if intro has already been dismissed
    if (typeof window !== "undefined" && (window as any).__introDismissed) {
      startTimer();
      return;
    }

    const hasIntro =
      typeof window !== "undefined" &&
      ((window as any).__hasBullIntro || document.getElementById("bull-intro"));

    // If there is no intro element at mount, start timer immediately
    if (!hasIntro) {
      startTimer();
      return;
    }

    // Intro is present: wait for "intro-dismissed" event
    const onDismissed = () => {
      startTimer();
    };
    window.addEventListener("intro-dismissed", onDismissed, { once: true });

    // Fallback: MutationObserver detecting when #bull-intro is unmounted
    const observer = new MutationObserver(() => {
      if (!document.getElementById("bull-intro")) {
        observer.disconnect();
        startTimer();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("intro-dismissed", onDismissed);
      observer.disconnect();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      timerStartedRef.current = false;
    };
  }, [pathname, startTimer]);

  // Support dispatching window event "open-register-popup" from any register button
  useEffect(() => {
    const handleCustomOpen = () => {
      setIsModalOpen(true);
    };
    window.addEventListener("open-register-popup", handleCustomOpen);
    return () => {
      window.removeEventListener("open-register-popup", handleCustomOpen);
    };
  }, []);

  // Handle modal close & save dismissal to sessionStorage
  const handleCloseModal = () => {
    setIsModalOpen(false);
    try {
      sessionStorage.setItem("regPopupDismissed", "true");
    } catch {}
  };

  // Strictly do not render on non-home pages (e.g. /register)
  if (pathname !== "/") return null;

  return (
    <>
      {/* Registration Form Modal (Centered, Accessible Native Dialog via Portal) */}
      {isModalOpen && (
        <RegisterFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          triggerBtnRef={triggerBtnRef}
          copy={COPY}
        />
      )}
    </>
  );
}

export default RegisterPopup;

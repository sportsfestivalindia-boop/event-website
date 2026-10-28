"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { RegisterFlow } from "./RegisterFlow";
import { ClipboardList, X } from "lucide-react";

export interface RegisterModalEventDetail {
  sport?: string;
  division?: string;
  cls?: string;
}

/** Global trigger function to open the register modal from anywhere in the app */
export function openRegisterModal(detail?: RegisterModalEventDetail) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("open-register-modal", { detail: detail || {} })
    );
  }
}

/** Global trigger function to close the register modal */
export function closeRegisterModal() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("close-register-modal"));
  }
}

export function RegisterModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [initialParams, setInitialParams] = useState<RegisterModalEventDetail>({});
  const modalCardRef = useRef<HTMLDivElement>(null);

  const handleOpen = useCallback((e: Event) => {
    const customEvent = e as CustomEvent<RegisterModalEventDetail>;
    setInitialParams(customEvent.detail || {});
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Listen to custom window events for opening/closing the modal
  useEffect(() => {
    window.addEventListener("open-register-modal", handleOpen);
    window.addEventListener("close-register-modal", handleClose);
    return () => {
      window.removeEventListener("open-register-modal", handleOpen);
      window.removeEventListener("close-register-modal", handleClose);
    };
  }, [handleOpen, handleClose]);

  // Lock body scroll and handle Escape key press when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleClose]);

  return (
    <>
      {/* ── Floating "Register Form" Pop-Up Button on Home Screen ── */}
      <div className="fixed bottom-6 left-6 z-40 flex flex-col items-start gap-1">
        <button
          type="button"
          onClick={() => {
            setInitialParams({});
            setIsOpen(true);
          }}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-label="Open athlete registration form popup"
          className="group relative flex items-center gap-2.5 sm:gap-3 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-[#FFE600] via-[#FF9A00] to-[#FF6A00] text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-[0_4px_30px_rgba(255,154,0,0.55)] hover:shadow-[0_6px_45px_rgba(255,154,0,0.85)] hover:scale-105 active:scale-95 transition-all duration-300 border border-white/40 cursor-pointer select-none"
        >
          {/* Animated ping radar dot */}
          <span className="relative flex size-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75" />
            <span className="relative inline-flex rounded-full size-2.5 bg-black" />
          </span>

          <ClipboardList className="size-4 shrink-0 transition-transform duration-300 group-hover:rotate-12" />

          <span className="whitespace-nowrap font-black">Register Form</span>

          <span className="hidden sm:inline-block text-[10px] font-mono font-black tracking-normal bg-black/15 px-2 py-0.5 rounded-full text-black">
            POPUP
          </span>
        </button>
      </div>

      {/* ── Modal Dialog Overlay ── */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Athlete registration form"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-xl p-2 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200"
          onClick={handleClose}
        >
          {/* Modal Container */}
          <div
            ref={modalCardRef}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl my-auto max-h-[94vh] overflow-y-auto rounded-3xl border border-white/20 bg-black shadow-[0_25px_90px_-15px_rgba(255,154,0,0.4)] focus:outline-none"
          >
            {/* Top Floating Close Button */}
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close registration form"
              className="absolute top-4 right-4 sm:top-6 sm:right-6 z-30 grid size-9 place-items-center rounded-full border border-white/20 bg-black/60 text-white/80 backdrop-blur-md transition-all hover:border-[#FF9A00] hover:text-[#FF9A00] hover:bg-[#FF9A00]/10 hover:scale-110 active:scale-95 cursor-pointer shadow-lg"
            >
              <X className="size-4 sm:size-5" />
            </button>

            {/* Embedded Multi-Step Registration Form */}
            <RegisterFlow
              initial={initialParams}
              isModal={true}
              onClose={handleClose}
            />
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { X, ArrowRight, Check, Loader2, ClipboardList } from "lucide-react";
import { CHAMPIONSHIPS, EVENT, minFee, registerHref } from "@/data/festival";
import { inr } from "@/lib/format";
import { WhatsAppGlyph } from "./icons";

export interface RegisterFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerBtnRef?: React.RefObject<HTMLButtonElement | null>;
  copy: {
    title: string;
    buttonLabel: string;
    step1: string;
    step2: string;
    successTitle: string;
    successMessage: string;
    successButton: string;
    errorTitle: string;
    errorMessage: string;
    whatsappPrompt: string;
  };
}

export default function RegisterFormModal({
  isOpen,
  onClose,
  triggerBtnRef,
  copy,
}: RegisterFormModalProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Available sports and divisions from festival data
  const openChampionships = CHAMPIONSHIPS.filter((c) => c.divisions.length > 0);

  // Form Fields State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [city, setCity] = useState("");
  const [association, setAssociation] = useState("");
  const [honeypot, setHoneypot] = useState(""); // Bot blocker

  const [sport, setSport] = useState(openChampionships[0]?.id || "bodybuilding");
  const currentChamp = openChampionships.find((c) => c.id === sport) || openChampionships[0];
  const [division, setDivision] = useState(currentChamp.divisions[0]?.id || "");
  const currentDiv = currentChamp.divisions.find((d) => d.id === division) || currentChamp.divisions[0];
  const [cls, setCls] = useState(currentDiv.classes[0] || "Open");

  // Flow State
  const [step, setStep] = useState<1 | 2>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Refs for Accessibility & Focus Management
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const phoneInputRef = useRef<HTMLInputElement | null>(null);
  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const dobInputRef = useRef<HTMLInputElement | null>(null);
  const cityInputRef = useRef<HTMLInputElement | null>(null);

  // Mount check for React Portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update divisions & classes when sport changes
  const handleSportChange = (newSport: string) => {
    setSport(newSport);
    const champ = openChampionships.find((c) => c.id === newSport) || openChampionships[0];
    const firstDiv = champ.divisions[0];
    setDivision(firstDiv?.id || "");
    setCls(firstDiv?.classes[0] || "Open");
  };

  // Update class when division changes
  const handleDivisionChange = (newDiv: string) => {
    setDivision(newDiv);
    const divObj = currentChamp.divisions.find((d) => d.id === newDiv);
    setCls(divObj?.classes[0] || "Open");
  };

  // Native <dialog> lifecycle and body scroll lock
  useEffect(() => {
    if (!mounted) return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      // Move focus to first input
      const timer = setTimeout(() => {
        nameInputRef.current?.focus();
      }, 80);

      return () => {
        clearTimeout(timer);
        document.body.style.overflow = prevOverflow;
      };
    } else {
      if (dialog.open) {
        dialog.close();
      }
      triggerBtnRef?.current?.focus();
    }
  }, [isOpen, mounted, triggerBtnRef]);

  // Backdrop click handler
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  // Validation function for Step 1
  const validateStep1 = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!name.trim() || name.trim().length < 2) {
      newErrors.name = "Please enter your full name (min 2 characters)";
    }

    const cleanPhone = phone.replace(/\D/g, "");
    const tenDigits = cleanPhone.length === 12 && cleanPhone.startsWith("91") ? cleanPhone.slice(2) : cleanPhone;
    if (!/^[6-9]\d{9}$/.test(tenDigits)) {
      newErrors.phone = "Enter a valid 10-digit Indian mobile number (e.g. 9876543210)";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Enter a valid email address (e.g. athlete@example.com)";
    }

    if (!dob) {
      newErrors.dob = "Please select your date of birth";
    } else {
      const selected = new Date(dob);
      if (selected > new Date()) {
        newErrors.dob = "Date of birth cannot be in the future";
      }
    }

    if (!city.trim() || city.trim().length < 2) {
      newErrors.city = "Please enter your city / district";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      if (newErrors.name) nameInputRef.current?.focus();
      else if (newErrors.phone) phoneInputRef.current?.focus();
      else if (newErrors.email) emailInputRef.current?.focus();
      else if (newErrors.dob) dobInputRef.current?.focus();
      else if (newErrors.city) cityInputRef.current?.focus();
      return false;
    }

    return true;
  }, [name, phone, email, dob, city]);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return; // Silent abort for bots

    if (!validateStep1()) {
      setStep(1);
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      // Store session dismissal flag so button doesn't reappear this session
      try {
        sessionStorage.setItem("regPopupDismissed", "true");
      } catch {}

      // Short delay for high-polish UX
      await new Promise((res) => setTimeout(res, 500));
      setIsSuccess(true);
    } catch {
      setSubmitError(copy.errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinishEntry = () => {
    onClose();
    const cleanPhone = phone.replace(/\D/g, "");
    const finalPhone = cleanPhone.length === 12 && cleanPhone.startsWith("91") ? cleanPhone.slice(2) : cleanPhone;
    
    const params = new URLSearchParams({
      sport,
      division,
      class: cls,
      name: name.trim(),
      dob,
      phone: finalPhone,
      email: email.trim(),
      city: city.trim(),
    });

    if (association.trim()) {
      params.set("association", association.trim());
    }

    router.push(`/register?${params.toString()}`);
  };

  if (!mounted) return null;

  const currentFee = currentDiv.fee ?? EVENT.fee;

  return createPortal(
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={handleBackdropClick}
      aria-modal="true"
      aria-labelledby="rp-title"
      className="rp-dialog m-auto p-0 bg-transparent border-0 outline-none max-w-full backdrop:bg-black/70 backdrop:backdrop-blur-sm fixed z-[100]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[560px] md:w-[560px] rounded-3xl bg-[#0A0A0A] border border-white/12 shadow-[0_25px_80px_rgba(0,0,0,0.8),0_0_40px_rgba(255,154,0,0.12)] overflow-hidden flex flex-col max-h-[90svh] rp-dialog-panel text-white relative max-md:fixed max-md:bottom-0 max-md:inset-x-0 max-md:w-full max-md:max-w-none max-md:rounded-b-none max-md:rounded-t-3xl max-md:max-h-[92svh] max-md:pb-[max(1rem,env(safe-area-inset-bottom))]"
      >
        {/* Thin Gold/Orange Gradient Top Edge */}
        <div aria-hidden="true" className="h-0.5 w-full bg-gradient-to-r from-[#FFE600] via-[#FF9A00] to-[#FF6A00] shrink-0" />

        {/* Subtle Ambient Glow in Corner */}
        <div aria-hidden="true" className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-[#FF9A00]/15 blur-3xl" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/10 shrink-0">
          <div>
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#FF9A00] uppercase block">
              Official Festival Entry · 2026
            </span>
            <h2 id="rp-title" className="display text-xl sm:text-2xl text-white tracking-tight uppercase mt-0.5">
              {copy.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close registration dialog"
            className="grid size-11 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 hover:text-white hover:border-[#FF9A00]/50 hover:bg-[#FF9A00]/10 transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Step Indicator Progress Bar */}
        {!isSuccess && (
          <div className="px-6 pt-4 shrink-0">
            <div className="flex items-center justify-between text-xs font-semibold text-white/70 mb-2">
              <span className={step === 1 ? "text-[#FF9A00]" : "text-white/50"}>{copy.step1}</span>
              <span className={step === 2 ? "text-[#FF9A00]" : "text-white/50"}>{copy.step2}</span>
            </div>
            <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#FFE600] via-[#FF9A00] to-[#FF6A00] transition-all duration-300"
                style={{ width: step === 1 ? "50%" : "100%" }}
              />
            </div>
          </div>
        )}

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Honeypot hidden field */}
          <input
            type="text"
            name="website_security_hp"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            className="hidden"
            aria-hidden="true"
          />

          {isSuccess ? (
            /* Success State */
            <div className="py-8 px-2 text-center flex flex-col items-center">
              <div className="size-16 rounded-full bg-gradient-to-tr from-[#FF6A00] to-[#FFE600] text-black grid place-items-center mb-5 rp-check-icon shadow-[0_0_30px_rgba(255,154,0,0.4)]">
                <Check className="size-9 stroke-[3]" />
              </div>

              <h3 className="display text-3xl text-white uppercase tracking-tight">
                {copy.successTitle}
              </h3>

              <p className="text-sm text-white/75 mt-2.5 max-w-md leading-relaxed">
                {copy.successMessage}
              </p>

              {/* Summary Card */}
              <div className="w-full rounded-2xl border border-white/12 bg-white/[0.03] p-4 mt-6 text-left text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-white/50">Athlete:</span>
                  <span className="font-bold text-white">{name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Category:</span>
                  <span className="font-bold text-[#FF9A00]">{currentChamp.sport} · {currentDiv.name} ({cls})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Fee:</span>
                  <span className="font-bold text-white">{currentFee ? inr(currentFee) : "FREE"}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="w-full mt-7 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleFinishEntry}
                  className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#FFE600] via-[#FF9A00] to-[#FF6A00] text-black font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all shadow-[0_4px_25px_rgba(255,154,0,0.4)] cursor-pointer"
                >
                  <span>{copy.successButton}</span>
                  <span className="grid size-7 place-items-center rounded-full bg-black text-white shrink-0 ml-1">
                    <ArrowRight className="size-4" />
                  </span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full h-11 rounded-xl border border-white/15 text-white/70 hover:text-white hover:border-white/30 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={step === 1 ? handleNextStep : handleSubmit} noValidate>
              {/* Error Alert */}
              {submitError && (
                <div className="mb-5 p-3.5 rounded-xl border border-red-500/40 bg-red-500/10 text-red-300 text-xs flex items-center gap-2.5">
                  <span className="size-2 rounded-full bg-red-400" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* STEP 1: PERSONAL DETAILS */}
              {step === 1 && (
                <div className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="rp-name" className="block text-sm font-medium text-white/80 mb-1.5">
                      Full Name <span className="text-[#FF6B6B]">*</span>
                    </label>
                    <input
                      ref={nameInputRef}
                      id="rp-name"
                      type="text"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors({ ...errors, name: "" });
                      }}
                      placeholder="Athlete full name"
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? "rp-name-error" : undefined}
                      className="h-12 w-full rounded-xl bg-white/[0.04] border border-white/15 px-4 text-base text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-[#FF9A00]/60 focus:border-[#FF9A00] transition-all"
                    />
                    {errors.name && (
                      <p id="rp-name-error" className="text-xs text-[#FF6B6B] mt-1 font-medium" aria-live="polite">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* 2-Column: Mobile & Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Mobile */}
                    <div>
                      <label htmlFor="rp-phone" className="block text-sm font-medium text-white/80 mb-1.5">
                        Mobile Number <span className="text-[#FF6B6B]">*</span>
                      </label>
                      <input
                        ref={phoneInputRef}
                        id="rp-phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        value={phone}
                        onChange={(e) => {
                          let digits = e.target.value.replace(/\D/g, "");
                          if (digits.length >= 12 && digits.startsWith("91")) digits = digits.slice(2);
                          if (digits.startsWith("0")) digits = digits.replace(/^0+/, "");
                          setPhone(digits.slice(0, 10));
                          if (errors.phone) setErrors({ ...errors, phone: "" });
                        }}
                        placeholder="10-digit number"
                        aria-invalid={!!errors.phone}
                        aria-describedby={errors.phone ? "rp-phone-error" : undefined}
                        className="h-12 w-full rounded-xl bg-white/[0.04] border border-white/15 px-4 text-base text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-[#FF9A00]/60 focus:border-[#FF9A00] transition-all"
                      />
                      {errors.phone && (
                        <p id="rp-phone-error" className="text-xs text-[#FF6B6B] mt-1 font-medium" aria-live="polite">
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="rp-email" className="block text-sm font-medium text-white/80 mb-1.5">
                        Email Address <span className="text-[#FF6B6B]">*</span>
                      </label>
                      <input
                        ref={emailInputRef}
                        id="rp-email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errors.email) setErrors({ ...errors, email: "" });
                        }}
                        placeholder="name@example.com"
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? "rp-email-error" : undefined}
                        className="h-12 w-full rounded-xl bg-white/[0.04] border border-white/15 px-4 text-base text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-[#FF9A00]/60 focus:border-[#FF9A00] transition-all"
                      />
                      {errors.email && (
                        <p id="rp-email-error" className="text-xs text-[#FF6B6B] mt-1 font-medium" aria-live="polite">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 2-Column: Date of Birth & City */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* DOB */}
                    <div>
                      <label htmlFor="rp-dob" className="block text-sm font-medium text-white/80 mb-1.5">
                        Date of Birth <span className="text-[#FF6B6B]">*</span>
                      </label>
                      <input
                        ref={dobInputRef}
                        id="rp-dob"
                        type="date"
                        autoComplete="bday"
                        value={dob}
                        max={new Date().toISOString().split("T")[0]}
                        onChange={(e) => {
                          setDob(e.target.value);
                          if (errors.dob) setErrors({ ...errors, dob: "" });
                        }}
                        aria-invalid={!!errors.dob}
                        aria-describedby={errors.dob ? "rp-dob-error" : undefined}
                        className="h-12 w-full rounded-xl bg-white/[0.04] border border-white/15 px-4 text-base text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-[#FF9A00]/60 focus:border-[#FF9A00] transition-all [color-scheme:dark]"
                      />
                      {errors.dob && (
                        <p id="rp-dob-error" className="text-xs text-[#FF6B6B] mt-1 font-medium" aria-live="polite">
                          {errors.dob}
                        </p>
                      )}
                    </div>

                    {/* City */}
                    <div>
                      <label htmlFor="rp-city" className="block text-sm font-medium text-white/80 mb-1.5">
                        City / District <span className="text-[#FF6B6B]">*</span>
                      </label>
                      <input
                        ref={cityInputRef}
                        id="rp-city"
                        type="text"
                        autoComplete="address-level2"
                        value={city}
                        onChange={(e) => {
                          setCity(e.target.value);
                          if (errors.city) setErrors({ ...errors, city: "" });
                        }}
                        placeholder="e.g. Bhubaneswar"
                        aria-invalid={!!errors.city}
                        aria-describedby={errors.city ? "rp-city-error" : undefined}
                        className="h-12 w-full rounded-xl bg-white/[0.04] border border-white/15 px-4 text-base text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-[#FF9A00]/60 focus:border-[#FF9A00] transition-all"
                      />
                      {errors.city && (
                        <p id="rp-city-error" className="text-xs text-[#FF6B6B] mt-1 font-medium" aria-live="polite">
                          {errors.city}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Association / Gym (Optional) */}
                  <div>
                    <label htmlFor="rp-assoc" className="block text-sm font-medium text-white/80 mb-1.5">
                      Gym / Club / Association <span className="text-white/40 text-xs">(Optional)</span>
                    </label>
                    <input
                      id="rp-assoc"
                      type="text"
                      value={association}
                      onChange={(e) => setAssociation(e.target.value)}
                      placeholder="e.g. Iron Gym / AOGA affiliated"
                      className="h-12 w-full rounded-xl bg-white/[0.04] border border-white/15 px-4 text-base text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-[#FF9A00]/60 focus:border-[#FF9A00] transition-all"
                    />
                  </div>

                  {/* Continue Button */}
                  <div className="pt-3">
                    <button
                      type="submit"
                      className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#FFE600] via-[#FF9A00] to-[#FF6A00] text-black font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all shadow-[0_4px_25px_rgba(255,154,0,0.4)] cursor-pointer"
                    >
                      <span>Continue to Category</span>
                      <span className="grid size-7 place-items-center rounded-full bg-black text-white shrink-0 ml-1">
                        <ArrowRight className="size-4" />
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: CATEGORY & SPORT SELECTION */}
              {step === 2 && (
                <div className="space-y-4">
                  {/* Sport Selector */}
                  <div>
                    <label htmlFor="rp-sport" className="block text-sm font-medium text-white/80 mb-1.5">
                      Choose Championship <span className="text-[#FF6B6B]">*</span>
                    </label>
                    <select
                      id="rp-sport"
                      value={sport}
                      onChange={(e) => handleSportChange(e.target.value)}
                      className="h-12 w-full rounded-xl bg-[#141414] border border-white/15 px-4 text-base text-white outline-none focus:ring-2 focus:ring-[#FF9A00]/60 focus:border-[#FF9A00] transition-all [color-scheme:dark]"
                    >
                      {openChampionships.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.sport} — {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Division Selector */}
                  <div>
                    <label htmlFor="rp-div" className="block text-sm font-medium text-white/80 mb-1.5">
                      Division <span className="text-[#FF6B6B]">*</span>
                    </label>
                    <select
                      id="rp-div"
                      value={division}
                      onChange={(e) => handleDivisionChange(e.target.value)}
                      className="h-12 w-full rounded-xl bg-[#141414] border border-white/15 px-4 text-base text-white outline-none focus:ring-2 focus:ring-[#FF9A00]/60 focus:border-[#FF9A00] transition-all [color-scheme:dark]"
                    >
                      {currentChamp.divisions.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} {d.fee !== undefined ? `(${inr(d.fee)})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Weight / Height Class */}
                  <div>
                    <label htmlFor="rp-class" className="block text-sm font-medium text-white/80 mb-1.5">
                      Weight / Height Class <span className="text-[#FF6B6B]">*</span>
                    </label>
                    <select
                      id="rp-class"
                      value={cls}
                      onChange={(e) => setCls(e.target.value)}
                      className="h-12 w-full rounded-xl bg-[#141414] border border-white/15 px-4 text-base text-white outline-none focus:ring-2 focus:ring-[#FF9A00]/60 focus:border-[#FF9A00] transition-all [color-scheme:dark]"
                    >
                      {currentDiv.classes.map((k) => (
                        <option key={k} value={k}>
                          {k}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Live Official Entry Fee Box */}
                  <div className="rounded-2xl border border-[#FF9A00]/30 bg-gradient-to-r from-[#FF9A00]/10 via-[#0A0A0A] to-transparent p-4 mt-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[11px] uppercase tracking-wider text-white/60 block">Official Entry Fee</span>
                        <span className="text-xs text-white/80 mt-0.5 block">
                          Schedule: <span className="text-white font-semibold">{currentChamp.when}</span>
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="display text-3xl sm:text-4xl text-[#FFE600]">
                          {currentFee ? inr(currentFee) : "FREE"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Buttons: Back + Submit */}
                  <div className="pt-3 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="h-14 px-5 rounded-2xl border border-white/15 text-white/80 hover:text-white hover:border-white/30 text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Back
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-[#FFE600] via-[#FF9A00] to-[#FF6A00] text-black font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all shadow-[0_4px_25px_rgba(255,154,0,0.4)] disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <Loader2 className="size-5 animate-spin text-black" />
                      ) : (
                        <>
                          <span>Submit &amp; Register</span>
                          <span className="grid size-7 place-items-center rounded-full bg-black text-white shrink-0 ml-1">
                            <ArrowRight className="size-4" />
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}

          {/* WhatsApp Support Help Line */}
          <div className="mt-5 pt-4 border-t border-white/10 text-center">
            <a
              href={EVENT.whatsappHref}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-[#25D366] transition-colors"
            >
              <WhatsAppGlyph className="size-3.5 text-[#25D366]" />
              <span>{copy.whatsappPrompt}</span>
            </a>
          </div>
        </div>
      </div>
    </dialog>,
    document.body
  );
}

"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { getRandomWisdomIndex } from "@/lib/services/wisdom-service";

interface WisdomCardProps {
  /**
   * Array of wisdom phrase strings fetched from the database
   */
  wisdomPhrases?: string[];
  /**
   * Whether to auto-dismiss the card after a delay
   * @default true
   */
  autoDismiss?: boolean;
  /**
   * Auto-dismiss delay in milliseconds
   * @default 3000 (3 seconds)
   */
  dismissDelay?: number;
  /**
   * Callback when the card is dismissed
   */
  onDismiss?: () => void;
}

/**
 * WisdomCard Component
 *
 * Displays a random motivational wisdom phrase after the user completes their pulse.
 * Features:
 * - Auto-fade after 3 seconds (configurable)
 * - Dismissible via tap/click
 * - Smooth fade-in/fade-out animations
 * - Glassmorph styling
 */
export function WisdomCard({
  wisdomPhrases,
  autoDismiss = true,
  dismissDelay = 3000,
  onDismiss,
}: WisdomCardProps) {
  const t = useTranslations("common");
  const tWisdom = useTranslations("dashboard.wisdomCard");
  const [wisdomText, setWisdomText] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);

  // Load wisdom on mount
  useEffect(() => {
    const phrases = wisdomPhrases ?? [];
    if (phrases.length === 0) return;

    const index = getRandomWisdomIndex(phrases.length);
    setWisdomText(phrases[index]);

    // Trigger fade-in animation after a brief delay
    setTimeout(() => setIsVisible(true), 100);
  }, [wisdomPhrases]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: handleDismiss is stable — only depends on setState calls
  useEffect(() => {
    if (!autoDismiss || !isVisible) return;

    const timer = setTimeout(() => {
      handleDismiss();
    }, dismissDelay);

    return () => clearTimeout(timer);
  }, [autoDismiss, dismissDelay, isVisible]);

  const handleDismiss = () => {
    // Start fade-out animation
    setIsVisible(false);

    // Remove from DOM after animation completes
    setTimeout(() => {
      setShouldRender(false);
      onDismiss?.();
    }, 300); // Match CSS transition duration
  };

  if (!shouldRender || wisdomText === null) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={handleDismiss}
      className={`
        relative overflow-hidden rounded-2xl p-6 mb-6 w-full text-left
        bg-white/80 backdrop-blur-md
        border border-[var(--teal)]/20
        shadow-lg shadow-[var(--teal)]/10
        cursor-pointer
        transition-all duration-300 ease-in-out
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}
      `}
      onKeyDown={(e) => {
        if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleDismiss();
        }
      }}
      aria-label={tWisdom("ariaLabel")}
    >
      {/* Gradient accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--teal)] to-[var(--blue)]" />

      {/* Wisdom text */}
      <p className="text-center text-[var(--slate-700)] text-lg leading-relaxed font-medium">
        "{wisdomText}"
      </p>

      {/* Dismiss hint */}
      <p className="text-center text-[var(--slate-400)] text-xs mt-3">
        {t("tapToDismiss")}
      </p>
    </button>
  );
}

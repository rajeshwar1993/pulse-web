"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { PulseLogo } from "@/components/ui/pulse-logo";
import { getRandomWisdomIndex } from "@/lib/services/wisdom-service";

interface PulseOverlayProps {
  isOpen: boolean;
  onComplete: (success: boolean) => void;
  pulseResult: Promise<boolean> | null;
}

export function PulseOverlay({
  isOpen,
  onComplete,
  pulseResult,
}: PulseOverlayProps) {
  const t = useTranslations("pulse");
  const tWisdom = useTranslations("wisdom");
  const [wisdomText, setWisdomText] = useState<string | null>(null);
  const [shouldExit, setShouldExit] = useState(false);
  const successRef = useRef(false);

  // Reset state when overlay opens
  useEffect(() => {
    if (isOpen) {
      setWisdomText(null);
      setShouldExit(false);
      successRef.current = false;
    }
  }, [isOpen]);

  // Phased timing: race pulseResult vs 1.5s delay for wisdom, then 3s fade-out
  useEffect(() => {
    if (!isOpen || !pulseResult) return;

    let cancelled = false;
    let fadeTimer: ReturnType<typeof setTimeout>;

    const showWisdom = () => {
      if (cancelled) return;
      const count = Number(tWisdom("count"));
      const index = getRandomWisdomIndex(count);
      const phrase = tWisdom(`phrases.${index}`);
      setWisdomText(phrase);

      // Start 3s fade-out timer after wisdom appears
      fadeTimer = setTimeout(() => {
        if (!cancelled) setShouldExit(true);
      }, 3000);
    };

    // Race: show wisdom when pulseResult resolves OR after 1.5s, whichever is sooner
    let wisdomShown = false;

    const earlyTimer = setTimeout(() => {
      if (!wisdomShown) {
        wisdomShown = true;
        showWisdom();
      }
    }, 1500);

    pulseResult.then((success) => {
      if (cancelled) return;
      successRef.current = success;
      if (!wisdomShown) {
        wisdomShown = true;
        showWisdom();
      }
    });

    // Also capture result even if wisdom was shown by timer
    pulseResult.then((success) => {
      if (!cancelled) successRef.current = success;
    });

    return () => {
      cancelled = true;
      clearTimeout(earlyTimer);
      clearTimeout(fadeTimer);
    };
  }, [isOpen, pulseResult, tWisdom]);

  const handleExitComplete = () => {
    onComplete(successRef.current);
  };

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {isOpen && !shouldExit && (
        <motion.div
          key="pulse-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white"
        >
          <div className="animate-heartbeat">
            <PulseLogo className="w-24 h-24" />
          </div>

          {wisdomText ? (
            <motion.p
              key="wisdom"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-8 max-w-sm px-6 text-center text-lg font-medium text-[var(--slate-700)] leading-relaxed"
            >
              &ldquo;{wisdomText}&rdquo;
            </motion.p>
          ) : (
            <motion.p
              key="sending"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="mt-8 text-lg font-medium text-slate-500"
            >
              {t("sendingOverlay")}
            </motion.p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

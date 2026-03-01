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
  const tWisdom = useTranslations("wisdom");
  const tWisdomRef = useRef(tWisdom);
  tWisdomRef.current = tWisdom;
  const [wisdomText, setWisdomText] = useState<string | null>(null);
  const [shouldExit, setShouldExit] = useState(false);
  const successRef = useRef(false);
  const pulseResolvedRef = useRef(false);
  const readyToExitRef = useRef(false);

  // Reset state when overlay opens
  useEffect(() => {
    if (isOpen) {
      setWisdomText(null);
      setShouldExit(false);
      successRef.current = false;
      pulseResolvedRef.current = false;
      readyToExitRef.current = false;
    }
  }, [isOpen]);

  // Fixed timing: wisdom at 1.5s, exit at 4s (or when sendPulse resolves, whichever is later)
  useEffect(() => {
    if (!isOpen || !pulseResult) return;

    let cancelled = false;

    // Show wisdom at 1.5s (no dependency on pulseResult)
    const wisdomTimer = setTimeout(() => {
      if (cancelled) return;
      const count = Number(tWisdomRef.current("count"));
      const index = getRandomWisdomIndex(count);
      const phrase = tWisdomRef.current(`phrases.${index}`);
      setWisdomText(phrase);
    }, 1500);

    // Ready to exit at 4s, but only if sendPulse has resolved
    const exitTimer = setTimeout(() => {
      if (cancelled) return;
      readyToExitRef.current = true;
      if (pulseResolvedRef.current) {
        setShouldExit(true);
      }
    }, 4000);

    // Track pulse resolution; exit immediately if 4s already passed
    pulseResult.then((success) => {
      if (cancelled) return;
      successRef.current = success;
      pulseResolvedRef.current = true;
      if (readyToExitRef.current) {
        setShouldExit(true);
      }
    });

    return () => {
      cancelled = true;
      clearTimeout(wisdomTimer);
      clearTimeout(exitTimer);
    };
  }, [isOpen, pulseResult]);

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

          {wisdomText && (
            <motion.p
              key="wisdom"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-8 max-w-sm px-6 text-center text-lg font-medium text-[var(--slate-700)] leading-relaxed"
            >
              &ldquo;{wisdomText}&rdquo;
            </motion.p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

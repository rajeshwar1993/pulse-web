"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { PulseLogo } from "@/components/ui/pulse-logo";
import { getRandomWisdomIndex } from "@/lib/services/wisdom-service";

interface PulseOverlayProps {
  isOpen: boolean;
  onComplete: (success: boolean) => void;
  pulseResult: Promise<boolean> | null;
  dashboardReady?: boolean;
  wisdomPhrases?: string[];
}

export function PulseOverlay({
  isOpen,
  onComplete,
  pulseResult,
  dashboardReady,
  wisdomPhrases,
}: PulseOverlayProps) {
  const wisdomPhrasesRef = useRef(wisdomPhrases ?? []);
  wisdomPhrasesRef.current = wisdomPhrases ?? [];
  const dashboardReadyRef = useRef(dashboardReady ?? true);
  dashboardReadyRef.current = dashboardReady ?? true;
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
      const phrases = wisdomPhrasesRef.current;
      if (phrases.length > 0) {
        const index = getRandomWisdomIndex(phrases.length);
        setWisdomText(phrases[index]);
      }
    }, 1500);

    // Ready to exit at 4s, but only if sendPulse has resolved and dashboard is ready
    const exitTimer = setTimeout(() => {
      if (cancelled) return;
      readyToExitRef.current = true;
      if (pulseResolvedRef.current && dashboardReadyRef.current) {
        setShouldExit(true);
      }
    }, 4000);

    // Track pulse resolution; exit immediately if 4s already passed and dashboard is ready
    pulseResult.then((success) => {
      if (cancelled) return;
      successRef.current = success;
      pulseResolvedRef.current = true;
      if (readyToExitRef.current && dashboardReadyRef.current) {
        setShouldExit(true);
      }
    });

    return () => {
      cancelled = true;
      clearTimeout(wisdomTimer);
      clearTimeout(exitTimer);
    };
  }, [isOpen, pulseResult]);

  // When dashboardReady transitions to true after other conditions are already met
  useEffect(() => {
    if (
      (dashboardReady ?? true) &&
      readyToExitRef.current &&
      pulseResolvedRef.current
    ) {
      setShouldExit(true);
    }
  }, [dashboardReady]);

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

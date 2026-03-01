"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { PulseLogo } from "@/components/ui/pulse-logo";

interface PulseOverlayProps {
  isOpen: boolean;
  onComplete: () => void;
}

export function PulseOverlay({ isOpen, onComplete }: PulseOverlayProps) {
  const t = useTranslations("pulse");

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isOpen && (
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
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="mt-8 text-lg font-medium text-slate-500"
          >
            {t("sendingOverlay")}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

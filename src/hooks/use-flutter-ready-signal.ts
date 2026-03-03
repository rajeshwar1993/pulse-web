"use client";

import { useEffect } from "react";
import { FLUTTER_READY_SIGNAL_DELAY_MS } from "@/lib/constants";
import { logger } from "@/lib/utils/logger";

/**
 * Sends a `{ type: "ready" }` message to Flutter via FlutterBridge
 * after a short delay, allowing the DOM to settle before cross-fading
 * from the splash screen.
 */
export function useFlutterReadySignal() {
  useEffect(() => {
    const sendReadySignal = () => {
      try {
        if (typeof window !== "undefined" && window.FlutterBridge) {
          logger.debug("Sending ready signal to Flutter...");
          window.FlutterBridge.postMessage(
            JSON.stringify({ type: "ready", timestamp: Date.now() }),
          );
          logger.debug("Ready signal sent successfully");
        }
      } catch (error) {
        logger.error("Failed to send ready signal", error);
      }
    };

    const timer = setTimeout(sendReadySignal, FLUTTER_READY_SIGNAL_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);
}

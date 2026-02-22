"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { SupportedLocale } from "@/i18n/config";
import { supportedLocales } from "@/i18n/config";
import { LocaleService } from "@/lib/services/locale-service";

export function FlutterBridgeListener() {
  const router = useRouter();

  useEffect(() => {
    const handleLocaleChanged = (event: CustomEvent<{ locale: string }>) => {
      const locale = event.detail?.locale;
      if (locale && supportedLocales.includes(locale as SupportedLocale)) {
        LocaleService.setStoredLocale(locale as SupportedLocale);
        router.refresh();
      }
    };

    window.addEventListener(
      "flutter-locale-changed",
      handleLocaleChanged as EventListener,
    );

    return () => {
      window.removeEventListener(
        "flutter-locale-changed",
        handleLocaleChanged as EventListener,
      );
    };
  }, [router]);

  return null;
}

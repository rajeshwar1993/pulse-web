"use client";

import type { SupportedLocale } from "@/i18n/config";
import { localeNames, supportedLocales } from "@/i18n/config";

interface LanguageSelectorProps {
  currentLocale: string;
  onLocaleChange: (locale: SupportedLocale) => void;
}

export function LanguageSelector({
  currentLocale,
  onLocaleChange,
}: LanguageSelectorProps) {
  return (
    <div className="space-y-2" role="radiogroup" aria-label="Language">
      {supportedLocales.map((locale) => {
        const isSelected = locale === currentLocale;

        return (
          // biome-ignore lint/a11y/useSemanticElements: styled button with role="radio" is intentional
          <button
            key={locale}
            type="button"
            role="radio"
            onClick={() => onLocaleChange(locale)}
            className={`
              w-full flex items-center justify-between px-4 py-3 rounded-xl
              transition-colors text-left
              ${
                isSelected
                  ? "border-2 border-[var(--teal)] bg-[var(--teal-50)]"
                  : "border-2 border-[var(--slate-200)] hover:border-[var(--slate-300)] bg-white"
              }
            `}
            aria-checked={isSelected}
          >
            <span
              className={`font-medium ${
                isSelected
                  ? "text-[var(--teal-500)]"
                  : "text-[var(--slate-700)]"
              }`}
            >
              {localeNames[locale]}
            </span>

            {isSelected && (
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                className="text-[var(--teal)]"
                aria-hidden="true"
              >
                <path
                  d="M16.667 5L7.5 14.167 3.333 10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );
}

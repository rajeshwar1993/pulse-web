"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { PulseLogo } from "@/components/ui/pulse-logo";

const NAV_ITEMS = [
  { href: "/appview/settings", labelKey: "settings", icon: "profile" },
  { href: "/appview/dashboard", labelKey: "dashboard", icon: "pulse" },
  {
    href: "/appview/activity",
    labelKey: "activity",
    icon: "activity",
  },
] as const;

/** Fixed bottom navigation bar for the appview (mobile) layout. */
export function BottomNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-t border-[var(--slate-200)] safe-area-inset-bottom">
      <div className="flex items-center justify-around h-14">
        {NAV_ITEMS.map(({ href, labelKey, icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-1 min-w-[72px] py-1 transition-colors ${
                isActive
                  ? "text-[var(--teal-500)]"
                  : "text-[var(--slate-400)] active:text-[var(--slate-600)]"
              }`}
            >
              <NavIcon icon={icon} isActive={isActive} />
              <span className="text-[10px] font-medium leading-tight">
                {t(labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function NavIcon({
  icon,
  isActive,
}: {
  icon: (typeof NAV_ITEMS)[number]["icon"];
  isActive: boolean;
}) {
  if (icon === "pulse") {
    return (
      <PulseLogo
        className={`w-7 h-7 ${!isActive ? "opacity-60 grayscale" : ""}`}
      />
    );
  }

  const strokeColor = isActive ? "var(--teal-500)" : "currentColor";

  if (icon === "profile") {
    return (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    );
  }

  // activity (bar chart icon)
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke={strokeColor}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 20V10" />
      <path d="M18 20V4" />
      <path d="M6 20v-4" />
    </svg>
  );
}

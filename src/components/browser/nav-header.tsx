"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { PulseLogo } from "@/components/ui/pulse-logo";
import { MobileMenu } from "./mobile-menu";
import { UserMenu } from "./user-menu";

interface NavHeaderUser {
  id: string;
  display_name: string;
  avatar_url: string;
}

interface NavHeaderProps {
  user?: NavHeaderUser | null;
}

const NAV_LINKS = [
  { href: "/dashboard", labelKey: "dashboard" },
  { href: "/connections", labelKey: "connections" },
  { href: "/settings", labelKey: "settings" },
] as const;

export function NavHeader({ user }: NavHeaderProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-[var(--slate-200)]">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href={user ? "/dashboard" : "/"}
          className="flex items-center gap-2.5"
        >
          <PulseLogo className="w-8 h-8" />
          <span className="text-lg font-semibold text-[var(--teal)]">
            {t("appName")}
          </span>
        </Link>

        {/* Desktop nav */}
        {user && (
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, labelKey }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[var(--teal-50)] text-[var(--teal-500)]"
                      : "text-[var(--slate-600)] hover:bg-[var(--slate-50)] hover:text-[var(--slate-800)]"
                  }`}
                >
                  {t(labelKey)}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right section */}
        <div className="flex items-center gap-2">
          {user && (
            <>
              {/* Desktop user menu */}
              <div className="hidden md:block">
                <UserMenu
                  displayName={user.display_name}
                  avatarUrl={user.avatar_url}
                />
              </div>

              {/* Mobile hamburger */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 rounded-lg hover:bg-[var(--slate-100)] transition-colors"
                aria-label={t("menu")}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[var(--slate-600)]"
                  aria-hidden="true"
                >
                  <path d="M4 6h16" />
                  <path d="M4 12h16" />
                  <path d="M4 18h16" />
                </svg>
              </button>

              <MobileMenu
                isOpen={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
                user={user}
              />
            </>
          )}
        </div>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef } from "react";
import { Avatar } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase/client";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user?: {
    display_name: string;
    avatar_url: string;
  } | null;
}

const NAV_LINKS = [
  { href: "/dashboard", labelKey: "dashboard" },
  { href: "/connections", labelKey: "connections" },
  { href: "/settings", labelKey: "settings" },
] as const;

export function MobileMenu({ isOpen, onClose, user }: MobileMenuProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    onClose();
    window.location.href = "/";
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: backdrop is a click-to-dismiss area */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        role="presentation"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-xl flex flex-col animate-slide-in-right"
        role="dialog"
        aria-modal="true"
        aria-label={t("menu")}
      >
        {/* Close button */}
        <div className="flex justify-end p-4">
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[var(--slate-100)] transition-colors"
            aria-label="Close menu"
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
              className="text-[var(--slate-500)]"
              aria-hidden="true"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Nav links */}
        {user && (
          <nav className="flex-1 px-4">
            <ul className="space-y-1">
              {NAV_LINKS.map(({ href, labelKey }) => {
                const isActive = pathname === href;
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={onClose}
                      className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                        isActive
                          ? "bg-[var(--teal-50)] text-[var(--teal-500)]"
                          : "text-[var(--slate-700)] hover:bg-[var(--slate-50)]"
                      }`}
                    >
                      {t(labelKey)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}

        {/* User info + logout */}
        {user && (
          <div className="border-t border-[var(--slate-200)] p-4">
            <div className="flex items-center gap-3 mb-4">
              <Avatar src={user.avatar_url} alt={user.display_name} size="md" />
              <span className="text-sm font-medium text-[var(--slate-800)]">
                {user.display_name}
              </span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full px-4 py-2.5 text-sm text-[var(--error)] hover:bg-[var(--rose-50)] rounded-lg transition-colors text-left"
            >
              {t("logout")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

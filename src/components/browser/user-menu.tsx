"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase/client";

interface UserMenuProps {
  displayName: string;
  avatarUrl: string;
}

export function UserMenu({ displayName, avatarUrl }: UserMenuProps) {
  const t = useTranslations("nav");
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  }, []);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="flex items-center gap-2 rounded-full p-1 hover:bg-[var(--slate-100)] transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Avatar src={avatarUrl} alt={displayName} size="sm" />
        <span className="hidden sm:block text-sm font-medium text-[var(--slate-700)] pr-1">
          {displayName}
        </span>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-[var(--slate-200)] py-1 z-50"
          role="menu"
        >
          <Link
            href="/settings"
            className="block px-4 py-2.5 text-sm text-[var(--slate-700)] hover:bg-[var(--slate-50)] transition-colors"
            role="menuitem"
            onClick={() => setIsOpen(false)}
          >
            {t("settings")}
          </Link>
          <hr className="my-1 border-[var(--slate-100)]" />
          <button
            type="button"
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2.5 text-sm text-[var(--error)] hover:bg-[var(--rose-50)] transition-colors"
            role="menuitem"
          >
            {t("logout")}
          </button>
        </div>
      )}
    </div>
  );
}

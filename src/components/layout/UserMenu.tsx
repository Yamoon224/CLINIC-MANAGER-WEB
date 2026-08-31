"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { IconLogout, IconSettings, IconUserCircle } from "@tabler/icons-react";
import { useAuth } from "@/features/auth/auth-context";
import { useClickOutside } from "@/lib/useClickOutside";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export function UserMenu() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));

  if (!user) return null;

  const initial = user.name.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full p-0.5 hover:bg-light"
        aria-label={user.name}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
          {initial}
        </span>
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-2 w-60 rounded-[6px] border border-border bg-surface p-2 shadow-[var(--shadow-preclinic-lg)]">
          <div className="mb-1 flex items-center gap-2 rounded-[6px] bg-light p-2 dark:bg-gray-100">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
              {initial}
            </span>
            <div className="min-w-0">
              <p className="m-0 truncate text-sm font-semibold text-heading">
                {user.name}
              </p>
              <p className="m-0 truncate text-xs text-muted">{user.email}</p>
            </div>
          </div>
          <Link
            href="/profil"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-[5px] px-2.5 py-1.5 text-[13px] text-heading hover:bg-light"
          >
            <IconUserCircle size={16} />
            {t("nav.profil")}
          </Link>
          <Link
            href="/parametres"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-[5px] px-2.5 py-1.5 text-[13px] text-heading hover:bg-light"
          >
            <IconSettings size={16} />
            {t("nav.parametres")}
          </Link>
          <div className="my-1 border-t border-border" />
          <button
            onClick={() => logout()}
            className="flex w-full items-center gap-2 rounded-[5px] px-2.5 py-1.5 text-[13px] text-danger hover:bg-danger-light"
          >
            <IconLogout size={16} />
            {t("nav.logout")}
          </button>
        </div>
      )}
    </div>
  );
}

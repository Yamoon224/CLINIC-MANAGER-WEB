"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { LogOut, Settings, User as UserIcon } from "lucide-react";
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
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-primary-light"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
          {initial}
        </span>
        <span className="hidden text-sm font-medium sm:inline">
          {user.name}
        </span>
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-2 w-56 rounded-xl border border-border bg-surface py-1 shadow-lg">
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted">{user.email}</p>
          </div>
          <Link
            href="/profil"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-primary-light/60"
          >
            <UserIcon size={16} />
            {t("nav.profil")}
          </Link>
          <Link
            href="/parametres"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-primary-light/60"
          >
            <Settings size={16} />
            {t("nav.parametres")}
          </Link>
          <button
            onClick={() => logout()}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-danger-light"
          >
            <LogOut size={16} />
            {t("nav.logout")}
          </button>
        </div>
      )}
    </div>
  );
}

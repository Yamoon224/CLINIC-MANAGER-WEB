"use client";

import Link from "next/link";
import { IconCalendarDue, IconMenu2, IconSettings } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { GlobalSearch } from "./GlobalSearch";
import { LanguageToggle } from "./LanguageToggle";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationBell } from "./NotificationBell";
import { UserMenu } from "./UserMenu";

const iconLink =
  "inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted shadow-[var(--shadow-preclinic-sm)] transition-colors hover:border-primary hover:text-primary";

export function Topbar({
  onOpenSidebar,
  onToggleCollapse,
}: {
  onOpenSidebar: () => void;
  onToggleCollapse: () => void;
}) {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b border-border bg-surface px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className={cn(iconLink, "lg:hidden")}
          aria-label={t("nav.openMenu")}
        >
          <IconMenu2 size={16} />
        </button>
        <button
          onClick={onToggleCollapse}
          className={cn(iconLink, "hidden lg:inline-flex")}
          aria-label={t("nav.toggleSidebar")}
        >
          <IconMenu2 size={16} />
        </button>
        <div className="hidden md:block">
          <GlobalSearch />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link href="/rendez-vous" className={iconLink} aria-label={t("nav.rendezVous")}>
          <IconCalendarDue size={16} />
        </Link>
        <Link href="/parametres" className={iconLink} aria-label={t("nav.parametres")}>
          <IconSettings size={16} />
        </Link>
        <ThemeToggle />
        <LanguageToggle />
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  );
}

"use client";

import { Menu } from "lucide-react";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { GlobalSearch } from "./GlobalSearch";
import { LanguageToggle } from "./LanguageToggle";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationBell } from "./NotificationBell";
import { UserMenu } from "./UserMenu";

export function Topbar({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border bg-surface px-4 py-3 shadow-sm lg:px-6">
      <button
        onClick={onOpenSidebar}
        className="rounded-lg p-2 text-muted hover:bg-primary-light hover:text-primary lg:hidden"
        aria-label={t("nav.openMenu")}
      >
        <Menu size={20} />
      </button>
      <div className="hidden flex-1 justify-center lg:flex">
        <GlobalSearch />
      </div>
      <div className="flex items-center gap-1">
        <LanguageToggle />
        <ThemeToggle />
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  );
}

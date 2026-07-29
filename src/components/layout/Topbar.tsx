"use client";

import { Menu } from "lucide-react";
import { NotificationBell } from "./NotificationBell";
import { UserMenu } from "./UserMenu";

export function Topbar({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface/80 px-4 py-3 backdrop-blur lg:px-6">
      <button
        onClick={onOpenSidebar}
        className="rounded-lg p-2 text-muted hover:bg-primary-light hover:text-primary lg:hidden"
        aria-label="Ouvrir le menu"
      >
        <Menu size={20} />
      </button>
      <div className="hidden lg:block" />
      <div className="flex items-center gap-2">
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { NAV_LINKS } from "./nav-links";

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/30 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 shrink-0 flex-col border-r border-border bg-surface transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-2 px-5 py-4">
          <div className="flex items-center gap-2">
            <Image
              src="/images/logo.png"
              alt="Clinic Manager"
              width={30}
              height={30}
              className="rounded-md"
            />
            <span className="font-semibold tracking-tight">
              Clinic Manager
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground lg:hidden"
            aria-label="Fermer le menu"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          <ul className="flex flex-col gap-0.5">
            {NAV_LINKS.map((link) => {
              const active =
                pathname === link.href ||
                pathname?.startsWith(`${link.href}/`);
              const Icon = link.icon;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "bg-primary-light text-primary"
                        : "text-muted hover:bg-primary-light/60 hover:text-foreground"
                    }`}
                  >
                    <Icon size={18} />
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}

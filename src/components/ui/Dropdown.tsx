"use client";

import { useRef, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { useClickOutside } from "@/lib/useClickOutside";

/* Menu déroulant générique (dropdown du template).
   `trigger` reçoit l'état ouvert et un toggle ; le contenu du menu est fermé
   au clic extérieur et au clic sur un <DropdownItem>. */
export function Dropdown({
  trigger,
  children,
  align = "end",
  menuClassName,
  closeOnSelect = true,
  width = "auto",
}: {
  trigger: (args: { open: boolean; toggle: () => void }) => ReactNode;
  children: ReactNode;
  align?: "start" | "end";
  menuClassName?: string;
  closeOnSelect?: boolean;
  width?: "auto" | "sm" | "md" | "lg";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));

  const widthClass =
    width === "sm"
      ? "min-w-40"
      : width === "md"
        ? "min-w-56"
        : width === "lg"
          ? "min-w-72"
          : "min-w-max";

  return (
    <div className="relative" ref={ref}>
      {trigger({ open, toggle: () => setOpen((v) => !v) })}
      {open && (
        <div
          onClick={() => closeOnSelect && setOpen(false)}
          className={cn(
            "absolute z-40 mt-1 rounded-[6px] border border-border bg-surface p-2 shadow-[var(--shadow-preclinic-lg)]",
            align === "end" ? "right-0" : "left-0",
            widthClass,
            menuClassName,
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({
  icon,
  onClick,
  href,
  tone = "default",
  disabled,
  children,
}: {
  icon?: ReactNode;
  onClick?: () => void;
  href?: string;
  tone?: "default" | "danger";
  disabled?: boolean;
  children: ReactNode;
}) {
  const className = cn(
    "flex w-full items-center gap-2 rounded-[5px] px-2.5 py-1.5 text-left text-[13px] transition-colors",
    tone === "danger"
      ? "text-danger hover:bg-danger-light"
      : "text-heading hover:bg-light",
    disabled && "pointer-events-none opacity-50",
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {icon}
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={className}>
      {icon}
      {children}
    </button>
  );
}

export function DropdownDivider() {
  return <div className="my-1 border-t border-border" />;
}

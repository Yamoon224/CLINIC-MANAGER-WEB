import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type Tone =
  | "primary"
  | "secondary"
  | "accent"
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "neutral";

/* badge-soft-* du template : texte plein + fond "transparent" de la même teinte. */
export const TONE_CLASSES: Record<Tone, string> = {
  primary: "bg-primary-light text-primary",
  secondary: "bg-secondary-light text-accent",
  accent: "bg-accent-light text-accent",
  info: "bg-info-light text-info",
  success: "bg-success-light text-success",
  warning: "bg-warning-light text-warning",
  danger: "bg-danger-light text-danger",
  neutral: "bg-gray-100 text-muted",
};

const BORDER_CLASSES: Record<Tone, string> = {
  primary: "border border-primary/40",
  secondary: "border border-accent/40",
  accent: "border border-accent/40",
  info: "border border-info/40",
  success: "border border-success/40",
  warning: "border border-warning/40",
  danger: "border border-danger/40",
  neutral: "border border-border",
};

export function Badge({
  tone = "neutral",
  border = false,
  pill = false,
  className,
  children,
}: {
  tone?: Tone;
  /** Ajoute un liseré de la même teinte (badge-soft + border du template). */
  border?: boolean;
  /** Coins arrondis pleins (par défaut : rounded léger comme le template). */
  pill?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 text-[13px] font-medium leading-5",
        pill ? "rounded-full" : "rounded",
        TONE_CLASSES[tone],
        border && BORDER_CLASSES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

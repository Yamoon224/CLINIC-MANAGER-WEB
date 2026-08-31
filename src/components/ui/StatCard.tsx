import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import type { Tone } from "./Badge";

const TONE_BG: Record<Tone, string> = {
  primary: "bg-primary text-white",
  secondary: "bg-secondary text-white",
  accent: "bg-accent text-white",
  info: "bg-info text-white",
  success: "bg-success text-white",
  warning: "bg-warning text-white",
  danger: "bg-danger text-white",
  neutral: "bg-gray-200 text-heading",
};

export function StatCard({
  label,
  value,
  icon,
  tone = "primary",
  delta,
  caption,
  chart,
  href,
  className,
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  tone?: Tone;
  delta?: { value: string; tone?: Tone };
  caption?: string;
  chart?: ReactNode;
  href?: string;
  className?: string;
}) {
  const inner = (
    <div
      className={cn(
        "flex h-full flex-col gap-2 rounded-[5px] border border-border bg-surface p-4 shadow-[var(--shadow-preclinic-sm)]",
        href && "transition-shadow hover:shadow-[var(--shadow-preclinic-card)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        {icon && (
          <span
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-full",
              TONE_BG[tone],
            )}
          >
            {icon}
          </span>
        )}
        {(delta || caption) && (
          <div className="text-right">
            {delta && (
              <span
                className={cn(
                  "inline-flex rounded px-1.5 py-0.5 text-[12px] font-medium text-white",
                  TONE_BG[delta.tone ?? "success"],
                )}
              >
                {delta.value}
              </span>
            )}
            {caption && <p className="m-0 mt-1 text-[12px] text-muted">{caption}</p>}
          </div>
        )}
      </div>
      <div className="flex items-end justify-between gap-2">
        <div className="min-w-0">
          <p className="m-0 truncate text-[13px] text-muted">{label}</p>
          <p className="m-0 mt-0.5 text-2xl font-bold text-heading">{value}</p>
        </div>
        {chart && <div className="shrink-0">{chart}</div>}
      </div>
    </div>
  );

  return href ? (
    <Link href={href} className="block h-full">
      {inner}
    </Link>
  ) : (
    inner
  );
}

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { Tone } from "./Badge";

type Size = "xs" | "sm" | "md" | "lg" | "xl" | "xxl";

const SIZE_CLASSES: Record<Size, string> = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-14 w-14 text-lg",
  xxl: "h-20 w-20 text-2xl",
};

const TONE_BG: Record<Tone, string> = {
  primary: "bg-primary-light text-primary",
  secondary: "bg-secondary-light text-accent",
  accent: "bg-accent-light text-accent",
  info: "bg-info-light text-info",
  success: "bg-success-light text-success",
  warning: "bg-warning-light text-warning",
  danger: "bg-danger-light text-danger",
  neutral: "bg-gray-100 text-muted",
};

export interface AvatarProps {
  src?: string | null;
  alt?: string;
  /** Initiales affichées si pas d'image. */
  initials?: string;
  /** Icône affichée si ni image ni initiales. */
  icon?: ReactNode;
  size?: Size;
  tone?: Tone;
  /** true = cercle, false = coins arrondis 5px (comme le template). */
  rounded?: boolean;
  /** Pastille de présence en bas à droite. */
  status?: "online" | "offline" | null;
  className?: string;
}

export function Avatar({
  src,
  alt = "",
  initials,
  icon,
  size = "md",
  tone = "primary",
  rounded = true,
  status = null,
  className,
}: AvatarProps) {
  const shape = rounded ? "rounded-full" : "rounded-[5px]";
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden font-semibold uppercase",
        SIZE_CLASSES[size],
        shape,
        !src && TONE_BG[tone],
        className,
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className={cn("h-full w-full object-cover", shape)} />
      ) : initials ? (
        initials.slice(0, 2)
      ) : (
        icon
      )}
      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-surface",
            status === "online" ? "bg-success" : "bg-gray-400",
          )}
        />
      )}
    </span>
  );
}

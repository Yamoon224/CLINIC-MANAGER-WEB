import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant =
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warning"
  | "danger"
  | "light"
  | "outline"
  | "ghost"
  | "gradient";

type Size = "sm" | "md" | "lg";

/* Rendu .btn du template : inline-flex, 12px/600, padding 6/10, radius 5px. */
const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-primary-hover border border-primary",
  secondary:
    "bg-secondary text-white hover:bg-secondary-hover border border-secondary",
  success: "bg-success text-white hover:brightness-95 border border-success",
  info: "bg-info text-white hover:brightness-95 border border-info",
  warning: "bg-warning text-white hover:brightness-95 border border-warning",
  danger: "bg-danger text-white hover:brightness-95 border border-danger",
  light:
    "bg-light text-heading hover:bg-gray-200 border border-border dark:bg-gray-100",
  outline:
    "bg-surface text-heading hover:bg-light border border-border",
  ghost: "bg-transparent text-heading hover:bg-light border border-transparent",
  gradient:
    "text-white border-0 bg-[linear-gradient(90deg,#2E37A4_0%,#0E9384_100%)] hover:bg-[linear-gradient(90deg,#0E9384_0%,#2E37A4_100%)]",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "text-xs px-2.5 py-1.5 gap-1.5",
  md: "text-[13px] px-3 py-2 gap-1.5",
  lg: "text-sm px-3.5 py-2.5 gap-2",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "primary", size = "md", className = "", icon, children, ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-[5px] font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none",
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          className,
        )}
        {...props}
      >
        {icon}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";

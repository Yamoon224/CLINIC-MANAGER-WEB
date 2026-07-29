import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-hover shadow-sm shadow-primary/20",
  secondary:
    "bg-primary-light text-primary hover:bg-primary/15",
  outline:
    "border border-border bg-surface text-foreground hover:bg-primary-light/60",
  ghost: "text-foreground hover:bg-primary-light/60",
  danger: "bg-danger text-white hover:bg-danger/90 shadow-sm shadow-danger/20",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "text-xs px-2.5 py-1.5 gap-1.5",
  md: "text-sm px-4 py-2 gap-2",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

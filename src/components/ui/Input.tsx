import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className = "", ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={`w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted/70 outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60 ${className}`}
      {...props}
    />
  );
});
Input.displayName = "Input";

import { forwardRef } from "react";
import type { SelectHTMLAttributes } from "react";

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(({ className = "", children, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={`w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
});
Select.displayName = "Select";

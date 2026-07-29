import { forwardRef } from "react";
import type { TextareaHTMLAttributes } from "react";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className = "", ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={`w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted/70 outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60 ${className}`}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

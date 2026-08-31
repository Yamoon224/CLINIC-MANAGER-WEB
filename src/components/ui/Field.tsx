import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/* Champ de formulaire au format "stacked" du template :
   label.form-label (13px / medium / heading) + astérisque danger + contrôle + hint. */
export function Field({
  label,
  required,
  hint,
  error,
  htmlFor,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string | null;
  htmlFor?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="text-[13px] font-medium text-heading"
      >
        {label}
        {required && <span className="ms-1 text-danger">*</span>}
      </label>
      {children}
      {error ? (
        <span className="text-xs text-danger">{error}</span>
      ) : hint ? (
        <span className="text-xs text-muted">{hint}</span>
      ) : null}
    </div>
  );
}

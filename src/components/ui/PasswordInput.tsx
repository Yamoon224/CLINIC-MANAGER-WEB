"use client";

import { forwardRef, useState } from "react";
import type { InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export const PasswordInput = forwardRef<
  HTMLInputElement,
  Omit<InputHTMLAttributes<HTMLInputElement>, "type">
>(({ className = "", ...props }, ref) => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        ref={ref}
        type={visible ? "text" : "password"}
        className={`w-full rounded-lg border border-border bg-surface px-3 py-2 pr-10 text-sm text-foreground placeholder:text-muted/70 outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60 ${className}`}
        {...props}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setVisible((v) => !v)}
        aria-label={t(visible ? "auth.hidePassword" : "auth.showPassword")}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-muted hover:text-foreground"
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
});
PasswordInput.displayName = "PasswordInput";

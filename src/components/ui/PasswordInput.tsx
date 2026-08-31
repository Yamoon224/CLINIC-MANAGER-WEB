"use client";

import { forwardRef, useState } from "react";
import type { InputHTMLAttributes } from "react";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { CONTROL_CLASS } from "./control-styles";

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
        className={cn(CONTROL_CLASS, "pr-10", className)}
        {...props}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setVisible((v) => !v)}
        aria-label={t(visible ? "auth.hidePassword" : "auth.showPassword")}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-muted hover:text-heading"
      >
        {visible ? <IconEyeOff size={18} /> : <IconEye size={18} />}
      </button>
    </div>
  );
});
PasswordInput.displayName = "PasswordInput";

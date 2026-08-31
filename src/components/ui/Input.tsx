import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { CONTROL_CLASS } from "./control-styles";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className = "", ...props }, ref) => {
  return (
    <input ref={ref} className={cn(CONTROL_CLASS, className)} {...props} />
  );
});
Input.displayName = "Input";

import { forwardRef } from "react";
import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { CONTROL_CLASS } from "./control-styles";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className = "", ...props }, ref) => {
  return (
    <textarea ref={ref} className={cn(CONTROL_CLASS, className)} {...props} />
  );
});
Textarea.displayName = "Textarea";

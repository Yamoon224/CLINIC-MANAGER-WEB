import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { IconCalendar } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { CONTROL_CLASS } from "./control-styles";

/* Champ date avec addon calendrier (input-icon-end du template).
   Utilise l'input date natif — évite une dépendance flatpickr côté client. */
export const DateInput = forwardRef<
  HTMLInputElement,
  Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
    type?: "date" | "datetime-local" | "time" | "month";
  }
>(({ className = "", type = "date", ...props }, ref) => {
  return (
    <div className="relative">
      <input
        ref={ref}
        type={type}
        className={cn(CONTROL_CLASS, "pr-9 [&::-webkit-calendar-picker-indicator]:opacity-0", className)}
        {...props}
      />
      <IconCalendar
        size={16}
        className="pointer-events-none absolute inset-y-0 right-3 my-auto text-muted"
      />
    </div>
  );
});
DateInput.displayName = "DateInput";

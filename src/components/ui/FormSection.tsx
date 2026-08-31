import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/* En-tête de section de formulaire (.feild-head du template) :
   bandeau clair + titre gras, suivi des champs. */
export function FormSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("mb-2", className)}>
      <div className="mb-4 rounded-[5px] bg-light px-3 py-2 dark:bg-gray-100">
        <h6 className="m-0 text-sm font-bold text-heading">{title}</h6>
        {description && (
          <p className="m-0 mt-0.5 text-xs text-muted">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

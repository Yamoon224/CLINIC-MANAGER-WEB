import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

/* .card du template : bordure 1px, radius 5px, fond surface, ombre douce.
   Le padding p-5 par défaut reste surchargeable via `className`
   (ex : <Card className="p-0 overflow-hidden"> pour envelopper une table). */
export function Card({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[5px] border border-border bg-surface p-5 shadow-[var(--shadow-preclinic-sm)]",
        className,
      )}
      {...props}
    />
  );
}

/* En-tête .card-header : à utiliser avec <Card className="p-0">. */
export function CardHeader({
  title,
  icon,
  actions,
  className = "",
  children,
}: {
  title?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 border-b border-border px-5 py-3.5",
        className,
      )}
    >
      {children ?? (
        <h3 className="m-0 flex items-center gap-1.5 text-[15px] font-semibold text-heading">
          {icon}
          {title}
        </h3>
      )}
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function CardBody({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5", className)} {...props} />;
}

export function CardFooter({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("border-t border-border px-5 py-3", className)}
      {...props}
    />
  );
}

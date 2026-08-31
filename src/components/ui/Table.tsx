import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

/* Wrapper de table simple au rendu du template (.table-responsive > table.table). */
export function Table({
  children,
  className,
  nowrap = true,
}: {
  children: ReactNode;
  className?: string;
  nowrap?: boolean;
}) {
  return (
    <div className="preclinic-scroll -mx-px overflow-x-auto">
      <table className={cn("table", nowrap && "table-nowrap", className)}>
        {children}
      </table>
    </div>
  );
}

export function Th({
  className,
  ...props
}: HTMLAttributes<HTMLTableCellElement>) {
  return <th className={className} {...props} />;
}

export function Td({
  className,
  ...props
}: HTMLAttributes<HTMLTableCellElement>) {
  return <td className={className} {...props} />;
}

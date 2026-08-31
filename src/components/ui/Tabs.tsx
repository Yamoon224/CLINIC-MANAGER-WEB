"use client";

import { cn } from "@/lib/cn";

export interface TabItem {
  key: string;
  label: string;
}

/* nav nav-tabs nav-bordered du template : onglets soulignés, actif en primary. */
export function Tabs({
  tabs,
  active,
  onChange,
  className,
}: {
  tabs: TabItem[];
  active: string;
  onChange: (key: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-6 border-b border-border", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={cn(
            "-mb-px border-b-2 px-1 pb-2.5 text-sm font-medium transition-colors",
            active === tab.key
              ? "border-primary text-primary"
              : "border-transparent text-muted hover:text-heading",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

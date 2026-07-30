"use client";

export interface TabItem {
  key: string;
  label: string;
}

export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: TabItem[];
  active: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 border-b border-border">
      {tabs.map((tabItem) => (
        <button
          key={tabItem.key}
          type="button"
          onClick={() => onChange(tabItem.key)}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            active === tabItem.key
              ? "border-b-2 border-primary text-primary"
              : "text-muted hover:text-foreground"
          }`}
        >
          {tabItem.label}
        </button>
      ))}
    </div>
  );
}

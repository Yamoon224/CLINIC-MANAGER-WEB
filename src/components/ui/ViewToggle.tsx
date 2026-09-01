"use client";

import { useState } from "react";
import { IconLayoutGrid, IconList } from "@tabler/icons-react";
import { cn } from "@/lib/cn";

export type ViewMode = "list" | "grid";

/**
 * Bascule liste / grille (cartes), reproduit le sélecteur du template.
 * L'état est mémorisé par `storageKey` pour retrouver la préférence
 * (init paresseux, même schéma que le repli de la sidebar).
 */
export function useViewMode(storageKey: string, initial: ViewMode = "list") {
  const [mode, setMode] = useState<ViewMode>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const saved = window.localStorage.getItem(storageKey);
      return saved === "list" || saved === "grid" ? saved : initial;
    } catch {
      return initial;
    }
  });

  function change(next: ViewMode) {
    setMode(next);
    try {
      window.localStorage.setItem(storageKey, next);
    } catch {
      /* ignore */
    }
  }

  return [mode, change] as const;
}

export function ViewToggle({
  mode,
  onChange,
  listLabel = "Liste",
  gridLabel = "Cartes",
}: {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
  listLabel?: string;
  gridLabel?: string;
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-[5px] border border-border bg-surface p-1">
      <button
        type="button"
        onClick={() => onChange("list")}
        aria-label={listLabel}
        aria-pressed={mode === "list"}
        className={cn(
          "inline-flex h-7 w-7 items-center justify-center rounded",
          mode === "list" ? "bg-primary text-white" : "text-muted hover:bg-light",
        )}
      >
        <IconList size={15} />
      </button>
      <button
        type="button"
        onClick={() => onChange("grid")}
        aria-label={gridLabel}
        aria-pressed={mode === "grid"}
        className={cn(
          "inline-flex h-7 w-7 items-center justify-center rounded",
          mode === "grid" ? "bg-primary text-white" : "text-muted hover:bg-light",
        )}
      >
        <IconLayoutGrid size={15} />
      </button>
    </div>
  );
}

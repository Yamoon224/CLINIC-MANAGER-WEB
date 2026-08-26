"use client";

import {
  Children,
  forwardRef,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode, SelectHTMLAttributes } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useClickOutside } from "@/lib/useClickOutside";

interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}

function extractOptions(children: ReactNode): Option[] {
  return Children.toArray(children).flatMap((child): Option[] => {
    if (!isValidElement(child)) return [];
    const props = child.props as {
      value?: unknown;
      children?: ReactNode;
      disabled?: boolean;
    };
    if (child.type !== "option") return [];
    return [
      {
        value: props.value === undefined ? "" : String(props.value),
        label:
          typeof props.children === "string"
            ? props.children
            : String(props.children ?? ""),
        disabled: props.disabled,
      },
    ];
  });
}

export const Select = forwardRef<
  HTMLButtonElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(
  (
    { className = "", children, value, onChange, disabled, id, name, required },
    ref,
  ) => {
    const options = useMemo(() => extractOptions(children), [children]);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [activeIndex, setActiveIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    useClickOutside(containerRef, () => setOpen(false));

    const selected = options.find((o) => o.value === String(value ?? ""));

    const filtered = useMemo(() => {
      if (!query.trim()) return options;
      const q = query.trim().toLowerCase();
      return options.filter((o) => o.label.toLowerCase().includes(q));
    }, [options, query]);

    useEffect(() => {
      if (open) {
        setQuery("");
        setActiveIndex(0);
        requestAnimationFrame(() => searchRef.current?.focus());
      }
    }, [open]);

    function selectOption(option: Option) {
      if (option.disabled) return;
      onChange?.({
        target: { value: option.value, name },
      } as unknown as React.ChangeEvent<HTMLSelectElement>);
      setOpen(false);
    }

    function handleKeyDown(event: React.KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        const option = filtered[activeIndex];
        if (option) selectOption(option);
      }
    }

    return (
      <div className={`relative ${className || "w-full"}`} ref={containerRef}>
        <button
          ref={ref}
          type="button"
          id={id}
          disabled={disabled}
          aria-required={required}
          onClick={() => !disabled && setOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-lg border border-border bg-surface px-3 py-2 text-left text-sm text-foreground outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
        >
          <span className={`truncate ${selected ? "" : "text-muted"}`}>
            {selected?.label || "Sélectionner..."}
          </span>
          <ChevronDown size={16} className="shrink-0 text-muted" />
        </button>
        {open && (
          <div className="absolute left-0 right-0 z-40 mt-1 overflow-hidden rounded-lg border border-border bg-surface shadow-lg">
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Rechercher..."
              className="w-full border-b border-border px-3 py-2 text-sm outline-none"
            />
            <ul className="max-h-56 overflow-y-auto py-1">
              {filtered.length === 0 && (
                <li className="px-3 py-2 text-sm text-muted">
                  Aucun résultat.
                </li>
              )}
              {filtered.map((option, index) => (
                <li key={option.value}>
                  <button
                    type="button"
                    disabled={option.disabled}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => selectOption(option)}
                    className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm disabled:opacity-50 ${
                      index === activeIndex
                        ? "bg-primary-light text-primary"
                        : "text-foreground"
                    }`}
                  >
                    <span className="truncate">{option.label}</span>
                    {option.value === selected?.value && (
                      <Check size={14} className="shrink-0" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  },
);
Select.displayName = "Select";

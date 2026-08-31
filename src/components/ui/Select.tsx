"use client";

import {
  Children,
  forwardRef,
  isValidElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import type { ReactNode, SelectHTMLAttributes } from "react";
import { IconCheck, IconChevronDown } from "@tabler/icons-react";
import { cn } from "@/lib/cn";

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
    const [menuRect, setMenuRect] = useState<{
      top: number;
      left: number;
      width: number;
    } | null>(null);

    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    const setTrigger = useCallback(
      (node: HTMLButtonElement | null) => {
        triggerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    const selected = options.find((o) => o.value === String(value ?? ""));

    const filtered = useMemo(() => {
      if (!query.trim()) return options;
      const q = query.trim().toLowerCase();
      return options.filter((o) => o.label.toLowerCase().includes(q));
    }, [options, query]);

    const reposition = useCallback(() => {
      const el = triggerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setMenuRect({ top: r.bottom + 4, left: r.left, width: r.width });
    }, []);

    useLayoutEffect(() => {
      if (!open) return;
      reposition();
    }, [open, reposition]);

    useEffect(() => {
      if (!open) return;
      setQuery("");
      setActiveIndex(0);
      requestAnimationFrame(() => searchRef.current?.focus());

      function onScrollOrResize() {
        reposition();
      }
      function onPointerDown(e: MouseEvent) {
        const t = e.target as Node;
        if (
          !triggerRef.current?.contains(t) &&
          !menuRef.current?.contains(t)
        ) {
          setOpen(false);
        }
      }
      window.addEventListener("scroll", onScrollOrResize, true);
      window.addEventListener("resize", onScrollOrResize);
      document.addEventListener("mousedown", onPointerDown);
      return () => {
        window.removeEventListener("scroll", onScrollOrResize, true);
        window.removeEventListener("resize", onScrollOrResize);
        document.removeEventListener("mousedown", onPointerDown);
      };
    }, [open, reposition]);

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
      <div className={cn("relative", className || "w-full")}>
        <button
          ref={setTrigger}
          type="button"
          id={id}
          disabled={disabled}
          aria-required={required}
          onClick={() => !disabled && setOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-[5px] border border-border bg-surface px-3 py-2 text-left text-sm text-heading outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-60"
        >
          <span className={cn("truncate", !selected && "text-muted")}>
            {selected?.label || "Sélectionner..."}
          </span>
          <IconChevronDown size={16} className="shrink-0 text-muted" />
        </button>

        {open &&
          menuRect &&
          typeof document !== "undefined" &&
          createPortal(
            <div
              ref={menuRef}
              style={{
                position: "fixed",
                top: menuRect.top,
                left: menuRect.left,
                width: menuRect.width,
              }}
              className="z-[70] overflow-hidden rounded-[5px] border border-border bg-surface shadow-[var(--shadow-preclinic-lg)]"
            >
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Rechercher..."
                className="w-full border-b border-border bg-surface px-3 py-2 text-sm outline-none"
              />
              <ul className="preclinic-scroll max-h-56 overflow-y-auto py-1">
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
                      className={cn(
                        "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm disabled:opacity-50",
                        index === activeIndex
                          ? "bg-primary-light text-primary"
                          : "text-heading",
                      )}
                    >
                      <span className="truncate">{option.label}</span>
                      {option.value === selected?.value && (
                        <IconCheck size={14} className="shrink-0" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>,
            document.body,
          )}
      </div>
    );
  },
);
Select.displayName = "Select";

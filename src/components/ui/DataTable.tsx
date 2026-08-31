"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  IconChevronLeft,
  IconChevronRight,
  IconSearch,
} from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export interface Column<T> {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
  headClassName?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T) => string | number;
  /** Pagination serveur. */
  page: number;
  perPage: number;
  total: number;
  onPageChange: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
  perPageOptions?: number[];
  /** Recherche : si fourni, affiche le champ de recherche. */
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  loading?: boolean;
  emptyLabel?: string;
  /** Slots à droite de la barre d'outils (Filtres, Tri…). */
  toolbarRight?: ReactNode;
  onRowClick?: (row: T) => void;
}

function pageWindow(current: number, last: number): (number | "…")[] {
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1);
  const out: (number | "…")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(last - 1, current + 1);
  if (start > 2) out.push("…");
  for (let i = start; i <= end; i++) out.push(i);
  if (end < last - 1) out.push("…");
  out.push(last);
  return out;
}

export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  page,
  perPage,
  total,
  onPageChange,
  onPerPageChange,
  perPageOptions = [10, 20, 30, 50],
  search,
  onSearchChange,
  searchPlaceholder,
  loading = false,
  emptyLabel,
  toolbarRight,
  onRowClick,
}: DataTableProps<T>) {
  const { t } = useTranslation();
  const [localSearch, setLocalSearch] = useState(search ?? "");

  useEffect(() => {
    setLocalSearch(search ?? "");
  }, [search]);

  useEffect(() => {
    if (!onSearchChange) return;
    const handle = setTimeout(() => {
      if (localSearch !== (search ?? "")) onSearchChange(localSearch);
    }, 300);
    return () => clearTimeout(handle);
  }, [localSearch, onSearchChange, search]);

  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  return (
    <div className="flex flex-col gap-3">
      {/* Barre d'outils */}
      {(onSearchChange || toolbarRight) && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          {onSearchChange ? (
            <div className="relative w-full max-w-xs">
              <IconSearch
                size={16}
                className="pointer-events-none absolute inset-y-0 left-3 my-auto text-muted"
              />
              <input
                type="search"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder={searchPlaceholder ?? t("common.datatable.search")}
                className="w-full rounded-[5px] border border-border bg-surface py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </div>
          ) : (
            <span />
          )}
          {toolbarRight && (
            <div className="flex flex-wrap items-center gap-2">{toolbarRight}</div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="preclinic-scroll overflow-x-auto rounded-[5px] border border-border">
        <table className="table table-nowrap">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} className={col.headClassName}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={getRowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={onRowClick ? "cursor-pointer" : undefined}
              >
                {columns.map((col) => (
                  <td key={col.key} className={col.className}>
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="!py-10 text-center text-sm text-muted"
                >
                  {loading
                    ? t("common.loading")
                    : (emptyLabel ?? t("common.datatable.empty"))}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Barre basse */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-[13px] text-muted">
        <div className="flex items-center gap-2">
          {onPerPageChange && (
            <>
              <span>{t("common.datatable.rowsPerPage")}</span>
              <select
                value={perPage}
                onChange={(e) => onPerPageChange(Number(e.target.value))}
                className="rounded-[5px] border border-border bg-surface px-2 py-1 text-[13px] outline-none focus:border-primary"
              >
                {perPageOptions.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </>
          )}
          <span>
            {t("common.datatable.range", { from, to, total })}
          </span>
        </div>

        {lastPage > 1 && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="inline-flex h-7 w-7 items-center justify-center rounded-[5px] border border-border text-muted disabled:opacity-40 hover:enabled:bg-light"
              aria-label={t("common.previous")}
            >
              <IconChevronLeft size={15} />
            </button>
            {pageWindow(page, lastPage).map((p, i) =>
              p === "…" ? (
                <span key={`e${i}`} className="px-1">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => onPageChange(p)}
                  className={cn(
                    "inline-flex h-7 min-w-7 items-center justify-center rounded-[5px] border px-1.5 text-[13px]",
                    p === page
                      ? "border-primary bg-primary text-white"
                      : "border-border text-muted hover:bg-light",
                  )}
                >
                  {p}
                </button>
              ),
            )}
            <button
              type="button"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= lastPage}
              className="inline-flex h-7 w-7 items-center justify-center rounded-[5px] border border-border text-muted disabled:opacity-40 hover:enabled:bg-light"
              aria-label={t("common.next")}
            >
              <IconChevronRight size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

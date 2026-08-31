"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  IconChevronDown,
  IconLayoutGrid,
  IconList,
} from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { downloadFile } from "@/lib/download";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { Dropdown, DropdownItem } from "./Dropdown";

export function PageHeader({
  title,
  description,
  total,
  actions,
  exportPdfPath,
  exportCsvPath,
  exportFilename = "export",
  viewToggle,
  className,
}: {
  title: string;
  description?: string;
  /** Badge "Total : N" à côté du titre (comme le template). */
  total?: number | string;
  actions?: ReactNode;
  exportPdfPath?: string;
  exportCsvPath?: string;
  exportFilename?: string;
  viewToggle?: { current: "list" | "grid"; listHref: string; gridHref: string };
  className?: string;
}) {
  const { t } = useTranslation();
  const hasExport = Boolean(exportPdfPath || exportCsvPath);

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-b border-border pb-3 sm:flex-row sm:items-center",
        className,
      )}
    >
      <div className="flex-1">
        <h4 className="m-0 flex flex-wrap items-center gap-2 text-lg font-bold text-heading">
          {title}
          {total != null && (
            <span className="rounded border border-primary/60 bg-primary-light px-2 py-0.5 text-[13px] font-medium text-primary">
              {typeof total === "number"
                ? t("common.datatable.total", { total })
                : total}
            </span>
          )}
        </h4>
        {description && <p className="m-0 mt-1 text-[13px] text-muted">{description}</p>}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {hasExport && (
          <Dropdown
            align="end"
            width="sm"
            trigger={({ toggle }) => (
              <button
                type="button"
                onClick={toggle}
                className="inline-flex items-center gap-1.5 rounded-[5px] border border-border bg-surface px-3 py-2 text-[13px] text-heading hover:bg-light"
              >
                {t("common.datatable.export")}
                <IconChevronDown size={14} />
              </button>
            )}
          >
            {exportPdfPath && (
              <DropdownItem
                onClick={() =>
                  downloadFile(exportPdfPath, `${exportFilename}.pdf`, "application/pdf")
                }
              >
                {t("common.datatable.exportPdf")}
              </DropdownItem>
            )}
            {exportCsvPath && (
              <DropdownItem
                onClick={() =>
                  downloadFile(exportCsvPath, `${exportFilename}.csv`, "text/csv")
                }
              >
                {t("common.datatable.exportExcel")}
              </DropdownItem>
            )}
          </Dropdown>
        )}

        {viewToggle && (
          <div className="flex items-center gap-1 rounded-[5px] border border-border bg-surface p-1">
            <Link
              href={viewToggle.listHref}
              className={cn(
                "rounded p-1",
                viewToggle.current === "list" ? "bg-light text-heading" : "text-muted",
              )}
              aria-label="Liste"
            >
              <IconList size={15} />
            </Link>
            <Link
              href={viewToggle.gridHref}
              className={cn(
                "rounded p-1",
                viewToggle.current === "grid" ? "bg-light text-heading" : "text-muted",
              )}
              aria-label="Grille"
            >
              <IconLayoutGrid size={15} />
            </Link>
          </div>
        )}

        {actions}
      </div>
    </div>
  );
}

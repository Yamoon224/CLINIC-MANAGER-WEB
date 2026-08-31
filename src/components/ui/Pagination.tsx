"use client";

import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const { t } = useTranslation();

  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center justify-center gap-3 py-2 text-[13px] text-muted">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="inline-flex h-7 w-7 items-center justify-center rounded-[5px] border border-border disabled:opacity-40 hover:enabled:bg-light"
        aria-label={t("common.previous")}
      >
        <IconChevronLeft size={15} />
      </button>
      <span>{t("common.pageOf", { page, total: totalPages })}</span>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="inline-flex h-7 w-7 items-center justify-center rounded-[5px] border border-border disabled:opacity-40 hover:enabled:bg-light"
        aria-label={t("common.next")}
      >
        <IconChevronRight size={15} />
      </button>
    </nav>
  );
}

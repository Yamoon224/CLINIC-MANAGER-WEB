"use client";

import { useTranslation } from "@/lib/i18n/LanguageContext";
import { Button } from "./Button";

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
    <nav className="flex items-center justify-center gap-4 py-3">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        {t("common.previous")}
      </Button>
      <span className="text-sm text-muted">
        {t("common.pageOf", { page, total: totalPages })}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        {t("common.next")}
      </Button>
    </nav>
  );
}

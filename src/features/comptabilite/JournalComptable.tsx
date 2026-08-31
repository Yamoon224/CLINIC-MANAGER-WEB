"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchJournal } from "./comptabilite-api";
import { fcfa, formatDate } from "./format";
import type { EcritureComptable } from "./types";
import {
  Badge,
  CsvButton,
  DataTable,
  DateInput,
  Field,
  Select,
  type Column,
} from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

const JOURNAUX = ["ventes", "caisse", "achats", "paie", "od"] as const;

export function JournalComptable() {
  const { t } = useTranslation();
  const [rows, setRows] = useState<EcritureComptable[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [journal, setJournal] = useState("");

  const load = useCallback(() => {
    fetchJournal({
      page,
      from: from || undefined,
      to: to || undefined,
      journal: journal || undefined,
    })
      .then((res) => {
        setRows(res.data);
        setTotal(res.meta.total);
      })
      .finally(() => setLoading(false));
  }, [page, from, to, journal]);

  useEffect(() => {
    load();
  }, [load]);

  const csvQuery = new URLSearchParams();
  if (from) csvQuery.set("from", from);
  if (to) csvQuery.set("to", to);
  if (journal) csvQuery.set("journal", journal);

  const columns: Column<EcritureComptable>[] = [
    {
      key: "date",
      header: t("comptabilite.journal.colDate"),
      cell: (e) => formatDate(e.date),
    },
    {
      key: "journal",
      header: t("comptabilite.journal.colJournal"),
      cell: (e) => (
        <Badge tone="neutral">{t(`comptabilite.journal.j.${e.journal}`)}</Badge>
      ),
    },
    {
      key: "libelle",
      header: t("comptabilite.journal.colLibelle"),
      cell: (e) => e.libelle,
    },
    {
      key: "debit",
      header: t("comptabilite.journal.colDebit"),
      className: "text-right",
      headClassName: "text-right",
      cell: (e) => (Number(e.debit) > 0 ? fcfa(e.debit) : ""),
    },
    {
      key: "credit",
      header: t("comptabilite.journal.colCredit"),
      className: "text-right",
      headClassName: "text-right",
      cell: (e) => (Number(e.credit) > 0 ? fcfa(e.credit) : ""),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <Field label={t("comptabilite.journal.du")}>
          <DateInput value={from} onChange={(e) => setFrom(e.target.value)} />
        </Field>
        <Field label={t("comptabilite.journal.au")}>
          <DateInput value={to} onChange={(e) => setTo(e.target.value)} />
        </Field>
        <Field label={t("comptabilite.journal.colJournal")}>
          <Select value={journal} onChange={(e) => setJournal(e.target.value)}>
            <option value="">{t("comptabilite.journal.tous")}</option>
            {JOURNAUX.map((j) => (
              <option key={j} value={j}>
                {t(`comptabilite.journal.j.${j}`)}
              </option>
            ))}
          </Select>
        </Field>
        <CsvButton
          path={`/comptabilite/journal/export.csv?${csvQuery}`}
          label={t("comptabilite.journal.export")}
          filename="journal-comptable.csv"
        />
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        getRowKey={(e) => e.id}
        page={page}
        perPage={30}
        total={total}
        onPageChange={setPage}
        loading={loading}
        emptyLabel={t("comptabilite.journal.vide")}
      />
    </div>
  );
}

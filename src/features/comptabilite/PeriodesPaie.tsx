"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IconCalendarPlus } from "@tabler/icons-react";
import { fetchPeriodesPaie, genererPeriode } from "./comptabilite-api";
import { fcfa, formatMonth } from "./format";
import type { PeriodePaie, PeriodeStatut } from "./types";
import {
  Badge,
  Button,
  DataTable,
  DateInput,
  Field,
  Modal,
  type Column,
  type Tone,
} from "@/components/ui";
import { apiErrorMessage } from "@/lib/api-client";
import { useTranslation } from "@/lib/i18n/LanguageContext";

const STATUT_TONE: Record<PeriodeStatut, Tone> = {
  brouillon: "warning",
  validee: "primary",
  cloturee: "success",
};

export function PeriodesPaie() {
  const { t } = useTranslation();
  const router = useRouter();
  const [rows, setRows] = useState<PeriodePaie[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [mois, setMois] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    fetchPeriodesPaie(page)
      .then((res) => {
        setRows(res.data);
        setTotal(res.meta.total);
      })
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleGenerer(e: React.FormEvent) {
    e.preventDefault();
    if (!mois) return;
    setBusy(true);
    setError(null);
    try {
      const res = await genererPeriode(mois);
      setShowForm(false);
      setMois("");
      router.push(`/comptabilite/paie/${res.data.id}`);
    } catch (err) {
      setError(apiErrorMessage(err, t("comptabilite.paie.genererError")));
    } finally {
      setBusy(false);
    }
  }

  const STATUT_LABELS: Record<PeriodeStatut, string> = {
    brouillon: t("comptabilite.paie.statutBrouillon"),
    validee: t("comptabilite.paie.statutValidee"),
    cloturee: t("comptabilite.paie.statutCloturee"),
  };

  const columns: Column<PeriodePaie>[] = [
    {
      key: "mois",
      header: t("comptabilite.paie.colPeriode"),
      cell: (p) => (
        <span className="font-semibold capitalize text-heading">
          {formatMonth(p.mois)}
        </span>
      ),
    },
    {
      key: "bulletins",
      header: t("comptabilite.paie.colBulletins"),
      cell: (p) => p.bulletins_count ?? 0,
    },
    {
      key: "masse",
      header: t("comptabilite.paie.colMasse"),
      cell: (p) =>
        p.masse_salariale != null ? fcfa(p.masse_salariale) : "—",
    },
    {
      key: "statut",
      header: t("common.status"),
      cell: (p) => (
        <Badge tone={STATUT_TONE[p.statut]} border>
          {STATUT_LABELS[p.statut]}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      headClassName: "text-right",
      cell: (p) => (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/comptabilite/paie/${p.id}`)}
          >
            {t("common.view")}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        rows={rows}
        getRowKey={(p) => p.id}
        page={page}
        perPage={24}
        total={total}
        onPageChange={setPage}
        loading={loading}
        emptyLabel={t("comptabilite.paie.listeVide")}
        toolbarRight={
          <Button
            icon={<IconCalendarPlus size={15} />}
            onClick={() => setShowForm(true)}
          >
            {t("comptabilite.paie.generer")}
          </Button>
        }
      />

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={t("comptabilite.paie.generer")}
        size="sm"
      >
        <form onSubmit={handleGenerer} className="flex flex-col gap-4">
          <Field label={t("comptabilite.paie.mois")} required>
            <DateInput value={mois} onChange={(e) => setMois(e.target.value)} />
          </Field>
          {error && <p className="text-sm text-danger">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="light"
              onClick={() => setShowForm(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={busy || !mois}>
              {t("comptabilite.paie.generer")}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

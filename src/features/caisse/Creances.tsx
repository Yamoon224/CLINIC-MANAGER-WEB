"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { IconAlertTriangle, IconWallet } from "@tabler/icons-react";
import { fetchCreances } from "./caisse-api";
import type { Facture } from "./types";
import {
  CsvButton,
  DataTable,
  DateInput,
  Field,
  StatCard,
  type Column,
} from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export function Creances() {
  const { t } = useTranslation();
  const [creances, setCreances] = useState<Facture[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");

  useEffect(() => {
    fetchCreances(page)
      .then((res) => {
        setCreances(res.data);
        setTotal(res.meta.total);
      })
      .finally(() => setLoading(false));
  }, [page]);

  const montantPage = creances.reduce((sum, f) => sum + Number(f.solde), 0);

  const exportParams = new URLSearchParams();
  if (dateDebut) exportParams.set("from", dateDebut);
  if (dateFin) exportParams.set("to", dateFin);

  const columns: Column<Facture>[] = [
    {
      key: "patient",
      header: t("caisse.creances.patient"),
      cell: (f) => `${f.patient.prenom} ${f.patient.nom}`,
    },
    {
      key: "facture",
      header: t("caisse.creances.facture"),
      cell: (f) => (
        <Link
          href={`/factures/${f.id}`}
          className="text-primary hover:underline"
        >
          {t("caisse.factures.label", { id: f.id })}
        </Link>
      ),
    },
    {
      key: "du",
      header: t("caisse.creances.montantDu"),
      className: "font-semibold text-danger",
      cell: (f) => t("caisse.creances.dueSuffix", { montant: f.solde }),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          icon={<IconAlertTriangle size={18} />}
          label={t("caisse.creances.statTotal")}
          value={total}
          tone="danger"
        />
        <StatCard
          icon={<IconWallet size={18} />}
          label={t("caisse.creances.statMontantPage")}
          value={`${montantPage.toLocaleString("fr-FR")} F CFA`}
          tone="warning"
        />
      </div>

      <DataTable
        columns={columns}
        rows={creances}
        getRowKey={(f) => f.id}
        page={page}
        perPage={15}
        total={total}
        onPageChange={setPage}
        loading={loading}
        emptyLabel={t("caisse.creances.empty")}
        toolbarRight={
          <>
            <Field label={t("caisse.export.from")}>
              <DateInput
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
              />
            </Field>
            <Field label={t("caisse.export.to")}>
              <DateInput
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
              />
            </Field>
            <CsvButton
              path={`/factures/export.csv?${exportParams}`}
              label={t("caisse.export.csvFactures")}
              filename="factures.csv"
            />
          </>
        }
      />
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertTriangle, Wallet, type LucideIcon } from "lucide-react";
import { fetchCreances } from "./caisse-api";
import type { Facture } from "./types";
import { Card, CsvButton, Field, Input, Pagination } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  tone: "warning" | "danger";
}) {
  const chip = tone === "danger" ? "bg-danger-light text-danger" : "bg-warning-light text-warning";
  return (
    <Card className="flex items-center gap-3 p-4">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${chip}`}>
        <Icon size={18} />
      </span>
      <div className="min-w-0">
        <div className="text-xs font-medium text-muted">{label}</div>
        <div className="mt-1 text-2xl font-semibold text-foreground">{value}</div>
      </div>
    </Card>
  );
}

export function Creances() {
  const { t } = useTranslation();
  const [creances, setCreances] = useState<Facture[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCreances, setTotalCreances] = useState(0);
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");

  useEffect(() => {
    fetchCreances(page).then((res) => {
      setCreances(res.data);
      setTotalPages(res.meta.last_page);
      setTotalCreances(res.meta.total);
    });
  }, [page]);

  const montantPage = creances.reduce((sum, f) => sum + Number(f.solde), 0);

  const exportParams = new URLSearchParams();
  if (dateDebut) exportParams.set("from", dateDebut);
  if (dateFin) exportParams.set("to", dateFin);

  return (
    <div className="flex flex-col gap-4">
      {creances.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            icon={AlertTriangle}
            label={t("caisse.creances.statTotal")}
            value={totalCreances}
            tone="danger"
          />
          <StatCard
            icon={Wallet}
            label={t("caisse.creances.statMontantPage")}
            value={`${montantPage.toLocaleString("fr-FR")} F CFA`}
            tone="warning"
          />
        </div>
      )}
      <div className="flex items-end gap-2">
        <Field label={t("caisse.export.from")}>
          <Input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} />
        </Field>
        <Field label={t("caisse.export.to")}>
          <Input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} />
        </Field>
        <CsvButton
          path={`/factures/export.csv?${exportParams}`}
          label={t("caisse.export.csvFactures")}
          filename="factures.csv"
        />
      </div>
      <Card className="p-0 overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th>{t("caisse.creances.patient")}</th>
              <th>{t("caisse.creances.facture")}</th>
              <th>{t("caisse.creances.montantDu")}</th>
            </tr>
          </thead>
          <tbody>
            {creances.map((f) => (
              <tr key={f.id}>
                <td>
                  {f.patient.prenom} {f.patient.nom}
                </td>
                <td>
                  <Link href={`/factures/${f.id}`} className="text-primary hover:underline">
                    {t("caisse.factures.label", { id: f.id })}
                  </Link>
                </td>
                <td className="font-semibold text-danger">
                  {t("caisse.creances.dueSuffix", { montant: f.solde })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {creances.length === 0 && (
          <p className="text-sm text-muted p-4">{t("caisse.creances.empty")}</p>
        )}
      </Card>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}

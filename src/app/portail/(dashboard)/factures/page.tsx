"use client";

import { useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import { fetchMesFactures } from "@/features/portail/portail-api";
import type { PortailFacture } from "@/features/portail/types";
import { Badge, Card, PageHeader } from "@/components/ui";
import type { Tone } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

const STATUT_TONE: Record<string, Tone> = {
  ouverte: "primary",
  partiellement_payee: "warning",
  payee: "success",
  annulee: "danger",
};

function formatMontant(value: string | number): string {
  return `${Number(value).toLocaleString("fr-FR")} F CFA`;
}

export default function PortailFacturesPage() {
  const { t, locale } = useTranslation();
  const [factures, setFactures] = useState<PortailFacture[] | null>(null);

  useEffect(() => {
    fetchMesFactures().then(setFactures);
  }, []);

  const soldeDu = factures?.reduce((sum, f) => sum + Number(f.solde), 0) ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("portail.factures.title")} />

      {factures !== null && factures.length > 0 && (
        <Card className="flex items-start gap-3 p-4">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              soldeDu > 0 ? "bg-warning-light text-warning" : "bg-success-light text-success"
            }`}
          >
            <Wallet size={18} />
          </span>
          <div>
            <div className="text-xs font-medium text-muted">{t("portail.factures.statSoldeDu")}</div>
            <div
              className={`mt-1 text-2xl font-semibold ${soldeDu > 0 ? "text-warning" : "text-success"}`}
            >
              {formatMontant(soldeDu)}
            </div>
          </div>
        </Card>
      )}

      {factures === null ? (
        <p className="text-sm text-muted">{t("common.loading")}</p>
      ) : factures.length === 0 ? (
        <Card>
          <p className="text-sm text-muted">{t("portail.factures.noResults")}</p>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">{t("portail.factures.table.date")}</th>
                <th className="px-4 py-3">{t("portail.factures.table.total")}</th>
                <th className="px-4 py-3">{t("portail.factures.table.paye")}</th>
                <th className="px-4 py-3">{t("portail.factures.table.solde")}</th>
                <th className="px-4 py-3">{t("portail.factures.table.statut")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {factures.map((f) => (
                <tr key={f.id}>
                  <td className="px-4 py-3 text-muted">
                    {new Date(f.created_at).toLocaleDateString(
                      locale === "en" ? "en-US" : "fr-FR",
                    )}
                  </td>
                  <td className="px-4 py-3">{formatMontant(f.montant_total)}</td>
                  <td className="px-4 py-3">{formatMontant(f.montant_paye)}</td>
                  <td className="px-4 py-3 font-medium">{formatMontant(f.solde)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={STATUT_TONE[f.statut] ?? "neutral"}>
                      {t(`caisse.factureStatut.${f.statut}`)}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

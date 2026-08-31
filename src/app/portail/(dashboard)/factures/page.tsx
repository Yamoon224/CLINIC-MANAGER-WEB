"use client";

import { useEffect, useState } from "react";
import { IconWallet } from "@tabler/icons-react";
import { fetchMesFactures } from "@/features/portail/portail-api";
import type { PortailFacture } from "@/features/portail/types";
import { Badge, DataTable, PageHeader, StatCard } from "@/components/ui";
import type { Column, Tone } from "@/components/ui";
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
  const [factures, setFactures] = useState<PortailFacture[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMesFactures()
      .then(setFactures)
      .finally(() => setLoading(false));
  }, []);

  const soldeDu = factures.reduce((sum, f) => sum + Number(f.solde), 0);

  const columns: Column<PortailFacture>[] = [
    {
      key: "date",
      header: t("portail.factures.table.date"),
      cell: (f) =>
        new Date(f.created_at).toLocaleDateString(
          locale === "en" ? "en-US" : "fr-FR",
        ),
    },
    {
      key: "total",
      header: t("portail.factures.table.total"),
      cell: (f) => formatMontant(f.montant_total),
    },
    {
      key: "paye",
      header: t("portail.factures.table.paye"),
      cell: (f) => formatMontant(f.montant_paye),
    },
    {
      key: "solde",
      header: t("portail.factures.table.solde"),
      className: "font-semibold text-heading",
      cell: (f) => formatMontant(f.solde),
    },
    {
      key: "statut",
      header: t("portail.factures.table.statut"),
      cell: (f) => (
        <Badge tone={STATUT_TONE[f.statut] ?? "neutral"} border>
          {t(`caisse.factureStatut.${f.statut}`)}
        </Badge>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("portail.factures.title")} />

      <StatCard
        className="sm:max-w-xs"
        icon={<IconWallet size={18} />}
        label={t("portail.factures.statSoldeDu")}
        value={formatMontant(soldeDu)}
        tone={soldeDu > 0 ? "warning" : "success"}
      />

      <DataTable
        columns={columns}
        rows={factures}
        getRowKey={(f) => f.id}
        loading={loading}
        emptyLabel={t("portail.factures.noResults")}
      />
    </div>
  );
}

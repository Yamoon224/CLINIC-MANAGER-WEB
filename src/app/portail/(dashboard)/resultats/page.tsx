"use client";

import { useEffect, useState } from "react";
import { IconAlertTriangle, IconFlask } from "@tabler/icons-react";
import { fetchMesResultats } from "@/features/portail/portail-api";
import type { PortailResultat } from "@/features/portail/types";
import { Badge, DataTable, PageHeader, StatCard } from "@/components/ui";
import type { Column } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export default function PortailResultatsPage() {
  const { t, locale } = useTranslation();
  const [resultats, setResultats] = useState<PortailResultat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMesResultats()
      .then(setResultats)
      .finally(() => setLoading(false));
  }, []);

  const anormauxCount = resultats.filter(
    (r) => r.resultat_anormal || r.resultat_critique,
  ).length;

  const columns: Column<PortailResultat>[] = [
    {
      key: "analyse",
      header: t("portail.resultats.table.analyse"),
      className: "font-medium text-heading",
      cell: (r) => r.analyse,
    },
    {
      key: "resultat",
      header: t("portail.resultats.table.resultat"),
      cell: (r) => (
        <div>
          <div className="flex items-center gap-2">
            <span>{r.resultat_valeur ?? "-"}</span>
            {r.resultat_critique && (
              <Badge tone="danger" border>
                {t("portail.resultats.critique")}
              </Badge>
            )}
            {!r.resultat_critique && r.resultat_anormal && (
              <Badge tone="warning" border>
                {t("portail.resultats.anormal")}
              </Badge>
            )}
          </div>
          {r.commentaire && (
            <p className="mt-1 text-xs italic text-muted">{r.commentaire}</p>
          )}
        </div>
      ),
    },
    {
      key: "date",
      header: t("portail.resultats.table.date"),
      cell: (r) =>
        r.valide_at
          ? new Date(r.valide_at).toLocaleDateString(
              locale === "en" ? "en-US" : "fr-FR",
            )
          : "-",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("portail.resultats.title")} />

      <div className="grid grid-cols-2 gap-4 sm:max-w-md">
        <StatCard
          icon={<IconFlask size={18} />}
          label={t("portail.resultats.statTotal")}
          value={resultats.length}
          tone="primary"
        />
        <StatCard
          icon={<IconAlertTriangle size={18} />}
          label={t("portail.resultats.statAnormaux")}
          value={anormauxCount}
          tone={anormauxCount > 0 ? "warning" : "success"}
        />
      </div>

      <DataTable
        columns={columns}
        rows={resultats}
        getRowKey={(r) => r.id}
        loading={loading}
        emptyLabel={t("portail.resultats.noResults")}
      />
    </div>
  );
}

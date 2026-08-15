"use client";

import { useEffect, useState } from "react";
import { fetchMesResultats } from "@/features/portail/portail-api";
import type { PortailResultat } from "@/features/portail/types";
import { Badge, Card, PageHeader } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export default function PortailResultatsPage() {
  const { t, locale } = useTranslation();
  const [resultats, setResultats] = useState<PortailResultat[] | null>(null);

  useEffect(() => {
    fetchMesResultats().then(setResultats);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("portail.resultats.title")} />

      {resultats === null ? (
        <p className="text-sm text-muted">{t("common.loading")}</p>
      ) : resultats.length === 0 ? (
        <Card>
          <p className="text-sm text-muted">{t("portail.resultats.noResults")}</p>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">{t("portail.resultats.table.analyse")}</th>
                <th className="px-4 py-3">{t("portail.resultats.table.resultat")}</th>
                <th className="px-4 py-3">{t("portail.resultats.table.date")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {resultats.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3">{r.analyse}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span>{r.resultat_valeur ?? "-"}</span>
                      {r.resultat_critique && (
                        <Badge tone="danger">{t("portail.resultats.critique")}</Badge>
                      )}
                      {!r.resultat_critique && r.resultat_anormal && (
                        <Badge tone="warning">{t("portail.resultats.anormal")}</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {r.valide_at
                      ? new Date(r.valide_at).toLocaleDateString(
                          locale === "en" ? "en-US" : "fr-FR",
                        )
                      : "-"}
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

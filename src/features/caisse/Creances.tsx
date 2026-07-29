"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchCreances } from "./caisse-api";
import type { Facture } from "./types";
import { Card, Pagination } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export function Creances() {
  const { t } = useTranslation();
  const [creances, setCreances] = useState<Facture[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCreances(page).then((res) => {
      setCreances(res.data);
      setTotalPages(res.meta.last_page);
    });
  }, [page]);

  return (
    <div className="flex flex-col gap-4">
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

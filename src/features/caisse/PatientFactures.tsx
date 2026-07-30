"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FacturationAction } from "./FacturationAction";
import { fetchPatientFactures } from "./caisse-api";
import type { Facture } from "./types";
import { Badge, Button, Modal, Pagination } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

const STATUT_TONES: Record<Facture["statut"], "primary" | "warning" | "success" | "neutral"> = {
  ouverte: "primary",
  partiellement_payee: "warning",
  payee: "success",
  annulee: "neutral",
};

export function PatientFactures({ patientId }: { patientId: number }) {
  const { t } = useTranslation();
  const [factures, setFactures] = useState<Facture[] | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFacturation, setShowFacturation] = useState(false);

  useEffect(() => {
    fetchPatientFactures(patientId, page).then((res) => {
      setFactures(res.data);
      setTotalPages(res.meta.last_page);
    });
  }, [patientId, page]);

  if (factures === null) return null;

  return (
    <div>
      <h2 className="font-semibold mb-2 text-foreground">{t("caisse.factures.title")}</h2>
      <table className="table">
        <thead>
          <tr>
            <th>{t("caisse.factures.numero")}</th>
            <th>{t("caisse.factures.montant")}</th>
            <th>{t("common.status")}</th>
          </tr>
        </thead>
        <tbody>
          {factures.map((f) => (
            <tr key={f.id}>
              <td>
                <Link
                  href={`/factures/${f.id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {t("caisse.factures.label", { id: f.id })}
                </Link>
              </td>
              <td>{f.montant_total} F CFA</td>
              <td>
                <Badge tone={STATUT_TONES[f.statut]}>{t(`caisse.factureStatut.${f.statut}`)}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {factures.length === 0 && <p className="text-muted text-sm mb-3">{t("caisse.factures.empty")}</p>}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      <Button onClick={() => setShowFacturation(true)}>
        + {t("caisse.facturation.title")}
      </Button>
      <Modal
        open={showFacturation}
        onClose={() => setShowFacturation(false)}
        title={t("caisse.facturation.title")}
        size="lg"
      >
        <FacturationAction
          patientId={patientId}
          onCancel={() => setShowFacturation(false)}
        />
      </Modal>
    </div>
  );
}

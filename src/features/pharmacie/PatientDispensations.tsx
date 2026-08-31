"use client";

import { useCallback, useEffect, useState } from "react";
import { DispensationForm } from "./DispensationForm";
import { fetchPatientDispensations } from "./pharmacie-api";
import type { Dispensation } from "./types";
import { Badge, Button, Modal, Pagination } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export function PatientDispensations({ patientId }: { patientId: number }) {
  const { t } = useTranslation();
  const [dispensations, setDispensations] = useState<Dispensation[] | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(() => {
    fetchPatientDispensations(patientId, page).then((res) => {
      setDispensations(res.data);
      setTotalPages(res.meta.last_page);
    });
  }, [patientId, page]);

  useEffect(() => {
    load();
  }, [load]);

  if (dispensations === null) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold text-heading">{t("pharmacie.title")}</h2>
        <Button size="sm" onClick={() => setShowForm(true)}>
          + {t("pharmacie.dispense")}
        </Button>
      </div>
      <ul className="flex flex-col gap-2 mb-3 text-sm">
        {dispensations.map((d) => (
          <li key={d.id} className="rounded-lg border border-border p-2">
            <span className="font-medium text-heading">
              {t("pharmacie.itemLabel", { dci: d.medicament.dci, quantite: d.quantite })}
            </span>{" "}
            <span className="text-muted">
              {d.created_at && new Date(d.created_at).toLocaleDateString("fr-FR")}
            </span>
            {d.est_substitution && d.medicament_original && (
              <p className="mt-1">
                <Badge tone="warning">
                  {t("pharmacie.substitutedBadge", { dci: d.medicament_original.dci })}
                </Badge>
              </p>
            )}
          </li>
        ))}
        {dispensations.length === 0 && (
          <li className="text-muted">{t("pharmacie.noDispensations")}</li>
        )}
      </ul>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={t("pharmacie.dispenseTitle")}
      >
        <DispensationForm
          patientId={patientId}
          onCancel={() => setShowForm(false)}
          onDispensed={() => {
            setShowForm(false);
            load();
          }}
        />
      </Modal>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchPrescriptionsEnAttente } from "./pharmacie-api";
import type { PrescriptionEnAttente } from "./types";
import { DispensationForm } from "./DispensationForm";
import { Button, Card, Modal } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export function PrescriptionsEnAttente() {
  const { t } = useTranslation();
  const [prescriptions, setPrescriptions] = useState<PrescriptionEnAttente[]>([]);
  const [selected, setSelected] = useState<PrescriptionEnAttente | null>(null);

  const load = useCallback(() => {
    fetchPrescriptionsEnAttente().then((res) => setPrescriptions(res.data));
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [load]);

  return (
    <div className="flex flex-col gap-2">
      <Card className="p-0 overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th>{t("pharmacie.enAttente.colPatient")}</th>
              <th>{t("pharmacie.enAttente.colMedicament")}</th>
              <th>{t("pharmacie.enAttente.colInstructions")}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {prescriptions.map((p) => (
              <tr key={p.id}>
                <td>{p.patient ? `${p.patient.prenom} ${p.patient.nom}` : "—"}</td>
                <td>
                  {p.medicament.dci} {p.medicament.dosage ?? ""}
                </td>
                <td className="text-muted">{p.instructions ?? "—"}</td>
                <td>
                  <Button variant="ghost" size="sm" onClick={() => setSelected(p)}>
                    {t("pharmacie.enAttente.dispenser")}
                  </Button>
                </td>
              </tr>
            ))}
            {prescriptions.length === 0 && (
              <tr>
                <td colSpan={4} className="text-muted">
                  {t("pharmacie.enAttente.empty")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={t("pharmacie.dispenseTitle")}
        size="md"
      >
        {selected && selected.patient && (
          <DispensationForm
            patientId={selected.patient.id}
            presetMedicamentId={selected.medicament.id}
            prescriptionId={selected.id}
            onCancel={() => setSelected(null)}
            onDispensed={() => {
              setSelected(null);
              load();
            }}
          />
        )}
      </Modal>
    </div>
  );
}

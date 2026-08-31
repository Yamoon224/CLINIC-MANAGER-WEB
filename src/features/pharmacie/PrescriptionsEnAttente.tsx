"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchPrescriptionsEnAttente } from "./pharmacie-api";
import type { PrescriptionEnAttente } from "./types";
import { DispensationForm } from "./DispensationForm";
import { Button, DataTable, Modal, type Column } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export function PrescriptionsEnAttente() {
  const { t } = useTranslation();
  const [prescriptions, setPrescriptions] = useState<PrescriptionEnAttente[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PrescriptionEnAttente | null>(null);

  const load = useCallback(() => {
    fetchPrescriptionsEnAttente()
      .then((res) => setPrescriptions(res.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [load]);

  const columns: Column<PrescriptionEnAttente>[] = [
    {
      key: "patient",
      header: t("pharmacie.enAttente.colPatient"),
      cell: (p) =>
        p.patient ? `${p.patient.prenom} ${p.patient.nom}` : "—",
    },
    {
      key: "medicament",
      header: t("pharmacie.enAttente.colMedicament"),
      cell: (p) => (
        <span className="font-semibold text-heading">
          {p.medicament.dci} {p.medicament.dosage ?? ""}
        </span>
      ),
    },
    {
      key: "instructions",
      header: t("pharmacie.enAttente.colInstructions"),
      cell: (p) => <span className="text-muted">{p.instructions ?? "—"}</span>,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      headClassName: "text-right",
      cell: (p) => (
        <div className="flex justify-end">
          <Button size="sm" variant="outline" onClick={() => setSelected(p)}>
            {t("pharmacie.enAttente.dispenser")}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-2">
      <DataTable
        columns={columns}
        rows={prescriptions}
        getRowKey={(p) => p.id}
        searchAccessor={(p) =>
          `${p.patient ? `${p.patient.prenom} ${p.patient.nom}` : ""} ${p.medicament.dci}`
        }
        loading={loading}
        emptyLabel={t("pharmacie.enAttente.empty")}
      />

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

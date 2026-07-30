"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { fetchLits, libererLit } from "./hospitalisation-api";
import type { Lit, LitStatut } from "./types";
import { AdmissionAction } from "./AdmissionAction";
import { Badge, Button, Card, Modal } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

const STATUT_TONES: Record<LitStatut, "success" | "danger" | "warning" | "neutral"> = {
  libre: "success",
  occupe: "danger",
  reserve: "warning",
  nettoyage: "neutral",
};

export function BedPlan() {
  const { t } = useTranslation();
  const router = useRouter();
  const [lits, setLits] = useState<Lit[]>([]);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [admitLit, setAdmitLit] = useState<Lit | null>(null);

  const STATUT_LABELS: Record<LitStatut, string> = {
    libre: t("hospitalisation.bedPlan.statutLibre"),
    occupe: t("hospitalisation.bedPlan.statutOccupe"),
    reserve: t("hospitalisation.bedPlan.statutReserve"),
    nettoyage: t("hospitalisation.bedPlan.statutNettoyage"),
  };

  const load = useCallback(() => {
    fetchLits().then((res) => setLits(res.data));
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [load]);

  async function handleLiberer(id: number) {
    setBusyId(id);
    try {
      await libererLit(id);
      load();
    } finally {
      setBusyId(null);
    }
  }

  const parChambre = lits.reduce<Record<string, Lit[]>>((acc, lit) => {
    (acc[lit.chambre] ??= []).push(lit);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-6">
      {Object.entries(parChambre).map(([chambre, litsChambre]) => (
        <div key={chambre}>
          <h2 className="font-medium mb-2 text-foreground">
            {t("hospitalisation.bedPlan.room", { chambre })}
          </h2>
          <div className="flex flex-wrap gap-3">
            {litsChambre.map((lit) => (
              <Card key={lit.id} className="w-56 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{lit.numero}</span>
                  <Badge tone={STATUT_TONES[lit.statut]}>{STATUT_LABELS[lit.statut]}</Badge>
                </div>
                {lit.patient_actuel && (
                  <p className="mt-2 text-sm">
                    {lit.patient_actuel.prenom} {lit.patient_actuel.nom}
                  </p>
                )}
                {lit.statut === "libre" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAdmitLit(lit)}
                    className="mt-2 w-full"
                  >
                    {t("hospitalisation.bedPlan.admit")}
                  </Button>
                )}
                {lit.patient_actuel && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/sejours/${lit.patient_actuel!.sejour_id}`)}
                    className="mt-2 w-full"
                  >
                    {t("hospitalisation.bedPlan.viewSejour")}
                  </Button>
                )}
                {lit.statut === "nettoyage" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleLiberer(lit.id)}
                    disabled={busyId === lit.id}
                    className="mt-2 w-full"
                  >
                    {t("hospitalisation.bedPlan.markFree")}
                  </Button>
                )}
              </Card>
            ))}
          </div>
        </div>
      ))}
      {lits.length === 0 && <p className="text-muted">{t("hospitalisation.bedPlan.empty")}</p>}

      <Modal
        open={admitLit !== null}
        onClose={() => setAdmitLit(null)}
        title={t("hospitalisation.admission.title")}
        size="md"
      >
        {admitLit && (
          <AdmissionAction
            litId={admitLit.id}
            onCancel={() => setAdmitLit(null)}
            onAdmitted={(sejourId) => {
              setAdmitLit(null);
              router.push(`/sejours/${sejourId}`);
            }}
          />
        )}
      </Modal>
    </div>
  );
}

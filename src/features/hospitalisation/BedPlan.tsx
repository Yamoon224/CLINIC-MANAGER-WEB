"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  IconBed,
  IconCircleCheck,
  IconSparkles,
  IconUsers,
} from "@tabler/icons-react";
import { fetchLits, libererLit } from "./hospitalisation-api";
import type { Lit, LitStatut } from "./types";
import { Badge, Button, Card, Modal, PageHeader, StatCard, type Tone } from "@/components/ui";
import { AdmissionAction } from "./AdmissionAction";
import { useTranslation } from "@/lib/i18n/LanguageContext";

const STATUT_TONES: Record<LitStatut, Tone> = {
  libre: "success",
  occupe: "danger",
  reserve: "warning",
  nettoyage: "neutral",
};

const STATUT_ACCENT: Record<LitStatut, string> = {
  libre: "border-l-4 border-l-success",
  occupe: "border-l-4 border-l-danger",
  reserve: "border-l-4 border-l-warning",
  nettoyage: "border-l-4 border-l-border",
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

  const totalLits = lits.length;
  const litsOccupes = lits.filter((l) => l.statut === "occupe").length;
  const litsLibres = lits.filter((l) => l.statut === "libre").length;
  const tauxOccupation = totalLits > 0 ? Math.round((litsOccupes / totalLits) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("hospitalisation.bedPlan.pageTitle")}
        description={t("hospitalisation.bedPlan.pageDescription")}
      />

      {totalLits > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            icon={<IconBed size={18} />}
            label={t("dashboard.hospitalisation.litsTotal")}
            value={totalLits}
            tone="primary"
          />
          <StatCard
            icon={<IconUsers size={18} />}
            label={t("dashboard.hospitalisation.litsOccupes")}
            value={litsOccupes}
            tone="danger"
          />
          <StatCard
            icon={<IconCircleCheck size={18} />}
            label={t("hospitalisation.bedPlan.statFree")}
            value={litsLibres}
            tone="success"
          />
          <StatCard
            icon={<IconSparkles size={18} />}
            label={t("dashboard.hospitalisation.tauxOccupation")}
            value={`${tauxOccupation}%`}
            tone="accent"
          />
        </div>
      )}

      {Object.entries(parChambre).map(([chambre, litsChambre]) => (
        <div key={chambre}>
          <h2 className="mb-2 font-semibold text-heading">
            {t("hospitalisation.bedPlan.room", { chambre })}
          </h2>
          <div className="flex flex-wrap gap-3">
            {litsChambre.map((lit) => (
              <Card
                key={lit.id}
                className={`w-56 p-3 text-sm ${STATUT_ACCENT[lit.statut]}`}
              >
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

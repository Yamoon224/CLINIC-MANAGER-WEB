"use client";

import { useCallback, useEffect, useState } from "react";
import { getGrossesse } from "./maternite-api";
import { AccouchementForm } from "./AccouchementForm";
import { CpnForm } from "./CpnForm";
import { NouveauNeForm } from "./NouveauNeForm";
import type { Grossesse } from "./types";
import { Badge, Card } from "@/components/ui";

const STATUT_LABELS: Record<Grossesse["statut"], string> = {
  suivie: "Suivie",
  accouchee: "Accouchée",
  interrompue: "Interrompue",
};

export function GrossesseDetail({ id }: { id: number }) {
  const [grossesse, setGrossesse] = useState<Grossesse | null>(null);

  const load = useCallback(() => {
    getGrossesse(id).then((res) => setGrossesse(res.data));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (!grossesse) return <p className="text-sm text-muted">Chargement...</p>;

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <div>
        <h1 className="text-lg font-semibold text-foreground">
          Dossier obstétrical - {grossesse.patient.prenom} {grossesse.patient.nom}
        </h1>
        <p className="text-sm text-muted">Dossier n° {grossesse.patient.numero_dossier}</p>
      </div>

      {grossesse.a_risque && (
        <div className="rounded-lg bg-danger-light px-3 py-2 text-sm font-semibold text-danger">
          ⚠ Grossesse à risque
        </div>
      )}

      <Card>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <Row label="DDR" value={grossesse.ddr} />
          <Row label="Terme prévu" value={grossesse.terme} />
          <Row
            label="Semaines d'aménorrhée"
            value={grossesse.semaines_amenorrhee ? `${grossesse.semaines_amenorrhee} SA` : null}
          />
          <Row
            label="Gestité / Parité"
            value={
              grossesse.gestite || grossesse.parite
                ? `G${grossesse.gestite ?? "?"} P${grossesse.parite ?? "?"}`
                : null
            }
          />
          <Row label="Groupe sanguin" value={grossesse.groupe_sanguin} />
          <div className="contents">
            <dt className="text-muted">Statut</dt>
            <dd>
              <Badge tone={grossesse.statut === "suivie" ? "primary" : "neutral"}>
                {STATUT_LABELS[grossesse.statut]}
              </Badge>
            </dd>
          </div>
        </dl>
      </Card>

      {grossesse.facteurs_risque && (
        <div className="rounded-lg bg-danger-light p-3 text-sm">
          <span className="font-semibold text-danger">Facteurs de risque : </span>
          <span className="text-foreground">{grossesse.facteurs_risque}</span>
        </div>
      )}

      <div>
        <h2 className="mb-2 font-semibold text-foreground">
          Consultations prénatales ({grossesse.consultations_prenatales.length})
        </h2>
        <div className="mb-3 flex flex-col gap-2 text-sm">
          {grossesse.consultations_prenatales.map((cpn) => (
            <Card key={cpn.id} className="p-3">
              <div className="flex justify-between">
                <span className="font-medium">CPN {cpn.numero}</span>
                <span className="text-muted">{cpn.date_cpn}</span>
              </div>
              <p className="text-muted">
                {[
                  cpn.poids && `Poids: ${cpn.poids}kg`,
                  cpn.tension && `Tension: ${cpn.tension}`,
                  cpn.hauteur_uterine && `HU: ${cpn.hauteur_uterine}cm`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              {cpn.risque_detecte && (
                <p className="mt-1 font-medium text-danger">⚠ {cpn.risque_details}</p>
              )}
            </Card>
          ))}
        </div>
        {grossesse.statut === "suivie" && <CpnForm grossesseId={grossesse.id} onAdded={load} />}
      </div>

      <div>
        <h2 className="mb-2 font-semibold text-foreground">Accouchement</h2>
        {grossesse.accouchement ? (
          <Card className="flex flex-col gap-2 text-sm">
            <div className="flex items-center gap-2">
              <Badge tone={grossesse.accouchement.mode === "voie_basse" ? "success" : "accent"}>
                {grossesse.accouchement.mode === "voie_basse" ? "Voie basse" : "Césarienne"}
              </Badge>
              <span className="text-muted">
                {grossesse.accouchement.date_heure &&
                  new Date(grossesse.accouchement.date_heure).toLocaleString("fr-FR")}
              </span>
            </div>
            {grossesse.accouchement.complications && (
              <p className="text-danger">
                Complications : {grossesse.accouchement.complications}
              </p>
            )}

            <h3 className="mt-2 font-medium text-foreground">Nouveau-nés</h3>
            <div className="flex flex-col gap-2">
              {grossesse.accouchement.nouveau_nes.map((bebe) => (
                <Card key={bebe.id} className="p-3">
                  {bebe.patient.prenom} {bebe.patient.nom} ({bebe.patient.numero_dossier}) -{" "}
                  {bebe.sexe === "F" ? "Féminin" : bebe.sexe === "M" ? "Masculin" : "?"}
                  {bebe.poids && `, ${bebe.poids}kg`}
                  {bebe.score_apgar_1min !== null &&
                    `, Apgar ${bebe.score_apgar_1min}/${bebe.score_apgar_5min}`}
                </Card>
              ))}
              {grossesse.accouchement.nouveau_nes.length === 0 && (
                <p className="text-muted">Aucun nouveau-né enregistré.</p>
              )}
            </div>

            <NouveauNeForm accouchementId={grossesse.accouchement.id} onAdded={load} />
          </Card>
        ) : grossesse.statut === "suivie" ? (
          <AccouchementForm grossesseId={grossesse.id} onSaved={load} />
        ) : (
          <p className="text-sm text-muted">Aucun accouchement enregistré.</p>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="contents">
      <dt className="text-muted">{label}</dt>
      <dd>{value || "-"}</dd>
    </div>
  );
}

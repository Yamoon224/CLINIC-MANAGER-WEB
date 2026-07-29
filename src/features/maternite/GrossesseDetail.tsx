"use client";

import { useCallback, useEffect, useState } from "react";
import { getGrossesse } from "./maternite-api";
import { AccouchementForm } from "./AccouchementForm";
import { CpnForm } from "./CpnForm";
import { NouveauNeForm } from "./NouveauNeForm";
import type { Grossesse } from "./types";

export function GrossesseDetail({ id }: { id: number }) {
  const [grossesse, setGrossesse] = useState<Grossesse | null>(null);

  const load = useCallback(() => {
    getGrossesse(id).then((res) => setGrossesse(res.data));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (!grossesse) return <p className="text-gray-500">Chargement...</p>;

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <div>
        <h1 className="text-lg font-semibold">
          Dossier obstétrical - {grossesse.patient.prenom} {grossesse.patient.nom}
        </h1>
        <p className="text-sm text-gray-500">Dossier n° {grossesse.patient.numero_dossier}</p>
      </div>

      {grossesse.a_risque && (
        <div className="border border-red-300 bg-red-50 rounded p-3 text-sm text-red-700 font-semibold">
          ⚠ Grossesse à risque
        </div>
      )}

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
        <Row label="Statut" value={grossesse.statut} />
      </dl>

      {grossesse.facteurs_risque && (
        <div className="border border-red-300 bg-red-50 rounded p-3 text-sm">
          <span className="font-semibold text-red-700">Facteurs de risque : </span>
          {grossesse.facteurs_risque}
        </div>
      )}

      <div>
        <h2 className="font-semibold mb-2">
          Consultations prénatales ({grossesse.consultations_prenatales.length})
        </h2>
        <ul className="flex flex-col gap-1 mb-3 text-sm">
          {grossesse.consultations_prenatales.map((cpn) => (
            <li key={cpn.id} className="border rounded p-2">
              <div className="flex justify-between">
                <span className="font-medium">CPN {cpn.numero}</span>
                <span className="text-gray-500">{cpn.date_cpn}</span>
              </div>
              <p className="text-gray-600">
                {[
                  cpn.poids && `Poids: ${cpn.poids}kg`,
                  cpn.tension && `Tension: ${cpn.tension}`,
                  cpn.hauteur_uterine && `HU: ${cpn.hauteur_uterine}cm`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              {cpn.risque_detecte && (
                <p className="text-red-700 font-medium">⚠ {cpn.risque_details}</p>
              )}
            </li>
          ))}
        </ul>
        {grossesse.statut === "suivie" && <CpnForm grossesseId={grossesse.id} onAdded={load} />}
      </div>

      <div>
        <h2 className="font-semibold mb-2">Accouchement</h2>
        {grossesse.accouchement ? (
          <div className="border rounded p-3 text-sm flex flex-col gap-2">
            <p>
              {grossesse.accouchement.mode === "voie_basse" ? "Voie basse" : "Césarienne"} -{" "}
              {grossesse.accouchement.date_heure &&
                new Date(grossesse.accouchement.date_heure).toLocaleString("fr-FR")}
            </p>
            {grossesse.accouchement.complications && (
              <p className="text-red-700">
                Complications : {grossesse.accouchement.complications}
              </p>
            )}

            <h3 className="font-medium mt-2">Nouveau-nés</h3>
            <ul className="flex flex-col gap-1">
              {grossesse.accouchement.nouveau_nes.map((bebe) => (
                <li key={bebe.id} className="border rounded p-2">
                  {bebe.patient.prenom} {bebe.patient.nom} ({bebe.patient.numero_dossier}) -{" "}
                  {bebe.sexe === "F" ? "Féminin" : bebe.sexe === "M" ? "Masculin" : "?"}
                  {bebe.poids && `, ${bebe.poids}kg`}
                  {bebe.score_apgar_1min !== null &&
                    `, Apgar ${bebe.score_apgar_1min}/${bebe.score_apgar_5min}`}
                </li>
              ))}
              {grossesse.accouchement.nouveau_nes.length === 0 && (
                <li className="text-gray-500">Aucun nouveau-né enregistré.</li>
              )}
            </ul>

            <NouveauNeForm accouchementId={grossesse.accouchement.id} onAdded={load} />
          </div>
        ) : grossesse.statut === "suivie" ? (
          <AccouchementForm grossesseId={grossesse.id} onSaved={load} />
        ) : (
          <p className="text-gray-500">Aucun accouchement enregistré.</p>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="contents">
      <dt className="text-gray-500">{label}</dt>
      <dd>{value || "-"}</dd>
    </div>
  );
}

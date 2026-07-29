"use client";

import { useCallback, useEffect, useState } from "react";
import { administrerVaccin, fetchCarnet, fetchVaccins } from "./vaccinations-api";
import type { Carnet, Vaccin } from "./types";

export function CarnetVaccination({ patientId }: { patientId: number }) {
  const [carnet, setCarnet] = useState<Carnet | null>(null);
  const [vaccins, setVaccins] = useState<Vaccin[]>([]);
  const [vaccinId, setVaccinId] = useState<number | "">("");
  const [dateAdministration, setDateAdministration] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [mapiSurvenue, setMapiSurvenue] = useState(false);
  const [mapiDetails, setMapiDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    fetchCarnet(patientId).then(setCarnet);
  }, [patientId]);

  useEffect(() => {
    load();
    fetchVaccins().then((res) => setVaccins(res.data));
  }, [load]);

  async function handleAdminister() {
    if (!vaccinId) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await administrerVaccin(patientId, {
        vaccin_id: vaccinId,
        date_administration: dateAdministration,
        mapi_survenue: mapiSurvenue,
        mapi_details: mapiDetails || undefined,
      });
      setMapiSurvenue(false);
      setMapiDetails("");
      load();
    } catch {
      setError("Impossible d'administrer ce vaccin (schéma déjà complet ?).");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!carnet) return null;

  return (
    <div>
      <h2 className="font-semibold mb-2">Vaccinations</h2>

      <ul className="flex flex-col gap-1 mb-2 text-sm">
        {carnet.data.map((v) => (
          <li key={v.id} className="border rounded p-2">
            <span className="font-medium">
              {v.vaccin.nom} - dose {v.dose_numero}/{v.vaccin.nombre_doses}
            </span>{" "}
            <span className="text-gray-500">{v.date_administration}</span>
            {v.mapi_survenue && (
              <p className="text-red-700">⚠ MAPI : {v.mapi_details}</p>
            )}
          </li>
        ))}
        {carnet.data.length === 0 && (
          <li className="text-gray-500">Aucune vaccination enregistrée.</li>
        )}
      </ul>

      {carnet.echeances.length > 0 && (
        <div className="mb-3 text-sm">
          <span className="font-medium">Prochaines échéances : </span>
          {carnet.echeances
            .map(
              (e) =>
                `${e.vaccin.nom} (dose ${e.prochaine_dose})${e.date_prevue ? ` - ${e.date_prevue}` : ""}`,
            )
            .join(" · ")}
        </div>
      )}

      <div className="border rounded p-3 flex flex-col gap-2 max-w-md">
        <div className="flex gap-2">
          <select
            value={vaccinId}
            onChange={(e) => setVaccinId(e.target.value ? Number(e.target.value) : "")}
            className="border rounded px-3 py-2 flex-1"
          >
            <option value="">Vaccin...</option>
            {vaccins.map((v) => (
              <option key={v.id} value={v.id}>
                {v.nom}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={dateAdministration}
            onChange={(e) => setDateAdministration(e.target.value)}
            className="border rounded px-3 py-2"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={mapiSurvenue}
            onChange={(e) => setMapiSurvenue(e.target.checked)}
          />
          MAPI (manifestation adverse post-vaccinale) constatée
        </label>
        {mapiSurvenue && (
          <textarea
            placeholder="Détails de la MAPI"
            value={mapiDetails}
            onChange={(e) => setMapiDetails(e.target.value)}
            className="border rounded px-3 py-2"
            rows={2}
          />
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          onClick={handleAdminister}
          disabled={isSubmitting || !vaccinId}
          className="bg-blue-600 text-white rounded px-3 py-2 self-start disabled:opacity-50"
        >
          Administrer
        </button>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { administrerVaccin, fetchCarnet, fetchVaccins } from "./vaccinations-api";
import type { Carnet, Vaccin } from "./types";
import { Badge, Button, Card, Input, Select, Textarea } from "@/components/ui";

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
      <h2 className="font-semibold text-foreground mb-2">Vaccinations</h2>

      <ul className="flex flex-col gap-2 mb-3 text-sm">
        {carnet.data.map((v) => (
          <li key={v.id} className="rounded-lg border border-border p-2">
            <span className="font-medium text-foreground">
              {v.vaccin.nom} - dose {v.dose_numero}/{v.vaccin.nombre_doses}
            </span>{" "}
            <span className="text-muted">{v.date_administration}</span>
            {v.mapi_survenue && (
              <p className="mt-1">
                <Badge tone="danger">⚠ MAPI : {v.mapi_details}</Badge>
              </p>
            )}
          </li>
        ))}
        {carnet.data.length === 0 && (
          <li className="text-muted">Aucune vaccination enregistrée.</li>
        )}
      </ul>

      {carnet.echeances.length > 0 && (
        <div className="mb-3 text-sm">
          <span className="font-medium text-foreground">Prochaines échéances : </span>
          <span className="text-muted">
            {carnet.echeances
              .map(
                (e) =>
                  `${e.vaccin.nom} (dose ${e.prochaine_dose})${e.date_prevue ? ` - ${e.date_prevue}` : ""}`,
              )
              .join(" · ")}
          </span>
        </div>
      )}

      <Card className="flex flex-col gap-2 max-w-md p-3">
        <div className="flex gap-2">
          <Select
            value={vaccinId}
            onChange={(e) => setVaccinId(e.target.value ? Number(e.target.value) : "")}
            className="flex-1"
          >
            <option value="">Vaccin...</option>
            {vaccins.map((v) => (
              <option key={v.id} value={v.id}>
                {v.nom}
              </option>
            ))}
          </Select>
          <Input
            type="date"
            value={dateAdministration}
            onChange={(e) => setDateAdministration(e.target.value)}
            className="w-auto"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={mapiSurvenue}
            onChange={(e) => setMapiSurvenue(e.target.checked)}
          />
          MAPI (manifestation adverse post-vaccinale) constatée
        </label>
        {mapiSurvenue && (
          <Textarea
            placeholder="Détails de la MAPI"
            value={mapiDetails}
            onChange={(e) => setMapiDetails(e.target.value)}
            rows={2}
          />
        )}
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button onClick={handleAdminister} disabled={isSubmitting || !vaccinId} className="self-start">
          Administrer
        </Button>
      </Card>
    </div>
  );
}

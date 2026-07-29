"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ajouterSuivi,
  fetchLits,
  fetchSejour,
  sortir,
  transferer,
} from "./hospitalisation-api";
import type { Lit, Sejour } from "./types";
import { Button, Card, Field, Input, PageHeader, Select, Textarea } from "@/components/ui";

export function SejourDetail({ id }: { id: number }) {
  const [sejour, setSejour] = useState<Sejour | null>(null);
  const [litsLibres, setLitsLibres] = useState<Lit[]>([]);
  const [nouveauLitId, setNouveauLitId] = useState<number | "">("");

  const [temperature, setTemperature] = useState("");
  const [tension, setTension] = useState("");
  const [pouls, setPouls] = useState("");
  const [observations, setObservations] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    fetchSejour(id).then((res) => setSejour(res.data));
    fetchLits().then((res) => setLitsLibres(res.data.filter((l) => l.statut === "libre")));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAjouterSuivi() {
    setBusy(true);
    try {
      await ajouterSuivi(id, {
        releve_at: new Date().toISOString(),
        temperature: temperature ? Number(temperature) : undefined,
        tension: tension || undefined,
        pouls: pouls ? Number(pouls) : undefined,
        observations: observations || undefined,
      });
      setTemperature("");
      setTension("");
      setPouls("");
      setObservations("");
      load();
    } finally {
      setBusy(false);
    }
  }

  async function handleTransferer() {
    if (!nouveauLitId) return;
    setBusy(true);
    try {
      await transferer(id, nouveauLitId);
      setNouveauLitId("");
      load();
    } finally {
      setBusy(false);
    }
  }

  async function handleSortir() {
    setBusy(true);
    try {
      await sortir(id);
      load();
    } finally {
      setBusy(false);
    }
  }

  if (!sejour) return <p className="text-muted">Chargement...</p>;

  const readOnly = sejour.statut === "termine";

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <PageHeader
        title={`Hospitalisation - ${sejour.patient.prenom} ${sejour.patient.nom}`}
        description={`Chambre ${sejour.lit.chambre} - ${sejour.lit.numero} · ${sejour.motif}`}
      />

      {readOnly && (
        <div className="rounded-xl border border-success/30 bg-success-light p-3 text-sm text-success">
          Sortie enregistrée - {sejour.nombre_jours} jour(s), frais de séjour :{" "}
          {sejour.frais_sejour} F CFA
        </div>
      )}

      <div>
        <h2 className="font-semibold mb-2 text-foreground">Feuille de température</h2>
        <ul className="flex flex-col gap-2 mb-3 text-sm">
          {sejour.suivis.map((s) => (
            <li key={s.id} className="rounded-xl border border-border bg-surface p-3">
              <span className="text-muted">
                {s.releve_at && new Date(s.releve_at).toLocaleString("fr-FR")}
              </span>{" "}
              {s.temperature && `${s.temperature}°C `}
              {s.pouls && `· ${s.pouls} bpm `}
              {s.observations && <p>{s.observations}</p>}
            </li>
          ))}
          {sejour.suivis.length === 0 && (
            <li className="text-muted">Aucun relevé enregistré.</li>
          )}
        </ul>

        {!readOnly && (
          <Card className="flex flex-col gap-3">
            <div className="grid grid-cols-3 gap-2">
              <Field label="Température">
                <Input
                  placeholder="°C"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                />
              </Field>
              <Field label="Tension">
                <Input
                  placeholder="ex. 12/8"
                  value={tension}
                  onChange={(e) => setTension(e.target.value)}
                />
              </Field>
              <Field label="Pouls">
                <Input
                  placeholder="bpm"
                  value={pouls}
                  onChange={(e) => setPouls(e.target.value)}
                />
              </Field>
            </div>
            <Textarea
              placeholder="Soins administrés, observations..."
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              rows={2}
            />
            <Button onClick={handleAjouterSuivi} disabled={busy} className="self-start">
              Ajouter le relevé
            </Button>
          </Card>
        )}
      </div>

      {!readOnly && (
        <div className="flex items-center gap-3 border-t border-border pt-4">
          <Select
            value={nouveauLitId}
            onChange={(e) => setNouveauLitId(e.target.value ? Number(e.target.value) : "")}
            className="max-w-xs"
          >
            <option value="">Transférer vers...</option>
            {litsLibres.map((l) => (
              <option key={l.id} value={l.id}>
                Chambre {l.chambre} - {l.numero}
              </option>
            ))}
          </Select>
          <Button variant="outline" onClick={handleTransferer} disabled={busy || !nouveauLitId}>
            Transférer
          </Button>

          <Button onClick={handleSortir} disabled={busy} className="ml-auto">
            Enregistrer la sortie
          </Button>
        </div>
      )}
    </div>
  );
}

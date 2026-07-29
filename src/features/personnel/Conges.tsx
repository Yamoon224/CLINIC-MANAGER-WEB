"use client";

import { useEffect, useState } from "react";
import { demanderConge, fetchConges, fetchEmployes, traiterConge } from "./personnel-api";
import {
  CONGE_STATUT_LABELS,
  CONGE_TYPE_LABELS,
  type Conge,
  type CongeStatut,
  type CongeType,
  type Employe,
} from "./types";
import { Badge, Button, Card, Field, Input, Select } from "@/components/ui";

const CONGE_STATUT_TONE: Record<CongeStatut, "warning" | "success" | "danger"> = {
  en_attente: "warning",
  approuve: "success",
  refuse: "danger",
};

export function Conges() {
  const [statut, setStatut] = useState<CongeStatut | "">("en_attente");
  const [conges, setConges] = useState<Conge[]>([]);
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [employeId, setEmployeId] = useState("");
  const [type, setType] = useState<CongeType>("annuel");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  function load() {
    fetchConges(statut).then((res) => setConges(res.data));
  }

  useEffect(() => {
    fetchConges(statut).then((res) => setConges(res.data));
  }, [statut]);

  useEffect(() => {
    fetchEmployes().then((res) => setEmployes(res.data));
  }, []);

  async function handleDemander() {
    if (!employeId || !dateDebut || !dateFin) return;
    setError(null);
    try {
      await demanderConge(Number(employeId), { type, date_debut: dateDebut, date_fin: dateFin });
      setDateDebut("");
      setDateFin("");
      load();
    } catch {
      setError("Demande impossible (période déjà couverte par un congé existant ?).");
    }
  }

  async function handleTraiter(id: number, decision: "approuve" | "refuse") {
    setBusyId(id);
    try {
      await traiterConge(id, decision);
      load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <Card className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Employé">
            <Select value={employeId} onChange={(e) => setEmployeId(e.target.value)}>
              <option value="">Employé…</option>
              {employes.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.prenom} {e.nom}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Type de congé">
            <Select value={type} onChange={(e) => setType(e.target.value as CongeType)}>
              {Object.entries(CONGE_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date de début">
            <Input
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
            />
          </Field>
          <Field label="Date de fin">
            <Input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} />
          </Field>
        </div>
        {error && (
          <p className="rounded-lg bg-danger-light px-3 py-2 text-sm text-danger">{error}</p>
        )}
        <Button onClick={handleDemander} className="self-start">
          Demander un congé
        </Button>
      </Card>

      <Field label="Filtrer par statut">
        <Select
          value={statut}
          onChange={(e) => setStatut(e.target.value as CongeStatut | "")}
          className="w-56"
        >
          <option value="">Tous statuts</option>
          {Object.entries(CONGE_STATUT_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </Field>

      <div className="flex flex-col gap-2">
        {conges.map((c) => (
          <Card key={c.id} className="p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium">
                {c.employe && `${c.employe.prenom} ${c.employe.nom}`} - {CONGE_TYPE_LABELS[c.type]}
              </span>
              <Badge tone={CONGE_STATUT_TONE[c.statut]}>{CONGE_STATUT_LABELS[c.statut]}</Badge>
            </div>
            <div className="mt-1 text-xs text-muted">
              Du {c.date_debut} au {c.date_fin} ({c.duree_jours} j.)
            </div>
            {c.statut === "en_attente" && (
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleTraiter(c.id, "approuve")}
                  disabled={busyId === c.id}
                  className="border-success/30 text-success hover:bg-success-light"
                >
                  Approuver
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleTraiter(c.id, "refuse")}
                  disabled={busyId === c.id}
                >
                  Refuser
                </Button>
              </div>
            )}
          </Card>
        ))}
        {conges.length === 0 && <p className="text-sm text-muted">Aucun congé.</p>}
      </div>
    </div>
  );
}

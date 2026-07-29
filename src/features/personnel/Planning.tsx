"use client";

import { useEffect, useState } from "react";
import { assignerPlanning, fetchEmployes, fetchPlanning, retirerPlanning } from "./personnel-api";
import { CRENEAU_LABELS, type Creneau, type Employe, type Planning as PlanningEntry } from "./types";
import { Badge, Button, Card, Field, Input, Select } from "@/components/ui";

export function Planning() {
  const [entries, setEntries] = useState<PlanningEntry[]>([]);
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [employeId, setEmployeId] = useState("");
  const [date, setDate] = useState("");
  const [creneau, setCreneau] = useState<Creneau>("matin");
  const [service, setService] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function load() {
    fetchPlanning().then((res) => setEntries(res.data));
  }

  useEffect(() => {
    load();
    fetchEmployes().then((res) => setEmployes(res.data));
  }, []);

  async function handleAssigner() {
    if (!employeId || !date) return;
    setBusy(true);
    setError(null);
    try {
      await assignerPlanning(Number(employeId), { date, creneau, service: service || undefined });
      setDate("");
      setService("");
      load();
    } catch {
      setError("Affectation impossible (créneau déjà pris ou employé en congé).");
    } finally {
      setBusy(false);
    }
  }

  async function handleRetirer(id: number) {
    setBusy(true);
    try {
      await retirerPlanning(id);
      load();
    } finally {
      setBusy(false);
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
          <Field label="Créneau">
            <Select value={creneau} onChange={(e) => setCreneau(e.target.value as Creneau)}>
              {Object.entries(CRENEAU_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="Service">
            <Input
              placeholder="Service (optionnel)"
              value={service}
              onChange={(e) => setService(e.target.value)}
            />
          </Field>
        </div>
        {error && (
          <p className="rounded-lg bg-danger-light px-3 py-2 text-sm text-danger">{error}</p>
        )}
        <Button onClick={handleAssigner} disabled={busy} className="self-start">
          Affecter au planning
        </Button>
      </Card>

      <div className="flex flex-col gap-2">
        {entries.map((p) => (
          <Card key={p.id} className="flex items-center justify-between p-3">
            <span className="flex items-center gap-2 text-sm">
              {p.date}
              <Badge tone="primary">{CRENEAU_LABELS[p.creneau]}</Badge>
              {p.employe && `${p.employe.prenom} ${p.employe.nom}`}
              {p.service && ` (${p.service})`}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRetirer(p.id)}
              disabled={busy}
              className="text-danger hover:bg-danger-light"
            >
              Retirer
            </Button>
          </Card>
        ))}
        {entries.length === 0 && <p className="text-sm text-muted">Aucune affectation.</p>}
      </div>
    </div>
  );
}

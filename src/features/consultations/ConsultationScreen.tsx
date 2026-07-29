"use client";

import { useCallback, useEffect, useState } from "react";
import {
  addPrescription,
  completeConsultation,
  getConsultation,
  updateConsultation,
} from "./consultations-api";
import {
  PRESCRIPTION_TYPE_LABELS,
  type Consultation,
  type PrescriptionType,
  type UpdateConsultationPayload,
} from "./types";
import { Button, Card, Field, Input, Select, Textarea } from "@/components/ui";

export function ConsultationScreen({ id }: { id: number }) {
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [form, setForm] = useState<UpdateConsultationPayload>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  const [prescriptionType, setPrescriptionType] = useState<PrescriptionType>("medicament");
  const [designation, setDesignation] = useState("");
  const [instructions, setInstructions] = useState("");
  const [isAddingPrescription, setIsAddingPrescription] = useState(false);

  const load = useCallback(() => {
    getConsultation(id).then((res) => {
      setConsultation(res.data);
      setForm({
        examen_clinique: res.data.examen_clinique ?? "",
        diagnostic: res.data.diagnostic ?? "",
        cim10_code: res.data.cim10_code ?? "",
        conduite_a_tenir: res.data.conduite_a_tenir ?? "",
        temperature: res.data.constantes.temperature
          ? Number(res.data.constantes.temperature)
          : undefined,
        tension: res.data.constantes.tension ?? "",
        poids: res.data.constantes.poids ? Number(res.data.constantes.poids) : undefined,
        pouls: res.data.constantes.pouls ?? undefined,
      });
    });
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave() {
    setIsSaving(true);
    try {
      await updateConsultation(id, form);
      load();
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAddPrescription() {
    if (!designation.trim()) return;
    setIsAddingPrescription(true);
    try {
      await addPrescription(id, {
        type: prescriptionType,
        designation,
        instructions: instructions || undefined,
      });
      setDesignation("");
      setInstructions("");
      load();
    } finally {
      setIsAddingPrescription(false);
    }
  }

  async function handleFinish() {
    setIsFinishing(true);
    try {
      await handleSave();
      await completeConsultation(id);
      load();
    } finally {
      setIsFinishing(false);
    }
  }

  if (!consultation) return <p className="text-sm text-muted">Chargement...</p>;

  const readOnly = consultation.statut === "terminee";

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <div>
        <h1 className="text-lg font-semibold text-foreground">
          Consultation - {consultation.patient.prenom} {consultation.patient.nom}
        </h1>
        <p className="text-sm text-muted">
          Dossier n° {consultation.patient.numero_dossier} · Motif : {consultation.motif}
        </p>
      </div>

      {consultation.patient.allergies && (
        <div className="rounded-xl border border-danger/30 bg-danger-light p-3 text-sm">
          <span className="font-semibold text-danger">⚠ Allergies : </span>
          {consultation.patient.allergies}
        </div>
      )}

      {readOnly && (
        <div className="rounded-xl border border-success/30 bg-success-light p-3 text-sm text-success">
          Consultation terminée.
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Field label="Température (°C)">
          <Input
            type="number"
            step="0.1"
            disabled={readOnly}
            placeholder="37.0"
            value={form.temperature ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, temperature: e.target.value ? Number(e.target.value) : undefined }))
            }
          />
        </Field>
        <Field label="Tension">
          <Input
            disabled={readOnly}
            placeholder="120/80"
            value={form.tension ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, tension: e.target.value }))}
          />
        </Field>
        <Field label="Poids (kg)">
          <Input
            type="number"
            step="0.1"
            disabled={readOnly}
            placeholder="Poids en kg"
            value={form.poids ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, poids: e.target.value ? Number(e.target.value) : undefined }))
            }
          />
        </Field>
        <Field label="Pouls (bpm)">
          <Input
            type="number"
            disabled={readOnly}
            placeholder="Pouls/min"
            value={form.pouls ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, pouls: e.target.value ? Number(e.target.value) : undefined }))
            }
          />
        </Field>
      </div>

      <Field label="Examen clinique">
        <Textarea
          disabled={readOnly}
          rows={3}
          placeholder="Résultats de l'examen clinique..."
          value={form.examen_clinique ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, examen_clinique: e.target.value }))}
        />
      </Field>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <Field label="Diagnostic">
            <Input
              disabled={readOnly}
              placeholder="Diagnostic"
              value={form.diagnostic ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, diagnostic: e.target.value }))}
            />
          </Field>
        </div>
        <Field label="Code CIM-10">
          <Input
            disabled={readOnly}
            placeholder="Code CIM-10"
            value={form.cim10_code ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, cim10_code: e.target.value }))}
          />
        </Field>
      </div>

      <Field label="Conduite à tenir">
        <Textarea
          disabled={readOnly}
          rows={2}
          placeholder="Conduite à tenir, traitement, recommandations..."
          value={form.conduite_a_tenir ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, conduite_a_tenir: e.target.value }))}
        />
      </Field>

      {!readOnly && (
        <Button variant="outline" onClick={handleSave} disabled={isSaving} className="self-start">
          {isSaving ? "Enregistrement..." : "Enregistrer"}
        </Button>
      )}

      <Card className="p-4">
        <h2 className="font-semibold text-foreground mb-3">Prescriptions</h2>
        <ul className="flex flex-col gap-2 mb-3 text-sm">
          {consultation.prescriptions.map((p) => (
            <li key={p.id} className="rounded-lg border border-border p-2">
              <span className="font-medium text-foreground">{PRESCRIPTION_TYPE_LABELS[p.type]}</span> - {p.designation}
              {p.instructions && <p className="text-muted">{p.instructions}</p>}
            </li>
          ))}
          {consultation.prescriptions.length === 0 && (
            <li className="text-muted">Aucune prescription.</li>
          )}
        </ul>

        {!readOnly && (
          <div className="flex flex-col gap-2 rounded-xl border border-border p-3">
            <div className="flex gap-2">
              <Select
                value={prescriptionType}
                onChange={(e) => setPrescriptionType(e.target.value as PrescriptionType)}
              >
                {Object.entries(PRESCRIPTION_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
              <Input
                placeholder="Désignation (médicament, analyse...)"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="flex-1"
              />
            </div>
            <Input
              placeholder="Instructions (posologie...)"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
            <Button
              onClick={handleAddPrescription}
              disabled={isAddingPrescription}
              className="self-start"
            >
              Ajouter
            </Button>
          </div>
        )}
      </Card>

      {!readOnly && (
        <Button onClick={handleFinish} disabled={isFinishing} className="self-start">
          {isFinishing ? "..." : "Terminer la consultation"}
        </Button>
      )}
    </div>
  );
}

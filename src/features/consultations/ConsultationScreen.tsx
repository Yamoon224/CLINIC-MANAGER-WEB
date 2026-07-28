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

  if (!consultation) return <p className="text-gray-500">Chargement...</p>;

  const readOnly = consultation.statut === "terminee";

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <div>
        <h1 className="text-lg font-semibold">
          Consultation — {consultation.patient.prenom} {consultation.patient.nom}
        </h1>
        <p className="text-sm text-gray-500">
          Dossier n° {consultation.patient.numero_dossier} · Motif : {consultation.motif}
        </p>
      </div>

      {consultation.patient.allergies && (
        <div className="border border-red-300 bg-red-50 rounded p-3 text-sm">
          <span className="font-semibold text-red-700">⚠ Allergies : </span>
          {consultation.patient.allergies}
        </div>
      )}

      {readOnly && (
        <div className="border border-green-300 bg-green-50 rounded p-3 text-sm text-green-800">
          Consultation terminée.
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Field label="Température (°C)">
          <input
            type="number"
            step="0.1"
            disabled={readOnly}
            value={form.temperature ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, temperature: e.target.value ? Number(e.target.value) : undefined }))
            }
            className="border rounded px-3 py-2 w-full disabled:bg-gray-100"
          />
        </Field>
        <Field label="Tension">
          <input
            disabled={readOnly}
            placeholder="120/80"
            value={form.tension ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, tension: e.target.value }))}
            className="border rounded px-3 py-2 w-full disabled:bg-gray-100"
          />
        </Field>
        <Field label="Poids (kg)">
          <input
            type="number"
            step="0.1"
            disabled={readOnly}
            value={form.poids ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, poids: e.target.value ? Number(e.target.value) : undefined }))
            }
            className="border rounded px-3 py-2 w-full disabled:bg-gray-100"
          />
        </Field>
        <Field label="Pouls (bpm)">
          <input
            type="number"
            disabled={readOnly}
            value={form.pouls ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, pouls: e.target.value ? Number(e.target.value) : undefined }))
            }
            className="border rounded px-3 py-2 w-full disabled:bg-gray-100"
          />
        </Field>
      </div>

      <Field label="Examen clinique">
        <textarea
          disabled={readOnly}
          rows={3}
          value={form.examen_clinique ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, examen_clinique: e.target.value }))}
          className="border rounded px-3 py-2 w-full disabled:bg-gray-100"
        />
      </Field>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <Field label="Diagnostic">
            <input
              disabled={readOnly}
              value={form.diagnostic ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, diagnostic: e.target.value }))}
              className="border rounded px-3 py-2 w-full disabled:bg-gray-100"
            />
          </Field>
        </div>
        <Field label="Code CIM-10">
          <input
            disabled={readOnly}
            value={form.cim10_code ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, cim10_code: e.target.value }))}
            className="border rounded px-3 py-2 w-full disabled:bg-gray-100"
          />
        </Field>
      </div>

      <Field label="Conduite à tenir">
        <textarea
          disabled={readOnly}
          rows={2}
          value={form.conduite_a_tenir ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, conduite_a_tenir: e.target.value }))}
          className="border rounded px-3 py-2 w-full disabled:bg-gray-100"
        />
      </Field>

      {!readOnly && (
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="border rounded px-3 py-2 self-start disabled:opacity-50"
        >
          {isSaving ? "Enregistrement..." : "Enregistrer"}
        </button>
      )}

      <div className="border-t pt-4">
        <h2 className="font-semibold mb-2">Prescriptions</h2>
        <ul className="flex flex-col gap-1 mb-3 text-sm">
          {consultation.prescriptions.map((p) => (
            <li key={p.id} className="border rounded p-2">
              <span className="font-medium">{PRESCRIPTION_TYPE_LABELS[p.type]}</span> — {p.designation}
              {p.instructions && <p className="text-gray-500">{p.instructions}</p>}
            </li>
          ))}
          {consultation.prescriptions.length === 0 && (
            <li className="text-gray-500">Aucune prescription.</li>
          )}
        </ul>

        {!readOnly && (
          <div className="flex flex-col gap-2 border rounded p-3">
            <div className="flex gap-2">
              <select
                value={prescriptionType}
                onChange={(e) => setPrescriptionType(e.target.value as PrescriptionType)}
                className="border rounded px-3 py-2"
              >
                {Object.entries(PRESCRIPTION_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <input
                placeholder="Désignation (médicament, analyse...)"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="border rounded px-3 py-2 flex-1"
              />
            </div>
            <input
              placeholder="Instructions (posologie...)"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="border rounded px-3 py-2"
            />
            <button
              onClick={handleAddPrescription}
              disabled={isAddingPrescription}
              className="border rounded px-3 py-2 self-start disabled:opacity-50"
            >
              Ajouter
            </button>
          </div>
        )}
      </div>

      {!readOnly && (
        <button
          onClick={handleFinish}
          disabled={isFinishing}
          className="bg-blue-600 text-white rounded px-3 py-2 self-start disabled:opacity-50"
        >
          {isFinishing ? "..." : "Terminer la consultation"}
        </button>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span>{label}</span>
      {children}
    </label>
  );
}

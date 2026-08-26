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
import { fetchAnalyseTypes } from "@/features/laboratoire/laboratoire-api";
import type { AnalyseType } from "@/features/laboratoire/types";
import { checkInteractions, fetchMedicaments } from "@/features/pharmacie/pharmacie-api";
import type { InteractionMedicamenteuse, Medicament } from "@/features/pharmacie/types";
import { AlertTriangle, CheckCircle2, ClipboardList } from "lucide-react";
import { Badge, Button, Card, Field, Input, PageHeader, PdfButton, Select, Textarea } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

/**
 * Very deliberately not a drug-interaction engine — there's no structured
 * interaction database in this app. This is a best-effort text match
 * against the patient's free-text allergies field, meant to catch the
 * obvious case (patient's allergy list literally names the drug) and
 * prompt a human to double-check, not to be relied on as clinical
 * decision support.
 */
function matchesAllergy(allergiesText: string, medicamentDci: string): boolean {
  const dci = medicamentDci.trim().toLowerCase();
  if (!dci) return false;
  return allergiesText
    .toLowerCase()
    .split(/[,;\n]+/)
    .map((term) => term.trim())
    .filter((term) => term.length > 2)
    .some((term) => dci.includes(term) || term.includes(dci));
}

export function ConsultationScreen({ id }: { id: number }) {
  const { t } = useTranslation();
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [form, setForm] = useState<UpdateConsultationPayload>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  const [prescriptionType, setPrescriptionType] = useState<PrescriptionType>("medicament");
  const [analyseTypes, setAnalyseTypes] = useState<AnalyseType[]>([]);
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [analyseTypeId, setAnalyseTypeId] = useState<number | "">("");
  const [medicamentId, setMedicamentId] = useState<number | "">("");
  const [designation, setDesignation] = useState("");
  const [instructions, setInstructions] = useState("");
  const [allergyOverride, setAllergyOverride] = useState(false);
  const [interactionWarnings, setInteractionWarnings] = useState<InteractionMedicamenteuse[]>([]);
  const [interactionOverride, setInteractionOverride] = useState(false);
  const [isAddingPrescription, setIsAddingPrescription] = useState(false);

  useEffect(() => {
    fetchAnalyseTypes().then((res) => setAnalyseTypes(res.data));
    fetchMedicaments().then((res) => setMedicaments(res.data));
  }, []);

  const load = useCallback(() => {
    getConsultation(id).then((res) => {
      setConsultation(res.data);
      setForm({
        examen_clinique: res.data.examen_clinique ?? "",
        diagnostic: res.data.diagnostic ?? "",
        cim10_code: res.data.cim10_code ?? "",
        conduite_a_tenir: res.data.conduite_a_tenir ?? "",
        prix: res.data.prix ? Number(res.data.prix) : undefined,
        temperature: res.data.constantes.temperature
          ? Number(res.data.constantes.temperature)
          : undefined,
        tension: res.data.constantes.tension ?? "",
        poids: res.data.constantes.poids ? Number(res.data.constantes.poids) : undefined,
        pouls: res.data.constantes.pouls ?? undefined,
      });
    });
  }, [id]);

  // Adding a prescription only changes the prescriptions list — refreshing
  // the whole form here (like `load` does) would silently overwrite any
  // clinical fields (diagnostic, price...) the practitioner typed but
  // hadn't hit "Enregistrer" for yet.
  const reloadPrescriptionsOnly = useCallback(() => {
    getConsultation(id).then((res) => setConsultation(res.data));
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

  const selectedMedicament = medicaments.find((m) => m.id === medicamentId);
  const allergyWarning =
    prescriptionType === "medicament" &&
    !!selectedMedicament &&
    !!consultation?.patient.allergies &&
    matchesAllergy(consultation.patient.allergies, selectedMedicament.dci);

  // Checked against the medicaments already prescribed in this same
  // consultation — not the patient's full history, which this app has no
  // "currently active medication" concept for (see Dispensation, which is
  // a one-off dispensing record, not a course of treatment with an end
  // date).
  useEffect(() => {
    if (prescriptionType !== "medicament" || !medicamentId || !consultation) {
      setInteractionWarnings([]);
      return;
    }
    const otherIds = consultation.prescriptions
      .filter((p): p is typeof p & { medicament_id: number } => p.type === "medicament" && p.medicament_id !== null)
      .map((p) => p.medicament_id);
    if (otherIds.length === 0) {
      setInteractionWarnings([]);
      return;
    }
    checkInteractions([...otherIds, medicamentId]).then((res) => setInteractionWarnings(res.data));
  }, [prescriptionType, medicamentId, consultation]);

  function resetPrescriptionForm() {
    setAnalyseTypeId("");
    setMedicamentId("");
    setDesignation("");
    setInstructions("");
    setAllergyOverride(false);
    setInteractionOverride(false);
  }

  async function handleAddPrescription() {
    if (allergyWarning && !allergyOverride) return;
    if (interactionWarnings.length > 0 && !interactionOverride) return;

    let payload: {
      type: PrescriptionType;
      designation: string;
      instructions?: string;
      analyse_type_id?: number;
      medicament_id?: number;
    };
    if (prescriptionType === "analyse") {
      const analyseType = analyseTypes.find((a) => a.id === analyseTypeId);
      if (!analyseType) return;
      payload = { type: "analyse", designation: analyseType.nom, analyse_type_id: analyseType.id };
    } else if (prescriptionType === "medicament") {
      if (!selectedMedicament) return;
      payload = {
        type: "medicament",
        designation: `${selectedMedicament.dci}${selectedMedicament.dosage ? ` ${selectedMedicament.dosage}` : ""}`,
        medicament_id: selectedMedicament.id,
      };
    } else {
      if (!designation.trim()) return;
      payload = { type: "imagerie", designation };
    }

    setIsAddingPrescription(true);
    try {
      await addPrescription(id, { ...payload, instructions: instructions || undefined });
      resetPrescriptionForm();
      reloadPrescriptionsOnly();
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

  if (!consultation) return <p className="text-sm text-muted">{t("common.loading")}</p>;

  const readOnly = consultation.statut === "terminee";

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={t("consultations.header", {
          prenom: consultation.patient.prenom,
          nom: consultation.patient.nom,
        })}
        description={t("consultations.subHeader", {
          numero: consultation.patient.numero_dossier,
          motif: consultation.motif,
        })}
        actions={
          <Badge tone={readOnly ? "success" : "primary"}>
            {readOnly ? t("consultations.statutTerminee") : t("consultations.statutEnCours")}
          </Badge>
        }
      />

      {consultation.patient.allergies && (
        <div className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger-light p-3 text-sm">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-danger" />
          <p>
            <span className="font-semibold text-danger">{t("consultations.allergiesLabel")}</span>
            {consultation.patient.allergies}
          </p>
        </div>
      )}

      {readOnly && (
        <div className="flex items-center gap-2 rounded-xl border border-success/30 bg-success-light p-3 text-sm text-success">
          <CheckCircle2 size={16} className="shrink-0" />
          {t("consultations.completed")}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Field label={t("consultations.temperature")}>
          <Input
            type="number"
            step="0.1"
            disabled={readOnly}
            placeholder={t("consultations.temperaturePlaceholder")}
            value={form.temperature ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, temperature: e.target.value ? Number(e.target.value) : undefined }))
            }
          />
        </Field>
        <Field label={t("consultations.tension")}>
          <Input
            disabled={readOnly}
            placeholder={t("consultations.tensionPlaceholder")}
            value={form.tension ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, tension: e.target.value }))}
          />
        </Field>
        <Field label={t("consultations.poids")}>
          <Input
            type="number"
            step="0.1"
            disabled={readOnly}
            placeholder={t("consultations.poidsPlaceholder")}
            value={form.poids ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, poids: e.target.value ? Number(e.target.value) : undefined }))
            }
          />
        </Field>
        <Field label={t("consultations.pouls")}>
          <Input
            type="number"
            disabled={readOnly}
            placeholder={t("consultations.poulsPlaceholder")}
            value={form.pouls ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, pouls: e.target.value ? Number(e.target.value) : undefined }))
            }
          />
        </Field>
      </div>

      <Field label={t("consultations.examenClinique")}>
        <Textarea
          disabled={readOnly}
          rows={3}
          placeholder={t("consultations.examenCliniquePlaceholder")}
          value={form.examen_clinique ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, examen_clinique: e.target.value }))}
        />
      </Field>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <Field label={t("consultations.diagnostic")}>
            <Input
              disabled={readOnly}
              placeholder={t("consultations.diagnosticPlaceholder")}
              value={form.diagnostic ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, diagnostic: e.target.value }))}
            />
          </Field>
        </div>
        <Field label={t("consultations.cim10")}>
          <Input
            disabled={readOnly}
            placeholder={t("consultations.cim10")}
            value={form.cim10_code ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, cim10_code: e.target.value }))}
          />
        </Field>
      </div>

      <Field label={t("consultations.conduiteATenir")}>
        <Textarea
          disabled={readOnly}
          rows={2}
          placeholder={t("consultations.conduiteATenirPlaceholder")}
          value={form.conduite_a_tenir ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, conduite_a_tenir: e.target.value }))}
        />
      </Field>

      <div className="max-w-xs">
        <Field label={t("consultations.prix")}>
          <Input
            type="number"
            step="1"
            min="0"
            disabled={readOnly}
            placeholder={t("consultations.prixPlaceholder")}
            value={form.prix ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, prix: e.target.value ? Number(e.target.value) : undefined }))
            }
          />
        </Field>
      </div>

      {!readOnly && (
        <Button variant="outline" onClick={handleSave} disabled={isSaving} className="self-start">
          {isSaving ? t("consultations.saving") : t("consultations.save")}
        </Button>
      )}

      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="flex items-center gap-2 font-semibold text-foreground">
            <ClipboardList size={18} className="text-primary" />
            {t("consultations.prescriptions")}
          </h2>
          {consultation.prescriptions.length > 0 && (
            <PdfButton
              path={`/consultations/${id}/ordonnance.pdf`}
              label={t("consultations.printOrdonnance")}
            />
          )}
        </div>
        <ul className="flex flex-col gap-2 mb-3 text-sm">
          {consultation.prescriptions.map((p) => (
            <li key={p.id} className="flex items-start gap-2 rounded-lg border border-border p-2">
              <Badge tone="neutral">{PRESCRIPTION_TYPE_LABELS[p.type]}</Badge>
              <div>
                <span className="font-medium text-foreground">{p.designation}</span>
                {p.instructions && <p className="text-muted">{p.instructions}</p>}
              </div>
            </li>
          ))}
          {consultation.prescriptions.length === 0 && (
            <li className="text-muted">{t("consultations.noPrescriptions")}</li>
          )}
        </ul>

        {!readOnly && (
          <div className="flex flex-col gap-2 rounded-xl border border-border p-3">
            <div className="flex gap-2">
              <Select
                value={prescriptionType}
                onChange={(e) => {
                  setPrescriptionType(e.target.value as PrescriptionType);
                  resetPrescriptionForm();
                }}
              >
                {Object.entries(PRESCRIPTION_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>

              {prescriptionType === "analyse" && (
                <Select
                  value={analyseTypeId}
                  onChange={(e) => setAnalyseTypeId(e.target.value ? Number(e.target.value) : "")}
                  className="flex-1"
                >
                  <option value="">{t("consultations.selectAnalysePlaceholder")}</option>
                  {analyseTypes.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nom}
                    </option>
                  ))}
                </Select>
              )}

              {prescriptionType === "medicament" && (
                <Select
                  value={medicamentId}
                  onChange={(e) => {
                    setMedicamentId(e.target.value ? Number(e.target.value) : "");
                    setAllergyOverride(false);
                    setInteractionOverride(false);
                  }}
                  className="flex-1"
                >
                  <option value="">{t("consultations.selectMedicamentPlaceholder")}</option>
                  {medicaments.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.dci} {m.dosage ?? ""}
                    </option>
                  ))}
                </Select>
              )}

              {prescriptionType === "imagerie" && (
                <Input
                  placeholder={t("consultations.designationPlaceholder")}
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="flex-1"
                />
              )}
            </div>

            {allergyWarning && (
              <div className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger-light p-2 text-sm text-danger">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">{t("consultations.allergyWarningTitle")}</p>
                  <p>{t("consultations.allergyWarningBody", { allergies: consultation.patient.allergies ?? "" })}</p>
                  <label className="mt-1 flex items-center gap-2 font-normal">
                    <input
                      type="checkbox"
                      checked={allergyOverride}
                      onChange={(e) => setAllergyOverride(e.target.checked)}
                    />
                    {t("consultations.allergyOverride")}
                  </label>
                </div>
              </div>
            )}

            {interactionWarnings.map((interaction) => (
              <div
                key={interaction.id}
                className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning-light p-2 text-sm text-warning"
              >
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">{t("pharmacie.interactions.warningTitle")}</p>
                  <p>
                    {t("pharmacie.interactions.warningBody", {
                      a: interaction.medicament_a.dci,
                      b: interaction.medicament_b.dci,
                      description: interaction.description ?? "",
                    })}
                  </p>
                </div>
              </div>
            ))}
            {interactionWarnings.length > 0 && (
              <label className="flex items-center gap-2 text-sm font-normal text-warning">
                <input
                  type="checkbox"
                  checked={interactionOverride}
                  onChange={(e) => setInteractionOverride(e.target.checked)}
                />
                {t("pharmacie.interactions.warningOverride")}
              </label>
            )}

            <Input
              placeholder={t("consultations.instructionsPlaceholder")}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
            <Button
              onClick={handleAddPrescription}
              disabled={
                isAddingPrescription ||
                (allergyWarning && !allergyOverride) ||
                (interactionWarnings.length > 0 && !interactionOverride)
              }
              className="self-start"
            >
              {t("consultations.add")}
            </Button>
          </div>
        )}
      </Card>

      {!readOnly && (
        <Button onClick={handleFinish} disabled={isFinishing} className="self-start">
          {isFinishing ? t("consultations.finishing") : t("consultations.finish")}
        </Button>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  IconActivity,
  IconChevronLeft,
  IconClipboardList,
  IconLogout,
  IconThermometer,
} from "@tabler/icons-react";
import { Badge, Button, Card, Input, PageHeader, Select } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import {
  ajouterActe,
  enregistrerConstantes,
  getAdmission,
  mettreEnObservation,
  sortir,
  trier,
} from "./urgences-api";
import {
  ISSUE_LABELS,
  NIVEAUX_TRIAGE,
  type AdmissionStatut,
  type AdmissionUrgence,
  type IssueUrgence,
  type NiveauTriage,
} from "./types";

const STATUT_TONE: Record<AdmissionStatut, "primary" | "accent" | "success" | "warning" | "danger" | "neutral"> = {
  admis: "primary",
  trie: "accent",
  observation: "warning",
  sorti: "success",
};

const TRIAGE_SELECTED_CLASSES: Record<NiveauTriage, string> = {
  reanimation: "bg-danger text-white",
  tres_urgent: "bg-danger text-white",
  urgent: "bg-warning text-white",
  semi_urgent: "bg-primary text-white",
  non_urgent: "bg-success text-white",
};

export function UrgenceDetail({ id }: { id: number }) {
  const { t } = useTranslation();
  const [admission, setAdmission] = useState<AdmissionUrgence | null>(null);
  const [acteDescription, setActeDescription] = useState("");
  const [constantes, setConstantes] = useState({
    temperature: "",
    tension: "",
    poids: "",
    pouls: "",
  });
  const [issue, setIssue] = useState<IssueUrgence>("domicile");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    getAdmission(id).then((res) => {
      setAdmission(res.data);
      setConstantes({
        temperature: res.data.constantes.temperature ?? "",
        tension: res.data.constantes.tension ?? "",
        poids: res.data.constantes.poids ?? "",
        pouls: res.data.constantes.pouls?.toString() ?? "",
      });
    });
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleTrier(niveau: (typeof NIVEAUX_TRIAGE)[number]) {
    setBusy(true);
    try {
      await trier(id, niveau);
      load();
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveConstantes() {
    setBusy(true);
    try {
      await enregistrerConstantes(id, {
        temperature: constantes.temperature ? Number(constantes.temperature) : undefined,
        tension: constantes.tension || undefined,
        poids: constantes.poids ? Number(constantes.poids) : undefined,
        pouls: constantes.pouls ? Number(constantes.pouls) : undefined,
      });
      load();
    } finally {
      setBusy(false);
    }
  }

  async function handleAddActe() {
    if (!acteDescription.trim()) return;
    setBusy(true);
    try {
      await ajouterActe(id, acteDescription);
      setActeDescription("");
      load();
    } finally {
      setBusy(false);
    }
  }

  async function handleObservation() {
    setBusy(true);
    try {
      await mettreEnObservation(id);
      load();
    } finally {
      setBusy(false);
    }
  }

  async function handleSortie() {
    setBusy(true);
    try {
      await sortir(id, issue);
      load();
    } finally {
      setBusy(false);
    }
  }

  if (!admission) return <p className="text-muted">{t("common.loading")}</p>;

  const readOnly = admission.statut === "sorti";

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/urgences"
        className="inline-flex w-fit items-center gap-1 text-sm font-semibold text-heading hover:text-primary"
      >
        <IconChevronLeft size={16} />
        {t("urgences.title")}
      </Link>
      <PageHeader
        title={t("urgences.detail.title", {
          prenom: admission.patient.prenom,
          nom: admission.patient.nom,
        })}
        description={t("urgences.detail.dossierNumero", { numero: admission.patient.numero_dossier })}
        actions={
          <Badge border tone={STATUT_TONE[admission.statut]}>
            {t(`urgences.statut.${admission.statut}`)}
          </Badge>
        }
      />

      {admission.patient.allergies && (
        <div className="rounded-[5px] border border-danger/30 bg-danger-light px-3 py-2 text-sm">
          <span className="font-semibold text-danger">{t("urgences.detail.allergies")}</span>
          {admission.patient.allergies}
        </div>
      )}

      {readOnly && (
        <div className="rounded-[5px] border border-success/30 bg-success-light px-3 py-2 text-sm text-success">
          {t("urgences.detail.sortieEnregistree")}
          {admission.issue && t(`urgences.issue.${admission.issue}`)}
        </div>
      )}

      <Card>
        <h2 className="flex items-center gap-2 font-semibold text-heading mb-3">
          <IconActivity size={18} className="text-primary" />
          {t("urgences.detail.triage")}
        </h2>
        <div className="flex flex-wrap gap-2">
          {NIVEAUX_TRIAGE.map((niveau) => {
            const selected = admission.niveau_triage === niveau;
            return (
              <button
                key={niveau}
                disabled={busy || readOnly}
                onClick={() => handleTrier(niveau)}
                className={`rounded-[5px] px-3 py-2 text-sm font-semibold transition-colors disabled:opacity-50 ${
                  selected
                    ? TRIAGE_SELECTED_CLASSES[niveau]
                    : "border border-border bg-surface hover:bg-light"
                }`}
              >
                {t(`urgences.niveau.${niveau}`)}
              </button>
            );
          })}
        </div>
      </Card>

      <Card>
        <h2 className="flex items-center gap-2 font-semibold text-heading mb-3">
          <IconThermometer size={18} className="text-primary" />
          {t("urgences.detail.constantes")}
        </h2>
        <div className="grid grid-cols-4 gap-3">
          <Input
            placeholder={t("urgences.detail.temperature")}
            disabled={readOnly}
            value={constantes.temperature}
            onChange={(e) => setConstantes((c) => ({ ...c, temperature: e.target.value }))}
          />
          <Input
            placeholder={t("urgences.detail.tension")}
            disabled={readOnly}
            value={constantes.tension}
            onChange={(e) => setConstantes((c) => ({ ...c, tension: e.target.value }))}
          />
          <Input
            placeholder={t("urgences.detail.poids")}
            disabled={readOnly}
            value={constantes.poids}
            onChange={(e) => setConstantes((c) => ({ ...c, poids: e.target.value }))}
          />
          <Input
            placeholder={t("urgences.detail.pouls")}
            disabled={readOnly}
            value={constantes.pouls}
            onChange={(e) => setConstantes((c) => ({ ...c, pouls: e.target.value }))}
          />
        </div>
        {!readOnly && (
          <Button
            variant="outline"
            onClick={handleSaveConstantes}
            disabled={busy}
            className="mt-3"
          >
            {t("urgences.detail.saveConstantes")}
          </Button>
        )}
      </Card>

      <Card>
        <h2 className="flex items-center gap-2 font-semibold text-heading mb-3">
          <IconClipboardList size={18} className="text-primary" />
          {t("urgences.detail.gestesTraitements")}
        </h2>
        <ul className="flex flex-col gap-1.5 mb-3 text-sm">
          {admission.actes.map((acte) => (
            <li key={acte.id} className="rounded-[5px] border border-border px-3 py-2">
              <span className="text-muted">
                {acte.created_at &&
                  new Date(acte.created_at).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
              </span>{" "}
              - {acte.description}
            </li>
          ))}
          {admission.actes.length === 0 && (
            <li className="text-muted">{t("urgences.detail.noActes")}</li>
          )}
        </ul>
        {!readOnly && (
          <div className="flex gap-2">
            <Input
              placeholder={t("urgences.detail.actePlaceholder")}
              value={acteDescription}
              onChange={(e) => setActeDescription(e.target.value)}
              className="flex-1"
            />
            <Button variant="outline" onClick={handleAddActe} disabled={busy}>
              {t("urgences.detail.add")}
            </Button>
          </div>
        )}
      </Card>

      {!readOnly && (
        <Card className="flex items-center gap-4 flex-wrap">
          {admission.statut !== "observation" && (
            <Button variant="outline" onClick={handleObservation} disabled={busy}>
              {t("urgences.detail.miseEnObservation")}
            </Button>
          )}

          <Select
            value={issue}
            onChange={(e) => setIssue(e.target.value as IssueUrgence)}
            className="max-w-xs"
          >
            {Object.keys(ISSUE_LABELS).map((value) => (
              <option key={value} value={value}>
                {t(`urgences.issue.${value}`)}
              </option>
            ))}
          </Select>
          <Button onClick={handleSortie} disabled={busy}>
            <IconLogout size={16} />
            {t("urgences.detail.sortie")}
          </Button>
        </Card>
      )}
    </div>
  );
}

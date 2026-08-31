"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createAssurancePatient,
  demanderPriseEnCharge,
  fetchAssurancesPatient,
  fetchCompagnies,
} from "./assurances-api";
import type { AssurancePatient, CompagnieAssurance } from "./types";
import { Badge, Button, Card, Input, Modal, Pagination, Select } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export function PatientAssurances({ patientId }: { patientId: number }) {
  const { t } = useTranslation();
  const [assurances, setAssurances] = useState<AssurancePatient[] | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [compagnies, setCompagnies] = useState<CompagnieAssurance[]>([]);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(() => {
    fetchAssurancesPatient(patientId, page).then((res) => {
      setAssurances(res.data);
      setTotalPages(res.meta.last_page);
    });
  }, [patientId, page]);

  useEffect(() => {
    load();
    fetchCompagnies().then((res) => setCompagnies(res.data));
  }, [load, patientId]);

  if (assurances === null) return null;

  return (
    <div>
      <h2 className="mb-2 font-semibold text-heading">
        {t("assurances.patientAssurances.title")}
      </h2>
      <Card className="p-0 overflow-hidden mb-3">
        <table className="table">
          <thead>
            <tr>
              <th>{t("assurances.patientAssurances.compagnie")}</th>
              <th>{t("assurances.patientAssurances.numeroAdherent")}</th>
              <th>{t("assurances.patientAssurances.taux")}</th>
              <th>{t("assurances.patientAssurances.periode")}</th>
              <th>{t("common.status")}</th>
              <th>{t("common.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {assurances.map((a) => (
              <AssuranceRow key={a.id} assurance={a} onChanged={load} />
            ))}
          </tbody>
        </table>
        {assurances.length === 0 && (
          <p className="text-sm text-muted p-4">{t("assurances.patientAssurances.empty")}</p>
        )}
      </Card>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Button onClick={() => setShowForm(true)} className="self-start mt-3">
        + {t("assurances.patientAssurances.addTitle")}
      </Button>

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={t("assurances.patientAssurances.addTitle")}
      >
        <AddAssuranceForm
          patientId={patientId}
          compagnies={compagnies}
          onCancel={() => setShowForm(false)}
          onCreated={() => {
            setShowForm(false);
            load();
          }}
        />
      </Modal>
    </div>
  );
}

function AddAssuranceForm({
  patientId,
  compagnies,
  onCancel,
  onCreated,
}: {
  patientId: number;
  compagnies: CompagnieAssurance[];
  onCancel?: () => void;
  onCreated: () => void;
}) {
  const { t } = useTranslation();
  const [compagnieId, setCompagnieId] = useState("");
  const [numeroAdherent, setNumeroAdherent] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!compagnieId || !numeroAdherent || !dateDebut) return;
    setBusy(true);
    setError(null);
    try {
      await createAssurancePatient(patientId, {
        compagnie_assurance_id: Number(compagnieId),
        numero_adherent: numeroAdherent,
        date_debut: dateDebut,
        date_fin: dateFin || undefined,
      });
      setCompagnieId("");
      setNumeroAdherent("");
      setDateDebut("");
      setDateFin("");
      onCreated();
    } catch {
      setError(t("assurances.patientAssurances.error"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <Select value={compagnieId} onChange={(e) => setCompagnieId(e.target.value)} className="flex-1">
          <option value="">{t("assurances.patientAssurances.compagniePlaceholder")}</option>
          {compagnies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nom} ({c.taux_couverture_defaut}%)
            </option>
          ))}
        </Select>
        <Input
          placeholder={t("assurances.patientAssurances.numeroAdherentPlaceholder")}
          value={numeroAdherent}
          onChange={(e) => setNumeroAdherent(e.target.value)}
          className="w-40"
        />
      </div>
      <div className="flex gap-2">
        <Input
          type="date"
          value={dateDebut}
          onChange={(e) => setDateDebut(e.target.value)}
          className="flex-1"
        />
        <Input
          type="date"
          value={dateFin}
          onChange={(e) => setDateFin(e.target.value)}
          className="flex-1"
        />
      </div>
      {error && (
        <p className="rounded-[5px] bg-danger-light px-3 py-2 text-sm text-danger">{error}</p>
      )}
      <div className="flex gap-2">
        <Button onClick={handleSubmit} disabled={busy}>
          {t("assurances.patientAssurances.submit")}
        </Button>
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
        )}
      </div>
    </div>
  );
}

function AssuranceRow({
  assurance,
  onChanged,
}: {
  assurance: AssurancePatient;
  onChanged: () => void;
}) {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [motif, setMotif] = useState("");
  const [plafond, setPlafond] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleDemander() {
    if (!motif) return;
    setBusy(true);
    try {
      await demanderPriseEnCharge(assurance.id, {
        motif,
        montant_plafond: plafond ? Number(plafond) : undefined,
      });
      setMotif("");
      setPlafond("");
      setShowForm(false);
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  return (
    <tr>
      <td>{assurance.compagnie.nom}</td>
      <td>{assurance.numero_adherent}</td>
      <td>{assurance.taux_couverture}%</td>
      <td>
        {t("assurances.patientAssurances.period", { debut: assurance.date_debut })}{" "}
        {assurance.date_fin
          ? t("assurances.patientAssurances.au", { fin: assurance.date_fin })
          : t("assurances.patientAssurances.noEcheance")}
      </td>
      <td>
        <Badge tone={assurance.active ? "success" : "neutral"}>
          {t(`assurances.assuranceStatut.${assurance.statut}`)}
        </Badge>
      </td>
      <td>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowForm(true)}
          className="px-0 text-primary"
        >
          {t("assurances.patientAssurances.demanderPriseEnCharge")}
        </Button>

        <Modal
          open={showForm}
          onClose={() => setShowForm(false)}
          title={t("assurances.patientAssurances.demanderPriseEnCharge")}
        >
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <Input
                placeholder={t("assurances.patientAssurances.motifPlaceholder")}
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder={t("assurances.patientAssurances.plafondPlaceholder")}
                value={plafond}
                onChange={(e) => setPlafond(e.target.value)}
                className="w-32"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleDemander} disabled={busy}>
                {t("assurances.patientAssurances.envoyer")}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                {t("common.cancel")}
              </Button>
            </div>
          </div>
        </Modal>
      </td>
    </tr>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import {
  Badge,
  Button,
  ConfirmDeleteModal,
  DataTable,
  Field,
  Input,
  Modal,
  PatientSelect,
  Select,
  Textarea,
  type Column,
  type Tone,
} from "@/components/ui";
import { apiErrorMessage } from "@/lib/api-client";
import type { Patient } from "@/features/patients/types";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import {
  creerPriseEnCharge,
  deletePriseEnCharge,
  fetchAssurancesPatient,
  fetchPrisesEnCharge,
  traiterPriseEnCharge,
} from "./assurances-api";
import type {
  AssurancePatient,
  PriseEnCharge,
  PriseEnChargeStatut,
} from "./types";

const STATUT_TONES: Record<PriseEnChargeStatut, Tone> = {
  en_attente: "warning",
  approuvee: "success",
  refusee: "danger",
};

export function PrisesEnCharge() {
  const { t } = useTranslation();
  const [statut, setStatut] = useState<PriseEnChargeStatut | "">("en_attente");
  const [prises, setPrises] = useState<PriseEnCharge[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PriseEnCharge | null>(null);
  const [delBusy, setDelBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    fetchPrisesEnCharge(statut || undefined)
      .then((res) => setPrises(res.data))
      .finally(() => setLoading(false));
  }, [statut]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleTraiter(id: number, decision: "approuvee" | "refusee") {
    setBusyId(id);
    try {
      await traiterPriseEnCharge(id, decision);
      load();
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDelBusy(true);
    setError(null);
    try {
      await deletePriseEnCharge(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch (e) {
      setError(apiErrorMessage(e, t("assurances.prisesEnCharge.deleteError")));
    } finally {
      setDelBusy(false);
    }
  }

  const columns: Column<PriseEnCharge>[] = [
    {
      key: "numero",
      header: t("assurances.prisesEnCharge.numero"),
      cell: (p) => <span className="font-semibold text-heading">{p.numero}</span>,
    },
    {
      key: "patient",
      header: t("assurances.prisesEnCharge.patient"),
      cell: (p) =>
        p.assurance_patient.patient
          ? `${p.assurance_patient.patient.prenom} ${p.assurance_patient.patient.nom}`
          : "-",
    },
    {
      key: "compagnie",
      header: t("assurances.prisesEnCharge.compagnie"),
      cell: (p) => p.assurance_patient.compagnie.nom,
    },
    {
      key: "motif",
      header: t("assurances.prisesEnCharge.motif"),
      cell: (p) => (
        <span>
          {p.motif}
          {p.montant_plafond
            ? t("assurances.prisesEnCharge.plafondSuffix", {
                montant: p.montant_plafond,
              })
            : ""}
        </span>
      ),
    },
    {
      key: "statut",
      header: t("common.status"),
      cell: (p) => (
        <Badge tone={STATUT_TONES[p.statut]} border>
          {t(`assurances.priseEnChargeStatut.${p.statut}`)}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      headClassName: "text-right",
      cell: (p) =>
        p.statut === "en_attente" ? (
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTraiter(p.id, "approuvee")}
              disabled={busyId === p.id}
              className="border-success/40 text-success hover:bg-success-light"
            >
              {t("assurances.prisesEnCharge.approuver")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTraiter(p.id, "refusee")}
              disabled={busyId === p.id}
              className="border-danger/40 text-danger hover:bg-danger-light"
            >
              {t("assurances.prisesEnCharge.refuser")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteTarget(p)}
              aria-label={t("common.delete")}
              className="border-danger/40 text-danger hover:bg-danger-light"
            >
              <IconTrash size={14} />
            </Button>
          </div>
        ) : null,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <p className="rounded-[5px] bg-danger-light px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <DataTable
        columns={columns}
        rows={prises}
        getRowKey={(p) => p.id}
        loading={loading}
        emptyLabel={t("assurances.prisesEnCharge.empty")}
        toolbarRight={
          <>
            <Select
              value={statut}
              onChange={(e) =>
                setStatut(e.target.value as PriseEnChargeStatut | "")
              }
              className="w-52"
            >
              <option value="">
                {t("assurances.prisesEnCharge.tousStatuts")}
              </option>
              {(Object.keys(STATUT_TONES) as PriseEnChargeStatut[]).map(
                (value) => (
                  <option key={value} value={value}>
                    {t(`assurances.priseEnChargeStatut.${value}`)}
                  </option>
                ),
              )}
            </Select>
            <Button
              icon={<IconPlus size={15} />}
              onClick={() => setShowForm(true)}
            >
              {t("assurances.prisesEnCharge.new")}
            </Button>
          </>
        }
      />

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={t("assurances.prisesEnCharge.new")}
        size="lg"
      >
        <PriseEnChargeForm
          onCancel={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            setStatut("en_attente");
            load();
          }}
        />
      </Modal>

      <ConfirmDeleteModal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        busy={delBusy}
        title={t("common.confirmDeleteTitle")}
        message={t("assurances.prisesEnCharge.deleteMessage")}
        confirmLabel={t("common.yesDelete")}
        cancelLabel={t("common.cancel")}
      />
    </div>
  );
}

function PriseEnChargeForm({
  onCancel,
  onSaved,
}: {
  onCancel: () => void;
  onSaved: () => void;
}) {
  const { t } = useTranslation();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [assurances, setAssurances] = useState<AssurancePatient[]>([]);
  const [assuranceId, setAssuranceId] = useState("");
  const [motif, setMotif] = useState("");
  const [plafond, setPlafond] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!patient) return;
    fetchAssurancesPatient(patient.id).then((res) => setAssurances(res.data));
  }, [patient]);

  function pickPatient(p: Patient | null) {
    setPatient(p);
    setAssuranceId("");
    setAssurances([]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!assuranceId || !motif) return;
    setBusy(true);
    setError(null);
    try {
      await creerPriseEnCharge(Number(assuranceId), {
        motif,
        montant_plafond: plafond ? Number(plafond) : null,
      });
      onSaved();
    } catch (err) {
      setError(apiErrorMessage(err, t("assurances.prisesEnCharge.saveError")));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label={t("assurances.prisesEnCharge.patient")} required>
        <PatientSelect value={patient} onChange={pickPatient} />
      </Field>
      <Field label={t("assurances.prisesEnCharge.compagnie")} required>
        <Select
          value={assuranceId}
          onChange={(e) => setAssuranceId(e.target.value)}
          disabled={!patient}
        >
          <option value="">
            {patient
              ? assurances.length === 0
                ? t("assurances.prisesEnCharge.noAssurance")
                : "-"
              : t("assurances.prisesEnCharge.pickPatientFirst")}
          </option>
          {assurances.map((a) => (
            <option key={a.id} value={a.id}>
              {a.compagnie.nom} · {a.numero_adherent}
              {a.active ? "" : ` (${t("common.inactive")})`}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={t("assurances.prisesEnCharge.motif")} required>
        <Textarea
          rows={2}
          value={motif}
          onChange={(e) => setMotif(e.target.value)}
        />
      </Field>
      <Field label={t("assurances.prisesEnCharge.montantPlafond")}>
        <Input
          type="number"
          min={0}
          value={plafond}
          onChange={(e) => setPlafond(e.target.value)}
        />
      </Field>
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="light" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
        <Button type="submit" disabled={busy || !assuranceId || !motif}>
          {t("common.save")}
        </Button>
      </div>
    </form>
  );
}

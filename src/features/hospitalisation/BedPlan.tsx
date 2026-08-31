"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  IconBed,
  IconCircleCheck,
  IconPlus,
  IconSparkles,
  IconUsers,
} from "@tabler/icons-react";
import {
  createLit,
  deleteLit,
  fetchLits,
  libererLit,
  updateLit,
  type LitPayload,
} from "./hospitalisation-api";
import type { Lit, LitStatut } from "./types";
import {
  Badge,
  Button,
  Card,
  ConfirmDeleteModal,
  Field,
  Input,
  Modal,
  PageHeader,
  RowActions,
  Select,
  StatCard,
  type Tone,
} from "@/components/ui";
import { apiErrorMessage } from "@/lib/api-client";
import { AdmissionAction } from "./AdmissionAction";
import { useTranslation } from "@/lib/i18n/LanguageContext";

const STATUT_TONES: Record<LitStatut, Tone> = {
  libre: "success",
  occupe: "danger",
  reserve: "warning",
  nettoyage: "neutral",
};

const STATUT_ACCENT: Record<LitStatut, string> = {
  libre: "border-l-4 border-l-success",
  occupe: "border-l-4 border-l-danger",
  reserve: "border-l-4 border-l-warning",
  nettoyage: "border-l-4 border-l-border",
};

export function BedPlan() {
  const { t } = useTranslation();
  const router = useRouter();
  const [lits, setLits] = useState<Lit[]>([]);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [admitLit, setAdmitLit] = useState<Lit | null>(null);
  const [showLitForm, setShowLitForm] = useState(false);
  const [editingLit, setEditingLit] = useState<Lit | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Lit | null>(null);
  const [litBusy, setLitBusy] = useState(false);
  const [litError, setLitError] = useState<string | null>(null);

  const STATUT_LABELS: Record<LitStatut, string> = {
    libre: t("hospitalisation.bedPlan.statutLibre"),
    occupe: t("hospitalisation.bedPlan.statutOccupe"),
    reserve: t("hospitalisation.bedPlan.statutReserve"),
    nettoyage: t("hospitalisation.bedPlan.statutNettoyage"),
  };

  const load = useCallback(() => {
    fetchLits().then((res) => setLits(res.data));
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [load]);

  async function handleLiberer(id: number) {
    setBusyId(id);
    try {
      await libererLit(id);
      load();
    } finally {
      setBusyId(null);
    }
  }

  async function handleDeleteLit() {
    if (!deleteTarget) return;
    setLitBusy(true);
    setLitError(null);
    try {
      await deleteLit(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch (e) {
      setLitError(apiErrorMessage(e, t("hospitalisation.lits.deleteError")));
    } finally {
      setLitBusy(false);
    }
  }

  const parChambre = lits.reduce<Record<string, Lit[]>>((acc, lit) => {
    (acc[lit.chambre] ??= []).push(lit);
    return acc;
  }, {});

  const totalLits = lits.length;
  const litsOccupes = lits.filter((l) => l.statut === "occupe").length;
  const litsLibres = lits.filter((l) => l.statut === "libre").length;
  const tauxOccupation =
    totalLits > 0 ? Math.round((litsOccupes / totalLits) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("hospitalisation.bedPlan.pageTitle")}
        description={t("hospitalisation.bedPlan.pageDescription")}
        actions={
          <Button
            icon={<IconPlus size={15} />}
            onClick={() => {
              setEditingLit(null);
              setShowLitForm(true);
            }}
          >
            {t("hospitalisation.lits.new")}
          </Button>
        }
      />

      {litError && (
        <p className="rounded-[5px] bg-danger-light px-3 py-2 text-sm text-danger">
          {litError}
        </p>
      )}

      {totalLits > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            icon={<IconBed size={18} />}
            label={t("dashboard.hospitalisation.litsTotal")}
            value={totalLits}
            tone="primary"
          />
          <StatCard
            icon={<IconUsers size={18} />}
            label={t("dashboard.hospitalisation.litsOccupes")}
            value={litsOccupes}
            tone="danger"
          />
          <StatCard
            icon={<IconCircleCheck size={18} />}
            label={t("hospitalisation.bedPlan.statFree")}
            value={litsLibres}
            tone="success"
          />
          <StatCard
            icon={<IconSparkles size={18} />}
            label={t("dashboard.hospitalisation.tauxOccupation")}
            value={`${tauxOccupation}%`}
            tone="accent"
          />
        </div>
      )}

      {Object.entries(parChambre).map(([chambre, litsChambre]) => (
        <div key={chambre}>
          <h2 className="mb-2 font-semibold text-heading">
            {t("hospitalisation.bedPlan.room", { chambre })}
          </h2>
          <div className="flex flex-wrap gap-3">
            {litsChambre.map((lit) => (
              <Card
                key={lit.id}
                className={`w-56 p-3 text-sm ${STATUT_ACCENT[lit.statut]}`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-semibold text-heading">{lit.numero}</span>
                  <div className="flex items-center gap-1">
                    <Badge tone={STATUT_TONES[lit.statut]}>
                      {STATUT_LABELS[lit.statut]}
                    </Badge>
                    <RowActions
                      edit={() => {
                        setEditingLit(lit);
                        setShowLitForm(true);
                      }}
                      onDelete={() => setDeleteTarget(lit)}
                      editLabel={t("common.edit")}
                      deleteLabel={t("common.delete")}
                    />
                  </div>
                </div>
                {lit.patient_actuel && (
                  <p className="mt-2 text-sm">
                    {lit.patient_actuel.prenom} {lit.patient_actuel.nom}
                  </p>
                )}
                {lit.statut === "libre" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAdmitLit(lit)}
                    className="mt-2 w-full"
                  >
                    {t("hospitalisation.bedPlan.admit")}
                  </Button>
                )}
                {lit.patient_actuel && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(`/sejours/${lit.patient_actuel!.sejour_id}`)
                    }
                    className="mt-2 w-full"
                  >
                    {t("hospitalisation.bedPlan.viewSejour")}
                  </Button>
                )}
                {lit.statut === "nettoyage" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleLiberer(lit.id)}
                    disabled={busyId === lit.id}
                    className="mt-2 w-full"
                  >
                    {t("hospitalisation.bedPlan.markFree")}
                  </Button>
                )}
              </Card>
            ))}
          </div>
        </div>
      ))}
      {lits.length === 0 && (
        <p className="text-muted">{t("hospitalisation.bedPlan.empty")}</p>
      )}

      <Modal
        open={showLitForm}
        onClose={() => setShowLitForm(false)}
        title={
          editingLit
            ? t("hospitalisation.lits.edit")
            : t("hospitalisation.lits.new")
        }
      >
        <LitForm
          initial={editingLit}
          onCancel={() => setShowLitForm(false)}
          onSaved={() => {
            setShowLitForm(false);
            load();
          }}
        />
      </Modal>

      <ConfirmDeleteModal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteLit}
        busy={litBusy}
        title={t("common.confirmDeleteTitle")}
        message={t("hospitalisation.lits.deleteMessage", {
          numero: deleteTarget?.numero ?? "",
        })}
        confirmLabel={t("common.yesDelete")}
        cancelLabel={t("common.cancel")}
      />

      <Modal
        open={admitLit !== null}
        onClose={() => setAdmitLit(null)}
        title={t("hospitalisation.admission.title")}
        size="md"
      >
        {admitLit && (
          <AdmissionAction
            litId={admitLit.id}
            onCancel={() => setAdmitLit(null)}
            onAdmitted={(sejourId) => {
              setAdmitLit(null);
              router.push(`/sejours/${sejourId}`);
            }}
          />
        )}
      </Modal>
    </div>
  );
}

function LitForm({
  initial,
  onCancel,
  onSaved,
}: {
  initial: Lit | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const { t } = useTranslation();
  const [form, setForm] = useState<LitPayload>(
    initial
      ? {
          numero: initial.numero,
          chambre: initial.chambre,
          prix_journalier: initial.prix_journalier
            ? Number(initial.prix_journalier)
            : null,
          statut: initial.statut,
        }
      : { numero: "", chambre: "", prix_journalier: null },
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (initial) await updateLit(initial.id, form);
      else await createLit(form);
      onSaved();
    } catch (err) {
      setError(apiErrorMessage(err, t("hospitalisation.lits.saveError")));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("hospitalisation.lits.numero")} required>
          <Input
            required
            value={form.numero}
            onChange={(e) => setForm({ ...form, numero: e.target.value })}
          />
        </Field>
        <Field label={t("hospitalisation.lits.chambre")} required>
          <Input
            required
            value={form.chambre}
            onChange={(e) => setForm({ ...form, chambre: e.target.value })}
          />
        </Field>
        <Field label={t("hospitalisation.lits.prixJournalier")}>
          <Input
            type="number"
            min={0}
            value={form.prix_journalier ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                prix_journalier: e.target.value ? Number(e.target.value) : null,
              })
            }
          />
        </Field>
        {initial && (
          <Field label={t("common.status")}>
            <Select
              value={form.statut ?? "libre"}
              onChange={(e) =>
                setForm({
                  ...form,
                  statut: e.target.value as LitPayload["statut"],
                })
              }
            >
              <option value="libre">
                {t("hospitalisation.bedPlan.statutLibre")}
              </option>
              <option value="reserve">
                {t("hospitalisation.bedPlan.statutReserve")}
              </option>
              <option value="nettoyage">
                {t("hospitalisation.bedPlan.statutNettoyage")}
              </option>
            </Select>
          </Field>
        )}
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="light" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
        <Button type="submit" disabled={busy}>
          {t("common.save")}
        </Button>
      </div>
    </form>
  );
}

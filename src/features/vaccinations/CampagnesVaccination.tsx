"use client";

import { useCallback, useEffect, useState } from "react";
import { IconPlus } from "@tabler/icons-react";
import {
  Badge,
  Button,
  ConfirmDeleteModal,
  DataTable,
  DateInput,
  Field,
  Input,
  Modal,
  RowActions,
  Select,
  Textarea,
  type Column,
  type Tone,
} from "@/components/ui";
import { apiErrorMessage } from "@/lib/api-client";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import {
  createCampagne,
  deleteCampagne,
  fetchCampagnes,
  fetchVaccins,
  updateCampagne,
  type CampagnePayload,
  type CampagneVaccination as Campagne,
} from "./vaccinations-api";
import type { Vaccin } from "./types";

const STATUT_TONE: Record<Campagne["statut"], Tone> = {
  planifiee: "warning",
  en_cours: "primary",
  terminee: "success",
  annulee: "neutral",
};

export function CampagnesVaccination() {
  const { t } = useTranslation();
  const [campagnes, setCampagnes] = useState<Campagne[]>([]);
  const [vaccins, setVaccins] = useState<Vaccin[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Campagne | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Campagne | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    fetchCampagnes()
      .then((res) => setCampagnes(res.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    fetchVaccins().then((res) => setVaccins(res.data));
  }, [load]);

  const STATUT_LABELS: Record<Campagne["statut"], string> = {
    planifiee: t("campagnes.statut.planifiee"),
    en_cours: t("campagnes.statut.en_cours"),
    terminee: t("campagnes.statut.terminee"),
    annulee: t("campagnes.statut.annulee"),
  };

  async function handleDelete() {
    if (!deleteTarget) return;
    setBusy(true);
    setError(null);
    try {
      await deleteCampagne(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch (e) {
      setError(apiErrorMessage(e, t("campagnes.deleteError")));
    } finally {
      setBusy(false);
    }
  }

  const columns: Column<Campagne>[] = [
    {
      key: "nom",
      header: t("campagnes.colNom"),
      cell: (c) => <span className="font-semibold text-heading">{c.nom}</span>,
    },
    {
      key: "vaccin",
      header: t("campagnes.colVaccin"),
      cell: (c) => c.vaccin?.nom ?? "-",
    },
    {
      key: "periode",
      header: t("campagnes.colPeriode"),
      cell: (c) =>
        `${c.date_debut}${c.date_fin ? ` → ${c.date_fin}` : ""}`,
    },
    {
      key: "zone",
      header: t("campagnes.colZone"),
      cell: (c) => c.zone_cible ?? "-",
    },
    {
      key: "doses",
      header: t("campagnes.colDoses"),
      cell: (c) =>
        c.objectif_doses
          ? `${c.doses_administrees} / ${c.objectif_doses}`
          : c.doses_administrees,
    },
    {
      key: "statut",
      header: t("common.status"),
      cell: (c) => (
        <Badge tone={STATUT_TONE[c.statut]} border>
          {STATUT_LABELS[c.statut]}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      headClassName: "text-right",
      cell: (c) => (
        <div className="flex justify-end">
          <RowActions
            edit={() => {
              setEditing(c);
              setShowForm(true);
            }}
            onDelete={() => setDeleteTarget(c)}
            editLabel={t("common.edit")}
            deleteLabel={t("common.delete")}
          />
        </div>
      ),
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
        rows={campagnes}
        getRowKey={(c) => c.id}
        searchAccessor={(c) => `${c.nom} ${c.zone_cible ?? ""} ${c.vaccin?.nom ?? ""}`}
        loading={loading}
        emptyLabel={t("campagnes.empty")}
        toolbarRight={
          <Button
            icon={<IconPlus size={15} />}
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
          >
            {t("campagnes.new")}
          </Button>
        }
      />

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? t("campagnes.edit") : t("campagnes.new")}
        size="lg"
      >
        <CampagneForm
          initial={editing}
          vaccins={vaccins}
          statutLabels={STATUT_LABELS}
          onCancel={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            load();
          }}
        />
      </Modal>

      <ConfirmDeleteModal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        busy={busy}
        title={t("common.confirmDeleteTitle")}
        message={t("campagnes.deleteMessage", { nom: deleteTarget?.nom ?? "" })}
        confirmLabel={t("common.yesDelete")}
        cancelLabel={t("common.cancel")}
      />
    </div>
  );
}

function CampagneForm({
  initial,
  vaccins,
  statutLabels,
  onCancel,
  onSaved,
}: {
  initial: Campagne | null;
  vaccins: Vaccin[];
  statutLabels: Record<Campagne["statut"], string>;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const { t } = useTranslation();
  const [form, setForm] = useState<CampagnePayload>(
    initial
      ? {
          nom: initial.nom,
          vaccin_id: initial.vaccin?.id ?? null,
          date_debut: initial.date_debut,
          date_fin: initial.date_fin,
          zone_cible: initial.zone_cible,
          objectif_doses: initial.objectif_doses,
          doses_administrees: initial.doses_administrees,
          statut: initial.statut,
          notes: initial.notes,
        }
      : {
          nom: "",
          vaccin_id: null,
          date_debut: "",
          date_fin: null,
          zone_cible: "",
          objectif_doses: null,
          statut: "planifiee",
          notes: "",
        },
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (initial) await updateCampagne(initial.id, form);
      else await createCampagne(form);
      onSaved();
    } catch (err) {
      setError(apiErrorMessage(err, t("campagnes.saveError")));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("campagnes.colNom")} required>
          <Input
            required
            value={form.nom}
            onChange={(e) => setForm({ ...form, nom: e.target.value })}
          />
        </Field>
        <Field label={t("campagnes.colVaccin")}>
          <Select
            value={form.vaccin_id ? String(form.vaccin_id) : ""}
            onChange={(e) =>
              setForm({
                ...form,
                vaccin_id: e.target.value ? Number(e.target.value) : null,
              })
            }
          >
            <option value="">-</option>
            {vaccins.map((v) => (
              <option key={v.id} value={v.id}>
                {v.nom}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t("campagnes.dateDebut")} required>
          <DateInput
            required
            value={form.date_debut}
            onChange={(e) => setForm({ ...form, date_debut: e.target.value })}
          />
        </Field>
        <Field label={t("campagnes.dateFin")}>
          <DateInput
            value={form.date_fin ?? ""}
            onChange={(e) => setForm({ ...form, date_fin: e.target.value })}
          />
        </Field>
        <Field label={t("campagnes.colZone")}>
          <Input
            value={form.zone_cible ?? ""}
            onChange={(e) => setForm({ ...form, zone_cible: e.target.value })}
          />
        </Field>
        <Field label={t("campagnes.objectifDoses")}>
          <Input
            type="number"
            min={0}
            value={form.objectif_doses ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                objectif_doses: e.target.value ? Number(e.target.value) : null,
              })
            }
          />
        </Field>
        {initial && (
          <>
            <Field label={t("campagnes.dosesAdministrees")}>
              <Input
                type="number"
                min={0}
                value={form.doses_administrees ?? 0}
                onChange={(e) =>
                  setForm({
                    ...form,
                    doses_administrees: Number(e.target.value) || 0,
                  })
                }
              />
            </Field>
            <Field label={t("common.status")}>
              <Select
                value={form.statut}
                onChange={(e) =>
                  setForm({
                    ...form,
                    statut: e.target.value as Campagne["statut"],
                  })
                }
              >
                {(Object.keys(statutLabels) as Campagne["statut"][]).map((s) => (
                  <option key={s} value={s}>
                    {statutLabels[s]}
                  </option>
                ))}
              </Select>
            </Field>
          </>
        )}
      </div>
      <Field label={t("campagnes.notes")}>
        <Textarea
          rows={2}
          value={form.notes ?? ""}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
      </Field>
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

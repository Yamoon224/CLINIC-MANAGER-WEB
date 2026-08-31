"use client";

import { useCallback, useEffect, useState } from "react";
import { IconPlus } from "@tabler/icons-react";
import {
  Button,
  ConfirmDeleteModal,
  DataTable,
  Field,
  Input,
  Modal,
  RowActions,
  type Column,
} from "@/components/ui";
import { apiErrorMessage } from "@/lib/api-client";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import {
  createVaccin,
  deleteVaccin,
  fetchVaccins,
  updateVaccin,
  type VaccinPayload,
} from "./vaccinations-api";
import type { Vaccin } from "./types";

const EMPTY: VaccinPayload = {
  nom: "",
  antigene: "",
  nombre_doses: 1,
  intervalle_jours: null,
  age_recommande_jours: null,
};

export function Vaccins() {
  const { t } = useTranslation();
  const [vaccins, setVaccins] = useState<Vaccin[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Vaccin | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Vaccin | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    fetchVaccins()
      .then((res) => setVaccins(res.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setShowForm(true);
  }
  function openEdit(v: Vaccin) {
    setEditing(v);
    setShowForm(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setBusy(true);
    setError(null);
    try {
      await deleteVaccin(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch (e) {
      setError(apiErrorMessage(e, t("vaccins.deleteError")));
    } finally {
      setBusy(false);
    }
  }

  const columns: Column<Vaccin>[] = [
    {
      key: "nom",
      header: t("vaccins.colNom"),
      cell: (v) => <span className="font-semibold text-heading">{v.nom}</span>,
    },
    { key: "antigene", header: t("vaccins.colAntigene"), cell: (v) => v.antigene ?? "-" },
    {
      key: "doses",
      header: t("vaccins.colDoses"),
      cell: (v) => v.nombre_doses,
    },
    {
      key: "intervalle",
      header: t("vaccins.colIntervalle"),
      cell: (v) => (v.intervalle_jours ? `${v.intervalle_jours} j` : "-"),
    },
    {
      key: "age",
      header: t("vaccins.colAge"),
      cell: (v) => (v.age_recommande_jours ? `${v.age_recommande_jours} j` : "-"),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      headClassName: "text-right",
      cell: (v) => (
        <div className="flex justify-end">
          <RowActions
            edit={() => openEdit(v)}
            onDelete={() => setDeleteTarget(v)}
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
        rows={vaccins}
        getRowKey={(v) => v.id}
        searchAccessor={(v) => `${v.nom} ${v.antigene ?? ""}`}
        loading={loading}
        emptyLabel={t("vaccins.empty")}
        toolbarRight={
          <Button icon={<IconPlus size={15} />} onClick={openCreate}>
            {t("vaccins.new")}
          </Button>
        }
      />

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? t("vaccins.edit") : t("vaccins.new")}
        size="lg"
      >
        <VaccinForm
          initial={editing}
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
        message={t("vaccins.deleteMessage", { nom: deleteTarget?.nom ?? "" })}
        confirmLabel={t("common.yesDelete")}
        cancelLabel={t("common.cancel")}
      />
    </div>
  );
}

function VaccinForm({
  initial,
  onCancel,
  onSaved,
}: {
  initial: Vaccin | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const { t } = useTranslation();
  const [form, setForm] = useState<VaccinPayload>(
    initial
      ? {
          nom: initial.nom,
          antigene: initial.antigene ?? "",
          nombre_doses: initial.nombre_doses,
          intervalle_jours: initial.intervalle_jours,
          age_recommande_jours: initial.age_recommande_jours,
        }
      : EMPTY,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function num(v: string): number | null {
    return v === "" ? null : Number(v);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (initial) await updateVaccin(initial.id, form);
      else await createVaccin(form);
      onSaved();
    } catch {
      setError(t("vaccins.saveError"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("vaccins.colNom")} required>
          <Input
            required
            value={form.nom}
            onChange={(e) => setForm({ ...form, nom: e.target.value })}
          />
        </Field>
        <Field label={t("vaccins.colAntigene")}>
          <Input
            value={form.antigene ?? ""}
            onChange={(e) => setForm({ ...form, antigene: e.target.value })}
          />
        </Field>
        <Field label={t("vaccins.colDoses")} required>
          <Input
            type="number"
            min={1}
            required
            value={form.nombre_doses}
            onChange={(e) =>
              setForm({ ...form, nombre_doses: Number(e.target.value) || 1 })
            }
          />
        </Field>
        <Field label={t("vaccins.colIntervalle")}>
          <Input
            type="number"
            min={0}
            value={form.intervalle_jours ?? ""}
            onChange={(e) =>
              setForm({ ...form, intervalle_jours: num(e.target.value) })
            }
          />
        </Field>
        <Field label={t("vaccins.colAge")}>
          <Input
            type="number"
            min={0}
            value={form.age_recommande_jours ?? ""}
            onChange={(e) =>
              setForm({ ...form, age_recommande_jours: num(e.target.value) })
            }
          />
        </Field>
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

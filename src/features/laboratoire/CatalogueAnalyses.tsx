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
  createAnalyseType,
  deleteAnalyseType,
  fetchAnalyseTypes,
  updateAnalyseType,
  type AnalyseTypePayload,
} from "./laboratoire-api";
import type { AnalyseType } from "./types";

export function CatalogueAnalyses() {
  const { t } = useTranslation();
  const [types, setTypes] = useState<AnalyseType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AnalyseType | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AnalyseType | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    fetchAnalyseTypes()
      .then((res) => setTypes(res.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setBusy(true);
    setError(null);
    try {
      await deleteAnalyseType(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch (e) {
      setError(apiErrorMessage(e, t("catalogueAnalyses.deleteError")));
    } finally {
      setBusy(false);
    }
  }

  const columns: Column<AnalyseType>[] = [
    {
      key: "nom",
      header: t("catalogueAnalyses.colNom"),
      cell: (a) => <span className="font-semibold text-heading">{a.nom}</span>,
    },
    {
      key: "section",
      header: t("catalogueAnalyses.colSection"),
      cell: (a) => a.section ?? "-",
    },
    {
      key: "unite",
      header: t("catalogueAnalyses.colUnite"),
      cell: (a) => a.unite ?? "-",
    },
    {
      key: "ref",
      header: t("catalogueAnalyses.colRef"),
      cell: (a) =>
        a.valeur_ref_min || a.valeur_ref_max
          ? `${a.valeur_ref_min ?? "?"} – ${a.valeur_ref_max ?? "?"}`
          : "-",
    },
    {
      key: "prix",
      header: t("catalogueAnalyses.colPrix"),
      cell: (a) =>
        a.prix ? `${Number(a.prix).toLocaleString("fr-FR")} F CFA` : "-",
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      headClassName: "text-right",
      cell: (a) => (
        <div className="flex justify-end">
          <RowActions
            edit={() => {
              setEditing(a);
              setShowForm(true);
            }}
            onDelete={() => setDeleteTarget(a)}
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
        rows={types}
        getRowKey={(a) => a.id}
        searchAccessor={(a) => `${a.nom} ${a.section ?? ""}`}
        loading={loading}
        emptyLabel={t("catalogueAnalyses.empty")}
        toolbarRight={
          <Button
            icon={<IconPlus size={15} />}
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
          >
            {t("catalogueAnalyses.new")}
          </Button>
        }
      />

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? t("catalogueAnalyses.edit") : t("catalogueAnalyses.new")}
        size="lg"
      >
        <AnalyseTypeForm
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
        message={t("catalogueAnalyses.deleteMessage", {
          nom: deleteTarget?.nom ?? "",
        })}
        confirmLabel={t("common.yesDelete")}
        cancelLabel={t("common.cancel")}
      />
    </div>
  );
}

function toNum(v: string | null): number | null {
  return v === null || v === "" ? null : Number(v);
}

function AnalyseTypeForm({
  initial,
  onCancel,
  onSaved,
}: {
  initial: AnalyseType | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const { t } = useTranslation();
  const [form, setForm] = useState<AnalyseTypePayload>(
    initial
      ? {
          nom: initial.nom,
          section: initial.section ?? "",
          unite: initial.unite ?? "",
          prelevement: initial.prelevement ?? "",
          valeur_ref_min: toNum(initial.valeur_ref_min),
          valeur_ref_max: toNum(initial.valeur_ref_max),
          valeur_critique_min: toNum(initial.valeur_critique_min),
          valeur_critique_max: toNum(initial.valeur_critique_max),
          prix: toNum(initial.prix),
        }
      : {
          nom: "",
          section: "",
          unite: "",
          prelevement: "",
        },
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setNum(key: keyof AnalyseTypePayload, v: string) {
    setForm({ ...form, [key]: v === "" ? null : Number(v) });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (initial) await updateAnalyseType(initial.id, form);
      else await createAnalyseType(form);
      onSaved();
    } catch (err) {
      setError(apiErrorMessage(err, t("catalogueAnalyses.saveError")));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("catalogueAnalyses.colNom")} required>
          <Input
            required
            value={form.nom}
            onChange={(e) => setForm({ ...form, nom: e.target.value })}
          />
        </Field>
        <Field label={t("catalogueAnalyses.colSection")}>
          <Input
            value={form.section ?? ""}
            onChange={(e) => setForm({ ...form, section: e.target.value })}
          />
        </Field>
        <Field label={t("catalogueAnalyses.colUnite")}>
          <Input
            value={form.unite ?? ""}
            onChange={(e) => setForm({ ...form, unite: e.target.value })}
          />
        </Field>
        <Field label={t("catalogueAnalyses.colPrelevement")}>
          <Input
            value={form.prelevement ?? ""}
            onChange={(e) => setForm({ ...form, prelevement: e.target.value })}
          />
        </Field>
        <Field label={t("catalogueAnalyses.refMin")}>
          <Input
            type="number"
            step="any"
            value={form.valeur_ref_min ?? ""}
            onChange={(e) => setNum("valeur_ref_min", e.target.value)}
          />
        </Field>
        <Field label={t("catalogueAnalyses.refMax")}>
          <Input
            type="number"
            step="any"
            value={form.valeur_ref_max ?? ""}
            onChange={(e) => setNum("valeur_ref_max", e.target.value)}
          />
        </Field>
        <Field label={t("catalogueAnalyses.critMin")}>
          <Input
            type="number"
            step="any"
            value={form.valeur_critique_min ?? ""}
            onChange={(e) => setNum("valeur_critique_min", e.target.value)}
          />
        </Field>
        <Field label={t("catalogueAnalyses.critMax")}>
          <Input
            type="number"
            step="any"
            value={form.valeur_critique_max ?? ""}
            onChange={(e) => setNum("valeur_critique_max", e.target.value)}
          />
        </Field>
        <Field label={t("catalogueAnalyses.colPrix")} full>
          <Input
            type="number"
            min={0}
            value={form.prix ?? ""}
            onChange={(e) => setNum("prix", e.target.value)}
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

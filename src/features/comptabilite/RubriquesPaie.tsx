"use client";

import { useCallback, useEffect, useState } from "react";
import { IconPlus } from "@tabler/icons-react";
import {
  createRubrique,
  deleteRubrique,
  fetchRubriques,
  updateRubrique,
} from "./comptabilite-api";
import type {
  RubriqueCategorie,
  RubriqueMode,
  RubriquePaie,
  RubriquePayload,
} from "./types";
import {
  Badge,
  Button,
  ConfirmDeleteModal,
  DataTable,
  Field,
  Input,
  Modal,
  RowActions,
  Select,
  type Column,
} from "@/components/ui";
import { apiErrorMessage } from "@/lib/api-client";
import { useTranslation } from "@/lib/i18n/LanguageContext";

const CATEGORIES: RubriqueCategorie[] = [
  "gain",
  "retenue",
  "cotisation_salariale",
  "cotisation_patronale",
];
const MODES: RubriqueMode[] = ["fixe", "pct_base", "pct_brut_imposable"];

export function RubriquesPaie() {
  const { t } = useTranslation();
  const [rows, setRows] = useState<RubriquePaie[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<RubriquePaie | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<RubriquePaie | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    fetchRubriques()
      .then((res) => setRows(res.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const catLabel = (c: string) => t(`comptabilite.categorie.${c}`);
  const modeLabel = (m: string) => t(`comptabilite.mode2.${m}`);

  async function handleDelete() {
    if (!deleteTarget) return;
    setBusy(true);
    setError(null);
    try {
      await deleteRubrique(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch (e) {
      setError(apiErrorMessage(e, t("comptabilite.rubriques.deleteError")));
    } finally {
      setBusy(false);
    }
  }

  const columns: Column<RubriquePaie>[] = [
    {
      key: "libelle",
      header: t("comptabilite.rubriques.colLibelle"),
      cell: (r) => (
        <div>
          <span className="font-semibold text-heading">{r.libelle}</span>
          <span className="block text-[12px] text-muted">{r.code}</span>
        </div>
      ),
    },
    {
      key: "categorie",
      header: t("comptabilite.rubriques.colCategorie"),
      cell: (r) => <Badge tone="neutral">{catLabel(r.categorie)}</Badge>,
    },
    {
      key: "calcul",
      header: t("comptabilite.rubriques.colCalcul"),
      cell: (r) =>
        r.mode === "fixe"
          ? `${Number(r.montant ?? 0).toLocaleString("fr-FR")} F`
          : `${(Number(r.taux ?? 0) * 100).toFixed(2)} % · ${modeLabel(r.mode)}`,
    },
    {
      key: "actif",
      header: t("comptabilite.rubriques.colActif"),
      cell: (r) =>
        r.actif ? (
          <Badge tone="success">{t("common.yes")}</Badge>
        ) : (
          <Badge tone="neutral">{t("common.no")}</Badge>
        ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      headClassName: "text-right",
      cell: (r) => (
        <div className="flex justify-end">
          <RowActions
            edit={() => {
              setEditing(r);
              setShowForm(true);
            }}
            onDelete={() => setDeleteTarget(r)}
            editLabel={t("common.edit")}
            deleteLabel={t("common.delete")}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <h3 className="m-0 text-[15px] font-semibold text-heading">
        {t("comptabilite.rubriques.titre")}
      </h3>
      {error && (
        <p className="rounded-[5px] bg-danger-light px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}
      <DataTable
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        searchAccessor={(r) => `${r.libelle} ${r.code}`}
        loading={loading}
        emptyLabel={t("comptabilite.rubriques.vide")}
        toolbarRight={
          <Button
            icon={<IconPlus size={15} />}
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
          >
            {t("comptabilite.rubriques.nouvelle")}
          </Button>
        }
      />

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={
          editing
            ? t("comptabilite.rubriques.modifier")
            : t("comptabilite.rubriques.nouvelle")
        }
        size="md"
      >
        <RubriqueForm
          initial={editing}
          categories={CATEGORIES}
          modes={MODES}
          catLabel={catLabel}
          modeLabel={modeLabel}
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
        message={t("comptabilite.rubriques.deleteMessage", {
          nom: deleteTarget?.libelle ?? "",
        })}
        confirmLabel={t("common.yesDelete")}
        cancelLabel={t("common.cancel")}
      />
    </div>
  );
}

function RubriqueForm({
  initial,
  categories,
  modes,
  catLabel,
  modeLabel,
  onCancel,
  onSaved,
}: {
  initial: RubriquePaie | null;
  categories: RubriqueCategorie[];
  modes: RubriqueMode[];
  catLabel: (c: string) => string;
  modeLabel: (m: string) => string;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const { t } = useTranslation();
  const [form, setForm] = useState<RubriquePayload>(
    initial
      ? {
          code: initial.code,
          libelle: initial.libelle,
          categorie: initial.categorie,
          mode: initial.mode,
          taux: initial.taux ? Number(initial.taux) : null,
          montant: initial.montant ? Number(initial.montant) : null,
          imposable: initial.imposable,
          soumis_cotisation: initial.soumis_cotisation,
          ordre: initial.ordre,
          actif: initial.actif,
        }
      : {
          code: "",
          libelle: "",
          categorie: "gain",
          mode: "fixe",
          taux: null,
          montant: null,
          imposable: true,
          soumis_cotisation: true,
          ordre: 0,
          actif: true,
        },
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (initial) await updateRubrique(initial.id, form);
      else await createRubrique(form);
      onSaved();
    } catch (err) {
      setError(apiErrorMessage(err, t("comptabilite.rubriques.saveError")));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("comptabilite.rubriques.code")} required>
          <Input
            required
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
          />
        </Field>
        <Field label={t("comptabilite.rubriques.colLibelle")} required>
          <Input
            required
            value={form.libelle}
            onChange={(e) => setForm({ ...form, libelle: e.target.value })}
          />
        </Field>
        <Field label={t("comptabilite.rubriques.colCategorie")}>
          <Select
            value={form.categorie}
            onChange={(e) =>
              setForm({ ...form, categorie: e.target.value as RubriqueCategorie })
            }
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {catLabel(c)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t("comptabilite.rubriques.mode")}>
          <Select
            value={form.mode}
            onChange={(e) =>
              setForm({ ...form, mode: e.target.value as RubriqueMode })
            }
          >
            {modes.map((m) => (
              <option key={m} value={m}>
                {modeLabel(m)}
              </option>
            ))}
          </Select>
        </Field>
        {form.mode === "fixe" ? (
          <Field label={t("comptabilite.rubriques.montant")}>
            <Input
              type="number"
              value={form.montant ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  montant: e.target.value === "" ? null : Number(e.target.value),
                })
              }
            />
          </Field>
        ) : (
          <Field label={t("comptabilite.rubriques.taux")}>
            <Input
              type="number"
              step="any"
              placeholder="0.063"
              value={form.taux ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  taux: e.target.value === "" ? null : Number(e.target.value),
                })
              }
            />
          </Field>
        )}
      </div>
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.imposable}
            onChange={(e) => setForm({ ...form, imposable: e.target.checked })}
          />
          {t("comptabilite.rubriques.imposable")}
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.soumis_cotisation}
            onChange={(e) =>
              setForm({ ...form, soumis_cotisation: e.target.checked })
            }
          />
          {t("comptabilite.rubriques.soumisCotisation")}
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.actif}
            onChange={(e) => setForm({ ...form, actif: e.target.checked })}
          />
          {t("comptabilite.rubriques.colActif")}
        </label>
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

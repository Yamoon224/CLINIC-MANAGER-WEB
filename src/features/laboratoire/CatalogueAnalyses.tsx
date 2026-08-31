"use client";

import { useCallback, useEffect, useState } from "react";
import { IconPlus, IconTrash } from "@tabler/icons-react";
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
  type AnalyseParametrePayload,
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
      key: "parametres",
      header: t("catalogueAnalyses.colParametres"),
      cell: (a) =>
        (a.parametres?.length ?? 0) <= 1
          ? (a.parametres?.[0]?.nom ?? "-")
          : t("catalogueAnalyses.nbParametres", {
              count: a.parametres?.length ?? 0,
            }),
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

function toNum(v: string | null | undefined): number | null {
  return v === null || v === undefined || v === "" ? null : Number(v);
}

function emptyParametre(): AnalyseParametrePayload {
  return { nom: "", unite: "" };
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
  const [nom, setNom] = useState(initial?.nom ?? "");
  const [section, setSection] = useState(initial?.section ?? "");
  const [prelevement, setPrelevement] = useState(initial?.prelevement ?? "");
  const [prix, setPrix] = useState<number | null>(toNum(initial?.prix));
  const [parametres, setParametres] = useState<AnalyseParametrePayload[]>(
    initial?.parametres && initial.parametres.length > 0
      ? initial.parametres.map((p) => ({
          id: p.id,
          nom: p.nom,
          unite: p.unite ?? "",
          valeur_ref_min: toNum(p.valeur_ref_min),
          valeur_ref_max: toNum(p.valeur_ref_max),
          valeur_critique_min: toNum(p.valeur_critique_min),
          valeur_critique_max: toNum(p.valeur_critique_max),
          valeurs_anormales: p.valeurs_anormales ?? "",
          valeurs_critiques: p.valeurs_critiques ?? "",
        }))
      : [emptyParametre()],
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function patchParametre(index: number, patch: Partial<AnalyseParametrePayload>) {
    setParametres((prev) =>
      prev.map((p, i) => (i === index ? { ...p, ...patch } : p)),
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const payload: AnalyseTypePayload = {
      nom,
      section: section || null,
      prelevement: prelevement || null,
      prix,
      parametres: parametres.map((p) => ({
        ...(p.id ? { id: p.id } : {}),
        nom: p.nom,
        unite: p.unite || null,
        valeur_ref_min: p.valeur_ref_min ?? null,
        valeur_ref_max: p.valeur_ref_max ?? null,
        valeur_critique_min: p.valeur_critique_min ?? null,
        valeur_critique_max: p.valeur_critique_max ?? null,
        valeurs_anormales: p.valeurs_anormales || null,
        valeurs_critiques: p.valeurs_critiques || null,
      })),
    };
    try {
      if (initial) await updateAnalyseType(initial.id, payload);
      else await createAnalyseType(payload);
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
          <Input required value={nom} onChange={(e) => setNom(e.target.value)} />
        </Field>
        <Field label={t("catalogueAnalyses.colSection")}>
          <Input value={section} onChange={(e) => setSection(e.target.value)} />
        </Field>
        <Field label={t("catalogueAnalyses.colPrelevement")}>
          <Input
            value={prelevement}
            onChange={(e) => setPrelevement(e.target.value)}
          />
        </Field>
        <Field label={t("catalogueAnalyses.colPrix")}>
          <Input
            type="number"
            min={0}
            value={prix ?? ""}
            onChange={(e) =>
              setPrix(e.target.value === "" ? null : Number(e.target.value))
            }
          />
        </Field>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h4 className="m-0 text-[13px] font-bold uppercase tracking-wide text-muted">
            {t("catalogueAnalyses.parametresTitle")}
          </h4>
          <Button
            type="button"
            variant="light"
            size="sm"
            icon={<IconPlus size={14} />}
            onClick={() => setParametres((prev) => [...prev, emptyParametre()])}
          >
            {t("catalogueAnalyses.addParametre")}
          </Button>
        </div>

        {parametres.map((p, index) => (
          <div
            key={p.id ?? `new-${index}`}
            className="rounded-[5px] border border-border p-3"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[12px] font-semibold text-heading">
                {t("catalogueAnalyses.parametre")} {index + 1}
              </span>
              {parametres.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setParametres((prev) => prev.filter((_, i) => i !== index))
                  }
                  className="text-danger hover:text-danger/70"
                  aria-label={t("common.delete")}
                >
                  <IconTrash size={15} />
                </button>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label={t("catalogueAnalyses.paramNom")} required>
                <Input
                  required
                  value={p.nom}
                  onChange={(e) => patchParametre(index, { nom: e.target.value })}
                />
              </Field>
              <Field label={t("catalogueAnalyses.colUnite")}>
                <Input
                  value={p.unite ?? ""}
                  onChange={(e) =>
                    patchParametre(index, { unite: e.target.value })
                  }
                />
              </Field>
              <div />
              <Field label={t("catalogueAnalyses.refMin")}>
                <Input
                  type="number"
                  step="any"
                  value={p.valeur_ref_min ?? ""}
                  onChange={(e) =>
                    patchParametre(index, { valeur_ref_min: toNum(e.target.value) })
                  }
                />
              </Field>
              <Field label={t("catalogueAnalyses.refMax")}>
                <Input
                  type="number"
                  step="any"
                  value={p.valeur_ref_max ?? ""}
                  onChange={(e) =>
                    patchParametre(index, { valeur_ref_max: toNum(e.target.value) })
                  }
                />
              </Field>
              <div />
              <Field label={t("catalogueAnalyses.critMin")}>
                <Input
                  type="number"
                  step="any"
                  value={p.valeur_critique_min ?? ""}
                  onChange={(e) =>
                    patchParametre(index, {
                      valeur_critique_min: toNum(e.target.value),
                    })
                  }
                />
              </Field>
              <Field label={t("catalogueAnalyses.critMax")}>
                <Input
                  type="number"
                  step="any"
                  value={p.valeur_critique_max ?? ""}
                  onChange={(e) =>
                    patchParametre(index, {
                      valeur_critique_max: toNum(e.target.value),
                    })
                  }
                />
              </Field>
              <div />
              <Field label={t("catalogueAnalyses.motsClesAnormaux")}>
                <Input
                  value={p.valeurs_anormales ?? ""}
                  placeholder="positif, +"
                  onChange={(e) =>
                    patchParametre(index, { valeurs_anormales: e.target.value })
                  }
                />
              </Field>
              <Field label={t("catalogueAnalyses.motsClesCritiques")}>
                <Input
                  value={p.valeurs_critiques ?? ""}
                  onChange={(e) =>
                    patchParametre(index, { valeurs_critiques: e.target.value })
                  }
                />
              </Field>
            </div>
          </div>
        ))}
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

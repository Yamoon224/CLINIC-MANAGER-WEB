"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";
import {
  Badge,
  Button,
  ConfirmDeleteModal,
  Field,
  Input,
  Modal,
  Select,
} from "@/components/ui";
import { apiErrorMessage } from "@/lib/api-client";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { createActe, deleteActe, fetchActes, updateActe } from "./dentaire-api";
import { CATEGORIES_ACTE, type ActeDentaire, type CategorieActe } from "./types";

const CHIFFRES_ROMAINS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

/* Grille tarifaire du cabinet, présentée comme la grille papier : une carte par
   rubrique, numérotée en chiffres romains, prix alignés à droite. */
export function GrilleTarifaire() {
  const { t } = useTranslation();
  const [actes, setActes] = useState<ActeDentaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ActeDentaire | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ActeDentaire | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    fetchActes()
      .then((res) => setActes(res.data))
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
      await deleteActe(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch (e) {
      setError(apiErrorMessage(e, t("dentaire.grille.deleteError")));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[5px] border border-border bg-surface p-5 shadow-[var(--shadow-preclinic-sm)]">
        <div className="flex items-center gap-4">
          <Image
            src="/images/cpdg-logo.jpg"
            alt="Centre de Prothèse Dentaire de Guinée"
            width={88}
            height={76}
            className="shrink-0 rounded-md bg-white p-1"
          />
          <div>
            <h2 className="m-0 text-xl font-bold tracking-tight text-heading">
              {t("dentaire.grille.heading")}
            </h2>
            <p className="m-0 mt-1 text-[13px] text-primary">
              {t("dentaire.grille.subheading")}
            </p>
          </div>
        </div>
        <Button
          icon={<IconPlus size={15} />}
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
        >
          {t("dentaire.grille.new")}
        </Button>
      </div>

      {error && (
        <p className="rounded-[5px] bg-danger-light px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      {loading && <p className="text-sm text-muted">{t("common.loading")}</p>}
      {!loading && actes.length === 0 && (
        <p className="text-sm text-muted">{t("dentaire.grille.empty")}</p>
      )}

      <div className="grid items-start gap-4 lg:grid-cols-2">
        {CATEGORIES_ACTE.map((categorie, index) => {
          const lignes = actes.filter((acte) => acte.categorie === categorie);
          if (lignes.length === 0) return null;

          return (
            <section
              key={categorie}
              className="overflow-hidden rounded-[5px] border border-border bg-surface shadow-[var(--shadow-preclinic-sm)]"
            >
              {/* div et non h3 : la couleur globale des titres primerait sur text-white. */}
              <div className="bg-primary px-4 py-2.5 text-[13px] font-bold uppercase tracking-wide text-white">
                {CHIFFRES_ROMAINS[index]}. {t(`dentaire.grille.categories.${categorie}`)}
              </div>
              <ul className="m-0 flex list-none flex-col divide-y divide-border p-0">
                {lignes.map((acte) => (
                  <li
                    key={acte.id}
                    className="group flex items-center gap-3 px-4 py-2 text-sm"
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    <span
                      className={`min-w-0 flex-1 ${acte.actif ? "text-heading" : "text-muted line-through"}`}
                    >
                      {acte.libelle}
                    </span>
                    {!acte.actif && (
                      <Badge tone="neutral">{t("dentaire.grille.inactif")}</Badge>
                    )}
                    <span className="shrink-0 font-bold text-heading">
                      {Number(acte.prix).toLocaleString("fr-FR")}
                      {acte.unite && (
                        <span className="font-semibold"> / {acte.unite}</span>
                      )}
                    </span>
                    <span className="flex shrink-0 gap-1 opacity-60 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(acte);
                          setShowForm(true);
                        }}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-[5px] border border-border text-muted hover:bg-light hover:text-heading"
                        aria-label={t("common.edit")}
                        title={t("common.edit")}
                      >
                        <IconPencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(acte)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-[5px] border border-border text-danger hover:bg-danger-light"
                        aria-label={t("common.delete")}
                        title={t("common.delete")}
                      >
                        <IconTrash size={14} />
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? t("dentaire.grille.edit") : t("dentaire.grille.new")}
      >
        <ActeForm
          key={editing?.id ?? "new"}
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
        message={t("dentaire.grille.deleteMessage", {
          libelle: deleteTarget?.libelle ?? "",
        })}
        confirmLabel={t("common.yesDelete")}
        cancelLabel={t("common.cancel")}
      />
    </div>
  );
}

function ActeForm({
  initial,
  onCancel,
  onSaved,
}: {
  initial: ActeDentaire | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const { t } = useTranslation();
  const [categorie, setCategorie] = useState<CategorieActe>(
    initial?.categorie ?? "chirurgie_dentaire",
  );
  const [libelle, setLibelle] = useState(initial?.libelle ?? "");
  const [prix, setPrix] = useState(initial ? String(Number(initial.prix)) : "");
  const [unite, setUnite] = useState(initial?.unite ?? "");
  const [actif, setActif] = useState(initial?.actif ?? true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const payload = {
      categorie,
      libelle: libelle.trim(),
      prix: Number(prix),
      unite: unite.trim() || null,
      actif,
    };
    try {
      if (initial) await updateActe(initial.id, payload);
      else await createActe(payload);
      onSaved();
    } catch (e) {
      setError(apiErrorMessage(e, t("dentaire.common.saveError")));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("dentaire.grille.categorie")} required full>
          <Select
            value={categorie}
            onChange={(e) => setCategorie(e.target.value as CategorieActe)}
          >
            {CATEGORIES_ACTE.map((value) => (
              <option key={value} value={value}>
                {t(`dentaire.grille.categories.${value}`)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t("dentaire.grille.libelle")} required full>
          <Input required value={libelle} onChange={(e) => setLibelle(e.target.value)} />
        </Field>
        <Field label={t("dentaire.grille.prix")} required>
          <Input
            type="number"
            min={0}
            required
            value={prix}
            onChange={(e) => setPrix(e.target.value)}
          />
        </Field>
        <Field
          label={t("dentaire.grille.unite")}
          placeholder={t("dentaire.grille.unitePlaceholder")}
        >
          <Input value={unite} onChange={(e) => setUnite(e.target.value)} />
        </Field>
      </div>
      <label className="flex items-center gap-2 text-sm text-heading">
        <input
          type="checkbox"
          checked={actif}
          onChange={(e) => setActif(e.target.checked)}
        />
        {t("dentaire.grille.actif")}
      </label>
      {error && (
        <p className="rounded-[5px] bg-danger-light px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}
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

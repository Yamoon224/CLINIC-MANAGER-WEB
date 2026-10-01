"use client";

import { useCallback, useEffect, useState } from "react";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import {
  Button,
  ConfirmDeleteModal,
  DataTable,
  DateInput,
  Field,
  Input,
  Modal,
  PatientSelect,
  PdfButton,
  RowActions,
  Textarea,
  type Column,
} from "@/components/ui";
import type { Patient } from "@/features/patients/types";
import { apiErrorMessage } from "@/lib/api-client";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import {
  createOrdonnanceDentaire,
  deleteOrdonnanceDentaire,
  fetchOrdonnancesDentaires,
  ordonnancePdfPath,
  updateOrdonnanceDentaire,
} from "./dentaire-api";
import { formatDate, todayIso } from "./format";
import { PraticienSelect } from "./PraticienSelect";
import type { OrdonnanceDentaire } from "./types";

export function OrdonnancesDentaires() {
  const { t } = useTranslation();
  const [ordonnances, setOrdonnances] = useState<OrdonnanceDentaire[]>([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<OrdonnanceDentaire | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OrdonnanceDentaire | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    fetchOrdonnancesDentaires(page, perPage, search)
      .then((res) => {
        setOrdonnances(res.data);
        setTotal(res.meta.total);
      })
      .finally(() => setLoading(false));
  }, [page, perPage, search]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setBusy(true);
    setError(null);
    try {
      await deleteOrdonnanceDentaire(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch (e) {
      setError(apiErrorMessage(e, t("dentaire.ordonnances.deleteError")));
    } finally {
      setBusy(false);
    }
  }

  const columns: Column<OrdonnanceDentaire>[] = [
    {
      key: "date",
      header: t("dentaire.common.date"),
      cell: (o) => formatDate(o.date_ordonnance),
    },
    {
      key: "patient",
      header: t("dentaire.common.patient"),
      cell: (o) => (
        <span className="font-semibold text-heading">
          {o.patient.prenom} {o.patient.nom}
          <span className="block text-[13px] font-normal text-muted">
            {o.patient.numero_dossier}
          </span>
        </span>
      ),
    },
    {
      key: "medicaments",
      header: t("dentaire.ordonnances.medicaments"),
      cell: (o) => (
        <span className="block max-w-sm truncate">
          {o.lignes.map((ligne) => ligne.medicament).join(", ")}
        </span>
      ),
    },
    {
      key: "praticien",
      header: t("dentaire.common.praticien"),
      cell: (o) => o.praticien.name,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      headClassName: "text-right",
      cell: (o) => (
        <div className="flex items-center justify-end gap-2">
          <PdfButton
            path={ordonnancePdfPath(o.id)}
            label={t("dentaire.ordonnances.pdf")}
            filename={`ordonnance-${o.id}.pdf`}
          />
          <RowActions
            edit={() => {
              setEditing(o);
              setShowForm(true);
            }}
            onDelete={() => setDeleteTarget(o)}
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
        rows={ordonnances}
        getRowKey={(o) => o.id}
        page={page}
        perPage={perPage}
        total={total}
        onPageChange={setPage}
        onPerPageChange={(n) => {
          setPerPage(n);
          setPage(1);
        }}
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder={t("dentaire.common.searchPlaceholder")}
        loading={loading}
        emptyLabel={t("dentaire.ordonnances.empty")}
        toolbarRight={
          <Button
            icon={<IconPlus size={15} />}
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
          >
            {t("dentaire.ordonnances.new")}
          </Button>
        }
      />

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? t("dentaire.ordonnances.edit") : t("dentaire.ordonnances.new")}
        size="lg"
      >
        <OrdonnanceForm
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
        message={t("dentaire.ordonnances.deleteMessage", {
          patient: deleteTarget
            ? `${deleteTarget.patient.prenom} ${deleteTarget.patient.nom}`
            : "",
        })}
        confirmLabel={t("common.yesDelete")}
        cancelLabel={t("common.cancel")}
      />
    </div>
  );
}

interface LigneForm {
  /** Identifiant local stable pour la clé React. */
  cle: number;
  medicament: string;
  posologie: string;
  duree: string;
}

function ligneVide(lignes: LigneForm[]): LigneForm {
  const cle = lignes.reduce((max, ligne) => Math.max(max, ligne.cle), 0) + 1;
  return { cle, medicament: "", posologie: "", duree: "" };
}

function OrdonnanceForm({
  initial,
  onCancel,
  onSaved,
}: {
  initial: OrdonnanceDentaire | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const { t } = useTranslation();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [praticienId, setPraticienId] = useState<number | null>(null);
  const [date, setDate] = useState(initial?.date_ordonnance ?? todayIso());
  const [poids, setPoids] = useState(initial?.poids ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [lignes, setLignes] = useState<LigneForm[]>(() =>
    initial
      ? initial.lignes.map((ligne, index) => ({
          cle: index + 1,
          medicament: ligne.medicament,
          posologie: ligne.posologie ?? "",
          duree: ligne.duree ?? "",
        }))
      : [ligneVide([])],
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateLigne(cle: number, patch: Partial<LigneForm>) {
    setLignes((current) =>
      current.map((ligne) => (ligne.cle === cle ? { ...ligne, ...patch } : ligne)),
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const patientId = patient?.id ?? initial?.patient.id;
    if (!patientId) {
      setError(t("dentaire.common.patientRequired"));
      return;
    }
    const valides = lignes.filter((ligne) => ligne.medicament.trim() !== "");
    if (valides.length === 0) {
      setError(t("dentaire.ordonnances.lignesRequired"));
      return;
    }
    setBusy(true);
    setError(null);
    const payload = {
      patient_id: patientId,
      praticien_id: praticienId,
      date_ordonnance: date,
      poids: poids === "" ? null : Number(poids),
      notes: notes || null,
      lignes: valides.map((ligne) => ({
        medicament: ligne.medicament.trim(),
        posologie: ligne.posologie.trim() || null,
        duree: ligne.duree.trim() || null,
      })),
    };
    try {
      if (initial) await updateOrdonnanceDentaire(initial.id, payload);
      else await createOrdonnanceDentaire(payload);
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
        {initial ? (
          <Field label={t("dentaire.common.patient")} full>
            <Input
              disabled
              value={`${initial.patient.prenom} ${initial.patient.nom} · ${initial.patient.numero_dossier}`}
            />
          </Field>
        ) : (
          <Field label={t("dentaire.common.patient")} required full>
            <PatientSelect
              value={patient}
              onChange={setPatient}
              placeholder={t("dentaire.common.patientPlaceholder")}
            />
          </Field>
        )}
        <Field label={t("dentaire.common.date")}>
          <DateInput value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label={t("dentaire.common.poids")}>
          <Input
            type="number"
            min={0}
            step="0.1"
            value={poids}
            onChange={(e) => setPoids(e.target.value)}
          />
        </Field>
        {!initial && (
          <Field label={t("dentaire.common.praticien")} full>
            <PraticienSelect value={praticienId} onChange={setPraticienId} />
          </Field>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <p className="m-0 text-[13px] font-semibold text-heading">
          {t("dentaire.ordonnances.medicaments")}
        </p>
        {lignes.map((ligne) => (
          <div
            key={ligne.cle}
            className="grid gap-3 rounded-[5px] border border-border p-3 sm:grid-cols-12"
          >
            <Field
              label={t("dentaire.ordonnances.medicament")}
              placeholder={t("dentaire.ordonnances.medicamentPlaceholder")}
              className="sm:col-span-4"
            >
              <Input
                value={ligne.medicament}
                onChange={(e) => updateLigne(ligne.cle, { medicament: e.target.value })}
              />
            </Field>
            <Field
              label={t("dentaire.ordonnances.posologie")}
              placeholder={t("dentaire.ordonnances.posologiePlaceholder")}
              className="sm:col-span-4"
            >
              <Input
                value={ligne.posologie}
                onChange={(e) => updateLigne(ligne.cle, { posologie: e.target.value })}
              />
            </Field>
            <Field
              label={t("dentaire.ordonnances.duree")}
              placeholder={t("dentaire.ordonnances.dureePlaceholder")}
              className="sm:col-span-3"
            >
              <Input
                value={ligne.duree}
                onChange={(e) => updateLigne(ligne.cle, { duree: e.target.value })}
              />
            </Field>
            <div className="flex items-end justify-end sm:col-span-1">
              <button
                type="button"
                disabled={lignes.length === 1}
                onClick={() =>
                  setLignes((current) => current.filter((l) => l.cle !== ligne.cle))
                }
                className="inline-flex h-9 w-9 items-center justify-center rounded-[5px] border border-border text-danger hover:bg-danger-light disabled:opacity-40"
                aria-label={t("common.delete")}
                title={t("common.delete")}
              >
                <IconTrash size={15} />
              </button>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start"
          icon={<IconPlus size={14} />}
          onClick={() => setLignes((current) => [...current, ligneVide(current)])}
        >
          {t("dentaire.ordonnances.ajouterLigne")}
        </Button>
      </div>

      <Field label={t("dentaire.ordonnances.notes")}>
        <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </Field>

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

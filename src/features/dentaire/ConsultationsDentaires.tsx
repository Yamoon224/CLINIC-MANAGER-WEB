"use client";

import { useCallback, useEffect, useState } from "react";
import { IconCash, IconPlus } from "@tabler/icons-react";
import {
  Button,
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
  createConsultationDentaire,
  fetchActes,
  fetchConsultationsDentaires,
  recuConsultationPath,
  updateConsultationDentaire,
} from "./dentaire-api";
import { formatDate, gnf, todayIso } from "./format";
import { PraticienSelect } from "./PraticienSelect";
import {
  EncaissementModal,
  ReglementBadge,
  estEncaissable,
  useCanEncaisser,
} from "./Reglement";
import type { ConsultationDentaire } from "./types";

export function ConsultationsDentaires() {
  const { t } = useTranslation();
  const canEncaisser = useCanEncaisser();
  const [consultations, setConsultations] = useState<ConsultationDentaire[]>([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [tarifConsultation, setTarifConsultation] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ConsultationDentaire | null>(null);
  const [aEncaisser, setAEncaisser] = useState<ConsultationDentaire | null>(null);

  const load = useCallback(() => {
    fetchConsultationsDentaires(page, perPage, search)
      .then((res) => {
        setConsultations(res.data);
        setTotal(res.meta.total);
      })
      .finally(() => setLoading(false));
  }, [page, perPage, search]);

  useEffect(() => {
    load();
  }, [load]);

  // Tarif proposé par défaut : première ligne active de la rubrique "Consultation".
  useEffect(() => {
    fetchActes()
      .then((res) => {
        const acte = res.data.find((a) => a.categorie === "consultation" && a.actif);
        if (acte) setTarifConsultation(String(Number(acte.prix)));
      })
      .catch(() => undefined);
  }, []);

  const columns: Column<ConsultationDentaire>[] = [
    {
      key: "date",
      header: t("dentaire.common.date"),
      cell: (c) => formatDate(c.date_consultation),
    },
    {
      key: "patient",
      header: t("dentaire.common.patient"),
      cell: (c) => (
        <span className="font-semibold text-heading">
          {c.patient.prenom} {c.patient.nom}
          <span className="block text-[13px] font-normal text-muted">
            {c.patient.numero_dossier}
          </span>
        </span>
      ),
    },
    {
      key: "motif",
      header: t("dentaire.consultations.motif"),
      cell: (c) => (
        <span className="block max-w-[13rem] truncate" title={c.motif}>
          {c.motif}
        </span>
      ),
    },
    {
      key: "praticien",
      header: t("dentaire.common.praticien"),
      cell: (c) => c.praticien.name,
    },
    {
      key: "montant",
      header: t("dentaire.common.montant"),
      cell: (c) => gnf(c.montant),
    },
    {
      key: "reglement",
      header: t("dentaire.reglement.label"),
      cell: (c) => <ReglementBadge facture={c.facture} />,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      headClassName: "text-right",
      cell: (c) => (
        <div className="flex items-center justify-end gap-2">
          {canEncaisser && estEncaissable(c.facture) && (
            <Button
              size="sm"
              icon={<IconCash size={14} />}
              onClick={() => setAEncaisser(c)}
            >
              {t("dentaire.reglement.encaisser")}
            </Button>
          )}
          {c.facture && Number(c.facture.montant_paye) > 0 && (
            <PdfButton
              path={recuConsultationPath(c.id)}
              label={t("dentaire.reglement.recu")}
              filename={`recu-consultation-${c.id}.pdf`}
            />
          )}
          <RowActions
            edit={() => {
              setEditing(c);
              setShowForm(true);
            }}
            editLabel={t("common.edit")}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <DataTable
        columns={columns}
        rows={consultations}
        getRowKey={(c) => c.id}
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
        emptyLabel={t("dentaire.consultations.empty")}
        toolbarRight={
          <Button
            icon={<IconPlus size={15} />}
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
          >
            {t("dentaire.consultations.new")}
          </Button>
        }
      />

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={
          editing ? t("dentaire.consultations.edit") : t("dentaire.consultations.new")
        }
        size="lg"
      >
        <ConsultationForm
          key={editing?.id ?? "new"}
          initial={editing}
          tarifParDefaut={tarifConsultation}
          onCancel={() => setShowForm(false)}
          onSaved={(consultation) => {
            setShowForm(false);
            load();
            // Une nouvelle consultation s'encaisse dans la foulée, puis le reçu s'imprime.
            if (!editing && canEncaisser && estEncaissable(consultation.facture)) {
              setAEncaisser(consultation);
            }
          }}
        />
      </Modal>

      <EncaissementModal
        facture={aEncaisser?.facture ?? null}
        patient={
          aEncaisser ? `${aEncaisser.patient.prenom} ${aEncaisser.patient.nom}` : ""
        }
        onClose={() => setAEncaisser(null)}
        onPaid={() => {
          setAEncaisser(null);
          load();
        }}
      />
    </div>
  );
}

function ConsultationForm({
  initial,
  tarifParDefaut,
  onCancel,
  onSaved,
}: {
  initial: ConsultationDentaire | null;
  tarifParDefaut: string;
  onCancel: () => void;
  onSaved: (consultation: ConsultationDentaire) => void;
}) {
  const { t } = useTranslation();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [praticienId, setPraticienId] = useState<number | null>(null);
  const [date, setDate] = useState(initial?.date_consultation ?? todayIso());
  const [motif, setMotif] = useState(initial?.motif ?? "");
  const [examen, setExamen] = useState(initial?.examen ?? "");
  const [diagnostic, setDiagnostic] = useState(initial?.diagnostic ?? "");
  const [planTraitement, setPlanTraitement] = useState(initial?.plan_traitement ?? "");
  const [poids, setPoids] = useState(initial?.poids ?? "");
  const [montant, setMontant] = useState(tarifParDefaut);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!initial && !patient) {
      setError(t("dentaire.common.patientRequired"));
      return;
    }
    setBusy(true);
    setError(null);
    const clinique = {
      motif,
      examen: examen || null,
      diagnostic: diagnostic || null,
      plan_traitement: planTraitement || null,
      poids: poids === "" ? null : Number(poids),
    };
    try {
      const { data } = initial
        ? await updateConsultationDentaire(initial.id, clinique)
        : await createConsultationDentaire({
            ...clinique,
            patient_id: patient!.id,
            praticien_id: praticienId,
            date_consultation: date,
            montant: Number(montant) || 0,
          });
      onSaved(data);
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
          <>
            <Field label={t("dentaire.common.patient")} required full>
              <PatientSelect
                value={patient}
                onChange={setPatient}
                placeholder={t("dentaire.common.patientPlaceholder")}
              />
            </Field>
            <Field label={t("dentaire.common.date")}>
              <DateInput value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
            <Field label={t("dentaire.common.praticien")}>
              <PraticienSelect value={praticienId} onChange={setPraticienId} />
            </Field>
          </>
        )}
        <Field label={t("dentaire.consultations.motif")} required full>
          <Textarea
            required
            rows={2}
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
          />
        </Field>
        <Field label={t("dentaire.consultations.examen")} full>
          <Textarea
            rows={2}
            value={examen}
            onChange={(e) => setExamen(e.target.value)}
          />
        </Field>
        <Field label={t("dentaire.consultations.diagnostic")}>
          <Textarea
            rows={2}
            value={diagnostic}
            onChange={(e) => setDiagnostic(e.target.value)}
          />
        </Field>
        <Field label={t("dentaire.consultations.planTraitement")}>
          <Textarea
            rows={2}
            value={planTraitement}
            onChange={(e) => setPlanTraitement(e.target.value)}
          />
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
          <Field
            label={`${t("dentaire.common.montant")} (GNF)`}
            hint={t("dentaire.consultations.montantHint")}
            required
          >
            <Input
              type="number"
              min={0}
              required
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
            />
          </Field>
        )}
      </div>
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

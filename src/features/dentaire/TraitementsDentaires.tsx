"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import {
  Badge,
  Button,
  DataTable,
  DateInput,
  Field,
  Input,
  Modal,
  PatientSelect,
  Select,
  Textarea,
  type Column,
  type Tone,
} from "@/components/ui";
import type { Patient } from "@/features/patients/types";
import { apiErrorMessage } from "@/lib/api-client";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import {
  createTraitementDentaire,
  fetchActes,
  fetchTraitementsDentaires,
} from "./dentaire-api";
import { formatDate, gnf, todayIso } from "./format";
import { PraticienSelect } from "./PraticienSelect";
import { ReglementBadge } from "./Reglement";
import type {
  ActeDentaire,
  TraitementDentaire,
  TraitementStatut,
} from "./types";

export const TRAITEMENT_STATUT_TONES: Record<TraitementStatut, Tone> = {
  en_cours: "primary",
  termine: "success",
  annule: "neutral",
};

export function TraitementsDentaires() {
  const { t } = useTranslation();
  const router = useRouter();
  const [traitements, setTraitements] = useState<TraitementDentaire[]>([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [statut, setStatut] = useState<TraitementStatut | "">("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchTraitementsDentaires(page, perPage, search, statut || undefined)
      .then((res) => {
        if (cancelled) return;
        setTraitements(res.data);
        setTotal(res.meta.total);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, perPage, search, statut]);

  const columns: Column<TraitementDentaire>[] = [
    {
      key: "date",
      header: t("dentaire.common.date"),
      cell: (tr) => formatDate(tr.date_debut),
    },
    {
      key: "patient",
      header: t("dentaire.common.patient"),
      cell: (tr) => (
        <span className="font-semibold text-heading">
          {tr.patient.prenom} {tr.patient.nom}
          <span className="block text-[13px] font-normal text-muted">
            {tr.patient.numero_dossier}
          </span>
        </span>
      ),
    },
    {
      key: "actes",
      header: t("dentaire.traitements.actes"),
      cell: (tr) => (
        <span className="block max-w-xs truncate">
          {tr.actes[0]?.designation ?? "-"}
          {tr.actes.length > 1 && (
            <span className="text-muted">
              {" "}
              · {t("dentaire.traitements.actesCount", { count: tr.actes.length })}
            </span>
          )}
        </span>
      ),
    },
    {
      key: "total",
      header: t("dentaire.reglement.total"),
      cell: (tr) => gnf(tr.montant_total),
    },
    {
      key: "reste",
      header: t("dentaire.reglement.reste"),
      cell: (tr) =>
        tr.facture && tr.facture.statut !== "annulee" ? (
          <span
            className={
              tr.facture.solde > 0 ? "font-semibold text-danger" : "text-success"
            }
          >
            {gnf(tr.facture.solde)}
          </span>
        ) : (
          "-"
        ),
    },
    {
      key: "reglement",
      header: t("dentaire.reglement.label"),
      cell: (tr) => <ReglementBadge facture={tr.facture} />,
    },
    {
      key: "statut",
      header: t("dentaire.traitements.statut"),
      cell: (tr) => (
        <Badge tone={TRAITEMENT_STATUT_TONES[tr.statut]} border>
          {t(`dentaire.traitements.statuts.${tr.statut}`)}
        </Badge>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <DataTable
        columns={columns}
        rows={traitements}
        getRowKey={(tr) => tr.id}
        onRowClick={(tr) => router.push(`/dentaire/traitements/${tr.id}`)}
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
        emptyLabel={t("dentaire.traitements.empty")}
        toolbarRight={
          <>
            <Select
              className="w-48"
              value={statut}
              onChange={(e) => {
                setStatut(e.target.value as TraitementStatut | "");
                setPage(1);
              }}
            >
              <option value="">{t("dentaire.traitements.tousStatuts")}</option>
              <option value="en_cours">{t("dentaire.traitements.statuts.en_cours")}</option>
              <option value="termine">{t("dentaire.traitements.statuts.termine")}</option>
              <option value="annule">{t("dentaire.traitements.statuts.annule")}</option>
            </Select>
            <Button icon={<IconPlus size={15} />} onClick={() => setShowForm(true)}>
              {t("dentaire.traitements.new")}
            </Button>
          </>
        }
      />

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={t("dentaire.traitements.new")}
        size="xl"
      >
        <TraitementForm
          onCancel={() => setShowForm(false)}
          onCreated={(traitement) =>
            router.push(`/dentaire/traitements/${traitement.id}`)
          }
        />
      </Modal>
    </div>
  );
}

interface LigneForm {
  /** Identifiant local stable pour la clé React. */
  cle: number;
  /** "" = acte libre (hors grille). */
  acteId: string;
  designation: string;
  dent: string;
  quantite: string;
  prixUnitaire: string;
}

function ligneVide(lignes: LigneForm[]): LigneForm {
  return {
    cle: lignes.reduce((max, ligne) => Math.max(max, ligne.cle), 0) + 1,
    acteId: "",
    designation: "",
    dent: "",
    quantite: "1",
    prixUnitaire: "",
  };
}

function montantLigne(ligne: LigneForm): number {
  return (Number(ligne.quantite) || 0) * (Number(ligne.prixUnitaire) || 0);
}

function TraitementForm({
  onCancel,
  onCreated,
}: {
  onCancel: () => void;
  onCreated: (traitement: TraitementDentaire) => void;
}) {
  const { t } = useTranslation();
  const [actes, setActes] = useState<ActeDentaire[]>([]);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [praticienId, setPraticienId] = useState<number | null>(null);
  const [date, setDate] = useState(todayIso());
  const [poids, setPoids] = useState("");
  const [notes, setNotes] = useState("");
  const [lignes, setLignes] = useState<LigneForm[]>(() => [ligneVide([])]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActes()
      .then((res) => setActes(res.data.filter((a) => a.actif)))
      .catch(() => setActes([]));
  }, []);

  function updateLigne(cle: number, patch: Partial<LigneForm>) {
    setLignes((current) =>
      current.map((ligne) => (ligne.cle === cle ? { ...ligne, ...patch } : ligne)),
    );
  }

  function choisirActe(cle: number, acteId: string) {
    const acte = actes.find((a) => String(a.id) === acteId);
    updateLigne(cle, {
      acteId,
      designation: acte?.libelle ?? "",
      prixUnitaire: acte ? String(Number(acte.prix)) : "",
    });
  }

  const total = lignes.reduce((sum, ligne) => sum + montantLigne(ligne), 0);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!patient) {
      setError(t("dentaire.common.patientRequired"));
      return;
    }
    const valides = lignes.filter(
      (ligne) => ligne.designation.trim() !== "" && ligne.prixUnitaire !== "",
    );
    if (valides.length === 0) {
      setError(t("dentaire.traitements.actesRequired"));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { data } = await createTraitementDentaire({
        patient_id: patient.id,
        praticien_id: praticienId,
        date_debut: date,
        poids: poids === "" ? null : Number(poids),
        notes: notes || null,
        actes: valides.map((ligne) => ({
          acte_dentaire_id: ligne.acteId === "" ? null : Number(ligne.acteId),
          designation: ligne.designation.trim(),
          dent: ligne.dent.trim() || null,
          quantite: Math.max(1, Number(ligne.quantite) || 1),
          prix_unitaire: Number(ligne.prixUnitaire),
        })),
      });
      onCreated(data);
    } catch (e) {
      setError(apiErrorMessage(e, t("dentaire.common.saveError")));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label={t("dentaire.common.patient")} required className="lg:col-span-2">
          <PatientSelect
            value={patient}
            onChange={setPatient}
            placeholder={t("dentaire.common.patientPlaceholder")}
          />
        </Field>
        <Field label={t("dentaire.common.praticien")} className="lg:col-span-2">
          <PraticienSelect value={praticienId} onChange={setPraticienId} />
        </Field>
        <Field label={t("dentaire.common.date")} className="lg:col-span-2">
          <DateInput value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label={t("dentaire.common.poids")} className="lg:col-span-2">
          <Input
            type="number"
            min={0}
            step="0.1"
            value={poids}
            onChange={(e) => setPoids(e.target.value)}
          />
        </Field>
      </div>

      <div className="flex flex-col gap-3">
        <p className="m-0 text-[13px] font-semibold text-heading">
          {t("dentaire.traitements.actes")}
        </p>
        {lignes.map((ligne) => (
          <div
            key={ligne.cle}
            className="grid gap-3 rounded-[5px] border border-border p-3 sm:grid-cols-2 lg:grid-cols-12"
          >
            <Field label={t("dentaire.traitements.acte")} className="lg:col-span-4">
              <Select
                value={ligne.acteId}
                onChange={(e) => choisirActe(ligne.cle, e.target.value)}
              >
                <option value="">{t("dentaire.traitements.acteLibre")}</option>
                {actes.map((acte) => (
                  <option key={acte.id} value={acte.id}>
                    {`${t(`dentaire.grille.categories.${acte.categorie}`)} - ${acte.libelle}`}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label={t("dentaire.traitements.designation")}
              className="lg:col-span-3"
            >
              <Input
                value={ligne.designation}
                onChange={(e) => updateLigne(ligne.cle, { designation: e.target.value })}
              />
            </Field>
            <Field
              label={t("dentaire.traitements.dent")}
              placeholder={t("dentaire.traitements.dentPlaceholder")}
              className="lg:col-span-1"
            >
              <Input
                value={ligne.dent}
                onChange={(e) => updateLigne(ligne.cle, { dent: e.target.value })}
              />
            </Field>
            <Field label={t("dentaire.traitements.quantite")} className="lg:col-span-1">
              <Input
                type="number"
                min={1}
                value={ligne.quantite}
                onChange={(e) => updateLigne(ligne.cle, { quantite: e.target.value })}
              />
            </Field>
            <Field
              label={t("dentaire.traitements.prixUnitaire")}
              className="lg:col-span-2"
            >
              <Input
                type="number"
                min={0}
                value={ligne.prixUnitaire}
                onChange={(e) =>
                  updateLigne(ligne.cle, { prixUnitaire: e.target.value })
                }
              />
            </Field>
            <div className="flex items-end justify-end lg:col-span-1">
              <button
                type="button"
                disabled={lignes.length === 1}
                onClick={() =>
                  setLignes((current) => current.filter((l) => l.cle !== ligne.cle))
                }
                className="inline-flex h-9 w-9 items-center justify-center rounded-[5px] border border-border text-danger hover:bg-danger-light disabled:opacity-40"
                aria-label={t("dentaire.traitements.retirerActe")}
                title={t("dentaire.traitements.retirerActe")}
              >
                <IconTrash size={15} />
              </button>
            </div>
          </div>
        ))}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={<IconPlus size={14} />}
            onClick={() => setLignes((current) => [...current, ligneVide(current)])}
          >
            {t("dentaire.traitements.ajouterActe")}
          </Button>
          <p className="m-0 text-sm text-muted">
            {t("dentaire.traitements.total")} :{" "}
            <span className="text-base font-bold text-heading">{gnf(total)}</span>
          </p>
        </div>
      </div>

      <Field label={t("dentaire.traitements.notes")}>
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

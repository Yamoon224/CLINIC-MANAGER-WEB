"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { IconChevronLeft, IconPlus } from "@tabler/icons-react";
import {
  ajouterSuivi,
  annulerOperation,
  fetchLits,
  fetchOperations,
  fetchSejour,
  planifierOperation,
  sortir,
  terminerOperation,
  transferer,
} from "./hospitalisation-api";
import { fetchPraticiens } from "@/features/rendezvous/rendezvous-api";
import type { Praticien } from "@/features/rendezvous/types";
import type { Lit, Operation, Sejour } from "./types";
import {
  Badge,
  Button,
  Card,
  Field,
  Input,
  Modal,
  PageHeader,
  Select,
  Textarea,
} from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

const OPERATION_STATUT_TONE = {
  planifiee: "warning",
  realisee: "success",
  annulee: "neutral",
} as const;

const SEJOUR_STATUT_TONE = {
  en_cours: "primary",
  termine: "success",
} as const;

export function SejourDetail({ id }: { id: number }) {
  const { t } = useTranslation();
  const [sejour, setSejour] = useState<Sejour | null>(null);
  const [litsLibres, setLitsLibres] = useState<Lit[]>([]);
  const [nouveauLitId, setNouveauLitId] = useState<number | "">("");

  const [temperature, setTemperature] = useState("");
  const [tension, setTension] = useState("");
  const [pouls, setPouls] = useState("");
  const [observations, setObservations] = useState("");
  const [busy, setBusy] = useState(false);

  const [operations, setOperations] = useState<Operation[]>([]);
  const [praticiens, setPraticiens] = useState<Praticien[]>([]);
  const [showPlanifierModal, setShowPlanifierModal] = useState(false);
  const [operationATerminer, setOperationATerminer] = useState<Operation | null>(null);

  const load = useCallback(() => {
    fetchSejour(id).then((res) => setSejour(res.data));
    fetchLits().then((res) => setLitsLibres(res.data.filter((l) => l.statut === "libre")));
    fetchOperations(id).then((res) => setOperations(res.data));
  }, [id]);

  useEffect(() => {
    load();
    fetchPraticiens().then((res) => setPraticiens(res.data));
  }, [load]);

  async function handleAjouterSuivi() {
    setBusy(true);
    try {
      await ajouterSuivi(id, {
        releve_at: new Date().toISOString(),
        temperature: temperature ? Number(temperature) : undefined,
        tension: tension || undefined,
        pouls: pouls ? Number(pouls) : undefined,
        observations: observations || undefined,
      });
      setTemperature("");
      setTension("");
      setPouls("");
      setObservations("");
      load();
    } finally {
      setBusy(false);
    }
  }

  async function handleTransferer() {
    if (!nouveauLitId) return;
    setBusy(true);
    try {
      await transferer(id, nouveauLitId);
      setNouveauLitId("");
      load();
    } finally {
      setBusy(false);
    }
  }

  async function handleSortir() {
    setBusy(true);
    try {
      await sortir(id);
      load();
    } finally {
      setBusy(false);
    }
  }

  async function handleAnnulerOperation(operation: Operation) {
    await annulerOperation(operation.id);
    load();
  }

  if (!sejour) return <p className="text-muted">{t("common.loading")}</p>;

  const readOnly = sejour.statut === "termine";

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/hospitalisation"
        className="inline-flex w-fit items-center gap-1 text-sm font-semibold text-heading hover:text-primary"
      >
        <IconChevronLeft size={16} />
        {t("nav.hospitalisation")}
      </Link>
      <PageHeader
        title={t("hospitalisation.detail.title", {
          prenom: sejour.patient.prenom,
          nom: sejour.patient.nom,
        })}
        description={t("hospitalisation.detail.description", {
          chambre: sejour.lit.chambre,
          numero: sejour.lit.numero,
          motif: sejour.motif,
        })}
        actions={
          <Badge border tone={SEJOUR_STATUT_TONE[sejour.statut]}>
            {t(`hospitalisation.detail.statut${sejour.statut === "en_cours" ? "EnCours" : "Termine"}`)}
          </Badge>
        }
      />

      {readOnly && (
        <div className="rounded-[6px] border border-success/30 bg-success-light p-3 text-sm text-success">
          {t("hospitalisation.detail.dischargedBanner", {
            days: sejour.nombre_jours,
            montant: sejour.frais_sejour ?? "",
          })}
        </div>
      )}

      <div>
        <h2 className="mb-2 font-semibold text-heading">
          {t("hospitalisation.detail.temperatureSheet")}
        </h2>
        <ul className="flex flex-col gap-2 mb-3 text-sm">
          {sejour.suivis.map((s) => (
            <li key={s.id} className="rounded-[6px] border border-border bg-surface p-3">
              <span className="text-muted">
                {s.releve_at && new Date(s.releve_at).toLocaleString("fr-FR")}
              </span>{" "}
              {s.temperature && `${s.temperature}°C `}
              {s.pouls && `· ${s.pouls} bpm `}
              {s.observations && <p>{s.observations}</p>}
            </li>
          ))}
          {sejour.suivis.length === 0 && (
            <li className="text-muted">{t("hospitalisation.detail.noReadings")}</li>
          )}
        </ul>

        {!readOnly && (
          <Card className="flex flex-col gap-3">
            <div className="grid grid-cols-3 gap-2">
              <Field label={t("hospitalisation.detail.temperature")}>
                <Input
                  placeholder={t("hospitalisation.detail.temperaturePlaceholder")}
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                />
              </Field>
              <Field label={t("hospitalisation.detail.tension")}>
                <Input
                  placeholder={t("hospitalisation.detail.tensionPlaceholder")}
                  value={tension}
                  onChange={(e) => setTension(e.target.value)}
                />
              </Field>
              <Field label={t("hospitalisation.detail.pouls")}>
                <Input
                  placeholder={t("hospitalisation.detail.poulsPlaceholder")}
                  value={pouls}
                  onChange={(e) => setPouls(e.target.value)}
                />
              </Field>
            </div>
            <Textarea
              placeholder={t("hospitalisation.detail.observationsPlaceholder")}
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              rows={2}
            />
            <Button onClick={handleAjouterSuivi} disabled={busy} className="self-start">
              {t("hospitalisation.detail.addReading")}
            </Button>
          </Card>
        )}
      </div>

      <div className="border-t border-border pt-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold text-heading">
            {t("hospitalisation.operations.title")}
          </h2>
          {!readOnly && (
            <Button size="sm" onClick={() => setShowPlanifierModal(true)}>
              <><IconPlus size={15} className="mr-1" />{t("hospitalisation.operations.newOperation")}</>
            </Button>
          )}
        </div>

        {operations.length === 0 && (
          <p className="text-sm text-muted">{t("hospitalisation.operations.empty")}</p>
        )}

        {operations.length > 0 && (
          <Card className="overflow-x-auto p-0">
            <table className="table">
              <thead>
                <tr>
                  <th>{t("hospitalisation.operations.type")}</th>
                  <th>{t("hospitalisation.operations.datePrevue")}</th>
                  <th>{t("hospitalisation.operations.praticien")}</th>
                  <th>{t("hospitalisation.operations.statut")}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {operations.map((operation) => (
                  <tr key={operation.id}>
                    <td className="font-medium">{operation.type_operation}</td>
                    <td>
                      {operation.date_prevue &&
                        new Date(operation.date_prevue).toLocaleString("fr-FR")}
                    </td>
                    <td>{operation.praticien?.name ?? "-"}</td>
                    <td>
                      <Badge border tone={OPERATION_STATUT_TONE[operation.statut]}>
                        {t(`hospitalisation.operations.statut${operation.statut.charAt(0).toUpperCase()}${operation.statut.slice(1)}`)}
                      </Badge>
                    </td>
                    <td>
                      {operation.statut === "planifiee" && (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => setOperationATerminer(operation)}>
                            {t("hospitalisation.operations.terminer")}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAnnulerOperation(operation)}
                          >
                            {t("hospitalisation.operations.annuler")}
                          </Button>
                        </div>
                      )}
                      {operation.statut === "realisee" && operation.compte_rendu && (
                        <span className="text-xs text-muted">{operation.compte_rendu}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>

      {!readOnly && (
        <div className="flex items-center gap-3 border-t border-border pt-4">
          <Select
            value={nouveauLitId}
            onChange={(e) => setNouveauLitId(e.target.value ? Number(e.target.value) : "")}
            className="max-w-xs"
          >
            <option value="">{t("hospitalisation.detail.transferPlaceholder")}</option>
            {litsLibres.map((l) => (
              <option key={l.id} value={l.id}>
                {t("hospitalisation.detail.room", { chambre: l.chambre, numero: l.numero })}
              </option>
            ))}
          </Select>
          <Button variant="outline" onClick={handleTransferer} disabled={busy || !nouveauLitId}>
            {t("hospitalisation.detail.transfer")}
          </Button>

          <Button onClick={handleSortir} disabled={busy} className="ml-auto">
            {t("hospitalisation.detail.discharge")}
          </Button>
        </div>
      )}

      <Modal
        open={showPlanifierModal}
        onClose={() => setShowPlanifierModal(false)}
        title={t("hospitalisation.operations.newOperation")}
      >
        <PlanifierOperationForm
          sejourId={id}
          praticiens={praticiens}
          onCancel={() => setShowPlanifierModal(false)}
          onCreated={() => {
            setShowPlanifierModal(false);
            load();
          }}
        />
      </Modal>

      <Modal
        open={operationATerminer !== null}
        onClose={() => setOperationATerminer(null)}
        title={t("hospitalisation.operations.confirmTerminer")}
      >
        {operationATerminer && (
          <TerminerOperationForm
            operation={operationATerminer}
            onCancel={() => setOperationATerminer(null)}
            onDone={() => {
              setOperationATerminer(null);
              load();
            }}
          />
        )}
      </Modal>
    </div>
  );
}

function PlanifierOperationForm({
  sejourId,
  praticiens,
  onCancel,
  onCreated,
}: {
  sejourId: number;
  praticiens: Praticien[];
  onCancel: () => void;
  onCreated: () => void;
}) {
  const { t } = useTranslation();
  const [typeOperation, setTypeOperation] = useState("");
  const [datePrevue, setDatePrevue] = useState("");
  const [praticienId, setPraticienId] = useState<number | "">("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await planifierOperation(sejourId, {
        type_operation: typeOperation,
        date_prevue: new Date(datePrevue).toISOString(),
        praticien_id: praticienId || undefined,
      });
      onCreated();
    } catch {
      setError(t("hospitalisation.operations.errorSubmit"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label={t("hospitalisation.operations.type")} required>
        <Input
          required
          placeholder={t("hospitalisation.operations.typePlaceholder")}
          value={typeOperation}
          onChange={(e) => setTypeOperation(e.target.value)}
        />
      </Field>
      <Field label={t("hospitalisation.operations.datePrevue")} required>
        <Input
          type="datetime-local"
          required
          value={datePrevue}
          onChange={(e) => setDatePrevue(e.target.value)}
        />
      </Field>
      <Field label={t("hospitalisation.operations.praticien")}>
        <Select
          value={praticienId}
          onChange={(e) => setPraticienId(e.target.value ? Number(e.target.value) : "")}
        >
          <option value="">{t("hospitalisation.operations.praticienPlaceholder")}</option>
          {praticiens.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      </Field>
      {error && (
        <p className="rounded-[5px] bg-danger-light px-3 py-2 text-sm text-danger">{error}</p>
      )}
      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? t("hospitalisation.operations.submitting")
            : t("hospitalisation.operations.submit")}
        </Button>
        <Button type="button" variant="light" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
      </div>
    </form>
  );
}

function TerminerOperationForm({
  operation,
  onCancel,
  onDone,
}: {
  operation: Operation;
  onCancel: () => void;
  onDone: () => void;
}) {
  const { t } = useTranslation();
  const [compteRendu, setCompteRendu] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await terminerOperation(operation.id, compteRendu);
      onDone();
    } catch {
      setError(t("hospitalisation.operations.errorTerminer"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label={t("hospitalisation.operations.compteRendu")} required>
        <Textarea
          required
          placeholder={t("hospitalisation.operations.compteRenduPlaceholder")}
          value={compteRendu}
          onChange={(e) => setCompteRendu(e.target.value)}
          rows={4}
        />
      </Field>
      {error && (
        <p className="rounded-[5px] bg-danger-light px-3 py-2 text-sm text-danger">{error}</p>
      )}
      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? t("hospitalisation.operations.submitting")
            : t("hospitalisation.operations.submitTerminer")}
        </Button>
        <Button type="button" variant="light" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
      </div>
    </form>
  );
}

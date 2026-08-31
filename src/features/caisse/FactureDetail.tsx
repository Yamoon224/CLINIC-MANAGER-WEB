"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { IconChevronLeft } from "@tabler/icons-react";
import { annulerFacture, encaisser, fetchFacture } from "./caisse-api";
import { MODE_PAIEMENT_LABELS, type Facture, type ModePaiement } from "./types";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Field,
  Input,
  Modal,
  PageHeader,
  PdfButton,
  Select,
  type Tone,
} from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

const STATUT_TONES: Record<Facture["statut"], Tone> = {
  ouverte: "primary",
  partiellement_payee: "warning",
  payee: "success",
  annulee: "neutral",
};

function fcfa(v: number | string): string {
  return `${Number(v).toLocaleString("fr-FR")} F CFA`;
}

export function FactureDetail({ id }: { id: number }) {
  const { t } = useTranslation();
  const [facture, setFacture] = useState<Facture | null>(null);
  const [busy, setBusy] = useState(false);
  const [showEncaissement, setShowEncaissement] = useState(false);

  const load = useCallback(() => {
    fetchFacture(id).then((res) => setFacture(res.data));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAnnuler() {
    setBusy(true);
    try {
      await annulerFacture(id);
      load();
    } finally {
      setBusy(false);
    }
  }

  if (!facture) return <p className="text-muted">{t("common.loading")}</p>;

  const active =
    facture.statut === "ouverte" || facture.statut === "partiellement_payee";

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/caisse"
        className="inline-flex w-fit items-center gap-1 text-sm font-semibold text-heading hover:text-primary"
      >
        <IconChevronLeft size={16} />
        {t("nav.caisse")}
      </Link>

      <PageHeader
        title={t("caisse.factureDetail.title", {
          id: facture.id,
          prenom: facture.patient.prenom,
          nom: facture.patient.nom,
        })}
        description={t("caisse.factureDetail.description", {
          numero: facture.patient.numero_dossier,
        })}
        actions={
          <>
            <PdfButton
              path={`/factures/${id}/pdf`}
              label={t("caisse.factureDetail.exportPdf")}
            />
            <Badge tone={STATUT_TONES[facture.statut]} border>
              {t(`caisse.factureStatut.${facture.statut}`)}
            </Badge>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="overflow-hidden p-0 lg:col-span-2">
          <table className="table">
            <thead>
              <tr>
                <th>{t("caisse.factureDetail.designation")}</th>
                <th>{t("caisse.factureDetail.quantite")}</th>
                <th>{t("caisse.factureDetail.prixUnitaire")}</th>
                <th className="text-right">
                  {t("caisse.factureDetail.montant")}
                </th>
              </tr>
            </thead>
            <tbody>
              {facture.lignes.map((l) => (
                <tr key={l.id}>
                  <td className="font-medium text-heading">{l.designation}</td>
                  <td>{l.quantite}</td>
                  <td>{fcfa(l.prix_unitaire)}</td>
                  <td className="text-right">{fcfa(l.montant)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card className="flex h-fit flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">{t("caisse.factureDetail.total")}</span>
            <span className="font-semibold text-heading">
              {fcfa(facture.montant_total)}
            </span>
          </div>
          {facture.assurance_patient && (
            <>
              <div className="flex justify-between text-muted">
                <span>
                  {t("caisse.factureDetail.partCompagnie", {
                    compagnie: facture.assurance_patient.compagnie,
                  })}
                </span>
                <span>{fcfa(facture.montant_part_assurance)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>{t("caisse.factureDetail.partPatient")}</span>
                <span>{fcfa(facture.montant_part_patient)}</span>
              </div>
            </>
          )}
          <div className="flex justify-between border-t border-border pt-2">
            <span className="text-muted">{t("caisse.factureDetail.paye")}</span>
            <span>{fcfa(facture.montant_paye)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">{t("caisse.factureDetail.solde")}</span>
            <span
              className={`font-semibold ${Number(facture.solde) > 0 ? "text-danger" : "text-success"}`}
            >
              {fcfa(facture.solde)}
            </span>
          </div>
          {active && (
            <Button
              className="mt-2 w-full"
              onClick={() => setShowEncaissement(true)}
            >
              {t("caisse.factureDetail.encaisser")}
            </Button>
          )}
        </Card>
      </div>

      <Card className="p-0">
        <CardHeader title={t("caisse.factureDetail.encaissementsTitle")} />
        <div className="flex flex-col divide-y divide-border">
          {facture.encaissements.map((e) => (
            <div
              key={e.id}
              className="flex items-center justify-between px-5 py-3 text-sm"
            >
              <span className="font-medium text-heading">{fcfa(e.montant)}</span>
              <span className="text-muted">
                {t(`caisse.modePaiement.${e.mode_paiement}`)}
                {e.caissier && ` · ${e.caissier.name}`}
              </span>
            </div>
          ))}
          {facture.encaissements.length === 0 && (
            <p className="px-5 py-4 text-sm text-muted">
              {t("caisse.factureDetail.noEncaissements")}
            </p>
          )}
        </div>
      </Card>

      {facture.statut === "ouverte" && (
        <Button
          variant="outline"
          onClick={handleAnnuler}
          disabled={busy}
          className="self-start border-danger/40 text-danger hover:bg-danger-light"
        >
          {t("caisse.factureDetail.annulerFacture")}
        </Button>
      )}

      <Modal
        open={showEncaissement}
        onClose={() => setShowEncaissement(false)}
        title={t("caisse.factureDetail.encaisser")}
      >
        <EncaissementForm
          factureId={id}
          onCancel={() => setShowEncaissement(false)}
          onCreated={() => {
            setShowEncaissement(false);
            load();
          }}
        />
      </Modal>
    </div>
  );
}

function EncaissementForm({
  factureId,
  onCancel,
  onCreated,
}: {
  factureId: number;
  onCancel?: () => void;
  onCreated: () => void;
}) {
  const { t } = useTranslation();
  const [montant, setMontant] = useState("");
  const [modePaiement, setModePaiement] = useState<ModePaiement>("especes");
  const [reference, setReference] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!montant) return;
    setBusy(true);
    setError(null);
    try {
      await encaisser(factureId, {
        montant: Number(montant),
        mode_paiement: modePaiement,
        reference: reference || undefined,
      });
      onCreated();
    } catch {
      setError(t("caisse.factureDetail.encaisserError"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("caisse.factureDetail.montant")} required>
          <Input
            placeholder={t("caisse.factureDetail.montantPlaceholder")}
            value={montant}
            onChange={(e) => setMontant(e.target.value)}
            required
          />
        </Field>
        <Field label={t("caisse.factureDetail.modePaiement")}>
          <Select
            value={modePaiement}
            onChange={(e) => setModePaiement(e.target.value as ModePaiement)}
          >
            {Object.keys(MODE_PAIEMENT_LABELS).map((value) => (
              <option key={value} value={value}>
                {t(`caisse.modePaiement.${value}`)}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label={t("caisse.factureDetail.referencePlaceholder")}>
        <Input
          placeholder={t("caisse.factureDetail.referencePlaceholder")}
          value={reference}
          onChange={(e) => setReference(e.target.value)}
        />
      </Field>
      {error && (
        <p className="rounded-[5px] bg-danger-light px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="light" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
        )}
        <Button type="submit" disabled={busy}>
          {t("caisse.factureDetail.encaisser")}
        </Button>
      </div>
    </form>
  );
}

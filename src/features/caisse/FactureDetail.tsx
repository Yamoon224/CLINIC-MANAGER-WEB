"use client";

import { useCallback, useEffect, useState } from "react";
import { annulerFacture, encaisser, fetchFacture } from "./caisse-api";
import { MODE_PAIEMENT_LABELS, type Facture, type ModePaiement } from "./types";
import { Badge, Button, Card, Input, Modal, PageHeader, PdfButton, Select } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

const STATUT_TONES: Record<Facture["statut"], "primary" | "warning" | "success" | "neutral"> = {
  ouverte: "primary",
  partiellement_payee: "warning",
  payee: "success",
  annulee: "neutral",
};

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

  const active = facture.statut === "ouverte" || facture.statut === "partiellement_payee";

  return (
    <div className="flex flex-col gap-4">
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
          <div className="flex items-center gap-2">
            <PdfButton path={`/factures/${id}/pdf`} label={t("caisse.factureDetail.exportPdf")} />
            <Badge tone={STATUT_TONES[facture.statut]}>{t(`caisse.factureStatut.${facture.statut}`)}</Badge>
          </div>
        }
      />

      <Card className="p-0 overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th>{t("caisse.factureDetail.designation")}</th>
              <th>{t("caisse.factureDetail.quantite")}</th>
              <th>{t("caisse.factureDetail.prixUnitaire")}</th>
              <th>{t("caisse.factureDetail.montant")}</th>
            </tr>
          </thead>
          <tbody>
            {facture.lignes.map((l) => (
              <tr key={l.id}>
                <td>{l.designation}</td>
                <td>{l.quantite}</td>
                <td>{l.prix_unitaire}</td>
                <td>{l.montant}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card className="flex flex-col gap-1.5 max-w-xs text-sm">
        <div className="flex justify-between">
          <span>{t("caisse.factureDetail.total")}</span>
          <span className="font-semibold">{facture.montant_total} F CFA</span>
        </div>
        {facture.assurance_patient && (
          <>
            <div className="flex justify-between text-muted">
              <span>
                {t("caisse.factureDetail.partCompagnie", {
                  compagnie: facture.assurance_patient.compagnie,
                })}
              </span>
              <span>{facture.montant_part_assurance} F CFA</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>{t("caisse.factureDetail.partPatient")}</span>
              <span>{facture.montant_part_patient} F CFA</span>
            </div>
          </>
        )}
        <div className="flex justify-between">
          <span>{t("caisse.factureDetail.paye")}</span>
          <span>{facture.montant_paye} F CFA</span>
        </div>
        <div className="flex justify-between">
          <span>{t("caisse.factureDetail.solde")}</span>
          <span className="font-semibold">{facture.solde} F CFA</span>
        </div>
      </Card>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-foreground">
            {t("caisse.factureDetail.encaissementsTitle")}
          </h2>
          {active && (
            <Button size="sm" onClick={() => setShowEncaissement(true)}>
              + {t("caisse.factureDetail.encaisser")}
            </Button>
          )}
        </div>
        <ul className="text-sm flex flex-col gap-2 mb-3">
          {facture.encaissements.map((e) => (
            <li key={e.id} className="rounded-xl border border-border bg-surface p-3">
              {e.montant} F CFA - {t(`caisse.modePaiement.${e.mode_paiement}`)}
              {e.caissier && ` (${e.caissier.name})`}
            </li>
          ))}
          {facture.encaissements.length === 0 && (
            <li className="text-muted">{t("caisse.factureDetail.noEncaissements")}</li>
          )}
        </ul>
      </div>

      {active && (
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
      )}

      {facture.statut === "ouverte" && (
        <Button variant="ghost" onClick={handleAnnuler} disabled={busy} className="self-start text-danger hover:bg-danger-light">
          {t("caisse.factureDetail.annulerFacture")}
        </Button>
      )}
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
      setMontant("");
      setReference("");
      onCreated();
    } catch {
      setError(t("caisse.factureDetail.encaisserError"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Input
        placeholder={t("caisse.factureDetail.montantPlaceholder")}
        value={montant}
        onChange={(e) => setMontant(e.target.value)}
      />
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
      <Input
        placeholder={t("caisse.factureDetail.referencePlaceholder")}
        value={reference}
        onChange={(e) => setReference(e.target.value)}
      />
      {error && (
        <p className="rounded-lg bg-danger-light px-3 py-2 text-sm text-danger">{error}</p>
      )}
      <div className="flex gap-2">
        <Button type="submit" disabled={busy}>
          {t("caisse.factureDetail.encaisser")}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
        )}
      </div>
    </form>
  );
}

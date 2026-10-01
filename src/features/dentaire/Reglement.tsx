"use client";

import { useState } from "react";
import { encaisser } from "@/features/caisse/caisse-api";
import {
  MODE_PAIEMENT_LABELS,
  type ModePaiement,
} from "@/features/caisse/types";
import {
  Badge,
  Button,
  Field,
  Input,
  Modal,
  Select,
  type Tone,
} from "@/components/ui";
import { useAuth } from "@/features/auth/auth-context";
import { apiErrorMessage } from "@/lib/api-client";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { gnf } from "./format";
import type { FactureDentaire } from "./types";

const STATUT_TONES: Record<FactureDentaire["statut"], Tone> = {
  ouverte: "warning",
  partiellement_payee: "info",
  payee: "success",
  annulee: "neutral",
};

/* Profils ayant accès à la Caisse (cf. RolesAndPermissionsSeeder) : eux seuls
   se voient proposer l'encaissement depuis les écrans du cabinet dentaire. */
const ROLES_CAISSE = ["administrateur", "caissier", "comptable"];

export function useCanEncaisser(): boolean {
  const { user } = useAuth();
  return user?.roles.some((role) => ROLES_CAISSE.includes(role)) ?? false;
}

/** Une facture peut encore recevoir un versement. */
export function estEncaissable(facture: FactureDentaire | null): facture is FactureDentaire {
  return (
    facture !== null &&
    (facture.statut === "ouverte" || facture.statut === "partiellement_payee") &&
    facture.solde > 0
  );
}

export function ReglementBadge({ facture }: { facture: FactureDentaire | null }) {
  const { t } = useTranslation();

  if (!facture) {
    return <Badge tone="neutral">{t("dentaire.reglement.sansFacture")}</Badge>;
  }

  return (
    <Badge tone={STATUT_TONES[facture.statut]} border>
      {t(`dentaire.reglement.${facture.statut}`)}
    </Badge>
  );
}

/* Encaissement d'une facture dentaire : passe par la Caisse (même route que
   l'écran facture), donc soumis à ses règles - session ouverte, solde. */
export function EncaissementModal({
  facture,
  patient,
  onClose,
  onPaid,
}: {
  /** null = modale fermée. */
  facture: FactureDentaire | null;
  patient: string;
  onClose: () => void;
  onPaid: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Modal
      open={facture !== null}
      onClose={onClose}
      title={t("dentaire.encaissement.title", { patient })}
    >
      {facture && (
        <EncaissementForm
          key={facture.id}
          facture={facture}
          onCancel={onClose}
          onPaid={onPaid}
        />
      )}
    </Modal>
  );
}

function EncaissementForm({
  facture,
  onCancel,
  onPaid,
}: {
  facture: FactureDentaire;
  onCancel: () => void;
  onPaid: () => void;
}) {
  const { t } = useTranslation();
  const [montant, setMontant] = useState(String(facture.solde));
  const [modePaiement, setModePaiement] = useState<ModePaiement>("especes");
  const [reference, setReference] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await encaisser(facture.id, {
        montant: Number(montant),
        mode_paiement: modePaiement,
        reference: reference || undefined,
      });
      onPaid();
    } catch (e) {
      setError(apiErrorMessage(e, t("dentaire.encaissement.error")));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="m-0 text-sm font-semibold text-heading">
        {t("dentaire.encaissement.resteDu", { montant: gnf(facture.solde) })}
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("dentaire.encaissement.montant")} required>
          <Input
            type="number"
            min={1}
            max={facture.solde}
            required
            value={montant}
            onChange={(e) => setMontant(e.target.value)}
          />
        </Field>
        <Field label={t("dentaire.encaissement.modePaiement")}>
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
      <Field label={t("dentaire.encaissement.reference")}>
        <Input value={reference} onChange={(e) => setReference(e.target.value)} />
      </Field>
      <p className="m-0 text-xs text-muted">{t("dentaire.encaissement.sessionHint")}</p>
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
          {t("dentaire.encaissement.submit")}
        </Button>
      </div>
    </form>
  );
}

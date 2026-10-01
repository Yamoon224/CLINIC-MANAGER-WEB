"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { IconCash, IconChevronLeft } from "@tabler/icons-react";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  PageHeader,
  PdfButton,
} from "@/components/ui";
import { apiErrorMessage } from "@/lib/api-client";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import {
  annulerTraitementDentaire,
  fetchTraitementDentaire,
  recuTraitementPath,
  terminerTraitementDentaire,
} from "./dentaire-api";
import { formatDate, gnf } from "./format";
import {
  EncaissementModal,
  ReglementBadge,
  estEncaissable,
  useCanEncaisser,
} from "./Reglement";
import { TRAITEMENT_STATUT_TONES } from "./TraitementsDentaires";
import type { TraitementDentaire } from "./types";

export function TraitementDentaireDetail({ id }: { id: number }) {
  const { t } = useTranslation();
  const canEncaisser = useCanEncaisser();
  const [traitement, setTraitement] = useState<TraitementDentaire | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEncaissement, setShowEncaissement] = useState(false);

  const load = useCallback(() => {
    fetchTraitementDentaire(id)
      .then((res) => setTraitement(res.data))
      .catch(() => setNotFound(true));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function run(
    action: (id: number) => Promise<{ data: TraitementDentaire }>,
    fallback: string,
  ) {
    setBusy(true);
    setError(null);
    try {
      const { data } = await action(id);
      setTraitement(data);
    } catch (e) {
      setError(apiErrorMessage(e, fallback));
    } finally {
      setBusy(false);
    }
  }

  if (notFound) return <p className="text-muted">{t("dentaire.traitements.notFound")}</p>;
  if (!traitement) return <p className="text-muted">{t("common.loading")}</p>;

  const { facture, patient } = traitement;
  const versements = traitement.versements ?? [];
  const patientLabel = `${patient.prenom} ${patient.nom}`;

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/dentaire#traitements"
        className="inline-flex w-fit items-center gap-1 text-sm font-semibold text-heading hover:text-primary"
      >
        <IconChevronLeft size={16} />
        {t("nav.dentaire")}
      </Link>

      <PageHeader
        title={t("dentaire.traitements.detailTitle", {
          prenom: patient.prenom,
          nom: patient.nom,
        })}
        description={t("dentaire.traitements.detailDescription", {
          numero: patient.numero_dossier,
          date: formatDate(traitement.date_debut),
          praticien: traitement.praticien.name,
        })}
        actions={
          <>
            <Badge tone={TRAITEMENT_STATUT_TONES[traitement.statut]} border>
              {t(`dentaire.traitements.statuts.${traitement.statut}`)}
            </Badge>
            {traitement.statut === "en_cours" && (
              <Button
                variant="success"
                disabled={busy}
                onClick={() =>
                  run(terminerTraitementDentaire, t("dentaire.common.saveError"))
                }
              >
                {t("dentaire.traitements.terminer")}
              </Button>
            )}
          </>
        }
      />

      {error && (
        <p className="rounded-[5px] bg-danger-light px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="overflow-hidden p-0 lg:col-span-2">
          <table className="table">
            <thead>
              <tr>
                <th>{t("dentaire.traitements.acte")}</th>
                <th>{t("dentaire.traitements.dent")}</th>
                <th>{t("dentaire.traitements.quantite")}</th>
                <th>{t("dentaire.traitements.prixUnitaire")}</th>
                <th className="text-right">{t("dentaire.common.montant")}</th>
              </tr>
            </thead>
            <tbody>
              {traitement.actes.map((acte) => (
                <tr key={acte.id}>
                  <td className="font-medium text-heading">{acte.designation}</td>
                  <td>{acte.dent ?? "-"}</td>
                  <td>{acte.quantite}</td>
                  <td>{gnf(acte.prix_unitaire)}</td>
                  <td className="text-right">{gnf(acte.montant)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {traitement.notes && (
            <p className="m-0 border-t border-border px-5 py-3 text-sm text-muted">
              {traitement.notes}
            </p>
          )}
        </Card>

        <Card className="flex h-fit flex-col gap-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted">{t("dentaire.reglement.label")}</span>
            <ReglementBadge facture={facture} />
          </div>
          <div className="flex justify-between border-t border-border pt-2">
            <span className="text-muted">{t("dentaire.reglement.total")}</span>
            <span className="font-semibold text-heading">
              {gnf(traitement.montant_total)}
            </span>
          </div>
          {facture && (
            <>
              {Number(facture.montant_part_patient) !== Number(facture.montant_total) && (
                <div className="flex justify-between text-muted">
                  <span>{t("dentaire.reglement.partPatient")}</span>
                  <span>{gnf(facture.montant_part_patient)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted">{t("dentaire.reglement.paye")}</span>
                <span>{gnf(facture.montant_paye)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">{t("dentaire.reglement.reste")}</span>
                <span
                  className={`font-semibold ${facture.solde > 0 ? "text-danger" : "text-success"}`}
                >
                  {gnf(facture.solde)}
                </span>
              </div>
              {canEncaisser && estEncaissable(facture) && (
                <Button
                  className="mt-2 w-full"
                  icon={<IconCash size={15} />}
                  onClick={() => setShowEncaissement(true)}
                >
                  {t("dentaire.reglement.encaisser")}
                </Button>
              )}
              {canEncaisser && (
                <Link
                  href={`/factures/${facture.id}`}
                  className="text-center text-[13px] text-primary hover:underline"
                >
                  {t("dentaire.reglement.voirFacture")}
                </Link>
              )}
            </>
          )}
        </Card>
      </div>

      <Card className="p-0">
        <CardHeader title={t("dentaire.traitements.versements")} />
        <div className="flex flex-col divide-y divide-border">
          {versements.map((versement) => (
            <div
              key={versement.id}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm"
            >
              <div>
                <span className="font-semibold text-heading">
                  {gnf(versement.montant)}
                </span>
                <span className="text-muted">
                  {" · "}
                  {formatDate(versement.created_at)}
                  {" · "}
                  {t(`caisse.modePaiement.${versement.mode_paiement}`)}
                  {versement.caissier && ` · ${versement.caissier.name}`}
                </span>
                <span className="block text-[13px] text-muted">
                  {t("dentaire.traitements.resteApres", {
                    montant: gnf(versement.reste_a_payer),
                  })}
                </span>
              </div>
              <PdfButton
                path={recuTraitementPath(traitement.id, versement.id)}
                label={t("dentaire.traitements.recu")}
                filename={`recu-traitement-${versement.id}.pdf`}
              />
            </div>
          ))}
          {versements.length === 0 && (
            <p className="m-0 px-5 py-4 text-sm text-muted">
              {t("dentaire.traitements.aucunVersement")}
            </p>
          )}
        </div>
      </Card>

      {traitement.statut === "en_cours" && versements.length === 0 && (
        <Button
          variant="outline"
          disabled={busy}
          onClick={() =>
            run(annulerTraitementDentaire, t("dentaire.traitements.annulerError"))
          }
          className="self-start border-danger/40 text-danger hover:bg-danger-light"
        >
          {t("dentaire.traitements.annuler")}
        </Button>
      )}

      <EncaissementModal
        facture={showEncaissement ? facture : null}
        patient={patientLabel}
        onClose={() => setShowEncaissement(false)}
        onPaid={() => {
          setShowEncaissement(false);
          load();
        }}
      />
    </div>
  );
}

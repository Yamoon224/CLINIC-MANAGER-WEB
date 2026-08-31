"use client";

import { useCallback, useEffect, useState } from "react";
import { IconAlertTriangle, IconBabyCarriage, IconClipboardList } from "@tabler/icons-react";
import { getGrossesse } from "./maternite-api";
import { AccouchementForm } from "./AccouchementForm";
import { CpnForm } from "./CpnForm";
import { NouveauNeForm } from "./NouveauNeForm";
import type { Grossesse } from "./types";
import { Badge, Button, Card, Modal, PageHeader } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export function GrossesseDetail({ id }: { id: number }) {
  const { t } = useTranslation();
  const [grossesse, setGrossesse] = useState<Grossesse | null>(null);
  const [showCpnForm, setShowCpnForm] = useState(false);
  const [showNouveauNeForm, setShowNouveauNeForm] = useState(false);
  const [showAccouchementForm, setShowAccouchementForm] = useState(false);

  const STATUT_LABELS: Record<Grossesse["statut"], string> = {
    suivie: t("maternite.detail.statutSuivie"),
    accouchee: t("maternite.detail.statutAccouchee"),
    interrompue: t("maternite.detail.statutInterrompue"),
  };

  const STATUT_TONE: Record<Grossesse["statut"], "primary" | "success" | "danger"> = {
    suivie: "primary",
    accouchee: "success",
    interrompue: "danger",
  };

  const load = useCallback(() => {
    getGrossesse(id).then((res) => setGrossesse(res.data));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (!grossesse) return <p className="text-sm text-muted">{t("maternite.detail.loading")}</p>;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={t("maternite.detail.title", {
          prenom: grossesse.patient.prenom,
          nom: grossesse.patient.nom,
        })}
        description={t("maternite.detail.dossierNumero", { numero: grossesse.patient.numero_dossier })}
        actions={
          <Badge tone={STATUT_TONE[grossesse.statut]}>{STATUT_LABELS[grossesse.statut]}</Badge>
        }
      />

      {grossesse.a_risque && (
        <div className="flex items-center gap-2 rounded-[5px] bg-danger-light px-3 py-2 text-sm font-semibold text-danger">
          <IconAlertTriangle size={16} className="shrink-0" />
          {t("maternite.detail.aRisque")}
        </div>
      )}

      <Card>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <Row label={t("maternite.detail.ddr")} value={grossesse.ddr} />
          <Row label={t("maternite.detail.termePrevu")} value={grossesse.terme} />
          <Row
            label={t("maternite.detail.semainesAmenorrhee")}
            value={
              grossesse.semaines_amenorrhee
                ? t("maternite.detail.semainesValue", { sa: grossesse.semaines_amenorrhee })
                : null
            }
          />
          <Row
            label={t("maternite.detail.gestiteParite")}
            value={
              grossesse.gestite || grossesse.parite
                ? `G${grossesse.gestite ?? "?"} P${grossesse.parite ?? "?"}`
                : null
            }
          />
          <Row label={t("maternite.detail.groupeSanguin")} value={grossesse.groupe_sanguin} />
        </dl>
      </Card>

      {grossesse.facteurs_risque && (
        <div className="rounded-[5px] bg-danger-light p-3 text-sm">
          <span className="font-semibold text-danger">
            {t("maternite.detail.facteursRisque")}
          </span>
          <span className="text-heading">{grossesse.facteurs_risque}</span>
        </div>
      )}

      <div>
        <h2 className="mb-2 flex items-center gap-2 font-semibold text-heading">
          <IconClipboardList size={18} className="text-primary" />
          {t("maternite.detail.consultationsPrenatales", {
            count: grossesse.consultations_prenatales.length,
          })}
        </h2>
        <div className="mb-3 flex flex-col gap-2 text-sm">
          {grossesse.consultations_prenatales.map((cpn) => (
            <Card key={cpn.id} className="p-3">
              <div className="flex justify-between">
                <span className="font-medium">
                  {t("maternite.detail.cpnNumero", { numero: cpn.numero })}
                </span>
                <span className="text-muted">{cpn.date_cpn}</span>
              </div>
              <p className="text-muted">
                {[
                  cpn.poids && t("maternite.detail.poidsValue", { poids: cpn.poids }),
                  cpn.tension && t("maternite.detail.tensionValue", { tension: cpn.tension }),
                  cpn.hauteur_uterine &&
                    t("maternite.detail.huValue", { hu: cpn.hauteur_uterine }),
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              {cpn.risque_detecte && (
                <p className="mt-1 flex items-start gap-1.5 font-medium text-danger">
                  <IconAlertTriangle size={14} className="mt-0.5 shrink-0" />
                  {cpn.risque_details}
                </p>
              )}
            </Card>
          ))}
        </div>
        {grossesse.statut === "suivie" && (
          <>
            <Button size="sm" onClick={() => setShowCpnForm(true)}>
              {"+ "}{t("maternite.cpnForm.newCpn")}
            </Button>
            <Modal
              open={showCpnForm}
              onClose={() => setShowCpnForm(false)}
              title={t("maternite.cpnForm.newCpn")}
              size="lg"
            >
              <CpnForm
                grossesseId={grossesse.id}
                onCancel={() => setShowCpnForm(false)}
                onAdded={() => {
                  setShowCpnForm(false);
                  load();
                }}
              />
            </Modal>
          </>
        )}
      </div>

      <div>
        <h2 className="mb-2 flex items-center gap-2 font-semibold text-heading">
          <IconBabyCarriage size={18} className="text-primary" />
          {t("maternite.detail.accouchementTitle")}
        </h2>
        {grossesse.accouchement ? (
          <Card className="flex flex-col gap-2 text-sm">
            <div className="flex items-center gap-2">
              <Badge tone={grossesse.accouchement.mode === "voie_basse" ? "success" : "accent"}>
                {grossesse.accouchement.mode === "voie_basse"
                  ? t("maternite.accouchementForm.voieBasse")
                  : t("maternite.accouchementForm.cesarienne")}
              </Badge>
              <span className="text-muted">
                {grossesse.accouchement.date_heure &&
                  new Date(grossesse.accouchement.date_heure).toLocaleString("fr-FR")}
              </span>
            </div>
            {grossesse.accouchement.complications && (
              <p className="text-danger">
                {t("maternite.detail.complicationsValue", {
                  complications: grossesse.accouchement.complications,
                })}
              </p>
            )}

            <h3 className="mt-2 font-medium text-heading">
              {t("maternite.detail.nouveauxNes")}
            </h3>
            <div className="flex flex-col gap-2">
              {grossesse.accouchement.nouveau_nes.map((bebe) => (
                <Card key={bebe.id} className="p-3">
                  {bebe.patient.prenom} {bebe.patient.nom} ({bebe.patient.numero_dossier}) -{" "}
                  {bebe.sexe === "F"
                    ? t("maternite.detail.sexeFeminin")
                    : bebe.sexe === "M"
                      ? t("maternite.detail.sexeMasculin")
                      : t("maternite.detail.sexeInconnu")}
                  {bebe.poids && `, ${bebe.poids}kg`}
                  {bebe.score_apgar_1min !== null &&
                    t("maternite.detail.apgarValue", {
                      a1: bebe.score_apgar_1min,
                      a5: bebe.score_apgar_5min ?? "-",
                    })}
                </Card>
              ))}
              {grossesse.accouchement.nouveau_nes.length === 0 && (
                <p className="text-muted">{t("maternite.detail.noNouveauNe")}</p>
              )}
            </div>

            <Button size="sm" onClick={() => setShowNouveauNeForm(true)} className="self-start">
              {"+ "}{t("maternite.nouveauNeForm.newNouveauNe")}
            </Button>
            <Modal
              open={showNouveauNeForm}
              onClose={() => setShowNouveauNeForm(false)}
              title={t("maternite.nouveauNeForm.newNouveauNe")}
              size="lg"
            >
              <NouveauNeForm
                accouchementId={grossesse.accouchement.id}
                onCancel={() => setShowNouveauNeForm(false)}
                onAdded={() => {
                  setShowNouveauNeForm(false);
                  load();
                }}
              />
            </Modal>
          </Card>
        ) : grossesse.statut === "suivie" ? (
          <>
            <Button size="sm" onClick={() => setShowAccouchementForm(true)}>
              {"+ "}{t("maternite.accouchementForm.submit")}
            </Button>
            <Modal
              open={showAccouchementForm}
              onClose={() => setShowAccouchementForm(false)}
              title={t("maternite.accouchementForm.submit")}
              size="lg"
            >
              <AccouchementForm
                grossesseId={grossesse.id}
                onCancel={() => setShowAccouchementForm(false)}
                onSaved={() => {
                  setShowAccouchementForm(false);
                  load();
                }}
              />
            </Modal>
          </>
        ) : (
          <p className="text-sm text-muted">{t("maternite.detail.noAccouchement")}</p>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="contents">
      <dt className="text-muted">{label}</dt>
      <dd>{value || "-"}</dd>
    </div>
  );
}

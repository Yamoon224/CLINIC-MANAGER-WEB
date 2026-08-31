"use client";

import { useState } from "react";
import {
  IconActivity,
  IconAlertTriangle,
  IconAmbulance,
  IconBabyCarriage,
  IconBed,
  IconChevronDown,
  IconFlask,
  IconReceipt,
  IconStethoscope,
  IconVaccine,
} from "@tabler/icons-react";
import { Badge, Card, StatCard, Table, Td, Th } from "@/components/ui";
import { cn } from "@/lib/cn";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import type {
  ConsultationEpisode,
  DossierMedical as DossierMedicalData,
  Episode,
  GrossesseEpisode,
  UrgenceEpisode,
} from "./types";

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("fr-FR", { dateStyle: "medium" });
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <p className="m-0 text-[12px] font-bold uppercase tracking-wide text-muted">
        {title}
      </p>
      {children}
    </div>
  );
}

function ConstantesLine({
  constantes,
}: {
  constantes: ConsultationEpisode["constantes"];
}) {
  const { t } = useTranslation();
  const parts = [
    constantes.temperature && `${constantes.temperature} °C`,
    constantes.tension && `${t("dossierMedical.tension")} ${constantes.tension}`,
    constantes.poids && `${constantes.poids} kg`,
    constantes.pouls && `${constantes.pouls} bpm`,
  ].filter(Boolean);
  if (parts.length === 0) return null;
  return <p className="m-0 text-[13px] text-muted">{parts.join(" · ")}</p>;
}

function ConsultationBody({ episode }: { episode: ConsultationEpisode }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-3 border-t border-border px-4 py-3">
      {episode.examen_clinique && (
        <Section title={t("dossierMedical.examenClinique")}>
          <p className="m-0 whitespace-pre-line text-[13px] text-heading">
            {episode.examen_clinique}
          </p>
        </Section>
      )}
      <ConstantesLine constantes={episode.constantes} />
      {episode.conduite_a_tenir && (
        <Section title={t("dossierMedical.conduiteATenir")}>
          <p className="m-0 whitespace-pre-line text-[13px] text-heading">
            {episode.conduite_a_tenir}
          </p>
        </Section>
      )}

      {episode.prescriptions.length > 0 && (
        <Section title={t("dossierMedical.ordonnances")}>
          <ul className="m-0 flex list-none flex-col gap-1 p-0">
            {episode.prescriptions.map((p) => (
              <li key={p.id} className="text-[13px] text-heading">
                <Badge tone="primary">{p.type}</Badge> {p.designation}
                {p.instructions && (
                  <span className="text-muted"> — {p.instructions}</span>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {episode.analyses.length > 0 && (
        <Section title={t("dossierMedical.analyses")}>
          <ul className="m-0 flex list-none flex-col gap-1 p-0">
            {episode.analyses.map((a) => (
              <li key={a.id} className="text-[13px] text-heading">
                {a.analyse}
                {a.resultat_valeur && (
                  <>
                    {" : "}
                    <strong>
                      {a.resultat_valeur} {a.unite}
                    </strong>
                  </>
                )}{" "}
                {a.resultat_critique ? (
                  <Badge tone="danger">{t("dossierMedical.critique")}</Badge>
                ) : a.resultat_anormal ? (
                  <Badge tone="warning">{t("dossierMedical.anormal")}</Badge>
                ) : null}
                {a.commentaire && (
                  <span className="text-muted"> — {a.commentaire}</span>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {episode.dispensations.length > 0 && (
        <Section title={t("dossierMedical.dispensations")}>
          <ul className="m-0 flex list-none flex-col gap-1 p-0">
            {episode.dispensations.map((d) => (
              <li key={d.id} className="text-[13px] text-heading">
                {d.medicament} × {d.quantite}
                <span className="text-muted"> · {formatDate(d.date)}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {episode.sejours.map((s) => (
        <Section key={s.id} title={t("dossierMedical.hospitalisation")}>
          <p className="m-0 text-[13px] text-heading">
            {s.lit && <>{s.lit} · </>}
            {s.motif}
            <span className="text-muted">
              {" "}
              — {formatDate(s.admitted_at)} →{" "}
              {s.sortie_at ? formatDate(s.sortie_at) : t("dossierMedical.enCours")}
            </span>
          </p>
          {s.operations.length > 0 && (
            <ul className="m-0 mt-1 flex list-none flex-col gap-1 p-0">
              {s.operations.map((o) => (
                <li key={o.id} className="text-[13px] text-muted">
                  <IconActivity size={13} className="mr-1 inline" />
                  {o.type_operation} · {o.statut}
                  {o.praticien && <> · Dr {o.praticien}</>}
                  {o.date && <> · {formatDate(o.date)}</>}
                </li>
              ))}
            </ul>
          )}
        </Section>
      ))}
    </div>
  );
}

function UrgenceBody({ episode }: { episode: UrgenceEpisode }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-3 border-t border-border px-4 py-3">
      <ConstantesLine constantes={episode.constantes} />
      {episode.notes && (
        <Section title={t("dossierMedical.observations")}>
          <p className="m-0 whitespace-pre-line text-[13px] text-heading">
            {episode.notes}
          </p>
        </Section>
      )}
      {episode.actes.length > 0 && (
        <Section title={t("dossierMedical.actes")}>
          <ul className="m-0 flex list-none flex-col gap-1 p-0">
            {episode.actes.map((a) => (
              <li key={a.id} className="text-[13px] text-heading">
                {a.description}
              </li>
            ))}
          </ul>
        </Section>
      )}
      {episode.sortie_at && (
        <p className="m-0 text-[13px] text-muted">
          {t("dossierMedical.sortie")} : {formatDate(episode.sortie_at)}
          {episode.issue && <> · {episode.issue}</>}
        </p>
      )}
    </div>
  );
}

function GrossesseBody({ episode }: { episode: GrossesseEpisode }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-3 border-t border-border px-4 py-3">
      <p className="m-0 text-[13px] text-muted">
        {t("dossierMedical.ddr")} : {formatDate(episode.ddr)} ·{" "}
        {t("dossierMedical.terme")} : {formatDate(episode.terme)}
        {episode.semaines_amenorrhee != null && (
          <> · {episode.semaines_amenorrhee} SA</>
        )}
      </p>
      {episode.facteurs_risque && (
        <p className="m-0 text-[13px] text-danger">{episode.facteurs_risque}</p>
      )}
      {episode.cpn.length > 0 && (
        <Section title={t("dossierMedical.cpn")}>
          <ul className="m-0 flex list-none flex-col gap-1 p-0">
            {episode.cpn.map((c) => (
              <li key={c.id} className="text-[13px] text-heading">
                CPN {c.numero} · {formatDate(c.date_cpn)}
                {c.risque_detecte && (
                  <>
                    {" "}
                    <Badge tone="warning">{t("dossierMedical.risque")}</Badge>
                    {c.risque_details && (
                      <span className="text-muted"> — {c.risque_details}</span>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}
      {episode.accouchement && (
        <Section title={t("dossierMedical.accouchement")}>
          <p className="m-0 text-[13px] text-heading">
            {episode.accouchement.mode} · {formatDate(episode.accouchement.date_heure)}
            {episode.accouchement.complications && (
              <span className="text-danger"> — {episode.accouchement.complications}</span>
            )}
          </p>
          {episode.accouchement.nouveau_nes.length > 0 && (
            <ul className="m-0 mt-1 flex list-none flex-col gap-1 p-0">
              {episode.accouchement.nouveau_nes.map((ne) => (
                <li key={ne.id} className="text-[13px] text-muted">
                  {ne.sexe} · {ne.poids} kg
                  {ne.score_apgar_5min != null && (
                    <> · Apgar 5min {ne.score_apgar_5min}</>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Section>
      )}
    </div>
  );
}

const EPISODE_META: Record<
  Episode["type"],
  { badgeClass: string; icon: React.ReactNode; labelKey: string }
> = {
  consultation: {
    badgeClass: "bg-primary-light text-primary",
    icon: <IconStethoscope size={16} />,
    labelKey: "dossierMedical.episodeConsultation",
  },
  urgence: {
    badgeClass: "bg-danger-light text-danger",
    icon: <IconAmbulance size={16} />,
    labelKey: "dossierMedical.episodeUrgence",
  },
  grossesse: {
    badgeClass: "bg-accent-light text-accent",
    icon: <IconBabyCarriage size={16} />,
    labelKey: "dossierMedical.episodeGrossesse",
  },
};

function EpisodeCard({ episode }: { episode: Episode }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(episode.type === "consultation");
  const meta = EPISODE_META[episode.type];

  const heading =
    episode.type === "consultation"
      ? episode.motif || t("dossierMedical.episodeConsultation")
      : episode.type === "urgence"
        ? episode.niveau_triage_libelle || t("dossierMedical.episodeUrgence")
        : t("dossierMedical.episodeGrossesse");

  const subtitle =
    episode.type === "consultation"
      ? episode.praticien
        ? `Dr ${episode.praticien.name}`
        : null
      : null;

  return (
    <Card className="overflow-hidden p-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span
          className={cn(
            "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
            meta.badgeClass,
          )}
        >
          {meta.icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">
              {t(meta.labelKey)}
            </span>
            <span className="text-[12px] text-muted">{formatDate(episode.date)}</span>
          </span>
          <span className="block truncate text-[14px] font-semibold text-heading">
            {heading}
          </span>
          {episode.type === "consultation" && episode.diagnostic && (
            <span className="block truncate text-[13px] text-muted">
              {episode.cim10_code && (
                <Badge tone="info" className="mr-1">
                  {episode.cim10_code}
                </Badge>
              )}
              {episode.diagnostic}
            </span>
          )}
          {subtitle && (
            <span className="block text-[12px] text-muted">{subtitle}</span>
          )}
        </span>
        <IconChevronDown
          size={16}
          className={cn(
            "shrink-0 text-muted transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open && episode.type === "consultation" && (
        <ConsultationBody episode={episode} />
      )}
      {open && episode.type === "urgence" && <UrgenceBody episode={episode} />}
      {open && episode.type === "grossesse" && <GrossesseBody episode={episode} />}
    </Card>
  );
}

export function DossierMedical({
  dossier,
}: {
  dossier: DossierMedicalData;
}) {
  const { t } = useTranslation();
  const { synthese, timeline } = dossier;

  return (
    <div className="flex flex-col gap-4">
      {/* Synthèse */}
      <Card className="p-0">
        <div className="border-b border-border px-5 py-3.5">
          <h3 className="m-0 text-[15px] font-semibold text-heading">
            {t("dossierMedical.synthese")}
          </h3>
        </div>
        <div className="grid gap-3 p-5 sm:grid-cols-3">
          <StatCard
            label={t("dossierMedical.nbConsultations")}
            value={synthese.nb_consultations}
            icon={<IconStethoscope size={18} />}
            tone="primary"
          />
          <StatCard
            label={t("dossierMedical.nbHospitalisations")}
            value={synthese.nb_hospitalisations}
            icon={<IconBed size={18} />}
            tone="info"
          />
          <StatCard
            label={t("dossierMedical.nbVaccins")}
            value={synthese.nb_vaccins}
            icon={<IconVaccine size={18} />}
            tone="success"
          />
        </div>

        {synthese.allergies && (
          <div className="mx-5 mb-3 flex items-start gap-2 rounded-[5px] border border-danger/30 bg-danger-light px-3 py-2 text-sm text-danger">
            <IconAlertTriangle size={16} className="mt-0.5 shrink-0" />
            <p className="m-0">
              <span className="font-semibold">{t("dossierMedical.allergies")} </span>
              {synthese.allergies}
            </p>
          </div>
        )}

        {synthese.antecedents && (
          <div className="mx-5 mb-3 text-[13px] text-muted">
            <span className="font-semibold text-heading">
              {t("dossierMedical.antecedents")} :{" "}
            </span>
            {synthese.antecedents}
          </div>
        )}

        {synthese.problemes_actifs.length > 0 && (
          <div className="mx-5 mb-5 flex flex-wrap items-center gap-2">
            <span className="text-[13px] font-semibold text-heading">
              {t("dossierMedical.problemesActifs")} :
            </span>
            {synthese.problemes_actifs.map((p) => (
              <Badge key={p} tone="neutral" border>
                {p}
              </Badge>
            ))}
          </div>
        )}
      </Card>

      {/* Frise chronologique */}
      <div className="flex flex-col gap-3">
        <h3 className="m-0 text-[15px] font-semibold text-heading">
          {t("dossierMedical.timeline")}
        </h3>
        {timeline.length === 0 ? (
          <p className="text-sm text-muted">{t("dossierMedical.timelineVide")}</p>
        ) : (
          timeline.map((episode) => (
            <EpisodeCard key={`${episode.type}-${episode.id}`} episode={episode} />
          ))
        )}
      </div>

      {/* Carnet de vaccination */}
      <div className="flex flex-col gap-3">
        <h3 className="m-0 flex items-center gap-1.5 text-[15px] font-semibold text-heading">
          <IconVaccine size={16} />
          {t("dossierMedical.carnetVaccination")}
        </h3>
        <Card className="p-0">
          {dossier.vaccinations.length === 0 ? (
            <p className="m-0 p-4 text-sm text-muted">
              {t("dossierMedical.aucunVaccin")}
            </p>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>{t("dossierMedical.colVaccin")}</Th>
                  <Th>{t("dossierMedical.colDose")}</Th>
                  <Th>{t("dossierMedical.colDate")}</Th>
                  <Th>{t("dossierMedical.colMapi")}</Th>
                </tr>
              </thead>
              <tbody>
                {dossier.vaccinations.map((v) => (
                  <tr key={v.id}>
                    <Td>{v.vaccin}</Td>
                    <Td>{v.dose_numero}</Td>
                    <Td>{formatDate(v.date_administration)}</Td>
                    <Td>
                      {v.mapi_survenue ? (
                        <Badge tone="danger">{t("common.yes")}</Badge>
                      ) : (
                        "—"
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      </div>

      {/* Factures */}
      <div className="flex flex-col gap-3">
        <h3 className="m-0 flex items-center gap-1.5 text-[15px] font-semibold text-heading">
          <IconReceipt size={16} />
          {t("dossierMedical.factures")}
        </h3>
        <Card className="p-0">
          {dossier.factures.length === 0 ? (
            <p className="m-0 p-4 text-sm text-muted">
              {t("dossierMedical.aucuneFacture")}
            </p>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>{t("dossierMedical.colDate")}</Th>
                  <Th>{t("dossierMedical.colStatut")}</Th>
                  <Th className="text-right">{t("dossierMedical.colTotal")}</Th>
                  <Th className="text-right">{t("dossierMedical.colSolde")}</Th>
                </tr>
              </thead>
              <tbody>
                {dossier.factures.map((f) => (
                  <tr key={f.id}>
                    <Td>{formatDate(f.created_at)}</Td>
                    <Td>
                      <Badge tone={f.solde > 0 ? "warning" : "success"}>
                        {f.statut}
                      </Badge>
                    </Td>
                    <Td className="text-right">{f.montant_total}</Td>
                    <Td className="text-right">{f.solde}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      </div>

      <p className="flex items-center gap-1 text-[12px] text-muted">
        <IconFlask size={13} />
        {t("dossierMedical.lectureSeule")}
      </p>
    </div>
  );
}

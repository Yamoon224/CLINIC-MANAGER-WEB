"use client";

import {
  IconBriefcase,
  IconId,
  IconMail,
  IconPhone,
} from "@tabler/icons-react";
import { Avatar, Badge, type Tone } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import type { Employe, EmployeStatut, TypeContrat } from "./types";

const STATUT_TONE: Record<EmployeStatut, Tone> = {
  actif: "success",
  inactif: "neutral",
  suspendu: "danger",
};

export function EmployeCard({
  employe,
  onRemuneration,
}: {
  employe: Employe;
  onRemuneration?: () => void;
}) {
  const { t } = useTranslation();

  const typeContratLabels: Record<TypeContrat, string> = {
    cdi: t("personnel.typeContrat.cdi"),
    cdd: t("personnel.typeContrat.cdd"),
    vacataire: t("personnel.typeContrat.vacataire"),
    stage: t("personnel.typeContrat.stage"),
  };
  const statutLabels: Record<EmployeStatut, string> = {
    actif: t("personnel.employeStatut.actif"),
    inactif: t("personnel.employeStatut.inactif"),
    suspendu: t("personnel.employeStatut.suspendu"),
  };

  return (
    <div className="flex h-full flex-col gap-3 rounded-[6px] border border-border bg-surface p-4 shadow-[var(--shadow-preclinic-sm)] transition-shadow hover:shadow-[var(--shadow-preclinic-card)]">
      <div className="flex items-start gap-3">
        <Avatar
          initials={`${employe.prenom.charAt(0)}${employe.nom.charAt(0)}`}
          size="lg"
          rounded={false}
          tone="primary"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h6 className="m-0 truncate text-[15px] font-semibold text-heading">
              {employe.prenom} {employe.nom}
            </h6>
            <Badge tone={STATUT_TONE[employe.statut]} border>
              {statutLabels[employe.statut]}
            </Badge>
          </div>
          <p className="m-0 mt-0.5 flex items-center gap-1.5 truncate text-[13px] text-muted">
            <IconBriefcase size={13} className="shrink-0 text-heading" />
            {employe.fonction}
            {employe.service && ` · ${employe.service}`}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 text-[13px] text-muted">
        <p className="m-0 flex items-center gap-1.5 truncate">
          <IconId size={14} className="shrink-0 text-heading" />
          <span className="font-medium text-primary">{employe.matricule}</span>
        </p>
        {employe.telephone && (
          <p className="m-0 flex items-center gap-1.5 truncate">
            <IconPhone size={14} className="shrink-0 text-heading" />
            {employe.telephone}
          </p>
        )}
        {employe.email && (
          <p className="m-0 flex items-center gap-1.5 truncate">
            <IconMail size={14} className="shrink-0 text-heading" />
            {employe.email}
          </p>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
        <Badge tone="neutral">{typeContratLabels[employe.type_contrat]}</Badge>
        {onRemuneration && (
          <button
            type="button"
            onClick={onRemuneration}
            className="text-[13px] font-semibold text-primary hover:underline"
          >
            {t("comptabilite.remuneration.bouton")}
          </button>
        )}
      </div>
    </div>
  );
}

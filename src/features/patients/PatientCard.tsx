"use client";

import Link from "next/link";
import {
  IconFileText,
  IconIdBadge2,
  IconMapPin,
  IconPhone,
} from "@tabler/icons-react";
import { Avatar, Badge, RowActions } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import type { Patient } from "./types";

function ageFrom(dateNaissance: string | null): number | null {
  if (!dateNaissance) return null;
  const birth = new Date(dateNaissance);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

function InfoLine({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <p className="m-0 flex items-center gap-1.5 truncate text-[13px] text-muted">
      <span className="shrink-0 text-heading">{icon}</span>
      <span className="truncate">{children}</span>
    </p>
  );
}

export function PatientCard({ patient }: { patient: Patient }) {
  const { t } = useTranslation();
  const age = ageFrom(patient.date_naissance);
  const sexeLabel = patient.sexe
    ? patient.sexe === "F"
      ? t("patients.detail.sexeFeminin")
      : t("patients.detail.sexeMasculin")
    : null;
  const sub = [age != null ? t("patients.list.age", { age }) : null, sexeLabel]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="flex h-full flex-col gap-3 rounded-[6px] border border-border bg-surface p-4 shadow-[var(--shadow-preclinic-sm)] transition-shadow hover:shadow-[var(--shadow-preclinic-card)]">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar
            initials={`${patient.prenom.charAt(0)}${patient.nom.charAt(0)}`}
            size="lg"
            tone={patient.sexe === "F" ? "accent" : "primary"}
          />
          <div className="min-w-0">
            <Link
              href={`/patients/${patient.id}`}
              className="block truncate font-semibold text-heading hover:text-primary"
            >
              {patient.prenom} {patient.nom}
            </Link>
            {sub && (
              <span className="block truncate text-[13px] text-muted">{sub}</span>
            )}
          </div>
        </div>
        <div className="shrink-0">
          <RowActions
            view={`/patients/${patient.id}`}
            edit={`/patients/${patient.id}/modifier`}
            viewLabel={t("common.view")}
            editLabel={t("common.edit")}
            extra={[
              {
                label: t("dossierMedical.title"),
                href: `/patients/${patient.id}/dossier`,
                icon: <IconFileText size={15} />,
              },
            ]}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <InfoLine icon={<IconIdBadge2 size={14} />}>
          <span className="font-medium text-primary">
            {patient.numero_dossier}
          </span>
        </InfoLine>
        <InfoLine icon={<IconPhone size={14} />}>
          {patient.telephone || "—"}
        </InfoLine>
        <InfoLine icon={<IconMapPin size={14} />}>
          {patient.adresse || "—"}
        </InfoLine>
      </div>

      {patient.allergies && (
        <p className="m-0 truncate rounded-[5px] bg-danger-light px-2 py-1 text-[12px] text-danger">
          {t("patients.detail.allergies")} {patient.allergies}
        </p>
      )}

      <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
        {patient.sexe ? (
          <Badge tone={patient.sexe === "F" ? "accent" : "primary"} border>
            {sexeLabel}
          </Badge>
        ) : (
          <span />
        )}
        <Link
          href={`/patients/${patient.id}/dossier`}
          className="inline-flex items-center gap-1 text-[13px] font-semibold text-primary hover:underline"
        >
          <IconFileText size={14} />
          {t("dossierMedical.title")}
        </Link>
      </div>
    </div>
  );
}

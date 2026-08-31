"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconAlertTriangle,
  IconCake,
  IconCalendarPlus,
  IconChevronLeft,
  IconFileText,
  IconGenderBigender,
  IconIdBadge2,
  IconMapPin,
  IconPencil,
  IconPhone,
  IconRoute,
  IconShieldHeart,
} from "@tabler/icons-react";
import { PatientAssurances } from "@/features/assurances/PatientAssurances";
import { PatientFactures } from "@/features/caisse/PatientFactures";
import { PatientHistory } from "@/features/consultations/PatientHistory";
import { StartConsultationAction } from "@/features/consultations/StartConsultationAction";
import { PatientSejours } from "@/features/hospitalisation/PatientSejours";
import { PatientAnalyses } from "@/features/laboratoire/PatientAnalyses";
import { MaterniteSection } from "@/features/maternite/MaterniteSection";
import { PatientDispensations } from "@/features/pharmacie/PatientDispensations";
import { ActivatePortailAccess } from "@/features/portail/ActivatePortailAccess";
import { OrientPatientAction } from "@/features/queue/OrientPatientAction";
import { CarnetVaccination } from "@/features/vaccinations/CarnetVaccination";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Modal,
  PdfButton,
  Tabs,
  type TabItem,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import type { Patient } from "./types";

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-light text-muted dark:bg-gray-100">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="m-0 text-[12px] font-bold text-heading">{label}</p>
        <p className="m-0 truncate text-[13px] text-muted">{value || "-"}</p>
      </div>
    </div>
  );
}

export function PatientDetail({ patient: initialPatient }: { patient: Patient }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [patient, setPatient] = useState(initialPatient);
  const [showOrient, setShowOrient] = useState(false);
  const [showConsultation, setShowConsultation] = useState(false);
  const [tab, setTab] = useState("consultations");

  const sexeLabel = patient.sexe
    ? patient.sexe === "F"
      ? t("patients.detail.sexeFeminin")
      : t("patients.detail.sexeMasculin")
    : "-";

  const tabs: TabItem[] = [
    { key: "consultations", label: t("patients.detail.historiqueConsultations") },
    { key: "vaccinations", label: t("nav.vaccinations") },
    { key: "analyses", label: t("nav.laboratoire") },
    { key: "pharmacie", label: t("nav.pharmacie") },
    { key: "sejours", label: t("nav.hospitalisation") },
    { key: "assurances", label: t("nav.assurances") },
    { key: "factures", label: t("nav.caisse") },
  ];
  if (patient.sexe !== "M")
    tabs.push({ key: "maternite", label: t("patients.detail.maternite") });

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/patients"
        className="inline-flex w-fit items-center gap-1 text-sm font-semibold text-heading hover:text-primary"
      >
        <IconChevronLeft size={16} />
        {t("patients.list.title")}
      </Link>

      {/* Carte profil */}
      <Card className="p-0">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Avatar
              initials={`${patient.prenom.charAt(0)}${patient.nom.charAt(0)}`}
              size="xxl"
              rounded={false}
            />
            <div>
              <p className="m-0 text-[13px] font-semibold text-primary">
                {patient.numero_dossier}
              </p>
              <h1 className="m-0 text-xl font-bold text-heading">
                {patient.prenom} {patient.nom}
              </h1>
              <p className="m-0 mt-0.5 text-[13px] text-muted">
                {patient.adresse || "-"}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted">
                <span className="inline-flex items-center gap-1">
                  <IconPhone size={14} />
                  {patient.telephone || "-"}
                </span>
                {patient.sexe && (
                  <Badge tone={patient.sexe === "F" ? "accent" : "primary"}>
                    {sexeLabel}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="light"
              icon={<IconPencil size={15} />}
              onClick={() => router.push(`/patients/${patient.id}/modifier`)}
            >
              {t("common.edit")}
            </Button>
            <Button
              icon={<IconCalendarPlus size={15} />}
              onClick={() => setShowConsultation(true)}
            >
              {t("consultations.startTitle")}
            </Button>
          </div>
        </div>
      </Card>

      {/* À propos */}
      <Card className="p-0">
        <div className="border-b border-border px-5 py-3.5">
          <h3 className="m-0 flex items-center gap-1.5 text-[15px] font-semibold text-heading">
            <IconIdBadge2 size={16} />
            {t("patients.detail.about")}
          </h3>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
          <InfoRow
            icon={<IconCake size={16} />}
            label={t("patients.detail.dateNaissance")}
            value={patient.date_naissance}
          />
          <InfoRow
            icon={<IconGenderBigender size={16} />}
            label={t("patients.form.sexe")}
            value={sexeLabel}
          />
          <InfoRow
            icon={<IconMapPin size={16} />}
            label={t("patients.detail.adresse")}
            value={patient.adresse}
          />
          <InfoRow
            icon={<IconPhone size={16} />}
            label={t("patients.detail.personneAPrevenir")}
            value={
              patient.personne_a_prevenir_nom
                ? `${patient.personne_a_prevenir_nom} (${patient.personne_a_prevenir_telephone ?? "-"})`
                : null
            }
          />
          <InfoRow
            icon={<IconShieldHeart size={16} />}
            label={t("patients.detail.assurance")}
            value={patient.assurance_nom}
          />
        </div>

        {patient.allergies && (
          <div className="mx-5 mb-5 flex items-start gap-2 rounded-[5px] border border-danger/30 bg-danger-light px-3 py-2 text-sm text-danger">
            <IconAlertTriangle size={16} className="mt-0.5 shrink-0" />
            <p className="m-0">
              <span className="font-semibold">{t("patients.detail.allergies")}</span>
              {patient.allergies}
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2 border-t border-border px-5 py-3.5">
          <Button
            icon={<IconFileText size={15} />}
            onClick={() => router.push(`/patients/${patient.id}/dossier`)}
          >
            {t("dossierMedical.title")}
          </Button>
          <Button
            variant="light"
            icon={<IconRoute size={15} />}
            onClick={() => setShowOrient(true)}
          >
            {t("queue.orient.title")}
          </Button>
          <PdfButton
            path={`/patients/${patient.id}/dossier.pdf`}
            label={t("patients.detail.exportDossierPdf")}
          />
          <PdfButton
            path={`/patients/${patient.id}/carte.pdf`}
            label={t("dossierMedical.cartePatient")}
          />
          <ActivatePortailAccess patient={patient} onUpdated={setPatient} />
        </div>
      </Card>

      {/* Onglets */}
      <div className="flex flex-col gap-4">
        <Tabs tabs={tabs} active={tab} onChange={setTab} />
        <div className={cn(tab === "consultations" ? "" : "hidden")}>
          <PatientHistory patientId={patient.id} />
        </div>
        {tab === "vaccinations" && <CarnetVaccination patientId={patient.id} />}
        {tab === "analyses" && <PatientAnalyses patientId={patient.id} />}
        {tab === "pharmacie" && <PatientDispensations patientId={patient.id} />}
        {tab === "sejours" && <PatientSejours patientId={patient.id} />}
        {tab === "assurances" && <PatientAssurances patientId={patient.id} />}
        {tab === "factures" && <PatientFactures patientId={patient.id} />}
        {tab === "maternite" && patient.sexe !== "M" && (
          <MaterniteSection patientId={patient.id} />
        )}
      </div>

      <Modal
        open={showOrient}
        onClose={() => setShowOrient(false)}
        title={t("queue.orient.title")}
        size="md"
      >
        <OrientPatientAction
          patientId={patient.id}
          onCancel={() => setShowOrient(false)}
        />
      </Modal>

      <Modal
        open={showConsultation}
        onClose={() => setShowConsultation(false)}
        title={t("consultations.startTitle")}
        size="md"
      >
        <StartConsultationAction
          patientId={patient.id}
          onCancel={() => setShowConsultation(false)}
        />
      </Modal>
    </div>
  );
}

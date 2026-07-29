import { PatientAssurances } from "@/features/assurances/PatientAssurances";
import { PatientFactures } from "@/features/caisse/PatientFactures";
import { PatientHistory } from "@/features/consultations/PatientHistory";
import { StartConsultationAction } from "@/features/consultations/StartConsultationAction";
import { PatientSejours } from "@/features/hospitalisation/PatientSejours";
import { PatientAnalyses } from "@/features/laboratoire/PatientAnalyses";
import { MaterniteSection } from "@/features/maternite/MaterniteSection";
import { PatientDispensations } from "@/features/pharmacie/PatientDispensations";
import { OrientPatientAction } from "@/features/queue/OrientPatientAction";
import { CarnetVaccination } from "@/features/vaccinations/CarnetVaccination";
import { Badge, Card } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import type { Patient } from "./types";

export function PatientDetail({ patient }: { patient: Patient }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <Card>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              {patient.prenom} {patient.nom}
            </h1>
            <p className="text-sm text-muted">
              {t("patients.detail.dossierNumero", { numero: patient.numero_dossier })}
            </p>
          </div>
          {patient.sexe && (
            <Badge tone={patient.sexe === "F" ? "accent" : "primary"}>
              {patient.sexe === "F"
                ? t("patients.detail.sexeFeminin")
                : t("patients.detail.sexeMasculin")}
            </Badge>
          )}
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <Row label={t("patients.detail.dateNaissance")} value={patient.date_naissance} />
          <Row label={t("patients.detail.telephone")} value={patient.telephone} />
          <Row label={t("patients.detail.adresse")} value={patient.adresse} />
          <Row
            label={t("patients.detail.personneAPrevenir")}
            value={
              patient.personne_a_prevenir_nom
                ? `${patient.personne_a_prevenir_nom} (${patient.personne_a_prevenir_telephone ?? "-"})`
                : null
            }
          />
          <Row label={t("patients.detail.assurance")} value={patient.assurance_nom} />
        </dl>

        {patient.allergies && (
          <div className="mt-4 rounded-lg border border-danger/30 bg-danger-light px-3 py-2 text-sm">
            <span className="font-semibold text-danger">{t("patients.detail.allergies")}</span>
            {patient.allergies}
          </div>
        )}
      </Card>

      <div className="flex gap-4 flex-wrap">
        <OrientPatientAction patientId={patient.id} />
        <StartConsultationAction patientId={patient.id} />
      </div>

      <div>
        <h2 className="font-semibold text-foreground mb-2">
          {t("patients.detail.historiqueConsultations")}
        </h2>
        <PatientHistory patientId={patient.id} />
      </div>

      <CarnetVaccination patientId={patient.id} />

      <PatientAnalyses patientId={patient.id} />

      <PatientDispensations patientId={patient.id} />

      <PatientSejours patientId={patient.id} />

      <PatientAssurances patientId={patient.id} />

      <PatientFactures patientId={patient.id} />

      {patient.sexe !== "M" && <MaterniteSection patientId={patient.id} />}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="contents">
      <dt className="text-muted">{label}</dt>
      <dd className="text-foreground">{value || "-"}</dd>
    </div>
  );
}

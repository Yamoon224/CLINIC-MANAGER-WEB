import { useState } from "react";
import { AlertTriangle, Route, Stethoscope } from "lucide-react";
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
import { Badge, Button, Card, Modal, PageHeader, PdfButton } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import type { Patient } from "./types";

export function PatientDetail({ patient: initialPatient }: { patient: Patient }) {
  const { t } = useTranslation();
  const [patient, setPatient] = useState(initialPatient);
  const [showOrient, setShowOrient] = useState(false);
  const [showConsultation, setShowConsultation] = useState(false);

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <PageHeader
        title={`${patient.prenom} ${patient.nom}`}
        description={t("patients.detail.dossierNumero", { numero: patient.numero_dossier })}
        actions={
          patient.sexe ? (
            <Badge tone={patient.sexe === "F" ? "accent" : "primary"}>
              {patient.sexe === "F"
                ? t("patients.detail.sexeFeminin")
                : t("patients.detail.sexeMasculin")}
            </Badge>
          ) : undefined
        }
      />

      <Card>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
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
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-danger/30 bg-danger-light px-3 py-2 text-sm text-danger">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <p>
              <span className="font-semibold">{t("patients.detail.allergies")}</span>
              {patient.allergies}
            </p>
          </div>
        )}
      </Card>

      <div className="flex gap-2 flex-wrap">
        <Button onClick={() => setShowOrient(true)}>
          <Route size={16} className="mr-1.5" />
          {t("queue.orient.title")}
        </Button>
        <Button onClick={() => setShowConsultation(true)}>
          <Stethoscope size={16} className="mr-1.5" />
          {t("consultations.startTitle")}
        </Button>
        <PdfButton
          path={`/patients/${patient.id}/dossier.pdf`}
          label={t("patients.detail.exportDossierPdf")}
          variant="secondary"
        />
        <ActivatePortailAccess patient={patient} onUpdated={setPatient} />
      </div>

      <Modal
        open={showOrient}
        onClose={() => setShowOrient(false)}
        title={t("queue.orient.title")}
        size="md"
      >
        <OrientPatientAction patientId={patient.id} onCancel={() => setShowOrient(false)} />
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

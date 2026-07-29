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
import type { Patient } from "./types";

export function PatientDetail({ patient }: { patient: Patient }) {
  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <div>
        <h1 className="text-lg font-semibold">
          {patient.prenom} {patient.nom}
        </h1>
        <p className="text-sm text-gray-500">
          Dossier n° {patient.numero_dossier}
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
        <Row label="Date de naissance" value={patient.date_naissance} />
        <Row
          label="Sexe"
          value={
            patient.sexe === "F"
              ? "Féminin"
              : patient.sexe === "M"
                ? "Masculin"
                : null
          }
        />
        <Row label="Téléphone" value={patient.telephone} />
        <Row label="Adresse" value={patient.adresse} />
        <Row
          label="Personne à prévenir"
          value={
            patient.personne_a_prevenir_nom
              ? `${patient.personne_a_prevenir_nom} (${patient.personne_a_prevenir_telephone ?? "—"})`
              : null
          }
        />
        <Row label="Assurance" value={patient.assurance_nom} />
      </dl>

      {patient.allergies && (
        <div className="border border-red-300 bg-red-50 rounded p-3 text-sm">
          <span className="font-semibold text-red-700">Allergies : </span>
          {patient.allergies}
        </div>
      )}

      <div className="flex gap-4 flex-wrap">
        <OrientPatientAction patientId={patient.id} />
        <StartConsultationAction patientId={patient.id} />
      </div>

      <div>
        <h2 className="font-semibold mb-2">Historique des consultations</h2>
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
      <dt className="text-gray-500">{label}</dt>
      <dd>{value || "—"}</dd>
    </div>
  );
}

import { PatientForm } from "@/features/patients/PatientForm";

export default function NewPatientPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">Nouveau patient</h1>
      <PatientForm />
    </div>
  );
}

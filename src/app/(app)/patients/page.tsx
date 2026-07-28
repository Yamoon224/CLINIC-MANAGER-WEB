import { PatientList } from "@/features/patients/PatientList";

export default function PatientsPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">Patients</h1>
      <PatientList />
    </div>
  );
}

import { PatientEditPage } from "@/features/patients/PatientEditPage";

export default async function ModifierPatientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PatientEditPage id={Number(id)} />;
}

import { PatientDetailPage } from "@/features/patients/PatientDetailPage";

export default async function PatientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PatientDetailPage id={Number(id)} />;
}

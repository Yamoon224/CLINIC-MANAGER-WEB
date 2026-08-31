import { DossierMedicalPage } from "@/features/dossier-medical/DossierMedicalPage";

export default async function PatientDossierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DossierMedicalPage id={Number(id)} />;
}

import { ConsultationScreen } from "@/features/consultations/ConsultationScreen";

export default async function ConsultationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ConsultationScreen id={Number(id)} />;
}

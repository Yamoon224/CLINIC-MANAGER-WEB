import { UrgenceDetail } from "@/features/urgences/UrgenceDetail";

export default async function UrgenceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <UrgenceDetail id={Number(id)} />;
}

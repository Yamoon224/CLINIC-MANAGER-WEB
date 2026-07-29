import { SejourDetail } from "@/features/hospitalisation/SejourDetail";

export default async function SejourPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SejourDetail id={Number(id)} />;
}

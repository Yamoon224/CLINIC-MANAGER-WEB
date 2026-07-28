import { GrossesseDetail } from "@/features/maternite/GrossesseDetail";

export default async function GrossessePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <GrossesseDetail id={Number(id)} />;
}

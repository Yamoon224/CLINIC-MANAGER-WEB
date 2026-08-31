import { PeriodePaieDetail } from "@/features/comptabilite/PeriodePaieDetail";

export default async function PeriodePaiePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PeriodePaieDetail id={Number(id)} />;
}

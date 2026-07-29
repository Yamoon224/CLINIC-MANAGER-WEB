import { FactureDetail } from "@/features/caisse/FactureDetail";

export default async function FacturePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <FactureDetail id={Number(id)} />;
}

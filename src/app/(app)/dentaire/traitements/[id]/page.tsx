import { TraitementDentaireDetail } from "@/features/dentaire/TraitementDentaireDetail";

export default async function TraitementDentairePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TraitementDentaireDetail id={Number(id)} />;
}

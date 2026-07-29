"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createGrossesse, fetchGrossesses } from "./maternite-api";
import type { Grossesse } from "./types";
import { Badge, Button, Card, Input } from "@/components/ui";

export function MaterniteSection({ patientId }: { patientId: number }) {
  const router = useRouter();
  const [grossesses, setGrossesses] = useState<Grossesse[] | null>(null);
  const [ddr, setDdr] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchGrossesses(patientId).then((res) => setGrossesses(res.data));
  }, [patientId]);

  async function handleCreate() {
    setIsCreating(true);
    try {
      const { data } = await createGrossesse(patientId, { ddr: ddr || undefined });
      router.push(`/grossesses/${data.id}`);
    } finally {
      setIsCreating(false);
    }
  }

  if (grossesses === null) return null;

  const enCours = grossesses.find((g) => g.statut === "suivie");

  return (
    <div>
      <h2 className="mb-2 font-semibold text-foreground">Maternité</h2>
      <div className="mb-3 flex flex-col gap-1 text-sm">
        {grossesses.map((g) => (
          <div key={g.id} className="flex items-center gap-2">
            <Link href={`/grossesses/${g.id}`} className="font-medium text-primary hover:underline">
              Grossesse {g.statut === "suivie" ? "en cours" : g.statut}
            </Link>
            {g.a_risque && <Badge tone="danger">À risque</Badge>}
            {g.terme && <span className="text-muted">terme prévu {g.terme}</span>}
          </div>
        ))}
        {grossesses.length === 0 && (
          <p className="text-muted">Aucun dossier obstétrical.</p>
        )}
      </div>

      {!enCours && (
        <Card className="flex max-w-md items-center gap-2">
          <Input
            type="date"
            value={ddr}
            onChange={(e) => setDdr(e.target.value)}
            className="flex-1"
            aria-label="Date des dernières règles"
          />
          <Button onClick={handleCreate} disabled={isCreating} className="whitespace-nowrap">
            Ouvrir un dossier grossesse
          </Button>
        </Card>
      )}
    </div>
  );
}

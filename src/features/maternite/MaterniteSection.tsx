"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createGrossesse, fetchGrossesses } from "./maternite-api";
import type { Grossesse } from "./types";

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
      <h2 className="font-semibold mb-2">Maternité</h2>
      <ul className="flex flex-col gap-1 mb-3 text-sm">
        {grossesses.map((g) => (
          <li key={g.id}>
            <Link href={`/grossesses/${g.id}`} className="text-blue-600 underline">
              Grossesse {g.statut === "suivie" ? "en cours" : g.statut}
              {g.a_risque && <span className="text-red-600"> - à risque</span>}
            </Link>
            {g.terme && <span className="text-gray-500"> - terme prévu {g.terme}</span>}
          </li>
        ))}
        {grossesses.length === 0 && (
          <li className="text-gray-500">Aucun dossier obstétrical.</li>
        )}
      </ul>

      {!enCours && (
        <div className="border rounded p-3 flex items-center gap-2 max-w-md">
          <input
            type="date"
            value={ddr}
            onChange={(e) => setDdr(e.target.value)}
            className="border rounded px-3 py-2 flex-1"
            aria-label="Date des dernières règles"
          />
          <button
            onClick={handleCreate}
            disabled={isCreating}
            className="bg-blue-600 text-white rounded px-3 py-2 whitespace-nowrap disabled:opacity-50"
          >
            Ouvrir un dossier grossesse
          </button>
        </div>
      )}
    </div>
  );
}

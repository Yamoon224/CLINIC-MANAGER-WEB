"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { fetchLits, libererLit } from "./hospitalisation-api";
import type { Lit, LitStatut } from "./types";
import { Badge, Button, Card } from "@/components/ui";

const STATUT_LABELS: Record<LitStatut, string> = {
  libre: "Libre",
  occupe: "Occupé",
  reserve: "Réservé",
  nettoyage: "En nettoyage",
};

const STATUT_TONES: Record<LitStatut, "success" | "danger" | "warning" | "neutral"> = {
  libre: "success",
  occupe: "danger",
  reserve: "warning",
  nettoyage: "neutral",
};

export function BedPlan() {
  const [lits, setLits] = useState<Lit[]>([]);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(() => {
    fetchLits().then((res) => setLits(res.data));
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [load]);

  async function handleLiberer(id: number) {
    setBusyId(id);
    try {
      await libererLit(id);
      load();
    } finally {
      setBusyId(null);
    }
  }

  const parChambre = lits.reduce<Record<string, Lit[]>>((acc, lit) => {
    (acc[lit.chambre] ??= []).push(lit);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-6">
      {Object.entries(parChambre).map(([chambre, litsChambre]) => (
        <div key={chambre}>
          <h2 className="font-medium mb-2 text-foreground">Chambre {chambre}</h2>
          <div className="flex flex-wrap gap-3">
            {litsChambre.map((lit) => (
              <Card key={lit.id} className="w-56 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{lit.numero}</span>
                  <Badge tone={STATUT_TONES[lit.statut]}>{STATUT_LABELS[lit.statut]}</Badge>
                </div>
                {lit.patient_actuel && (
                  <Link
                    href={`/sejours/${lit.patient_actuel.sejour_id}`}
                    className="text-primary hover:underline block mt-2 text-sm"
                  >
                    {lit.patient_actuel.prenom} {lit.patient_actuel.nom}
                  </Link>
                )}
                {lit.statut === "nettoyage" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLiberer(lit.id)}
                    disabled={busyId === lit.id}
                    className="mt-2 px-0"
                  >
                    Marquer libre
                  </Button>
                )}
              </Card>
            ))}
          </div>
        </div>
      ))}
      {lits.length === 0 && <p className="text-muted">Aucun lit configuré.</p>}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { fetchDashboard } from "./administration-api";
import type { DashboardStats } from "./types";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border rounded p-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-semibold mb-2">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{children}</div>
    </div>
  );
}

function fcfa(montant: number): string {
  return `${montant.toLocaleString("fr-FR")} F CFA`;
}

const NIVEAU_TRIAGE_LABELS: Record<string, string> = {
  reanimation: "Réanimation",
  tres_urgent: "Très urgent",
  urgent: "Urgent",
  semi_urgent: "Semi-urgent",
  non_urgent: "Non urgent",
};

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchDashboard()
      .then((res) => setStats(res.data))
      .catch(() => setError(true));
  }, []);

  if (error) {
    return (
      <p className="text-gray-500">
        Statistiques réservées au profil administrateur.
      </p>
    );
  }
  if (!stats) return <p className="text-gray-500">Chargement...</p>;

  return (
    <div className="flex flex-col gap-8">
      <Section title="Réception">
        <StatCard label="Patients (total)" value={stats.reception.patients_total} />
        <StatCard label="Nouveaux aujourd'hui" value={stats.reception.nouveaux_patients_aujourdhui} />
        <StatCard label="Tickets en attente" value={stats.reception.tickets_en_attente} />
        <StatCard label="Tickets traités aujourd'hui" value={stats.reception.tickets_traites_aujourdhui} />
      </Section>

      <Section title="Rendez-vous du jour">
        <StatCard label="Total" value={stats.rendez_vous.aujourdhui_total} />
        <StatCard label="Honorés" value={stats.rendez_vous.honores} />
        <StatCard label="À venir" value={stats.rendez_vous.a_venir} />
        <StatCard label="Annulés / absents" value={stats.rendez_vous.annules_ou_absents} />
      </Section>

      <div>
        <h2 className="font-semibold mb-2">Urgences</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          <StatCard label="En cours (total)" value={stats.urgences.en_cours_total} />
          <StatCard label="Non triés" value={stats.urgences.non_trie} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {Object.entries(stats.urgences.par_niveau_triage).map(([niveau, count]) => (
            <StatCard key={niveau} label={NIVEAU_TRIAGE_LABELS[niveau] ?? niveau} value={count} />
          ))}
        </div>
      </div>

      <Section title="Hospitalisation">
        <StatCard label="Lits (total)" value={stats.hospitalisation.lits_total} />
        <StatCard label="Lits occupés" value={stats.hospitalisation.lits_occupes} />
        <StatCard label="Taux d'occupation" value={`${stats.hospitalisation.taux_occupation}%`} />
        <StatCard label="Séjours en cours" value={stats.hospitalisation.sejours_en_cours} />
      </Section>

      <Section title="Laboratoire">
        <StatCard label="En attente" value={stats.laboratoire.en_attente} />
        <StatCard label="À valider (biologiste)" value={stats.laboratoire.a_valider_biologiste} />
        <StatCard
          label="Résultats anormaux non validés"
          value={stats.laboratoire.resultats_anormaux_non_valides}
        />
      </Section>

      <Section title="Pharmacie">
        <StatCard label="Ruptures de stock" value={stats.pharmacie.ruptures_stock} />
        <StatCard label="Péremptions proches" value={stats.pharmacie.peremptions_proches} />
      </Section>

      <Section title="Caisse">
        <StatCard label="Chiffre d'affaires (jour)" value={fcfa(stats.caisse.chiffre_affaires_aujourdhui)} />
        <StatCard label="Dépenses (jour)" value={fcfa(stats.caisse.depenses_aujourdhui)} />
        <StatCard label="Factures impayées" value={stats.caisse.factures_impayees} />
        <StatCard label="Créances (total)" value={fcfa(stats.caisse.creances_total)} />
      </Section>

      <Section title="Assurances">
        <StatCard label="Prises en charge en attente" value={stats.assurances.prises_en_charge_en_attente} />
        <StatCard label="Réclamé non réglé" value={fcfa(stats.assurances.montant_reclame_non_regle)} />
      </Section>

      <Section title="Personnel">
        <StatCard label="Effectif actif" value={stats.personnel.effectif_actif} />
        <StatCard label="Congés en attente" value={stats.personnel.conges_en_attente} />
      </Section>
    </div>
  );
}

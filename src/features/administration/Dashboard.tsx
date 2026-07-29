"use client";

import { useEffect, useState } from "react";
import { fetchDashboard } from "./administration-api";
import type { DashboardStats } from "./types";
import { Card } from "@/components/ui";

type Tone = "primary" | "accent" | "success" | "warning" | "danger" | "neutral";

const TONE_TEXT: Record<Tone, string> = {
  primary: "text-primary",
  accent: "text-accent",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  neutral: "text-foreground",
};

function StatCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string | number;
  tone?: Tone;
}) {
  return (
    <Card className="p-4">
      <div className="text-xs font-medium text-muted">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${TONE_TEXT[tone]}`}>{value}</div>
    </Card>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{children}</div>
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

const NIVEAU_TRIAGE_TONE: Record<string, Tone> = {
  reanimation: "danger",
  tres_urgent: "danger",
  urgent: "warning",
  semi_urgent: "accent",
  non_urgent: "success",
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
      <p className="text-sm text-muted">
        Statistiques réservées au profil administrateur.
      </p>
    );
  }
  if (!stats) return <p className="text-sm text-muted">Chargement...</p>;

  return (
    <div className="flex flex-col gap-8">
      <Section title="Réception">
        <StatCard label="Patients (total)" value={stats.reception.patients_total} />
        <StatCard
          label="Nouveaux aujourd'hui"
          value={stats.reception.nouveaux_patients_aujourdhui}
          tone="primary"
        />
        <StatCard
          label="Tickets en attente"
          value={stats.reception.tickets_en_attente}
          tone="warning"
        />
        <StatCard
          label="Tickets traités aujourd'hui"
          value={stats.reception.tickets_traites_aujourdhui}
          tone="success"
        />
      </Section>

      <Section title="Rendez-vous du jour">
        <StatCard label="Total" value={stats.rendez_vous.aujourdhui_total} />
        <StatCard label="Honorés" value={stats.rendez_vous.honores} tone="success" />
        <StatCard label="À venir" value={stats.rendez_vous.a_venir} tone="primary" />
        <StatCard
          label="Annulés / absents"
          value={stats.rendez_vous.annules_ou_absents}
          tone="danger"
        />
      </Section>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-foreground">Urgences</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="En cours (total)" value={stats.urgences.en_cours_total} />
          <StatCard label="Non triés" value={stats.urgences.non_trie} tone="danger" />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {Object.entries(stats.urgences.par_niveau_triage).map(([niveau, count]) => (
            <StatCard
              key={niveau}
              label={NIVEAU_TRIAGE_LABELS[niveau] ?? niveau}
              value={count}
              tone={NIVEAU_TRIAGE_TONE[niveau] ?? "neutral"}
            />
          ))}
        </div>
      </div>

      <Section title="Hospitalisation">
        <StatCard label="Lits (total)" value={stats.hospitalisation.lits_total} />
        <StatCard label="Lits occupés" value={stats.hospitalisation.lits_occupes} tone="primary" />
        <StatCard
          label="Taux d'occupation"
          value={`${stats.hospitalisation.taux_occupation}%`}
          tone="accent"
        />
        <StatCard label="Séjours en cours" value={stats.hospitalisation.sejours_en_cours} />
      </Section>

      <Section title="Laboratoire">
        <StatCard label="En attente" value={stats.laboratoire.en_attente} tone="warning" />
        <StatCard
          label="À valider (biologiste)"
          value={stats.laboratoire.a_valider_biologiste}
          tone="primary"
        />
        <StatCard
          label="Résultats anormaux non validés"
          value={stats.laboratoire.resultats_anormaux_non_valides}
          tone="danger"
        />
      </Section>

      <Section title="Pharmacie">
        <StatCard label="Ruptures de stock" value={stats.pharmacie.ruptures_stock} tone="danger" />
        <StatCard
          label="Péremptions proches"
          value={stats.pharmacie.peremptions_proches}
          tone="warning"
        />
      </Section>

      <Section title="Caisse">
        <StatCard
          label="Chiffre d'affaires (jour)"
          value={fcfa(stats.caisse.chiffre_affaires_aujourdhui)}
          tone="success"
        />
        <StatCard
          label="Dépenses (jour)"
          value={fcfa(stats.caisse.depenses_aujourdhui)}
        />
        <StatCard
          label="Factures impayées"
          value={stats.caisse.factures_impayees}
          tone="warning"
        />
        <StatCard
          label="Créances (total)"
          value={fcfa(stats.caisse.creances_total)}
          tone="danger"
        />
      </Section>

      <Section title="Assurances">
        <StatCard
          label="Prises en charge en attente"
          value={stats.assurances.prises_en_charge_en_attente}
          tone="warning"
        />
        <StatCard
          label="Réclamé non réglé"
          value={fcfa(stats.assurances.montant_reclame_non_regle)}
          tone="danger"
        />
      </Section>

      <Section title="Personnel">
        <StatCard label="Effectif actif" value={stats.personnel.effectif_actif} tone="primary" />
        <StatCard
          label="Congés en attente"
          value={stats.personnel.conges_en_attente}
          tone="warning"
        />
      </Section>
    </div>
  );
}

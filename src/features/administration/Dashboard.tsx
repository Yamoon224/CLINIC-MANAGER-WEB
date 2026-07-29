"use client";

import { useEffect, useState } from "react";
import { fetchDashboard } from "./administration-api";
import type { DashboardStats } from "./types";
import { Card } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

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

function fcfa(montant: number): string {
  return `${montant.toLocaleString("fr-FR")} F CFA`;
}

const NIVEAU_TRIAGE_TONE: Record<string, Tone> = {
  reanimation: "danger",
  tres_urgent: "danger",
  urgent: "warning",
  semi_urgent: "accent",
  non_urgent: "success",
};

const TABS = [
  "reception",
  "rendezVous",
  "urgences",
  "hospitalisation",
  "laboratoire",
  "pharmacie",
  "caisse",
  "assurances",
  "personnel",
] as const;

type TabKey = (typeof TABS)[number];

export function Dashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState<TabKey>("reception");

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
  if (!stats) return <p className="text-sm text-muted">{t("common.loading")}</p>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-1 border-b border-border">
        {TABS.map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              tab === key
                ? "border-b-2 border-primary text-primary"
                : "text-muted hover:text-foreground"
            }`}
          >
            {t(`dashboard.tabs.${key}`)}
          </button>
        ))}
      </div>

      {tab === "reception" && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            label={t("dashboard.reception.patientsTotal")}
            value={stats.reception.patients_total}
          />
          <StatCard
            label={t("dashboard.reception.nouveauxAujourdhui")}
            value={stats.reception.nouveaux_patients_aujourdhui}
            tone="primary"
          />
          <StatCard
            label={t("dashboard.reception.ticketsEnAttente")}
            value={stats.reception.tickets_en_attente}
            tone="warning"
          />
          <StatCard
            label={t("dashboard.reception.ticketsTraites")}
            value={stats.reception.tickets_traites_aujourdhui}
            tone="success"
          />
        </div>
      )}

      {tab === "rendezVous" && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            label={t("dashboard.rendezVous.total")}
            value={stats.rendez_vous.aujourdhui_total}
          />
          <StatCard
            label={t("dashboard.rendezVous.honores")}
            value={stats.rendez_vous.honores}
            tone="success"
          />
          <StatCard
            label={t("dashboard.rendezVous.aVenir")}
            value={stats.rendez_vous.a_venir}
            tone="primary"
          />
          <StatCard
            label={t("dashboard.rendezVous.annulesOuAbsents")}
            value={stats.rendez_vous.annules_ou_absents}
            tone="danger"
          />
        </div>
      )}

      {tab === "urgences" && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard
              label={t("dashboard.urgences.enCoursTotal")}
              value={stats.urgences.en_cours_total}
            />
            <StatCard
              label={t("dashboard.urgences.nonTries")}
              value={stats.urgences.non_trie}
              tone="danger"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            {Object.entries(stats.urgences.par_niveau_triage).map(([niveau, count]) => (
              <StatCard
                key={niveau}
                label={t(
                  `dashboard.urgences.${niveau.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())}`,
                )}
                value={count}
                tone={NIVEAU_TRIAGE_TONE[niveau] ?? "neutral"}
              />
            ))}
          </div>
        </div>
      )}

      {tab === "hospitalisation" && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            label={t("dashboard.hospitalisation.litsTotal")}
            value={stats.hospitalisation.lits_total}
          />
          <StatCard
            label={t("dashboard.hospitalisation.litsOccupes")}
            value={stats.hospitalisation.lits_occupes}
            tone="primary"
          />
          <StatCard
            label={t("dashboard.hospitalisation.tauxOccupation")}
            value={`${stats.hospitalisation.taux_occupation}%`}
            tone="accent"
          />
          <StatCard
            label={t("dashboard.hospitalisation.sejoursEnCours")}
            value={stats.hospitalisation.sejours_en_cours}
          />
        </div>
      )}

      {tab === "laboratoire" && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            label={t("dashboard.laboratoire.enAttente")}
            value={stats.laboratoire.en_attente}
            tone="warning"
          />
          <StatCard
            label={t("dashboard.laboratoire.aValiderBiologiste")}
            value={stats.laboratoire.a_valider_biologiste}
            tone="primary"
          />
          <StatCard
            label={t("dashboard.laboratoire.resultatsAnormaux")}
            value={stats.laboratoire.resultats_anormaux_non_valides}
            tone="danger"
          />
        </div>
      )}

      {tab === "pharmacie" && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            label={t("dashboard.pharmacie.rupturesStock")}
            value={stats.pharmacie.ruptures_stock}
            tone="danger"
          />
          <StatCard
            label={t("dashboard.pharmacie.peremptionsProches")}
            value={stats.pharmacie.peremptions_proches}
            tone="warning"
          />
        </div>
      )}

      {tab === "caisse" && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            label={t("dashboard.caisse.chiffreAffaires")}
            value={fcfa(stats.caisse.chiffre_affaires_aujourdhui)}
            tone="success"
          />
          <StatCard
            label={t("dashboard.caisse.depenses")}
            value={fcfa(stats.caisse.depenses_aujourdhui)}
          />
          <StatCard
            label={t("dashboard.caisse.facturesImpayees")}
            value={stats.caisse.factures_impayees}
            tone="warning"
          />
          <StatCard
            label={t("dashboard.caisse.creancesTotal")}
            value={fcfa(stats.caisse.creances_total)}
            tone="danger"
          />
        </div>
      )}

      {tab === "assurances" && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            label={t("dashboard.assurances.prisesEnChargeEnAttente")}
            value={stats.assurances.prises_en_charge_en_attente}
            tone="warning"
          />
          <StatCard
            label={t("dashboard.assurances.montantReclame")}
            value={fcfa(stats.assurances.montant_reclame_non_regle)}
            tone="danger"
          />
        </div>
      )}

      {tab === "personnel" && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            label={t("dashboard.personnel.effectifActif")}
            value={stats.personnel.effectif_actif}
            tone="primary"
          />
          <StatCard
            label={t("dashboard.personnel.congesEnAttente")}
            value={stats.personnel.conges_en_attente}
            tone="warning"
          />
        </div>
      )}
    </div>
  );
}

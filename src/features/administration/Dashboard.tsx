"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Circle,
  ShieldCheck,
  TrendingUp,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { fetchDashboard } from "./administration-api";
import type { DashboardStats } from "./types";
import { Card, Tabs } from "@/components/ui";
import { BarChart } from "@/components/charts/BarChart";
import type { BarChartDatum } from "@/components/charts/BarChart";
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

const TONE_CHIP: Record<Tone, string> = {
  primary: "bg-primary-light text-primary",
  accent: "bg-accent-light text-accent",
  success: "bg-success-light text-success",
  warning: "bg-warning-light text-warning",
  danger: "bg-danger-light text-danger",
  neutral: "bg-foreground/5 text-muted",
};

const TONE_ICON: Record<Tone, LucideIcon> = {
  primary: TrendingUp,
  accent: ShieldCheck,
  success: ShieldCheck,
  warning: AlertTriangle,
  danger: XCircle,
  neutral: Circle,
};

const TONE_COLOR: Record<Tone, string> = {
  primary: "var(--color-primary)",
  accent: "var(--color-accent)",
  success: "var(--color-success)",
  warning: "var(--color-warning)",
  danger: "var(--color-danger)",
  neutral: "var(--color-muted)",
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
  const Icon = TONE_ICON[tone];
  return (
    <Card className="flex items-start gap-3 p-4">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${TONE_CHIP[tone]}`}>
        <Icon size={18} />
      </span>
      <div className="min-w-0">
        <div className="text-xs font-medium text-muted">{label}</div>
        <div className={`mt-1 text-2xl font-semibold ${TONE_TEXT[tone]}`}>{value}</div>
      </div>
    </Card>
  );
}

function fcfa(montant: number): string {
  return `${montant.toLocaleString("fr-FR")} F CFA`;
}

function ChartCard({
  title,
  data,
  formatValue,
}: {
  title: string;
  data: BarChartDatum[];
  formatValue?: (value: number) => string;
}) {
  return (
    <Card>
      <h3 className="mb-2 text-xs font-medium text-muted">{title}</h3>
      <BarChart data={data} formatValue={formatValue} />
    </Card>
  );
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

  const tabs = TABS.map((key) => ({ key, label: t(`dashboard.tabs.${key}`) }));

  return (
    <div className="flex flex-col gap-6">
      <Tabs tabs={tabs} active={tab} onChange={(key) => setTab(key as TabKey)} />

      {tab === "reception" && (
        <>
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
          <ChartCard
            title={t("dashboard.tabs.reception")}
            data={[
              { label: t("dashboard.reception.patientsTotal"), value: stats.reception.patients_total, color: TONE_COLOR.primary },
              { label: t("dashboard.reception.nouveauxAujourdhui"), value: stats.reception.nouveaux_patients_aujourdhui, color: TONE_COLOR.primary },
              { label: t("dashboard.reception.ticketsEnAttente"), value: stats.reception.tickets_en_attente, color: TONE_COLOR.warning },
              { label: t("dashboard.reception.ticketsTraites"), value: stats.reception.tickets_traites_aujourdhui, color: TONE_COLOR.success },
            ]}
          />
        </>
      )}

      {tab === "rendezVous" && (
        <>
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
          <ChartCard
            title={t("dashboard.tabs.rendezVous")}
            data={[
              { label: t("dashboard.rendezVous.total"), value: stats.rendez_vous.aujourdhui_total, color: TONE_COLOR.neutral },
              { label: t("dashboard.rendezVous.honores"), value: stats.rendez_vous.honores, color: TONE_COLOR.success },
              { label: t("dashboard.rendezVous.aVenir"), value: stats.rendez_vous.a_venir, color: TONE_COLOR.primary },
              { label: t("dashboard.rendezVous.annulesOuAbsents"), value: stats.rendez_vous.annules_ou_absents, color: TONE_COLOR.danger },
            ]}
          />
        </>
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
          <ChartCard
            title={t("dashboard.tabs.urgences")}
            data={Object.entries(stats.urgences.par_niveau_triage).map(([niveau, count]) => ({
              label: t(
                `dashboard.urgences.${niveau.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())}`,
              ),
              value: count,
              color: TONE_COLOR[NIVEAU_TRIAGE_TONE[niveau] ?? "neutral"],
            }))}
          />
        </div>
      )}

      {tab === "hospitalisation" && (
        <>
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
          <ChartCard
            title={t("dashboard.tabs.hospitalisation")}
            data={[
              { label: t("dashboard.hospitalisation.litsTotal"), value: stats.hospitalisation.lits_total, color: TONE_COLOR.neutral },
              { label: t("dashboard.hospitalisation.litsOccupes"), value: stats.hospitalisation.lits_occupes, color: TONE_COLOR.primary },
              { label: t("dashboard.hospitalisation.sejoursEnCours"), value: stats.hospitalisation.sejours_en_cours, color: TONE_COLOR.accent },
            ]}
          />
        </>
      )}

      {tab === "laboratoire" && (
        <>
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
          <ChartCard
            title={t("dashboard.tabs.laboratoire")}
            data={[
              { label: t("dashboard.laboratoire.enAttente"), value: stats.laboratoire.en_attente, color: TONE_COLOR.warning },
              { label: t("dashboard.laboratoire.aValiderBiologiste"), value: stats.laboratoire.a_valider_biologiste, color: TONE_COLOR.primary },
              { label: t("dashboard.laboratoire.resultatsAnormaux"), value: stats.laboratoire.resultats_anormaux_non_valides, color: TONE_COLOR.danger },
            ]}
          />
        </>
      )}

      {tab === "pharmacie" && (
        <>
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
          <ChartCard
            title={t("dashboard.tabs.pharmacie")}
            data={[
              { label: t("dashboard.pharmacie.rupturesStock"), value: stats.pharmacie.ruptures_stock, color: TONE_COLOR.danger },
              { label: t("dashboard.pharmacie.peremptionsProches"), value: stats.pharmacie.peremptions_proches, color: TONE_COLOR.warning },
            ]}
          />
        </>
      )}

      {tab === "caisse" && (
        <>
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
          <ChartCard
            title={t("dashboard.tabs.caisse")}
            formatValue={fcfa}
            data={[
              { label: t("dashboard.caisse.chiffreAffaires"), value: stats.caisse.chiffre_affaires_aujourdhui, color: TONE_COLOR.success },
              { label: t("dashboard.caisse.depenses"), value: stats.caisse.depenses_aujourdhui, color: TONE_COLOR.neutral },
              { label: t("dashboard.caisse.creancesTotal"), value: stats.caisse.creances_total, color: TONE_COLOR.danger },
            ]}
          />
        </>
      )}

      {tab === "assurances" && (
        <>
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
          <ChartCard
            title={t("dashboard.tabs.assurances")}
            formatValue={fcfa}
            data={[
              { label: t("dashboard.assurances.montantReclame"), value: stats.assurances.montant_reclame_non_regle, color: TONE_COLOR.danger },
            ]}
          />
        </>
      )}

      {tab === "personnel" && (
        <>
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
          <ChartCard
            title={t("dashboard.tabs.personnel")}
            data={[
              { label: t("dashboard.personnel.effectifActif"), value: stats.personnel.effectif_actif, color: TONE_COLOR.primary },
              { label: t("dashboard.personnel.congesEnAttente"), value: stats.personnel.conges_en_attente, color: TONE_COLOR.warning },
            ]}
          />
        </>
      )}
    </div>
  );
}

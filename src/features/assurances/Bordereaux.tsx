"use client";

import { useEffect, useState } from "react";
import { FileStack, Landmark, type LucideIcon } from "lucide-react";
import {
  creerBordereau,
  envoyerBordereau,
  fetchBordereaux,
  fetchCompagnies,
  reglerBordereau,
} from "./assurances-api";
import type { BordereauAssurance, CompagnieAssurance } from "./types";
import { Badge, Button, Card, Input, Modal, Pagination, Select } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

const STATUT_TONES: Record<BordereauAssurance["statut"], "neutral" | "primary" | "warning" | "success"> = {
  brouillon: "neutral",
  envoye: "primary",
  paye_partiel: "warning",
  paye: "success",
};

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
}) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-light text-accent">
        <Icon size={18} />
      </span>
      <div className="min-w-0">
        <div className="text-xs font-medium text-muted">{label}</div>
        <div className="mt-1 text-2xl font-semibold text-foreground">{value}</div>
      </div>
    </Card>
  );
}

export function Bordereaux() {
  const { t } = useTranslation();
  const [bordereaux, setBordereaux] = useState<BordereauAssurance[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBordereaux, setTotalBordereaux] = useState(0);
  const [compagnies, setCompagnies] = useState<CompagnieAssurance[]>([]);
  const [montantRegle, setMontantRegle] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState(false);
  const [showForm, setShowForm] = useState(false);

  function load() {
    fetchBordereaux(page).then((res) => {
      setBordereaux(res.data);
      setTotalPages(res.meta.last_page);
      setTotalBordereaux(res.meta.total);
    });
  }

  useEffect(() => {
    load();
  }, [page]);

  useEffect(() => {
    fetchCompagnies().then((res) => setCompagnies(res.data));
  }, []);

  async function handleEnvoyer(id: number) {
    setBusy(true);
    try {
      await envoyerBordereau(id);
      load();
    } finally {
      setBusy(false);
    }
  }

  async function handleRegler(id: number) {
    const montant = montantRegle[id];
    if (!montant) return;
    setBusy(true);
    try {
      await reglerBordereau(id, Number(montant));
      setMontantRegle((m) => ({ ...m, [id]: "" }));
      load();
    } finally {
      setBusy(false);
    }
  }

  const montantReclamePage = bordereaux.reduce((sum, b) => sum + Number(b.montant_total), 0);

  return (
    <div className="flex flex-col gap-4">
      {bordereaux.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            icon={FileStack}
            label={t("assurances.bordereaux.statTotal")}
            value={totalBordereaux}
          />
          <StatCard
            icon={Landmark}
            label={t("assurances.bordereaux.statMontantPage")}
            value={`${montantReclamePage.toLocaleString("fr-FR")} F CFA`}
          />
        </div>
      )}
      <Button onClick={() => setShowForm(true)} className="self-start">
        + {t("assurances.bordereaux.newBordereau")}
      </Button>

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={t("assurances.bordereaux.newBordereau")}
      >
        <CreateBordereauForm
          compagnies={compagnies}
          onCancel={() => setShowForm(false)}
          onCreated={() => {
            setShowForm(false);
            load();
          }}
        />
      </Modal>

      <Card className="p-0 overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th>{t("assurances.bordereaux.numero")}</th>
              <th>{t("assurances.bordereaux.compagnie")}</th>
              <th>{t("common.status")}</th>
              <th>{t("assurances.bordereaux.reglement")}</th>
              <th>{t("common.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {bordereaux.map((b) => (
              <tr key={b.id}>
                <td>{b.numero}</td>
                <td>{b.compagnie.nom}</td>
                <td>
                  <Badge tone={STATUT_TONES[b.statut]}>
                    {t(`assurances.bordereauStatut.${b.statut}`)}
                  </Badge>
                </td>
                <td>
                  {t("assurances.bordereaux.reglementProgress", {
                    regle: b.montant_regle,
                    total: b.montant_total,
                  })}
                  {b.nombre_factures !== null &&
                    ` - ${t("assurances.bordereaux.facturesCount", { count: b.nombre_factures })}`}
                </td>
                <td>
                  {b.statut === "brouillon" && (
                    <Button variant="outline" size="sm" onClick={() => handleEnvoyer(b.id)} disabled={busy}>
                      {t("assurances.bordereaux.marquerEnvoye")}
                    </Button>
                  )}
                  {(b.statut === "envoye" || b.statut === "paye_partiel") && (
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder={t("assurances.bordereaux.montantReglePlaceholder")}
                        value={montantRegle[b.id] ?? ""}
                        onChange={(e) =>
                          setMontantRegle((m) => ({ ...m, [b.id]: e.target.value }))
                        }
                        className="w-28 text-xs"
                      />
                      <Button variant="outline" size="sm" onClick={() => handleRegler(b.id)} disabled={busy}>
                        {t("assurances.bordereaux.enregistrerReglement")}
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {bordereaux.length === 0 && (
          <p className="text-sm text-muted p-4">{t("assurances.bordereaux.empty")}</p>
        )}
      </Card>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}

function CreateBordereauForm({
  compagnies,
  onCancel,
  onCreated,
}: {
  compagnies: CompagnieAssurance[];
  onCancel?: () => void;
  onCreated: () => void;
}) {
  const { t } = useTranslation();
  const [compagnieId, setCompagnieId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleCreer() {
    if (!compagnieId) return;
    setBusy(true);
    setError(null);
    try {
      await creerBordereau(Number(compagnieId));
      setCompagnieId("");
      onCreated();
    } catch {
      setError(t("assurances.bordereaux.error"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Select value={compagnieId} onChange={(e) => setCompagnieId(e.target.value)}>
        <option value="">{t("assurances.bordereaux.compagniePlaceholder")}</option>
        {compagnies.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nom}
          </option>
        ))}
      </Select>
      {error && (
        <p className="rounded-lg bg-danger-light px-3 py-2 text-sm text-danger">{error}</p>
      )}
      <div className="flex gap-2">
        <Button onClick={handleCreer} disabled={busy}>
          {t("assurances.bordereaux.generer")}
        </Button>
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
        )}
      </div>
    </div>
  );
}

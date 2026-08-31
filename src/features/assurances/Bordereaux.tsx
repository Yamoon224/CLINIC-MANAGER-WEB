"use client";

import { useCallback, useEffect, useState } from "react";
import { IconFileStack, IconReportMoney, IconPlus } from "@tabler/icons-react";
import {
  creerBordereau,
  envoyerBordereau,
  fetchBordereaux,
  fetchCompagnies,
  reglerBordereau,
} from "./assurances-api";
import type { BordereauAssurance, CompagnieAssurance } from "./types";
import {
  Badge,
  Button,
  DataTable,
  Field,
  Input,
  Modal,
  Select,
  StatCard,
  type Column,
  type Tone,
} from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

const STATUT_TONES: Record<BordereauAssurance["statut"], Tone> = {
  brouillon: "neutral",
  envoye: "primary",
  paye_partiel: "warning",
  paye: "success",
};

export function Bordereaux() {
  const { t } = useTranslation();
  const [bordereaux, setBordereaux] = useState<BordereauAssurance[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [compagnies, setCompagnies] = useState<CompagnieAssurance[]>([]);
  const [montantRegle, setMontantRegle] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(() => {
    fetchBordereaux(page)
      .then((res) => {
        setBordereaux(res.data);
        setTotal(res.meta.total);
      })
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

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

  const montantReclamePage = bordereaux.reduce(
    (sum, b) => sum + Number(b.montant_total),
    0,
  );

  const columns: Column<BordereauAssurance>[] = [
    {
      key: "numero",
      header: t("assurances.bordereaux.numero"),
      cell: (b) => <span className="font-semibold text-heading">{b.numero}</span>,
    },
    {
      key: "compagnie",
      header: t("assurances.bordereaux.compagnie"),
      cell: (b) => b.compagnie.nom,
    },
    {
      key: "statut",
      header: t("common.status"),
      cell: (b) => (
        <Badge tone={STATUT_TONES[b.statut]} border>
          {t(`assurances.bordereauStatut.${b.statut}`)}
        </Badge>
      ),
    },
    {
      key: "reglement",
      header: t("assurances.bordereaux.reglement"),
      cell: (b) => (
        <span>
          {t("assurances.bordereaux.reglementProgress", {
            regle: b.montant_regle,
            total: b.montant_total,
          })}
          {b.nombre_factures !== null &&
            ` · ${t("assurances.bordereaux.facturesCount", { count: b.nombre_factures })}`}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      headClassName: "text-right",
      cell: (b) => (
        <div className="flex justify-end">
          {b.statut === "brouillon" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEnvoyer(b.id)}
              disabled={busy}
            >
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRegler(b.id)}
                disabled={busy}
              >
                {t("assurances.bordereaux.enregistrerReglement")}
              </Button>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          icon={<IconFileStack size={18} />}
          label={t("assurances.bordereaux.statTotal")}
          value={total}
          tone="accent"
        />
        <StatCard
          icon={<IconReportMoney size={18} />}
          label={t("assurances.bordereaux.statMontantPage")}
          value={`${montantReclamePage.toLocaleString("fr-FR")} F CFA`}
          tone="primary"
        />
      </div>

      <DataTable
        columns={columns}
        rows={bordereaux}
        getRowKey={(b) => b.id}
        page={page}
        perPage={15}
        total={total}
        onPageChange={setPage}
        loading={loading}
        emptyLabel={t("assurances.bordereaux.empty")}
        toolbarRight={
          <Button icon={<IconPlus size={15} />} onClick={() => setShowForm(true)}>
            {t("assurances.bordereaux.newBordereau")}
          </Button>
        }
      />

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

  async function handleCreer(event: React.FormEvent) {
    event.preventDefault();
    if (!compagnieId) return;
    setBusy(true);
    setError(null);
    try {
      await creerBordereau(Number(compagnieId));
      onCreated();
    } catch {
      setError(t("assurances.bordereaux.error"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleCreer} className="flex flex-col gap-4">
      <Field label={t("assurances.bordereaux.compagnie")} required>
        <Select
          value={compagnieId}
          onChange={(e) => setCompagnieId(e.target.value)}
        >
          <option value="">
            {t("assurances.bordereaux.compagniePlaceholder")}
          </option>
          {compagnies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nom}
            </option>
          ))}
        </Select>
      </Field>
      {error && (
        <p className="rounded-[5px] bg-danger-light px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="light" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
        )}
        <Button type="submit" disabled={busy}>
          {t("assurances.bordereaux.generer")}
        </Button>
      </div>
    </form>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Building2, CheckCircle2, type LucideIcon } from "lucide-react";
import { createCompagnie, fetchCompagnies } from "./assurances-api";
import type { CompagnieAssurance } from "./types";
import { Badge, Button, Card, Field, Input, Modal } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

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
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
        <Icon size={18} />
      </span>
      <div className="min-w-0">
        <div className="text-xs font-medium text-muted">{label}</div>
        <div className="mt-1 text-2xl font-semibold text-foreground">{value}</div>
      </div>
    </Card>
  );
}

export function CompagniesAssurance() {
  const { t } = useTranslation();
  const [compagnies, setCompagnies] = useState<CompagnieAssurance[]>([]);
  const [showForm, setShowForm] = useState(false);

  function load() {
    fetchCompagnies().then((res) => setCompagnies(res.data));
  }

  useEffect(() => {
    load();
  }, []);

  const actives = compagnies.filter((c) => c.actif).length;

  return (
    <div className="flex flex-col gap-4">
      {compagnies.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            icon={Building2}
            label={t("assurances.compagnies.statTotal")}
            value={compagnies.length}
          />
          <StatCard
            icon={CheckCircle2}
            label={t("assurances.compagnies.statActives")}
            value={actives}
          />
        </div>
      )}
      <Button onClick={() => setShowForm(true)} className="self-start">
        + {t("assurances.compagnies.newCompagnie")}
      </Button>

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={t("assurances.compagnies.newCompagnie")}
      >
        <CreateCompagnieForm
          onCancel={() => setShowForm(false)}
          onCreated={() => {
            setShowForm(false);
            load();
          }}
        />
      </Modal>

      <ul className="flex flex-col gap-2 text-sm">
        {compagnies.map((c) => (
          <li
            key={c.id}
            className="flex items-center justify-between rounded-xl border border-border bg-surface p-3"
          >
            <span className="flex items-center gap-2">
              {c.nom}
              {c.contact_telephone && (
                <span className="text-muted">- {c.contact_telephone}</span>
              )}
              <Badge tone={c.actif ? "success" : "neutral"}>
                {c.actif ? t("common.active") : t("common.inactive")}
              </Badge>
            </span>
            <span className="font-semibold">{c.taux_couverture_defaut}%</span>
          </li>
        ))}
        {compagnies.length === 0 && <li className="text-muted">{t("assurances.compagnies.empty")}</li>}
      </ul>
    </div>
  );
}

function CreateCompagnieForm({
  onCancel,
  onCreated,
}: {
  onCancel?: () => void;
  onCreated: () => void;
}) {
  const { t } = useTranslation();
  const [nom, setNom] = useState("");
  const [taux, setTaux] = useState("");
  const [contactTelephone, setContactTelephone] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit() {
    if (!nom || !taux) return;
    setBusy(true);
    try {
      await createCompagnie({
        nom,
        taux_couverture_defaut: Number(taux),
        contact_telephone: contactTelephone || undefined,
      });
      setNom("");
      setTaux("");
      setContactTelephone("");
      onCreated();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <div className="flex-1">
          <Field label={t("assurances.compagnies.nom")}>
            <Input
              placeholder={t("assurances.compagnies.nomPlaceholder")}
              value={nom}
              onChange={(e) => setNom(e.target.value)}
            />
          </Field>
        </div>
        <div className="w-40">
          <Field label={t("assurances.compagnies.tauxCouverture")}>
            <Input
              placeholder={t("assurances.compagnies.tauxCouverturePlaceholder")}
              value={taux}
              onChange={(e) => setTaux(e.target.value)}
            />
          </Field>
        </div>
      </div>
      <Field label={t("assurances.compagnies.telephone")}>
        <Input
          placeholder={t("assurances.compagnies.telephonePlaceholder")}
          value={contactTelephone}
          onChange={(e) => setContactTelephone(e.target.value)}
        />
      </Field>
      <div className="flex gap-2">
        <Button onClick={handleSubmit} disabled={busy}>
          {t("assurances.compagnies.submit")}
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

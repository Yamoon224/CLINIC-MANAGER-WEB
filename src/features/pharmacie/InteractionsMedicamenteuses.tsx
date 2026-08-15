"use client";

import { useEffect, useState } from "react";
import {
  createInteraction,
  deleteInteraction,
  fetchInteractions,
  fetchMedicaments,
} from "./pharmacie-api";
import type { GraviteInteraction, InteractionMedicamenteuse, Medicament } from "./types";
import { Badge, Button, Card, Select, Textarea, type Tone } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

const GRAVITE_TONE: Record<GraviteInteraction, Tone> = {
  mineure: "neutral",
  moderee: "warning",
  majeure: "danger",
};

export function InteractionsMedicamenteuses() {
  const { t } = useTranslation();
  const [interactions, setInteractions] = useState<InteractionMedicamenteuse[]>([]);
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [busyId, setBusyId] = useState<number | null>(null);

  const GRAVITE_LABELS: Record<GraviteInteraction, string> = {
    mineure: t("pharmacie.interactions.graviteMineure"),
    moderee: t("pharmacie.interactions.graviteModeree"),
    majeure: t("pharmacie.interactions.graviteMajeure"),
  };

  function load() {
    fetchInteractions().then((res) => setInteractions(res.data));
  }

  useEffect(() => {
    load();
    fetchMedicaments().then((res) => setMedicaments(res.data));
  }, []);

  async function handleDelete(id: number) {
    setBusyId(id);
    try {
      await deleteInteraction(id);
      load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-4">
        <h2 className="mb-3 font-semibold text-foreground">{t("pharmacie.interactions.newTitle")}</h2>
        <CreateInteractionForm
          medicaments={medicaments}
          onCreated={() => load()}
        />
      </Card>

      <Card className="p-0 overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th>{t("pharmacie.interactions.colPaire")}</th>
              <th>{t("pharmacie.interactions.colGravite")}</th>
              <th>{t("pharmacie.interactions.colDescription")}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {interactions.map((i) => (
              <tr key={i.id}>
                <td>
                  {i.medicament_a.dci} × {i.medicament_b.dci}
                </td>
                <td>
                  <Badge tone={GRAVITE_TONE[i.gravite]}>{GRAVITE_LABELS[i.gravite]}</Badge>
                </td>
                <td className="text-muted">{i.description ?? "—"}</td>
                <td>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(i.id)}
                    disabled={busyId === i.id}
                    className="text-danger hover:bg-danger-light"
                  >
                    {t("common.cancel")}
                  </Button>
                </td>
              </tr>
            ))}
            {interactions.length === 0 && (
              <tr>
                <td colSpan={4} className="text-muted">
                  {t("pharmacie.interactions.empty")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function CreateInteractionForm({
  medicaments,
  onCreated,
}: {
  medicaments: Medicament[];
  onCreated: () => void;
}) {
  const { t } = useTranslation();
  const [medicamentAId, setMedicamentAId] = useState<number | "">("");
  const [medicamentBId, setMedicamentBId] = useState<number | "">("");
  const [gravite, setGravite] = useState<GraviteInteraction>("moderee");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const GRAVITE_LABELS: Record<GraviteInteraction, string> = {
    mineure: t("pharmacie.interactions.graviteMineure"),
    moderee: t("pharmacie.interactions.graviteModeree"),
    majeure: t("pharmacie.interactions.graviteMajeure"),
  };

  async function handleSubmit() {
    if (!medicamentAId || !medicamentBId || medicamentAId === medicamentBId) {
      setError(t("pharmacie.interactions.error"));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await createInteraction({
        medicament_a_id: medicamentAId,
        medicament_b_id: medicamentBId,
        gravite,
        description: description || undefined,
      });
      setMedicamentAId("");
      setMedicamentBId("");
      setDescription("");
      onCreated();
    } catch {
      setError(t("pharmacie.interactions.error"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Select
          value={medicamentAId}
          onChange={(e) => setMedicamentAId(e.target.value ? Number(e.target.value) : "")}
          className="flex-1"
        >
          <option value="">{t("pharmacie.interactions.selectMedicamentA")}</option>
          {medicaments.map((m) => (
            <option key={m.id} value={m.id}>
              {m.dci}
            </option>
          ))}
        </Select>
        <Select
          value={medicamentBId}
          onChange={(e) => setMedicamentBId(e.target.value ? Number(e.target.value) : "")}
          className="flex-1"
        >
          <option value="">{t("pharmacie.interactions.selectMedicamentB")}</option>
          {medicaments.map((m) => (
            <option key={m.id} value={m.id}>
              {m.dci}
            </option>
          ))}
        </Select>
        <Select value={gravite} onChange={(e) => setGravite(e.target.value as GraviteInteraction)} className="w-40">
          {Object.entries(GRAVITE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>
      <Textarea
        placeholder={t("pharmacie.interactions.descriptionPlaceholder")}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button onClick={handleSubmit} disabled={busy} className="self-start">
        {t("pharmacie.interactions.submit")}
      </Button>
    </div>
  );
}

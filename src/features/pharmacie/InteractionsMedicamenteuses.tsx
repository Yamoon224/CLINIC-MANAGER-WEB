"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createInteraction,
  deleteInteraction,
  fetchInteractions,
  fetchMedicaments,
} from "./pharmacie-api";
import type {
  GraviteInteraction,
  InteractionMedicamenteuse,
  Medicament,
} from "./types";
import {
  Badge,
  Button,
  Card,
  ConfirmDeleteModal,
  DataTable,
  Field,
  RowActions,
  Select,
  Textarea,
  type Column,
  type Tone,
} from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";

const GRAVITE_TONE: Record<GraviteInteraction, Tone> = {
  mineure: "neutral",
  moderee: "warning",
  majeure: "danger",
};

export function InteractionsMedicamenteuses() {
  const { t } = useTranslation();
  const [interactions, setInteractions] = useState<InteractionMedicamenteuse[]>(
    [],
  );
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] =
    useState<InteractionMedicamenteuse | null>(null);
  const [busy, setBusy] = useState(false);

  const GRAVITE_LABELS: Record<GraviteInteraction, string> = {
    mineure: t("pharmacie.interactions.graviteMineure"),
    moderee: t("pharmacie.interactions.graviteModeree"),
    majeure: t("pharmacie.interactions.graviteMajeure"),
  };

  const load = useCallback(() => {
    fetchInteractions()
      .then((res) => setInteractions(res.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    fetchMedicaments().then((res) => setMedicaments(res.data));
  }, [load]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      await deleteInteraction(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } finally {
      setBusy(false);
    }
  }

  const columns: Column<InteractionMedicamenteuse>[] = [
    {
      key: "paire",
      header: t("pharmacie.interactions.colPaire"),
      cell: (i) => (
        <span className="font-semibold text-heading">
          {i.medicament_a.dci} × {i.medicament_b.dci}
        </span>
      ),
    },
    {
      key: "gravite",
      header: t("pharmacie.interactions.colGravite"),
      cell: (i) => (
        <Badge tone={GRAVITE_TONE[i.gravite]} border>
          {GRAVITE_LABELS[i.gravite]}
        </Badge>
      ),
    },
    {
      key: "description",
      header: t("pharmacie.interactions.colDescription"),
      cell: (i) => <span className="text-muted">{i.description ?? "—"}</span>,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      headClassName: "text-right",
      cell: (i) => (
        <div className="flex justify-end">
          <RowActions
            onDelete={() => setDeleteTarget(i)}
            deleteLabel={t("common.delete")}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-0">
        <div className="border-b border-border px-5 py-3.5">
          <h2 className="m-0 text-[15px] font-semibold text-heading">
            {t("pharmacie.interactions.newTitle")}
          </h2>
        </div>
        <div className="p-5">
          <CreateInteractionForm
            medicaments={medicaments}
            onCreated={() => load()}
          />
        </div>
      </Card>

      <DataTable
        columns={columns}
        rows={interactions}
        getRowKey={(i) => i.id}
        searchAccessor={(i) => `${i.medicament_a.dci} ${i.medicament_b.dci}`}
        loading={loading}
        emptyLabel={t("pharmacie.interactions.empty")}
      />

      <ConfirmDeleteModal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        busy={busy}
        message={t("common.confirmDeleteMessage")}
        confirmLabel={t("common.yesDelete")}
        cancelLabel={t("common.cancel")}
        title={t("common.confirmDeleteTitle")}
      />
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

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label={t("pharmacie.interactions.selectMedicamentA")}>
          <Select
            value={medicamentAId}
            onChange={(e) =>
              setMedicamentAId(e.target.value ? Number(e.target.value) : "")
            }
          >
            <option value="">
              {t("pharmacie.interactions.selectMedicamentA")}
            </option>
            {medicaments.map((m) => (
              <option key={m.id} value={m.id}>
                {m.dci}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t("pharmacie.interactions.selectMedicamentB")}>
          <Select
            value={medicamentBId}
            onChange={(e) =>
              setMedicamentBId(e.target.value ? Number(e.target.value) : "")
            }
          >
            <option value="">
              {t("pharmacie.interactions.selectMedicamentB")}
            </option>
            {medicaments.map((m) => (
              <option key={m.id} value={m.id}>
                {m.dci}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t("pharmacie.interactions.colGravite")}>
          <Select
            value={gravite}
            onChange={(e) => setGravite(e.target.value as GraviteInteraction)}
          >
            {Object.entries(GRAVITE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label={t("pharmacie.interactions.colDescription")}>
        <Textarea
          placeholder={t("pharmacie.interactions.descriptionPlaceholder")}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />
      </Field>
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex justify-end">
        <Button type="submit" disabled={busy}>
          {t("pharmacie.interactions.submit")}
        </Button>
      </div>
    </form>
  );
}

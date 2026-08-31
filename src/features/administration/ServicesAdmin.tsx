"use client";

import { useCallback, useEffect, useState } from "react";
import { IconPlus } from "@tabler/icons-react";
import * as api from "./administration-api";
import type { Service, ServicePayload } from "./types";
import {
  Badge,
  Button,
  ConfirmDeleteModal,
  DataTable,
  Field,
  Input,
  Modal,
  RowActions,
  Textarea,
  type Column,
} from "@/components/ui";
import { apiErrorMessage } from "@/lib/api-client";
import { useTranslation } from "@/lib/i18n/LanguageContext";

const EMPTY: ServicePayload = {
  code: "",
  nom: "",
  couleur: null,
  description: null,
  ordre: 0,
  actif: true,
};

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ServicesAdmin() {
  const { t } = useTranslation();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Service | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    api
      .fetchServices(true)
      .then((res) => setServices(res.data))
      .catch((e) => setError(apiErrorMessage(e, t("parametres.services.loadError"))))
      .finally(() => setLoading(false));
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleToggleActif(service: Service) {
    setError(null);
    try {
      await api.updateService(service.id, {
        nom: service.nom,
        couleur: service.couleur,
        description: service.description,
        ordre: service.ordre,
        actif: !service.actif,
      });
      load();
    } catch (e) {
      setError(apiErrorMessage(e, t("parametres.services.saveError")));
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setBusy(true);
    setError(null);
    try {
      await api.deleteService(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch (e) {
      setError(apiErrorMessage(e, t("parametres.services.deleteError")));
    } finally {
      setBusy(false);
    }
  }

  const columns: Column<Service>[] = [
    {
      key: "nom",
      header: t("parametres.services.colNom"),
      cell: (s) => (
        <div className="flex items-center gap-2.5">
          <span
            className="inline-block h-3.5 w-3.5 shrink-0 rounded-full border border-border"
            style={{ background: s.couleur ?? "var(--color-border)" }}
          />
          <span className="font-semibold text-heading">{s.nom}</span>
        </div>
      ),
    },
    {
      key: "code",
      header: t("parametres.services.colCode"),
      cell: (s) => <span className="text-muted">{s.code}</span>,
    },
    {
      key: "ordre",
      header: t("parametres.services.colOrdre"),
      cell: (s) => s.ordre,
    },
    {
      key: "actif",
      header: t("parametres.services.colStatut"),
      cell: (s) => (
        <Badge tone={s.actif ? "success" : "neutral"} border>
          {s.actif
            ? t("parametres.services.actif")
            : t("parametres.services.inactif")}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      headClassName: "text-right",
      cell: (s) => (
        <div className="flex justify-end">
          <RowActions
            edit={() => {
              setEditing(s);
              setShowForm(true);
            }}
            onDelete={() => setDeleteTarget(s)}
            editLabel={t("common.edit")}
            deleteLabel={t("common.delete")}
            extra={[
              {
                label: s.actif
                  ? t("parametres.services.deactivate")
                  : t("parametres.services.activate"),
                onClick: () => handleToggleActif(s),
              },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted">{t("parametres.services.subtitle")}</p>

      {error && (
        <p className="rounded-[5px] bg-danger-light px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <DataTable
        columns={columns}
        rows={services}
        getRowKey={(s) => s.id}
        searchAccessor={(s) => `${s.nom} ${s.code}`}
        loading={loading}
        emptyLabel={t("parametres.services.empty")}
        toolbarRight={
          <Button
            icon={<IconPlus size={15} />}
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
          >
            {t("parametres.services.new")}
          </Button>
        }
      />

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={
          editing
            ? t("parametres.services.edit")
            : t("parametres.services.new")
        }
        size="lg"
      >
        <ServiceForm
          initial={editing}
          onCancel={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            load();
          }}
        />
      </Modal>

      <ConfirmDeleteModal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        busy={busy}
        title={t("common.confirmDeleteTitle")}
        message={t("parametres.services.deleteMessage", {
          nom: deleteTarget?.nom ?? "",
        })}
        confirmLabel={t("common.yesDelete")}
        cancelLabel={t("common.cancel")}
      />
    </div>
  );
}

function ServiceForm({
  initial,
  onCancel,
  onSaved,
}: {
  initial: Service | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const { t } = useTranslation();
  const [form, setForm] = useState<ServicePayload>(
    initial
      ? {
          nom: initial.nom,
          couleur: initial.couleur,
          description: initial.description,
          ordre: initial.ordre,
          actif: initial.actif,
        }
      : EMPTY,
  );
  const [codeTouched, setCodeTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (initial) {
        await api.updateService(initial.id, {
          nom: form.nom,
          couleur: form.couleur,
          description: form.description,
          ordre: form.ordre,
          actif: form.actif,
        });
      } else {
        await api.createService({ ...form, code: form.code || slugify(form.nom) });
      }
      onSaved();
    } catch (err) {
      setError(apiErrorMessage(err, t("parametres.services.saveError")));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("parametres.services.colNom")} required>
          <Input
            required
            value={form.nom}
            onChange={(e) => {
              const nom = e.target.value;
              setForm((f) => ({
                ...f,
                nom,
                code:
                  initial || codeTouched ? f.code : slugify(nom),
              }));
            }}
          />
        </Field>
        {!initial && (
          <Field
            label={t("parametres.services.colCode")}
            hint={t("parametres.services.codeHint")}
            required
          >
            <Input
              required
              value={form.code ?? ""}
              onChange={(e) => {
                setCodeTouched(true);
                setForm((f) => ({ ...f, code: e.target.value }));
              }}
            />
          </Field>
        )}
        <Field label={t("parametres.services.colCouleur")}>
          <Input
            type="text"
            placeholder="#2E37A4"
            value={form.couleur ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, couleur: e.target.value || null }))
            }
          />
        </Field>
        <Field label={t("parametres.services.colOrdre")}>
          <Input
            type="number"
            min={0}
            value={form.ordre}
            onChange={(e) =>
              setForm((f) => ({ ...f, ordre: Number(e.target.value) || 0 }))
            }
          />
        </Field>
        <Field label={t("parametres.services.colDescription")} full>
          <Textarea
            rows={2}
            value={form.description ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value || null }))
            }
          />
        </Field>
      </div>

      <label className="flex items-center gap-2 text-sm text-heading">
        <input
          type="checkbox"
          checked={form.actif}
          onChange={(e) => setForm((f) => ({ ...f, actif: e.target.checked }))}
          className="h-4 w-4 rounded border-border accent-primary"
        />
        {t("parametres.services.actifLabel")}
      </label>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="light" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
        <Button type="submit" disabled={busy}>
          {t("common.save")}
        </Button>
      </div>
    </form>
  );
}

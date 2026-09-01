"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IconPlus, IconSearch } from "@tabler/icons-react";
import {
  Avatar,
  Badge,
  Button,
  DataTable,
  Input,
  Modal,
  PageHeader,
  Pagination,
  RowActions,
  ViewToggle,
  useViewMode,
  type Column,
} from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { searchPatients } from "./patients-api";
import { PatientCard } from "./PatientCard";
import { PatientForm } from "./PatientForm";
import type { Patient } from "./types";

function ageFrom(dateNaissance: string | null): number | null {
  if (!dateNaissance) return null;
  const birth = new Date(dateNaissance);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

export function PatientList() {
  const { t } = useTranslation();
  const router = useRouter();
  const [view, setView] = useViewMode("patients.view");
  const [query, setQuery] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(12);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    let cancelled = false;
    searchPatients(query, page, perPage)
      .then((res) => {
        if (cancelled) return;
        setPatients(res.data);
        setTotal(res.meta.total);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [query, page, perPage]);

  const columns: Column<Patient>[] = [
    {
      key: "patient",
      header: t("patients.list.patient"),
      cell: (p) => {
        const age = ageFrom(p.date_naissance);
        const sexeLabel = p.sexe
          ? p.sexe === "F"
            ? t("patients.detail.sexeFeminin")
            : t("patients.detail.sexeMasculin")
          : null;
        const sub = [age != null ? t("patients.list.age", { age }) : null, sexeLabel]
          .filter(Boolean)
          .join(", ");
        return (
          <div className="flex items-center gap-2.5">
            <Avatar
              initials={`${p.prenom.charAt(0)}${p.nom.charAt(0)}`}
              size="md"
              rounded
            />
            <Link
              href={`/patients/${p.id}`}
              className="font-semibold text-heading hover:text-primary"
            >
              {p.prenom} {p.nom}
              {sub && (
                <span className="block text-[13px] font-normal text-muted">
                  {sub}
                </span>
              )}
            </Link>
          </div>
        );
      },
    },
    {
      key: "dossier",
      header: t("patients.numeroDossier"),
      cell: (p) => <span className="text-primary">{p.numero_dossier}</span>,
    },
    {
      key: "tel",
      header: t("patients.telephone"),
      cell: (p) => p.telephone ?? "-",
    },
    {
      key: "sexe",
      header: t("patients.form.sexe"),
      cell: (p) =>
        p.sexe ? (
          <Badge tone={p.sexe === "F" ? "accent" : "primary"}>
            {p.sexe === "F"
              ? t("patients.detail.sexeFeminin")
              : t("patients.detail.sexeMasculin")}
          </Badge>
        ) : (
          "-"
        ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      headClassName: "text-right",
      cell: (p) => (
        <div className="flex justify-end">
          <RowActions
            view={`/patients/${p.id}`}
            edit={`/patients/${p.id}/modifier`}
            viewLabel={t("common.view")}
            editLabel={t("common.edit")}
          />
        </div>
      ),
    },
  ];

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={t("patients.list.title")}
        total={total}
        actions={
          <>
            <ViewToggle
              mode={view}
              onChange={setView}
              listLabel={t("common.datatable.viewList")}
              gridLabel={t("common.datatable.viewGrid")}
            />
            <Button variant="light" onClick={() => setShowForm(true)}>
              {t("patients.list.quickNew")}
            </Button>
            <Button
              icon={<IconPlus size={15} />}
              onClick={() => router.push("/patients/nouveau")}
            >
              {t("patients.list.newPatient")}
            </Button>
          </>
        }
      />

      {view === "list" ? (
        <DataTable
          columns={columns}
          rows={patients}
          getRowKey={(p) => p.id}
          page={page}
          perPage={perPage}
          total={total}
          onPageChange={setPage}
          onPerPageChange={(n) => {
            setPerPage(n);
            setPage(1);
          }}
          search={query}
          onSearchChange={(v) => {
            setQuery(v);
            setPage(1);
          }}
          searchPlaceholder={t("patients.searchPlaceholder")}
          loading={isLoading}
          emptyLabel={t("patients.noResults")}
        />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="relative max-w-sm">
            <IconSearch
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <Input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder={t("patients.searchPlaceholder")}
              className="pl-9"
            />
          </div>

          {isLoading ? (
            <p className="text-sm text-muted">{t("common.loading")}</p>
          ) : patients.length === 0 ? (
            <p className="text-sm text-muted">{t("patients.noResults")}</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {patients.map((p) => (
                <PatientCard key={p.id} patient={p} />
              ))}
            </div>
          )}

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={t("patients.list.quickNew")}
        size="lg"
      >
        <PatientForm compact onCancel={() => setShowForm(false)} />
      </Modal>
    </div>
  );
}

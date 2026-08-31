"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IconPlus } from "@tabler/icons-react";
import {
  Avatar,
  Badge,
  Button,
  DataTable,
  Modal,
  PageHeader,
  RowActions,
  type Column,
} from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { searchPatients } from "./patients-api";
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
  const [query, setQuery] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    searchPatients(query, page, perPage)
      .then((res) => {
        setPatients(res.data);
        setTotal(res.meta.total);
      })
      .finally(() => setIsLoading(false));
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

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={t("patients.list.title")}
        total={total}
        actions={
          <>
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

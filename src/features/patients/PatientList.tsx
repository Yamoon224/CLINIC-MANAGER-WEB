"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { Badge, Button, Card, Input, Modal, PageHeader, Pagination } from "@/components/ui";
import { searchPatients } from "./patients-api";
import { PatientForm } from "./PatientForm";
import type { Patient } from "./types";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export function PatientList() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [query]);

  useEffect(() => {
    const handle = setTimeout(() => {
      setIsLoading(true);
      searchPatients(query, page)
        .then((res) => {
          setPatients(res.data);
          setTotalPages(res.meta.last_page);
          setTotal(res.meta.total);
        })
        .finally(() => setIsLoading(false));
    }, 250);
    return () => clearTimeout(handle);
  }, [query, page]);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={t("patients.title")}
        actions={
          <Button onClick={() => setShowForm(true)}>
            + {t("patients.newPatient")}
          </Button>
        }
      />

      <Card className="flex w-fit items-start gap-3 p-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
          <Users size={18} />
        </span>
        <div className="min-w-0">
          <div className="text-xs font-medium text-muted">{t("patients.stats.total")}</div>
          <div className="mt-1 text-2xl font-semibold text-primary">{total}</div>
        </div>
      </Card>

      <div className="flex items-center justify-between gap-4">
        <Input
          type="search"
          placeholder={t("patients.searchPlaceholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      <Card className="p-0 overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th>{t("patients.numeroDossier")}</th>
              <th>{t("patients.nom")}</th>
              <th>{t("patients.prenom")}</th>
              <th>{t("patients.form.sexe")}</th>
              <th>{t("patients.telephone")}</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr key={patient.id}>
                <td>
                  <Link
                    href={`/patients/${patient.id}`}
                    className="text-primary hover:underline font-medium"
                  >
                    {patient.numero_dossier}
                  </Link>
                </td>
                <td>{patient.nom}</td>
                <td>{patient.prenom}</td>
                <td>
                  {patient.sexe && (
                    <Badge tone={patient.sexe === "F" ? "accent" : "primary"}>
                      {patient.sexe === "F"
                        ? t("patients.detail.sexeFeminin")
                        : t("patients.detail.sexeMasculin")}
                    </Badge>
                  )}
                </td>
                <td>{patient.telephone ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {!isLoading && patients.length === 0 && (
          <p className="text-sm text-muted p-4">{t("patients.noResults")}</p>
        )}
      </Card>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={t("patients.newPatient")}
        size="lg"
      >
        <PatientForm onCancel={() => setShowForm(false)} />
      </Modal>
    </div>
  );
}

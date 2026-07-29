"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, Input, PageHeader, Pagination } from "@/components/ui";
import { searchPatients } from "./patients-api";
import type { Patient } from "./types";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export function PatientList() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

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
          <Link
            href="/patients/new"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm shadow-primary/20 transition-colors hover:bg-primary-hover"
          >
            + {t("patients.newPatient")}
          </Link>
        }
      />

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
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, Input, PageHeader } from "@/components/ui";
import { searchPatients } from "./patients-api";
import type { Patient } from "./types";

export function PatientList() {
  const [query, setQuery] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handle = setTimeout(() => {
      setIsLoading(true);
      searchPatients(query)
        .then((res) => setPatients(res.data))
        .finally(() => setIsLoading(false));
    }, 250);
    return () => clearTimeout(handle);
  }, [query]);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Patients"
        actions={
          <Link
            href="/patients/new"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm shadow-primary/20 transition-colors hover:bg-primary-hover"
          >
            + Nouveau patient
          </Link>
        }
      />

      <div className="flex items-center justify-between gap-4">
        <Input
          type="search"
          placeholder="Rechercher par nom, téléphone ou numéro de dossier..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b border-border bg-primary-light/40">
              <th className="py-2.5 px-4 font-semibold text-foreground/90">N° dossier</th>
              <th className="py-2.5 px-4 font-semibold text-foreground/90">Nom</th>
              <th className="py-2.5 px-4 font-semibold text-foreground/90">Prénom</th>
              <th className="py-2.5 px-4 font-semibold text-foreground/90">Téléphone</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr key={patient.id} className="border-b border-border last:border-0 hover:bg-primary-light/40">
                <td className="py-2.5 px-4">
                  <Link
                    href={`/patients/${patient.id}`}
                    className="text-primary hover:underline font-medium"
                  >
                    {patient.numero_dossier}
                  </Link>
                </td>
                <td className="py-2.5 px-4">{patient.nom}</td>
                <td className="py-2.5 px-4">{patient.prenom}</td>
                <td className="py-2.5 px-4">{patient.telephone ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {!isLoading && patients.length === 0 && (
          <p className="text-sm text-muted p-4">Aucun patient trouvé.</p>
        )}
      </Card>
    </div>
  );
}

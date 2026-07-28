"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
      <div className="flex items-center justify-between gap-4">
        <input
          type="search"
          placeholder="Rechercher par nom, téléphone ou numéro de dossier..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border rounded px-3 py-2 flex-1 max-w-md"
        />
        <Link
          href="/patients/new"
          className="bg-blue-600 text-white rounded px-3 py-2 whitespace-nowrap"
        >
          + Nouveau patient
        </Link>
      </div>

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2 pr-4">N° dossier</th>
            <th className="py-2 pr-4">Nom</th>
            <th className="py-2 pr-4">Prénom</th>
            <th className="py-2 pr-4">Téléphone</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr key={patient.id} className="border-b hover:bg-gray-50">
              <td className="py-2 pr-4">
                <Link
                  href={`/patients/${patient.id}`}
                  className="text-blue-600 underline"
                >
                  {patient.numero_dossier}
                </Link>
              </td>
              <td className="py-2 pr-4">{patient.nom}</td>
              <td className="py-2 pr-4">{patient.prenom}</td>
              <td className="py-2 pr-4">{patient.telephone ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {!isLoading && patients.length === 0 && (
        <p className="text-sm text-gray-500">Aucun patient trouvé.</p>
      )}
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { searchPatients } from "@/features/patients/patients-api";
import type { Patient } from "@/features/patients/types";
import { admettre } from "./urgences-api";

export function AdmissionForm() {
  const router = useRouter();

  const [patientQuery, setPatientQuery] = useState("");
  const [patientResults, setPatientResults] = useState<Patient[]>([]);
  const [patient, setPatient] = useState<Patient | null>(null);

  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handle = setTimeout(() => {
      if (!patientQuery) {
        setPatientResults([]);
        return;
      }
      searchPatients(patientQuery).then((res) => setPatientResults(res.data));
    }, 250);
    return () => clearTimeout(handle);
  }, [patientQuery]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const { data } = await admettre({
        patient_id: patient?.id,
        nom: patient ? undefined : nom || undefined,
        prenom: patient ? undefined : prenom || undefined,
        notes: notes || undefined,
      });
      router.push(`/urgences/${data.id}`);
    } catch {
      setError("Impossible d'admettre le patient.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xl">
      <p className="text-sm text-gray-600">
        Patient inconnu ou inconscient ? Laissez la recherche vide et
        validez directement - un dossier minimal sera créé.
      </p>

      <div className="flex flex-col gap-1">
        <label className="text-sm">Patient déjà connu (optionnel)</label>
        {patient ? (
          <div className="flex items-center justify-between border rounded px-3 py-2">
            <span>
              {patient.prenom} {patient.nom} ({patient.numero_dossier})
            </span>
            <button type="button" onClick={() => setPatient(null)} className="text-sm underline">
              Changer
            </button>
          </div>
        ) : (
          <>
            <input
              placeholder="Rechercher un patient..."
              value={patientQuery}
              onChange={(e) => setPatientQuery(e.target.value)}
              className="border rounded px-3 py-2"
            />
            {patientResults.length > 0 && (
              <ul className="border rounded divide-y">
                {patientResults.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setPatient(p);
                        setPatientResults([]);
                        setPatientQuery("");
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50"
                    >
                      {p.prenom} {p.nom} ({p.numero_dossier})
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>

      {!patient && (
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm">Nom (si connu)</label>
            <input
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="border rounded px-3 py-2"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm">Prénom (si connu)</label>
            <input
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              className="border rounded px-3 py-2"
            />
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-sm">Notes d&apos;admission</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="border rounded px-3 py-2"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-red-600 text-white rounded px-3 py-2 self-start disabled:opacity-50"
      >
        {isSubmitting ? "Admission..." : "Admettre aux urgences"}
      </button>
    </form>
  );
}

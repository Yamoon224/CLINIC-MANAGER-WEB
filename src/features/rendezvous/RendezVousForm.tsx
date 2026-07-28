"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { searchPatients } from "@/features/patients/patients-api";
import type { Patient } from "@/features/patients/types";
import {
  createRendezVous,
  fetchCreneauxDisponibles,
  fetchPraticiens,
} from "./rendezvous-api";
import {
  RENDEZ_VOUS_TYPE_LABELS,
  RENDEZ_VOUS_TYPES,
  type Praticien,
  type RendezVousType,
} from "./types";

export function RendezVousForm() {
  const router = useRouter();

  const [patientQuery, setPatientQuery] = useState("");
  const [patientResults, setPatientResults] = useState<Patient[]>([]);
  const [patient, setPatient] = useState<Patient | null>(null);

  const [praticiens, setPraticiens] = useState<Praticien[]>([]);
  const [praticienId, setPraticienId] = useState<number | "">("");
  const [type, setType] = useState<RendezVousType>("consultation");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const [creneaux, setCreneaux] = useState<string[]>([]);
  const [startsAt, setStartsAt] = useState("");
  const [motif, setMotif] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPraticiens().then((res) => setPraticiens(res.data));
  }, []);

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

  useEffect(() => {
    (async () => {
      setStartsAt("");
      if (!praticienId || !date) {
        setCreneaux([]);
        return;
      }
      const res = await fetchCreneauxDisponibles(praticienId, type, date);
      setCreneaux(res.data);
    })();
  }, [praticienId, type, date]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!patient || !praticienId || !startsAt) {
      setError("Patient, praticien et créneau sont requis.");
      return;
    }
    setIsSubmitting(true);
    try {
      await createRendezVous({
        patient_id: patient.id,
        praticien_id: praticienId,
        type,
        starts_at: startsAt,
        motif: motif || undefined,
      });
      router.push("/rendez-vous");
    } catch {
      setError("Impossible de créer le rendez-vous (créneau indisponible ?).");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xl">
      <div className="flex flex-col gap-1">
        <label className="text-sm">Patient</label>
        {patient ? (
          <div className="flex items-center justify-between border rounded px-3 py-2">
            <span>
              {patient.prenom} {patient.nom} ({patient.numero_dossier})
            </span>
            <button
              type="button"
              onClick={() => setPatient(null)}
              className="text-sm underline"
            >
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

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm">Praticien</label>
          <select
            value={praticienId}
            onChange={(e) =>
              setPraticienId(e.target.value ? Number(e.target.value) : "")
            }
            className="border rounded px-3 py-2"
          >
            <option value="">—</option>
            {praticiens.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as RendezVousType)}
            className="border rounded px-3 py-2"
          >
            {RENDEZ_VOUS_TYPES.map((t) => (
              <option key={t} value={t}>
                {RENDEZ_VOUS_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border rounded px-3 py-2"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm">Créneau disponible</label>
        {praticienId ? (
          creneaux.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {creneaux.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setStartsAt(c)}
                  className={`border rounded px-3 py-1 text-sm ${startsAt === c ? "bg-blue-600 text-white" : ""}`}
                >
                  {new Date(c).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Aucun créneau disponible ce jour-là.
            </p>
          )
        ) : (
          <p className="text-sm text-gray-500">
            Choisissez un praticien pour voir les créneaux.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm">Motif</label>
        <textarea
          value={motif}
          onChange={(e) => setMotif(e.target.value)}
          className="border rounded px-3 py-2"
          rows={2}
        />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-blue-600 text-white rounded px-3 py-2 self-start disabled:opacity-50"
      >
        {isSubmitting ? "Enregistrement..." : "Prendre le rendez-vous"}
      </button>
    </form>
  );
}

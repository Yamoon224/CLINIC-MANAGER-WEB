"use client";

import { useEffect, useState } from "react";
import { getPatient } from "./patients-api";
import { PatientDetail } from "./PatientDetail";
import type { Patient } from "./types";

export function PatientDetailPage({ id }: { id: number }) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    getPatient(id)
      .then((res) => setPatient(res.data))
      .catch(() => setError(true));
  }, [id]);

  if (error) return <p className="text-red-600">Patient introuvable.</p>;
  if (!patient) return <p className="text-gray-500">Chargement...</p>;

  return <PatientDetail patient={patient} />;
}

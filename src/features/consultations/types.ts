export type PrescriptionType = "medicament" | "analyse" | "imagerie";

export const PRESCRIPTION_TYPE_LABELS: Record<PrescriptionType, string> = {
  medicament: "Médicament",
  analyse: "Analyse",
  imagerie: "Imagerie",
};

export interface Prescription {
  id: number;
  type: PrescriptionType;
  analyse_type_id: number | null;
  medicament_id: number | null;
  designation: string;
  instructions: string | null;
  created_at: string | null;
}

export interface Constantes {
  temperature: string | null;
  tension: string | null;
  poids: string | null;
  pouls: number | null;
}

export interface Consultation {
  id: number;
  motif: string;
  examen_clinique: string | null;
  diagnostic: string | null;
  cim10_code: string | null;
  conduite_a_tenir: string | null;
  prix: string | null;
  constantes: Constantes;
  statut: "en_cours" | "terminee";
  started_at: string | null;
  ended_at: string | null;
  patient: {
    id: number;
    nom: string;
    prenom: string;
    numero_dossier: string;
    allergies: string | null;
  };
  praticien: {
    id: number;
    name: string;
  };
  prescriptions: Prescription[];
}

export interface StartConsultationPayload {
  patient_id: number;
  motif: string;
  rendez_vous_id?: number;
  ticket_id?: number;
}

export interface UpdateConsultationPayload {
  examen_clinique?: string;
  diagnostic?: string;
  cim10_code?: string;
  conduite_a_tenir?: string;
  prix?: number;
  temperature?: number;
  tension?: string;
  poids?: number;
  pouls?: number;
}

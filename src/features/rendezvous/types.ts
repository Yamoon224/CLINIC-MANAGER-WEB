export const RENDEZ_VOUS_TYPES = [
  "consultation",
  "cpn",
  "vaccination",
  "controle",
  "resultat",
] as const;

export type RendezVousType = (typeof RENDEZ_VOUS_TYPES)[number];

export const RENDEZ_VOUS_TYPE_LABELS: Record<RendezVousType, string> = {
  consultation: "Consultation",
  cpn: "Consultation prénatale",
  vaccination: "Vaccination",
  controle: "Contrôle",
  resultat: "Résultat",
};

export type RendezVousStatut =
  | "programme"
  | "confirme"
  | "arrive"
  | "en_consultation"
  | "honore"
  | "absent"
  | "annule"
  | "reporte";

export const RENDEZ_VOUS_STATUT_LABELS: Record<RendezVousStatut, string> = {
  programme: "Programmé",
  confirme: "Confirmé",
  arrive: "Arrivé",
  en_consultation: "En consultation",
  honore: "Honoré",
  absent: "Absent",
  annule: "Annulé",
  reporte: "Reporté",
};

export interface Praticien {
  id: number;
  name: string;
}

export interface RendezVous {
  id: number;
  type: RendezVousType;
  starts_at: string;
  ends_at: string;
  duree_minutes: number;
  statut: RendezVousStatut;
  motif: string | null;
  patient: {
    id: number;
    nom: string;
    prenom: string;
    numero_dossier: string;
  };
  praticien: Praticien;
  created_at: string | null;
}

export interface CreateRendezVousPayload {
  patient_id: number;
  praticien_id: number;
  type: RendezVousType;
  starts_at: string;
  motif?: string;
}

export const NIVEAUX_TRIAGE = [
  "reanimation",
  "tres_urgent",
  "urgent",
  "semi_urgent",
  "non_urgent",
] as const;

export type NiveauTriage = (typeof NIVEAUX_TRIAGE)[number];

export const NIVEAU_TRIAGE_LABELS: Record<NiveauTriage, string> = {
  reanimation: "Réanimation",
  tres_urgent: "Très urgent",
  urgent: "Urgent",
  semi_urgent: "Semi-urgent",
  non_urgent: "Non urgent",
};

export const NIVEAU_TRIAGE_COLORS: Record<NiveauTriage, string> = {
  reanimation: "bg-red-600 text-white",
  tres_urgent: "bg-orange-500 text-white",
  urgent: "bg-yellow-400 text-black",
  semi_urgent: "bg-blue-500 text-white",
  non_urgent: "bg-green-600 text-white",
};

export type IssueUrgence = "domicile" | "hospitalisation" | "reference" | "deces";

export const ISSUE_LABELS: Record<IssueUrgence, string> = {
  domicile: "Retour à domicile",
  hospitalisation: "Hospitalisation",
  reference: "Référence vers un autre établissement",
  deces: "Décès",
};

export type AdmissionStatut = "admis" | "trie" | "observation" | "sorti";

export interface UrgenceActe {
  id: number;
  description: string;
  created_at: string | null;
}

export interface AdmissionUrgence {
  id: number;
  statut: AdmissionStatut;
  niveau_triage: NiveauTriage | null;
  niveau_triage_libelle: string | null;
  niveau_triage_couleur: string | null;
  issue: IssueUrgence | null;
  constantes: {
    temperature: string | null;
    tension: string | null;
    poids: string | null;
    pouls: number | null;
  };
  notes: string | null;
  admitted_at: string | null;
  triage_at: string | null;
  sortie_at: string | null;
  patient: {
    id: number;
    nom: string;
    prenom: string;
    numero_dossier: string;
    allergies: string | null;
  };
  actes: UrgenceActe[];
}

export interface AdmettreUrgencePayload {
  patient_id?: number;
  nom?: string;
  prenom?: string;
  notes?: string;
}

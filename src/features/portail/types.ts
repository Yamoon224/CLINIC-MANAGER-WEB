export interface PortailPatient {
  id: number;
  numero_dossier: string;
  nom: string;
  prenom: string;
  email: string;
}

export interface PortailLoginCredentials {
  email: string;
  password: string;
}

export interface PortailLoginResponse {
  patient: PortailPatient;
  token: string;
}

export type RendezVousStatut =
  | "programme"
  | "confirme"
  | "arrive"
  | "en_consultation"
  | "honore"
  | "absent"
  | "annule"
  | "reporte";

export type RendezVousType =
  | "consultation"
  | "cpn"
  | "vaccination"
  | "controle"
  | "resultat";

export const RENDEZ_VOUS_TYPES: RendezVousType[] = [
  "consultation",
  "cpn",
  "vaccination",
  "controle",
  "resultat",
];

export interface PortailPraticien {
  id: number;
  name: string;
}

export interface PortailRendezVous {
  id: number;
  type: RendezVousType;
  statut: RendezVousStatut;
  starts_at: string;
  duree_minutes: number;
  motif: string | null;
  praticien: PortailPraticien;
}

export interface PortailResultat {
  id: number;
  analyse: string;
  resultat_valeur: string | null;
  resultat_anormal: boolean;
  resultat_critique: boolean;
  commentaire: string | null;
  valide_at: string | null;
}

export interface PortailFacture {
  id: number;
  statut: string;
  montant_total: string;
  montant_part_patient: string;
  montant_paye: string;
  solde: number;
  created_at: string;
}

export interface CreatePortailRendezVousPayload {
  praticien_id: number;
  type: RendezVousType;
  starts_at: string;
  motif?: string;
}

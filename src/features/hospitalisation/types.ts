export type LitStatut = "libre" | "occupe" | "reserve" | "nettoyage";

export interface Lit {
  id: number;
  numero: string;
  chambre: string;
  statut: LitStatut;
  prix_journalier: string;
  patient_actuel: {
    sejour_id: number;
    patient_id: number;
    nom: string;
    prenom: string;
  } | null;
}

export interface SuiviQuotidien {
  id: number;
  releve_at: string | null;
  temperature: string | null;
  tension: string | null;
  pouls: number | null;
  soins_administres: string | null;
  observations: string | null;
}

export type SejourStatut = "en_cours" | "termine";

export interface Sejour {
  id: number;
  motif: string;
  statut: SejourStatut;
  admitted_at: string | null;
  sortie_at: string | null;
  nombre_jours: number;
  frais_sejour: string | null;
  patient: {
    id: number;
    nom: string;
    prenom: string;
    numero_dossier: string;
  };
  lit: { id: number; numero: string; chambre: string };
  suivis: SuiviQuotidien[];
}

export interface AdmettrePayload {
  lit_id: number;
  motif: string;
  consultation_id?: number;
  admission_urgence_id?: number;
  grossesse_id?: number;
}

export interface AjouterSuiviPayload {
  releve_at: string;
  temperature?: number;
  tension?: string;
  pouls?: number;
  soins_administres?: string;
  observations?: string;
}

export type AnalyseSection =
  | "hematologie"
  | "biochimie"
  | "serologie"
  | "parasitologie"
  | "bacteriologie"
  | "autre";

export interface AnalyseType {
  id: number;
  nom: string;
  section: AnalyseSection;
  unite: string | null;
  prelevement: string | null;
  valeur_ref_min: string | null;
  valeur_ref_max: string | null;
  valeur_critique_min: string | null;
  valeur_critique_max: string | null;
  prix: string | null;
}

export type DemandeAnalyseStatut =
  | "demandee"
  | "preleve"
  | "valide_technicien"
  | "valide"
  | "annulee";

export interface DemandeAnalyse {
  id: number;
  urgente: boolean;
  statut: DemandeAnalyseStatut;
  resultat_valeur: string | null;
  resultat_anormal: boolean;
  resultat_critique: boolean;
  preleve_at: string | null;
  valide_technicien_at: string | null;
  valide_biologiste_at: string | null;
  patient: {
    id: number;
    nom: string;
    prenom: string;
    numero_dossier: string;
  };
  analyse_type: AnalyseType;
  demandeur: { id: number; name: string } | null;
  created_at: string | null;
}

export interface DemanderAnalysesPayload {
  analyse_type_ids: number[];
  urgente?: boolean;
  consultation_id?: number;
}

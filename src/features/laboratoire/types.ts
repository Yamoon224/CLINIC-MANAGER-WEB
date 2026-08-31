export type AnalyseSection =
  | "hematologie"
  | "biochimie"
  | "serologie"
  | "parasitologie"
  | "bacteriologie"
  | "autre";

export interface AnalyseParametre {
  id: number;
  nom: string;
  unite: string | null;
  ordre: number;
  valeur_ref_min: string | null;
  valeur_ref_max: string | null;
  valeur_critique_min: string | null;
  valeur_critique_max: string | null;
  valeurs_anormales: string | null;
  valeurs_critiques: string | null;
}

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
  /** Mots-clés (séparés par des virgules) qui signalent un résultat texte comme anormal — ex. "positif". */
  valeurs_anormales: string | null;
  /** Idem pour "critique" — voir EvaluateurResultat côté backend. */
  valeurs_critiques: string | null;
  prix: string | null;
  /** Paramètres mesurés (au moins un). Un examen simple en a un seul, nommé « Résultat ». */
  parametres?: AnalyseParametre[];
}

export interface ResultatAnalyse {
  analyse_parametre_id: number;
  valeur: string | null;
  anormal: boolean;
  critique: boolean;
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
  commentaire: string | null;
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
  resultats?: ResultatAnalyse[];
  demandeur: { id: number; name: string } | null;
  created_at: string | null;
}

export type FeuilleStatut =
  | "aucune"
  | "en_cours"
  | "a_valider"
  | "valide";

export interface FeuilleParametre {
  id: number;
  nom: string;
  unite: string | null;
  valeur_ref_min: string | null;
  valeur_ref_max: string | null;
  valeur_critique_min: string | null;
  valeur_critique_max: string | null;
  valeurs_anormales: string | null;
  valeurs_critiques: string | null;
  valeur: string | null;
  anormal: boolean;
  critique: boolean;
}

export interface FeuilleAnalyse {
  demande_analyse_id: number;
  statut: DemandeAnalyseStatut;
  urgente: boolean;
  analyse: { id: number; nom: string; section: AnalyseSection };
  parametres: FeuilleParametre[];
}

export interface FeuilleLabo {
  consultation: { id: number; motif: string | null; date: string | null };
  patient: { id: number; nom: string; prenom: string; numero_dossier: string };
  statut_global: FeuilleStatut;
  commentaire: string | null;
  analyses: FeuilleAnalyse[];
}

export interface FeuilleLaboListItem {
  consultation_id: number;
  motif: string | null;
  date: string | null;
  patient: { id: number; nom: string; prenom: string; numero_dossier: string };
  praticien: string | null;
  analyses_total: number;
  analyses_a_faire: number;
  analyses_a_valider: number;
}

export interface DemanderAnalysesPayload {
  analyse_type_ids: number[];
  urgente?: boolean;
  consultation_id?: number;
}

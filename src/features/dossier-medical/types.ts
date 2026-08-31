export interface SyntheseDossier {
  allergies: string | null;
  antecedents: string | null;
  nb_consultations: number;
  nb_hospitalisations: number;
  nb_vaccins: number;
  derniere_consultation: string | null;
  problemes_actifs: string[];
}

export interface DossierPrescription {
  id: number;
  type: string;
  designation: string;
  instructions: string | null;
}

export interface DossierAnalyse {
  id: number;
  analyse: string | null;
  unite: string | null;
  statut: string;
  resultat_valeur: string | null;
  resultat_anormal: boolean;
  resultat_critique: boolean;
  commentaire: string | null;
  date: string | null;
}

export interface DossierDispensation {
  id: number;
  medicament: string | null;
  quantite: number;
  date: string | null;
}

export interface DossierOperation {
  id: number;
  type_operation: string;
  statut: string;
  date: string | null;
  praticien: string | null;
  compte_rendu: string | null;
}

export interface DossierSejour {
  id: number;
  lit: string | null;
  motif: string | null;
  statut: string;
  admitted_at: string | null;
  sortie_at: string | null;
  operations: DossierOperation[];
}

export interface ConsultationEpisode {
  type: "consultation";
  id: number;
  date: string | null;
  motif: string | null;
  diagnostic: string | null;
  cim10_code: string | null;
  conduite_a_tenir: string | null;
  examen_clinique: string | null;
  statut: string;
  prix: string | null;
  praticien: { id: number; name: string } | null;
  constantes: {
    temperature: string | null;
    tension: string | null;
    poids: string | null;
    pouls: number | null;
  };
  prescriptions: DossierPrescription[];
  analyses: DossierAnalyse[];
  dispensations: DossierDispensation[];
  sejours: DossierSejour[];
}

export interface UrgenceEpisode {
  type: "urgence";
  id: number;
  date: string | null;
  statut: string;
  issue: string | null;
  niveau_triage: string | null;
  niveau_triage_libelle: string | null;
  niveau_triage_couleur: string | null;
  constantes: {
    temperature: string | null;
    tension: string | null;
    poids: string | null;
    pouls: number | null;
  };
  notes: string | null;
  sortie_at: string | null;
  actes: { id: number; description: string }[];
}

export interface GrossesseEpisode {
  type: "grossesse";
  id: number;
  date: string | null;
  statut: string;
  ddr: string | null;
  terme: string | null;
  semaines_amenorrhee: number | null;
  a_risque: boolean;
  facteurs_risque: string | null;
  cpn: {
    id: number;
    numero: number;
    date_cpn: string | null;
    risque_detecte: boolean;
    risque_details: string | null;
  }[];
  accouchement: {
    mode: string | null;
    date_heure: string | null;
    complications: string | null;
    nouveau_nes: {
      id: number;
      sexe: string | null;
      poids: string | null;
      score_apgar_5min: number | null;
    }[];
  } | null;
}

export type Episode = ConsultationEpisode | UrgenceEpisode | GrossesseEpisode;

export interface DossierVaccination {
  id: number;
  vaccin: string | null;
  dose_numero: number | null;
  date_administration: string | null;
  mapi_survenue: boolean;
}

export interface DossierFacture {
  id: number;
  statut: string;
  montant_total: string | null;
  montant_part_patient: string | null;
  montant_paye: string | null;
  solde: number;
  created_at: string | null;
}

export interface DossierMedical {
  patient: {
    id: number;
    numero_dossier: string;
    nom: string;
    prenom: string;
    date_naissance: string | null;
    sexe: "M" | "F" | null;
  };
  synthese: SyntheseDossier;
  timeline: Episode[];
  vaccinations: DossierVaccination[];
  factures: DossierFacture[];
}

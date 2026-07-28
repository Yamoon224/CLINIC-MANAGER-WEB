export type GrossesseStatut = "suivie" | "accouchee" | "interrompue";

export interface ConsultationPrenatale {
  id: number;
  numero: number;
  date_cpn: string | null;
  poids: string | null;
  tension: string | null;
  hauteur_uterine: string | null;
  bruits_coeur_foetal: string | null;
  traitements_preventifs: string | null;
  examens_prescrits: string | null;
  risque_detecte: boolean;
  risque_details: string | null;
  created_at: string | null;
}

export interface NouveauNe {
  id: number;
  sexe: "M" | "F" | null;
  poids: string | null;
  taille: string | null;
  score_apgar_1min: number | null;
  score_apgar_5min: number | null;
  vaccinations_naissance: string | null;
  patient: {
    id: number;
    nom: string;
    prenom: string;
    numero_dossier: string;
  };
}

export type ModeAccouchement = "voie_basse" | "cesarienne";

export interface Accouchement {
  id: number;
  mode: ModeAccouchement;
  date_heure: string | null;
  equipe: string | null;
  delivrance: string | null;
  complications: string | null;
  nouveau_nes: NouveauNe[];
}

export interface Grossesse {
  id: number;
  ddr: string | null;
  date_terme_echo: string | null;
  terme: string | null;
  semaines_amenorrhee: number | null;
  gestite: number | null;
  parite: number | null;
  groupe_sanguin: string | null;
  serologies: string | null;
  facteurs_risque: string | null;
  a_risque: boolean;
  statut: GrossesseStatut;
  patient: {
    id: number;
    nom: string;
    prenom: string;
    numero_dossier: string;
  };
  consultations_prenatales: ConsultationPrenatale[];
  accouchement: Accouchement | null;
}

export interface CreateGrossessePayload {
  ddr?: string;
  date_terme_echo?: string;
  gestite?: number;
  parite?: number;
  groupe_sanguin?: string;
  serologies?: string;
  facteurs_risque?: string;
}

export interface CreateCpnPayload {
  date_cpn: string;
  poids?: number;
  tension?: string;
  hauteur_uterine?: number;
  bruits_coeur_foetal?: string;
  traitements_preventifs?: string;
  examens_prescrits?: string;
  risque_detecte?: boolean;
  risque_details?: string;
}

export interface CreateAccouchementPayload {
  mode: ModeAccouchement;
  date_heure: string;
  equipe?: string;
  delivrance?: string;
  complications?: string;
}

export interface CreateNouveauNePayload {
  sexe?: "M" | "F";
  poids?: number;
  taille?: number;
  score_apgar_1min?: number;
  score_apgar_5min?: number;
  vaccinations_naissance?: string;
}

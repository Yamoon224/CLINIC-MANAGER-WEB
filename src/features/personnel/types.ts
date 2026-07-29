export type TypeContrat = "cdi" | "cdd" | "vacataire" | "stage";
export type EmployeStatut = "actif" | "inactif" | "suspendu";

export const TYPE_CONTRAT_LABELS: Record<TypeContrat, string> = {
  cdi: "CDI",
  cdd: "CDD",
  vacataire: "Vacataire",
  stage: "Stage",
};

export interface Employe {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  fonction: string;
  service: string | null;
  type_contrat: TypeContrat;
  date_embauche: string;
  telephone: string | null;
  email: string | null;
  statut: EmployeStatut;
  user_id: number | null;
}

export type CongeType = "annuel" | "maladie" | "maternite" | "sans_solde" | "autre";
export type CongeStatut = "en_attente" | "approuve" | "refuse";

export const CONGE_TYPE_LABELS: Record<CongeType, string> = {
  annuel: "Congé annuel",
  maladie: "Maladie",
  maternite: "Maternité",
  sans_solde: "Sans solde",
  autre: "Autre",
};

export const CONGE_STATUT_LABELS: Record<CongeStatut, string> = {
  en_attente: "En attente",
  approuve: "Approuvé",
  refuse: "Refusé",
};

export interface Conge {
  id: number;
  type: CongeType;
  date_debut: string;
  date_fin: string;
  duree_jours: number;
  motif: string | null;
  statut: CongeStatut;
  date_reponse: string | null;
  commentaire: string | null;
  employe?: {
    id: number;
    matricule: string;
    nom: string;
    prenom: string;
  };
}

export type Creneau = "matin" | "apres_midi" | "nuit" | "garde";

export const CRENEAU_LABELS: Record<Creneau, string> = {
  matin: "Matin",
  apres_midi: "Après-midi",
  nuit: "Nuit",
  garde: "Garde",
};

export interface Planning {
  id: number;
  date: string;
  creneau: Creneau;
  service: string | null;
  statut: "planifie" | "effectue" | "absent";
  employe?: {
    id: number;
    matricule: string;
    nom: string;
    prenom: string;
  };
}

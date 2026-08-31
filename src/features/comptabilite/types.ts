export type RubriqueCategorie =
  | "gain"
  | "retenue"
  | "cotisation_salariale"
  | "cotisation_patronale";

export type RubriqueMode = "fixe" | "pct_base" | "pct_brut_imposable";

export interface RubriquePaie {
  id: number;
  code: string;
  libelle: string;
  categorie: RubriqueCategorie;
  mode: RubriqueMode;
  taux: string | null;
  montant: string | null;
  imposable: boolean;
  soumis_cotisation: boolean;
  ordre: number;
  actif: boolean;
  pivot?: { montant: string | null; taux: string | null };
}

export interface RubriquePayload {
  code: string;
  libelle: string;
  categorie: RubriqueCategorie;
  mode: RubriqueMode;
  taux?: number | null;
  montant?: number | null;
  imposable: boolean;
  soumis_cotisation: boolean;
  ordre?: number | null;
  actif: boolean;
}

export interface BaremeTranche {
  id?: number;
  tranche_min: number;
  tranche_max: number | null;
  taux: number;
  ordre: number;
}

export type PeriodeStatut = "brouillon" | "validee" | "cloturee";

export interface LigneBulletin {
  libelle: string;
  categorie: string;
  base: string | null;
  taux: string | null;
  montant: string;
}

export interface BulletinPaie {
  id: number;
  periode_paie_id: number;
  employe: {
    id: number;
    matricule: string;
    nom: string;
    prenom: string;
    fonction: string;
  };
  salaire_base: string;
  total_gains: string;
  total_retenues: string;
  total_cotisations_salariales: string;
  its: string;
  salaire_brut: string;
  salaire_brut_imposable: string;
  salaire_net: string;
  statut: "a_payer" | "paye";
  mode_paiement: string | null;
  paye_le: string | null;
  depense_id: number | null;
  lignes?: LigneBulletin[];
}

export interface PeriodePaie {
  id: number;
  mois: string;
  libelle: string;
  statut: PeriodeStatut;
  validee_at: string | null;
  cloturee_at: string | null;
  bulletins_count?: number;
  masse_salariale?: number;
  bulletins?: BulletinPaie[];
}

export interface EcritureComptable {
  id: number;
  date: string;
  journal: "ventes" | "caisse" | "achats" | "paie" | "od";
  libelle: string;
  compte: string | null;
  debit: string;
  credit: string;
}

export interface EtatFinancier {
  periode: { from: string | null; to: string | null };
  produits: number;
  charges: number;
  resultat: number;
  charges_par_categorie: { categorie: string; total: number }[];
  tresorerie: number;
}

export interface EmployeRemuneration {
  employe: { id: number; matricule: string; nom: string; prenom: string };
  salaire_base: string;
  rubriques: RubriquePaie[];
}

export interface DashboardStats {
  reception: {
    patients_total: number;
    nouveaux_patients_aujourdhui: number;
    tickets_en_attente: number;
    tickets_traites_aujourdhui: number;
  };
  rendez_vous: {
    aujourdhui_total: number;
    honores: number;
    annules_ou_absents: number;
    a_venir: number;
  };
  urgences: {
    en_cours_total: number;
    non_trie: number;
    par_niveau_triage: {
      reanimation: number;
      tres_urgent: number;
      urgent: number;
      semi_urgent: number;
      non_urgent: number;
    };
  };
  hospitalisation: {
    lits_total: number;
    lits_occupes: number;
    taux_occupation: number;
    sejours_en_cours: number;
  };
  laboratoire: {
    en_attente: number;
    a_valider_biologiste: number;
    resultats_anormaux_non_valides: number;
  };
  pharmacie: {
    ruptures_stock: number;
    peremptions_proches: number;
  };
  caisse: {
    chiffre_affaires_aujourdhui: number;
    depenses_aujourdhui: number;
    factures_impayees: number;
    creances_total: number;
  };
  assurances: {
    prises_en_charge_en_attente: number;
    montant_reclame_non_regle: number;
  };
  personnel: {
    effectif_actif: number;
    conges_en_attente: number;
  };
}

/** Montant en FCFA, avec séparateur de milliers français. */
export const montant = (valeur) => new Intl.NumberFormat("fr-FR").format(Number(valeur || 0)) + " FCFA";

export const initiales = (texte = "") =>
    texte
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((partie) => partie[0])
        .join("")
        .toUpperCase();

/** Prochaine action du restaurant sur une commande, selon son statut actuel. */
export const statutSuivant = {
    EN_ATTENTE: { code: "CONFIRMEE", label: "Confirmer" },
    CONFIRMEE: { code: "EN_PREPARATION", label: "Lancer la préparation" },
    EN_PREPARATION: { code: "PRETE", label: "Marquer prête" },
};

/** Statuts pour lesquels le serveur autorise l'annulation (voir CommandeService). */
export const statutsAnnulables = ["EN_ATTENTE", "CONFIRMEE"];

/** Filtres de la liste des commandes : regroupés selon qui doit agir. */
export const filtresCommandes = [
    { id: "toutes", label: "Toutes", codes: null },
    { id: "a-traiter", label: "À traiter", codes: ["EN_ATTENTE", "CONFIRMEE", "EN_PREPARATION"] },
    { id: "en-route", label: "Prêtes et en livraison", codes: ["PRETE", "EN_LIVRAISON"] },
    { id: "terminees", label: "Terminées", codes: ["LIVREE", "ANNULEE"] },
];

/** Rubriques de l'espace restaurant (identifiants utilisés aussi par la navigation mobile). */
export const URL_ESPACE = "/restaurant/tableau-de-bord";

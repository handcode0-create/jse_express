/** Montant en FCFA, avec séparateur de milliers français. */
export const montant = (valeur) => new Intl.NumberFormat("fr-FR").format(Number(valeur || 0)) + " FCFA";

/** Initiales (deux lettres maximum) d'un nom complet. */
export const initiales = (texte = "") =>
    texte
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((partie) => partie[0])
        .join("")
        .toUpperCase();

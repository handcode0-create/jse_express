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

/** Minutes écoulées depuis une date `jj/mm/aaaa` et une heure `hh:mm` (null si illisibles). */
export function minutesDepuis(date, heure) {
    if (!date || !heure) return null;

    const [jour, mois, annee] = date.split("/");
    const minutes = Math.floor((Date.now() - new Date(`${annee}-${mois}-${jour}T${heure}:00`).getTime()) / 60000);

    return Number.isFinite(minutes) && minutes >= 0 ? minutes : null;
}

/** Durée lisible : « à l'instant », « 12 min », « 3 h », « 2 j ». */
export function libelleDuree(minutes) {
    if (minutes === null || minutes === undefined) return "—";
    if (minutes < 1) return "à l’instant";
    if (minutes < 60) return `${minutes} min`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} h`;

    return `${Math.floor(minutes / 1440)} j`;
}

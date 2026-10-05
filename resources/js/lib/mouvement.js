/** Vrai si l'utilisateur a demandé de réduire les animations (à respecter pour tout mouvement non essentiel). */
export const mouvementReduit = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

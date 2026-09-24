const CLE_FAVORIS = "jse-express-favoris";

export function lireFavoris() {
    if (typeof window === "undefined") return [];

    try {
        const valeur = window.localStorage.getItem(CLE_FAVORIS);
        const favoris = valeur ? JSON.parse(valeur) : [];
        return Array.isArray(favoris) ? favoris : [];
    } catch {
        return [];
    }
}

export function estFavori(id) {
    return lireFavoris().some((favori) => String(favori.id) === String(id));
}

export function basculerFavori(restaurant) {
    const favoris = lireFavoris();
    const existe = favoris.some(
        (favori) => String(favori.id) === String(restaurant.id),
    );

    const nouveauxFavoris = existe
        ? favoris.filter(
              (favori) => String(favori.id) !== String(restaurant.id),
          )
        : [
              ...favoris,
              {
                  id: restaurant.id,
                  nom: restaurant.nom,
                  note: restaurant.note ?? null,
                  avis: Number(restaurant.avis || 0),
                  type: restaurant.type || "Restaurant",
                  adresse: restaurant.adresse || "Adzopé",
                  services: restaurant.services || "",
                  description: restaurant.description || "",
                  image: restaurant.image || null,
              },
          ];

    window.localStorage.setItem(
        CLE_FAVORIS,
        JSON.stringify(nouveauxFavoris),
    );

    window.dispatchEvent(new CustomEvent("jse:favoris-change"));
    return nouveauxFavoris;
}

export function supprimerFavori(id) {
    const nouveauxFavoris = lireFavoris().filter(
        (favori) => String(favori.id) !== String(id),
    );

    window.localStorage.setItem(
        CLE_FAVORIS,
        JSON.stringify(nouveauxFavoris),
    );
    window.dispatchEvent(new CustomEvent("jse:favoris-change"));
    return nouveauxFavoris;
}

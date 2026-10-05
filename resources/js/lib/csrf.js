// Laravel dépose le jeton CSRF dans le cookie XSRF-TOKEN : il reste à jour
// même après une connexion/déconnexion sans rechargement complet de la page.
export function tokenXsrf() {
    if (typeof document === "undefined") return "";

    const cookie = document.cookie
        .split("; ")
        .find((ligne) => ligne.startsWith("XSRF-TOKEN="));

    return cookie ? decodeURIComponent(cookie.split("=").slice(1).join("=")) : "";
}

export function entetesJson() {
    return {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-XSRF-TOKEN": tokenXsrf(),
    };
}

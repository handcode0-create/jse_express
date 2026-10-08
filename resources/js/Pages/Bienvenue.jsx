import { useSyncExternalStore } from "react";
import BienvenueMobile from "../Composants/Bienvenue/BienvenueMobile";
import BienvenueWeb from "../Composants/Bienvenue/BienvenueWeb";

const REQUETE_WEB = "(min-width: 1024px)";

function useModeWeb() {
    return useSyncExternalStore(
        (notifier) => {
            const media = window.matchMedia(REQUETE_WEB);
            media.addEventListener("change", notifier);
            return () => media.removeEventListener("change", notifier);
        },
        () => window.matchMedia(REQUETE_WEB).matches,
        () => false,
    );
}

/**
 * Mobile / tablette : onboarding conforme à la maquette (inchangé).
 * Web (≥ 1024 px) : composition dédiée, pensée pour le grand écran.
 */
export default function Bienvenue() {
    return useModeWeb() ? <BienvenueWeb /> : <BienvenueMobile />;
}

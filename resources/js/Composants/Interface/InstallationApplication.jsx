import { Download, Share, X } from "lucide-react";
import { useEffect, useState } from "react";

const CLE_REJET = "jse-install-dismissed";
const DUREE_REJET = 7 * 24 * 60 * 60 * 1000;

function estIOS() {
    return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function estSafari() {
    const ua = window.navigator.userAgent;
    return (
        /safari/i.test(ua) &&
        !/chrome|crios|android|fxios|edgios/i.test(ua)
    );
}

function estDejaInstallee() {
    return (
        window.navigator.standalone === true ||
        window.matchMedia("(display-mode: standalone)").matches ||
        window.matchMedia("(display-mode: fullscreen)").matches
    );
}

function aEteIgnoree() {
    try {
        const date = Number(window.localStorage.getItem(CLE_REJET));
        return Number.isFinite(date) && Date.now() - date < DUREE_REJET;
    } catch {
        return false;
    }
}

function enregistrerRejet() {
    try {
        window.localStorage.setItem(CLE_REJET, String(Date.now()));
    } catch {
        // Le composant reste fonctionnel même si le stockage est indisponible.
    }
}

export default function InstallationApplication() {
    const [visible, setVisible] = useState(false);
    const [promptInstallation, setPromptInstallation] = useState(null);
    const [ios, setIos] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;

        if (estDejaInstallee() || aEteIgnoree()) return;

        const iosSafari = estIOS() && estSafari();

        if (iosSafari) {
            const timer = window.setTimeout(() => {
                setIos(true);
                setVisible(true);
            }, 1200);

            return () => window.clearTimeout(timer);
        }

        const recevoirPrompt = (event) => {
            event.preventDefault();
            setPromptInstallation(event);
            setVisible(true);
        };

        window.addEventListener("beforeinstallprompt", recevoirPrompt);

        const verifierModeStandalone = () => {
            if (estDejaInstallee()) {
                setVisible(false);
                setPromptInstallation(null);
            }
        };

        window.addEventListener("appinstalled", verifierModeStandalone);
        window.addEventListener("resize", verifierModeStandalone);

        return () => {
            window.removeEventListener(
                "beforeinstallprompt",
                recevoirPrompt,
            );
            window.removeEventListener("appinstalled", verifierModeStandalone);
            window.removeEventListener("resize", verifierModeStandalone);
        };
    }, []);

    const fermer = () => {
        enregistrerRejet();
        setVisible(false);
    };

    const installer = async () => {
        if (!promptInstallation) return;

        promptInstallation.prompt();
        const resultat = await promptInstallation.userChoice;

        if (resultat?.outcome === "dismissed") {
            enregistrerRejet();
        }

        setPromptInstallation(null);
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <aside
            className="fixed inset-x-4 bottom-5 z-[120] mx-auto max-w-xl overflow-hidden rounded-[26px] border border-jse-secondaire/25 bg-jse-principal shadow-[0_20px_60px_rgba(18,60,50,0.28)] backdrop-blur-xl"
            role="dialog"
            aria-label="Installer JSE Express"
        >
            <div className="flex gap-4 p-5 sm:p-6">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-[18px] bg-jse-secondaire/15 text-jse-secondaire ring-1 ring-jse-secondaire/25">
                    <Download size={28} strokeWidth={2.2} />
                </div>

                <div className="min-w-0 flex-1 pr-6">
                    <h2 className="font-sans text-lg font-semibold tracking-[-0.02em] text-jse-fond">
                        Installer JSE Express
                    </h2>

                    {ios ? (
                        <p className="mt-2 text-sm leading-6 text-jse-fond/70">
                            Ajoute l’appli à ton écran d’accueil pour un accès
                            direct, et pour garder tes commandes facilement
                            accessibles hors ligne.
                        </p>
                    ) : (
                        <p className="mt-2 text-sm leading-6 text-jse-fond/70">
                            Ajoute l’appli à ton écran d’accueil pour un accès
                            direct et une expérience plus rapide.
                        </p>
                    )}

                    {ios ? (
                        <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm leading-6 text-jse-fond/80">
                            <span>Appuie sur</span>
                            <span
                                className="inline-flex size-7 items-center justify-center rounded-lg bg-jse-secondaire/15 text-jse-secondaire"
                                aria-hidden="true"
                            >
                                <Share size={17} strokeWidth={2.4} />
                            </span>
                            <span>puis</span>
                            <strong className="font-semibold text-jse-fond">
                                + Sur l’écran d’accueil
                            </strong>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={installer}
                            className="mt-4 inline-flex items-center justify-center rounded-xl bg-jse-accent px-4 py-2.5 text-sm font-semibold text-jse-texte transition-transform hover:brightness-105 active:scale-[0.98]"
                        >
                            Installer l’application
                        </button>
                    )}
                </div>

                <button
                    type="button"
                    onClick={fermer}
                    className="absolute right-3 top-3 flex size-10 items-center justify-center rounded-full text-jse-fond/55 transition-colors hover:bg-white/10 hover:text-jse-fond"
                    aria-label="Fermer"
                >
                    <X size={22} />
                </button>
            </div>
        </aside>
    );
}

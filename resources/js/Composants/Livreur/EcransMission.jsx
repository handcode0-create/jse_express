import { useEffect, useRef, useState } from "react";
import { AlertCircle, ArrowLeft, Bike, Check, MapPin, Navigation, Phone, Store } from "lucide-react";
import AdminButton from "../Admin/AdminButton";
import AdminCard from "../Admin/AdminCard";
import { montant } from "../../lib/format";
import CarteLivreur, { usePositionLivreur } from "./CarteLivreur";

/**
 * Écran plein format d'une étape de mission : retour accessible, fermeture par Échap,
 * défilement de la page verrouillé.
 */
function EcranPlein({ titre, surtitre, onRetour, children }) {
    const retourRef = useRef(onRetour);
    retourRef.current = onRetour;

    useEffect(() => {
        const defilementPrecedent = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const surClavier = (evenement) => {
            if (evenement.key === "Escape") retourRef.current?.();
        };
        document.addEventListener("keydown", surClavier);

        return () => {
            document.removeEventListener("keydown", surClavier);
            document.body.style.overflow = defilementPrecedent;
        };
    }, []);

    return (
        <div role="dialog" aria-modal="true" aria-label={titre} className="jse-admin-page fixed inset-0 z-[80] overflow-y-auto bg-jse-theme-bg text-jse-theme-text">
            <div className="mx-auto min-h-full w-full max-w-xl px-4 pb-[calc(24px+env(safe-area-inset-bottom))] pt-[max(16px,env(safe-area-inset-top))]">
                <header className="flex items-center gap-3 py-2">
                    {onRetour && (
                        <button
                            type="button"
                            onClick={onRetour}
                            aria-label="Retour"
                            className="flex size-11 shrink-0 items-center justify-center rounded-full border border-jse-theme-border bg-jse-theme-surface text-jse-theme-text transition hover:bg-jse-theme-surface-soft focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-jse-secondaire/30"
                        >
                            <ArrowLeft size={19} aria-hidden="true" />
                        </button>
                    )}
                    <div className="min-w-0">
                        {surtitre && <p className="text-xs font-semibold uppercase tracking-[0.14em] text-jse-theme-muted">{surtitre}</p>}
                        <h1 className="truncate text-lg font-semibold text-jse-theme-heading">{titre}</h1>
                    </div>
                </header>
                <div className="mt-3 space-y-4">{children}</div>
            </div>
        </div>
    );
}

function ListeArticles({ articles = [] }) {
    return (
        <ul className="divide-y divide-jse-theme-border">
            {articles.map((article, index) => (
                <li key={index} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                    <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-jse-theme-surface-soft text-sm font-semibold tabular-nums text-jse-theme-heading">
                        {article.quantite}×
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-jse-theme-text">{article.nom}</span>
                </li>
            ))}
        </ul>
    );
}

function Erreur({ message }) {
    if (!message) return null;

    return (
        <p role="alert" className="flex items-start gap-2 rounded-2xl bg-jse-danger/10 p-3 text-sm font-medium text-jse-danger">
            <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>{message}</span>
        </p>
    );
}

/** Détail d'une mission : itinéraire, articles, et action suivante (accepter ou naviguer). */
export function DetailMission({ mission, onRetour, onAccepter, onNavigation, enCours, erreur }) {
    const enLivraison = mission.statut_livraison === "en_cours";

    return (
        <EcranPlein titre={`Mission ${mission.reference}`} surtitre="Détail de la mission" onRetour={onRetour}>
            <AdminCard className="flex items-start gap-3 p-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-jse-principal/10 text-jse-theme-heading">
                    <Store size={22} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                    <p className="text-base font-semibold text-jse-theme-text">{mission.restaurant?.nom || "Restaurant"}</p>
                    <p className="mt-0.5 text-sm text-jse-theme-muted">{mission.restaurant?.adresse || "Adresse non précisée"}</p>
                </div>
                {mission.restaurant?.telephone && (
                    <a
                        href={`tel:${mission.restaurant.telephone}`}
                        aria-label={`Appeler ${mission.restaurant.nom || "le restaurant"}`}
                        className="flex size-11 shrink-0 items-center justify-center rounded-full bg-jse-principal text-white transition hover:bg-jse-principal/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-jse-secondaire/30"
                    >
                        <Phone size={17} aria-hidden="true" />
                    </a>
                )}
            </AdminCard>

            <AdminCard className="p-4">
                <ol className="space-y-5">
                    <li className="flex gap-3">
                        <span className="mt-1 size-3 shrink-0 rounded-full bg-jse-accent" aria-hidden="true" />
                        <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-jse-theme-muted">1 · Retrait au restaurant</p>
                            <p className="mt-1 text-sm font-semibold text-jse-theme-text">{mission.restaurant?.adresse || "—"}</p>
                        </div>
                    </li>
                    <li className="flex gap-3">
                        <span className="mt-1 size-3 shrink-0 rounded-full bg-jse-secondaire" aria-hidden="true" />
                        <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-jse-theme-muted">2 · Livraison au client</p>
                            <p className="mt-1 text-sm font-semibold text-jse-theme-text">{mission.adresse_livraison || "—"}</p>
                            <p className="mt-0.5 text-sm text-jse-theme-muted">
                                {mission.client?.nom || "Client"} · {mission.telephone_livraison || "—"}
                            </p>
                        </div>
                    </li>
                </ol>
            </AdminCard>

            <AdminCard className="p-4">
                <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-jse-theme-text">Articles à livrer ({mission.articles?.length || 0})</p>
                    <p className="text-sm font-semibold tabular-nums text-jse-theme-heading">{montant(mission.montant_total)}</p>
                </div>
                <div className="mt-3">
                    <ListeArticles articles={mission.articles} />
                </div>
            </AdminCard>

            <Erreur message={erreur} />

            {!enLivraison && (
                <AdminButton chargement={enCours} pleineLargeur onClick={onAccepter}>
                    <Bike size={18} aria-hidden="true" />
                    Accepter la mission
                </AdminButton>
            )}

            {enLivraison && (
                <div className="grid gap-2 sm:grid-cols-2">
                    <AdminButton onClick={onNavigation}>
                        <Navigation size={17} aria-hidden="true" />
                        Continuer la livraison
                    </AdminButton>
                    {mission.telephone_livraison && (
                        <AdminButton href={`tel:${mission.telephone_livraison}`} variante="contour">
                            <Phone size={17} aria-hidden="true" />
                            Appeler le client
                        </AdminButton>
                    )}
                </div>
            )}
        </EcranPlein>
    );
}

/** Étape 1 : trajet vers le restaurant, avec la position de l'appareil. */
export function NavigationMission({ mission, onRetour, onArrive }) {
    const { position, precision, erreur } = usePositionLivreur(true);

    return (
        <EcranPlein titre="Trajet vers le restaurant" surtitre="Navigation" onRetour={onRetour}>
            <div className="h-[48vh] min-h-[320px]">
                <CarteLivreur position={position} precision={precision} erreur={erreur} />
            </div>
            <AdminCard className="p-4">
                <div className="flex items-center gap-3">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-jse-accent/15 text-jse-theme-heading">
                        <Store size={21} aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-jse-theme-muted">Prochaine étape</p>
                        <p className="text-base font-semibold text-jse-theme-text">Retrait au restaurant</p>
                        <p className="truncate text-sm text-jse-theme-muted">{mission.restaurant?.adresse || "Adresse non précisée"}</p>
                    </div>
                </div>
                <AdminButton className="mt-4" pleineLargeur onClick={onArrive}>
                    <Check size={16} aria-hidden="true" />
                    Je suis arrivé au restaurant
                </AdminButton>
            </AdminCard>
        </EcranPlein>
    );
}

/** Étape 2 : vérification des articles avant de partir chez le client. */
export function RetraitMission({ mission, onRetour, onDemarrer }) {
    return (
        <EcranPlein titre="Retrait de la commande" surtitre={mission.restaurant?.nom || "Restaurant"} onRetour={onRetour}>
            <AdminCard className="p-4">
                <p className="text-sm font-semibold text-jse-theme-text">Articles à récupérer</p>
                <div className="mt-3">
                    <ListeArticles articles={mission.articles} />
                </div>
            </AdminCard>
            <div className="flex flex-col items-center gap-3 rounded-3xl bg-jse-secondaire/10 p-6 text-center">
                <span className="flex size-16 items-center justify-center rounded-full bg-jse-secondaire text-jse-principal">
                    <Check size={30} strokeWidth={2.5} aria-hidden="true" />
                </span>
                <p className="text-base font-semibold text-jse-theme-heading">Commande prête au retrait</p>
                <p className="text-sm text-jse-theme-muted">Vérifiez que tous les articles sont présents avant de commencer la livraison.</p>
            </div>
            <AdminButton pleineLargeur onClick={onDemarrer}>
                Commencer la livraison
            </AdminButton>
        </EcranPlein>
    );
}

/** Étape 3 : livraison chez le client et saisie du PIN à six chiffres. */
export function LivraisonMission({ mission, onRetour, onValider, enCours, erreur }) {
    const [pin, setPin] = useState("");
    const champsRef = useRef([]);
    const { position, precision, erreur: erreurGps } = usePositionLivreur(true);

    useEffect(() => {
        champsRef.current[0]?.focus();
    }, []);

    const modifier = (index, brut) => {
        const valeur = brut.replace(/\D/g, "");

        if (!valeur) {
            setPin((courant) => courant.slice(0, index) + courant.slice(index + 1));
            return;
        }

        const chiffres = valeur.slice(-6);
        setPin((courant) => {
            const caracteres = courant.padEnd(6, " ").split("");
            chiffres.split("").forEach((chiffre, decalage) => {
                if (index + decalage < 6) caracteres[index + decalage] = chiffre;
            });

            return caracteres.join("").replace(/\s/g, "").slice(0, 6);
        });
        champsRef.current[Math.min(index + chiffres.length, 5)]?.focus();
    };

    const surTouche = (index, evenement) => {
        if (evenement.key === "Backspace" && !pin[index] && index > 0) champsRef.current[index - 1]?.focus();
    };

    const surColler = (evenement) => {
        evenement.preventDefault();
        const colle = evenement.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);

        if (!colle) return;

        setPin(colle);
        champsRef.current[Math.min(colle.length, 6) - 1]?.focus();
    };

    const soumettre = (evenement) => {
        evenement.preventDefault();
        if (pin.length === 6) onValider(pin);
    };

    return (
        <EcranPlein titre="En livraison" surtitre={`Mission ${mission.reference}`} onRetour={onRetour}>
            <AdminCard className="p-4">
                <p className="text-base font-semibold text-jse-theme-text">{mission.client?.nom || "Client"}</p>
                <p className="mt-1 flex items-start gap-1.5 text-sm text-jse-theme-muted">
                    <MapPin size={15} className="mt-0.5 shrink-0 text-jse-secondaire" aria-hidden="true" />
                    {mission.adresse_livraison || "Adresse client"}
                </p>
                {mission.telephone_livraison && (
                    <a href={`tel:${mission.telephone_livraison}`} className="mt-2 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-jse-theme-heading hover:underline">
                        <Phone size={15} aria-hidden="true" />
                        {mission.telephone_livraison}
                    </a>
                )}
            </AdminCard>

            <div className="h-[260px]">
                <CarteLivreur compact position={position} precision={precision} erreur={erreurGps} />
            </div>

            <form onSubmit={soumettre} className="rounded-3xl border border-jse-accent/30 bg-jse-accent/10 p-5">
                <fieldset>
                    <legend className="text-xs font-semibold uppercase tracking-[0.12em] text-jse-theme-muted">Confirmation de livraison</legend>
                    <p className="mt-2 text-base font-semibold text-jse-theme-text">Demandez le code PIN au client</p>
                    <p className="mt-1 text-sm text-jse-theme-muted">Saisissez les 6 chiffres communiqués par le client pour clôturer la livraison.</p>

                    <div className="mt-4 grid grid-cols-6 gap-2">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <input
                                key={index}
                                ref={(element) => {
                                    champsRef.current[index] = element;
                                }}
                                value={pin[index] || ""}
                                onChange={(evenement) => modifier(index, evenement.target.value)}
                                onKeyDown={(evenement) => surTouche(index, evenement)}
                                onPaste={surColler}
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={6}
                                autoComplete={index === 0 ? "one-time-code" : "off"}
                                aria-label={`Chiffre ${index + 1} du PIN`}
                                aria-invalid={Boolean(erreur)}
                                className={[
                                    "h-14 w-full min-w-0 rounded-2xl border bg-jse-theme-surface text-center text-xl font-bold tabular-nums text-jse-theme-text outline-none transition focus:ring-4",
                                    erreur ? "border-jse-danger focus:ring-jse-danger/20" : "border-jse-theme-border focus:border-jse-secondaire focus:ring-jse-secondaire/20",
                                ].join(" ")}
                            />
                        ))}
                    </div>
                </fieldset>

                <div className="mt-3">
                    <Erreur message={erreur} />
                </div>

                <AdminButton type="submit" className="mt-4" pleineLargeur chargement={enCours} disabled={pin.length !== 6}>
                    Terminer la livraison
                </AdminButton>
            </form>
        </EcranPlein>
    );
}

/** Écran final : la commande est clôturée. */
export function SuccesMission({ mission, onRetour }) {
    return (
        <EcranPlein titre="Livraison réussie" surtitre={`Commande ${mission.reference}`} onRetour={null}>
            <div className="flex flex-col items-center px-2 pt-8 text-center">
                <span className="flex size-24 items-center justify-center rounded-full bg-jse-secondaire text-jse-principal shadow-[0_0_0_14px_rgba(69,185,119,.14)]">
                    <Check size={46} strokeWidth={2.5} aria-hidden="true" />
                </span>
                <p className="mt-7 font-against text-4xl text-jse-theme-heading">Livraison réussie !</p>
                <p className="mt-2 text-sm text-jse-theme-muted">La commande est clôturée.</p>
            </div>
            <AdminCard className="p-5 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-jse-theme-muted">Trajet effectué</p>
                <p className="mt-2 text-base font-semibold text-jse-theme-text">
                    {mission.restaurant?.nom || "Restaurant"} → {mission.client?.nom || "Client"}
                </p>
            </AdminCard>
            <AdminButton variante="contour" pleineLargeur onClick={onRetour}>
                Voir mes missions
            </AdminButton>
        </EcranPlein>
    );
}

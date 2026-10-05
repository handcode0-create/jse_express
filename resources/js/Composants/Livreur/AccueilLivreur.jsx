import { useLayoutEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { ArrowRight, Bike, Check, CheckCircle2, MapPin, Power, Receipt, Store, Timer, Truck } from "lucide-react";
import AdminButton from "../Admin/AdminButton";
import Compteur from "../Interface/Compteur";
import TuileIndicateur from "../Interface/TuileIndicateur";
import { libelleDuree, minutesDepuis, montant } from "../../lib/format";
import { mouvementReduit } from "../../lib/mouvement";

const ETAPES = ["Attribuée", "En livraison", "Livrée"];

function etapeActive(mission) {
    return mission.statut_livraison === "en_cours" ? 1 : 0;
}

/** Carte de statut dans le héro : l'interrupteur « en ligne » est le geste principal du livreur. */
function StatutEnLigne({ disponible, enCours, onBasculer }) {
    return (
        <div data-hero className="rounded-3xl border border-white/20 bg-white/10 p-5 backdrop-blur-md sm:p-6">
            <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-jse-fond/70">Votre statut</p>
                    <p className="mt-2 flex items-center gap-3 whitespace-nowrap font-against text-3xl leading-none text-jse-fond sm:text-4xl">
                        <span className="relative flex size-3.5" aria-hidden="true">
                            {disponible && <span className="absolute inline-flex size-full rounded-full bg-jse-secondaire opacity-70 motion-safe:animate-ping" />}
                            <span className={["relative inline-flex size-3.5 rounded-full", disponible ? "bg-jse-secondaire" : "bg-white/40"].join(" ")} />
                        </span>
                        {disponible ? "En ligne" : "Hors ligne"}
                    </p>
                </div>
                <button
                    type="button"
                    role="switch"
                    aria-checked={disponible}
                    aria-label="Disponibilité pour les livraisons"
                    disabled={enCours}
                    onClick={onBasculer}
                    className="relative h-10 w-[4.5rem] shrink-0 rounded-full transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40 disabled:opacity-60"
                >
                    <span className={["absolute inset-0 rounded-full transition", disponible ? "bg-jse-secondaire" : "bg-white/25"].join(" ")} />
                    <span className={["absolute top-1 flex size-8 items-center justify-center rounded-full bg-white text-jse-principal shadow-lg transition-all", disponible ? "left-[2.25rem]" : "left-1"].join(" ")}>
                        <Power size={16} aria-hidden="true" />
                    </span>
                </button>
            </div>
            <p className="mt-3 text-sm leading-6 text-jse-fond/80">{disponible ? "Les nouvelles missions de votre zone peuvent vous être attribuées." : "Vous ne recevez aucune mission tant que vous êtes hors ligne."}</p>
        </div>
    );
}

function Heros({ livreur, mission, disponible, enCours, onBasculer, onOuvrir, onNaviguer }) {
    const racine = useRef(null);
    const prenom = livreur?.prenom || livreur?.nom || "livreur";

    useLayoutEffect(() => {
        if (!racine.current || mouvementReduit()) return undefined;

        const contexte = gsap.context(() => {
            gsap.from("[data-hero]", { y: 26, opacity: 0, duration: 0.7, ease: "power3.out", stagger: 0.09 });
            gsap.from("[data-fond]", { scale: 1.1, duration: 1.8, ease: "power2.out" });
        }, racine);

        return () => contexte.revert();
    }, []);

    const phrase = mission
        ? mission.statut_livraison === "en_cours"
            ? `Livraison en cours chez ${mission.client?.nom || "votre client"}. Terminez-la avec le code PIN du client.`
            : `Nouvelle mission : ${mission.restaurant?.nom || "un restaurant"} vous attend. Acceptez-la pour démarrer.`
        : disponible
          ? "Vous êtes en ligne. Votre prochaine mission s’affichera ici dès son attribution."
          : "Vous êtes hors ligne. Passez en ligne pour recevoir des missions dans votre zone.";

    return (
        <section ref={racine} aria-labelledby="titre-accueil-livreur" className="relative isolate overflow-hidden rounded-[2rem] bg-jse-principal text-jse-fond shadow-jse-elevated">
            <img data-fond src="/assets/optimises/fond-marque.webp" alt="" aria-hidden="true" decoding="async" className="absolute inset-0 -z-10 size-full object-cover object-[60%_50%]" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-jse-principal via-jse-principal/90 to-jse-principal/60 sm:bg-gradient-to-r sm:from-jse-principal sm:via-jse-principal/80 sm:to-jse-principal/20" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-jse-principal/80 via-transparent to-transparent" />

            <div className="relative grid items-center gap-8 px-6 py-8 sm:px-10 sm:py-10 lg:min-h-[380px] lg:grid-cols-[1.15fr_0.85fr] lg:px-14">
                <div className="max-w-xl">
                    <p data-hero className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-jse-fond/90">
                        <span className="h-0.5 w-8 shrink-0 rounded-full bg-jse-secondaire" aria-hidden="true" />
                        <span className="min-w-0 break-words">Espace livreur{livreur?.zone?.nom ? ` · Zone ${livreur.zone.nom}` : ""}</span>
                    </p>
                    <h1 id="titre-accueil-livreur" data-hero className={["mt-4 font-against leading-[0.92] tracking-tight", prenom.length > 9 ? "text-4xl sm:text-5xl lg:text-6xl" : "text-5xl sm:text-6xl lg:text-7xl"].join(" ")}>
                        Bonjour
                        <span className="block break-words text-jse-accent">{prenom}.</span>
                    </h1>
                    <p data-hero className="mt-5 max-w-md text-base leading-7 text-jse-fond/85">
                        {phrase}
                    </p>

                    <div data-hero className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                        {mission ? (
                            <button type="button" onClick={() => onOuvrir(mission)} className="inline-flex h-12 items-center justify-center gap-3 rounded-full bg-jse-accent px-7 text-sm font-semibold text-white shadow-lg shadow-jse-accent/25 transition hover:-translate-y-0.5 hover:bg-jse-accent/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40">
                                {mission.statut_livraison === "en_cours" ? "Continuer la livraison" : "Ouvrir la mission"}
                                <ArrowRight size={17} aria-hidden="true" />
                            </button>
                        ) : disponible ? (
                            <button type="button" onClick={() => onNaviguer("missions")} className="inline-flex h-12 items-center justify-center gap-3 rounded-full bg-jse-accent px-7 text-sm font-semibold text-white shadow-lg shadow-jse-accent/25 transition hover:-translate-y-0.5 hover:bg-jse-accent/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40">
                                Voir mes missions
                                <ArrowRight size={17} aria-hidden="true" />
                            </button>
                        ) : (
                            <button type="button" disabled={enCours} onClick={onBasculer} className="inline-flex h-12 items-center justify-center gap-3 rounded-full bg-jse-accent px-7 text-sm font-semibold text-white shadow-lg shadow-jse-accent/25 transition hover:-translate-y-0.5 hover:bg-jse-accent/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40 disabled:opacity-60">
                                <Power size={17} aria-hidden="true" />
                                Passer en ligne
                            </button>
                        )}
                        <button type="button" onClick={() => onNaviguer("carte")} className="inline-flex h-12 items-center justify-center rounded-full border border-white/30 bg-white/10 px-6 text-sm font-semibold text-jse-fond backdrop-blur-md transition hover:bg-white/15 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40">
                            Ma carte
                        </button>
                    </div>

                    <ul data-hero className="mt-6 flex flex-wrap gap-2">
                        {livreur?.matricule && (
                            <li className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm backdrop-blur-md">
                                <Receipt size={15} className="text-jse-secondaire" aria-hidden="true" />
                                {livreur.matricule}
                            </li>
                        )}
                        {livreur?.zone?.nom && (
                            <li className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm backdrop-blur-md">
                                <MapPin size={15} className="text-jse-secondaire" aria-hidden="true" />
                                Zone {livreur.zone.nom}
                            </li>
                        )}
                    </ul>
                </div>

                <StatutEnLigne disponible={disponible} enCours={enCours} onBasculer={onBasculer} />
            </div>
        </section>
    );
}

/** Mission sous forme de « ticket » : itinéraire restaurant → client, progression et action. */
function MissionTicket({ mission, principale, onOuvrir }) {
    const etape = etapeActive(mission);
    const [date, heure] = (mission.date_attribution || "").split(" ");
    const minutes = minutesDepuis(date, heure);
    const enLivraison = mission.statut_livraison === "en_cours";
    const sombre = principale;

    const classes = {
        carte: sombre ? "jse-dark-surface bg-jse-principal text-jse-fond shadow-jse-elevated" : "jse-admin-card border border-jse-theme-border bg-jse-theme-surface text-jse-theme-text shadow-jse-carte",
        discret: sombre ? "text-jse-fond/70" : "text-jse-theme-muted",
        fort: sombre ? "text-jse-fond" : "text-jse-theme-text",
        montant: sombre ? "text-jse-fond" : "text-jse-theme-heading",
        puce: sombre ? "border border-white/20 bg-white/10 text-jse-fond backdrop-blur-md" : "bg-jse-theme-surface-soft text-jse-theme-muted",
        trait: sombre ? "border-white/25" : "border-jse-theme-border",
    };

    return (
        <li data-ticket className={["relative overflow-hidden rounded-3xl p-5 sm:p-6", classes.carte].join(" ")}>
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className={["text-xs font-semibold uppercase tracking-[0.12em]", classes.discret].join(" ")}>Mission #{mission.reference}</p>
                    <p className={["mt-1 text-4xl font-semibold tabular-nums tracking-tight", classes.montant].join(" ")}>{montant(mission.montant_total)}</p>
                </div>
                <span className={["inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold", classes.puce].join(" ")}>
                    <Timer size={13} aria-hidden="true" />
                    {libelleDuree(minutes)}
                </span>
            </div>

            <ol className="mt-6 space-y-5">
                <li className="flex gap-3">
                    <span className="mt-1.5 flex flex-col items-center" aria-hidden="true">
                        <span className="size-3 rounded-full bg-jse-accent" />
                        <span className={["mt-1 h-10 border-l border-dashed", classes.trait].join(" ")} />
                    </span>
                    <div className="min-w-0">
                        <p className={["flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.1em]", classes.discret].join(" ")}>
                            <Store size={13} aria-hidden="true" /> Retrait
                        </p>
                        <p className={["mt-1 truncate text-base font-semibold", classes.fort].join(" ")}>{mission.restaurant?.nom || "Restaurant"}</p>
                        <p className={["truncate text-sm", classes.discret].join(" ")}>{mission.restaurant?.adresse || "Adresse non précisée"}</p>
                    </div>
                </li>
                <li className="flex gap-3">
                    <span className="mt-1.5" aria-hidden="true">
                        <span className="block size-3 rounded-full bg-jse-secondaire" />
                    </span>
                    <div className="min-w-0">
                        <p className={["flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.1em]", classes.discret].join(" ")}>
                            <MapPin size={13} aria-hidden="true" /> Livraison
                        </p>
                        <p className={["mt-1 truncate text-base font-semibold", classes.fort].join(" ")}>{mission.client?.nom || "Client"}</p>
                        <p className={["truncate text-sm", classes.discret].join(" ")}>{mission.adresse_livraison || mission.zone || "—"}</p>
                    </div>
                </li>
            </ol>

            <ol className="mt-6 grid grid-cols-3 gap-2" aria-label="Progression de la mission">
                {ETAPES.map((libelle, index) => (
                    <li key={libelle} className="text-center">
                        <span className={["block h-1.5 rounded-full", index <= etape ? (index === etape ? "bg-jse-accent" : "bg-jse-secondaire") : sombre ? "bg-white/20" : "bg-jse-theme-border"].join(" ")} />
                        <span className={["mt-1.5 block text-xs font-medium", index <= etape ? classes.fort : classes.discret].join(" ")}>{libelle}</span>
                    </li>
                ))}
            </ol>

            <button
                type="button"
                onClick={() => onOuvrir(mission)}
                className={[
                    "mt-6 inline-flex h-12 w-full items-center justify-center gap-3 rounded-full px-6 text-sm font-semibold transition hover:-translate-y-0.5 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4",
                    sombre ? "bg-jse-accent text-white shadow-lg shadow-jse-accent/25 focus-visible:ring-white/40" : "bg-jse-principal text-white focus-visible:ring-jse-secondaire/40",
                ].join(" ")}
            >
                {enLivraison ? "Continuer la livraison" : "Ouvrir la mission"}
                <ArrowRight size={17} aria-hidden="true" />
            </button>
        </li>
    );
}

/** Attente de mission : un radar animé quand le livreur est en ligne. */
function AttenteMission({ disponible, enCours, onBasculer }) {
    return (
        <div className="jse-admin-card flex flex-col items-center gap-6 rounded-3xl border border-jse-theme-border bg-jse-theme-surface p-8 text-center shadow-jse-carte sm:flex-row sm:p-10 sm:text-left">
            <div className="relative flex size-32 shrink-0 items-center justify-center" aria-hidden="true">
                {disponible && (
                    <>
                        <span className="absolute inset-0 rounded-full border-2 border-jse-secondaire/50 motion-safe:animate-ping" />
                        <span className="absolute inset-4 rounded-full border-2 border-jse-secondaire/40 motion-safe:animate-ping [animation-delay:400ms]" />
                    </>
                )}
                <span className={["relative flex size-20 items-center justify-center rounded-full", disponible ? "bg-jse-secondaire text-jse-principal" : "bg-jse-theme-surface-soft text-jse-theme-muted"].join(" ")}>
                    <Bike size={34} />
                </span>
            </div>
            <div className="min-w-0">
                <p className="font-against text-4xl leading-none text-jse-theme-heading">{disponible ? "En attente de mission" : "Vous êtes hors ligne"}</p>
                <p className="mt-3 max-w-md text-sm leading-6 text-jse-theme-muted">
                    {disponible ? "Dès qu’un restaurant de votre zone prépare une commande, elle vous est attribuée et apparaît ici." : "Passez en ligne pour que les commandes de votre zone puissent vous être attribuées."}
                </p>
                {!disponible && (
                    <AdminButton className="mt-5" chargement={enCours} onClick={onBasculer}>
                        <Power size={16} aria-hidden="true" />
                        Passer en ligne
                    </AdminButton>
                )}
            </div>
        </div>
    );
}

function DernieresLivraisons({ historique, onNaviguer }) {
    if (historique.length === 0) return null;

    return (
        <section aria-labelledby="titre-dernieres" className="jse-admin-card rounded-3xl border border-jse-theme-border bg-jse-theme-surface p-5 shadow-jse-carte sm:p-6">
            <div className="flex items-end justify-between gap-3">
                <h2 id="titre-dernieres" className="min-w-0 font-against text-2xl leading-none text-jse-theme-heading sm:text-3xl">
                    Dernières livraisons
                </h2>
                <button type="button" onClick={() => onNaviguer("missions")} className="inline-flex min-h-10 shrink-0 items-center gap-1 whitespace-nowrap text-sm font-semibold text-jse-theme-heading hover:underline">
                    Tout voir
                    <ArrowRight size={15} aria-hidden="true" />
                </button>
            </div>
            <ul className="mt-4 divide-y divide-jse-theme-border">
                {historique.slice(0, 3).map((element) => (
                    <li key={element.id} className="flex items-center gap-3 py-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-jse-secondaire/15 text-jse-theme-heading">
                            <Check size={17} aria-hidden="true" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-jse-theme-text">{element.restaurant || "Restaurant"}</p>
                            <p className="truncate text-sm text-jse-theme-muted">
                                #{element.reference} · {element.date || "—"}
                            </p>
                        </div>
                        <span className="shrink-0 text-sm font-semibold tabular-nums text-jse-theme-heading">{montant(element.montant_total)}</span>
                    </li>
                ))}
            </ul>
        </section>
    );
}

/**
 * Accueil de l'espace livreur : héro de marque avec le statut en ligne, indicateurs animés,
 * missions en « tickets » (la première en vert, dominante), attente avec radar, dernières livraisons.
 */
export default function AccueilLivreur({ livreur, livraisons, historique, statistiques, enCours, onBasculer, onOuvrir, onNaviguer }) {
    const disponible = livreur?.disponibilite === "disponible";
    const missionPrincipale = livraisons[0] ?? null;
    const racineMissions = useRef(null);
    const cles = useMemo(() => livraisons.map((mission) => mission.attribution_id).join("-"), [livraisons]);

    useLayoutEffect(() => {
        if (!racineMissions.current || mouvementReduit()) return undefined;

        const contexte = gsap.context(() => {
            gsap.from("[data-ticket]", { y: 24, opacity: 0, duration: 0.55, ease: "power3.out", stagger: 0.08, delay: 0.25 });
        }, racineMissions);

        return () => contexte.revert();
    }, [cles]);

    return (
        <div className="space-y-6 sm:space-y-8">
            <Heros livreur={livreur} mission={missionPrincipale} disponible={disponible} enCours={enCours} onBasculer={onBasculer} onOuvrir={onOuvrir} onNaviguer={onNaviguer} />

            <section aria-label="Indicateurs" className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                <div className="order-1 col-span-2 sm:order-1 sm:col-span-1">
                    <TuileIndicateur icone={Truck} label="Livraisons du jour" sombre>
                        <Compteur valeur={statistiques.missions_du_jour || 0} />
                    </TuileIndicateur>
                </div>
                <div className="order-2">
                    <TuileIndicateur icone={Receipt} label="Missions actives">
                        <Compteur valeur={statistiques.missions_actives || 0} />
                    </TuileIndicateur>
                </div>
                <div className="order-3">
                    <TuileIndicateur icone={CheckCircle2} label="Livraisons terminées">
                        <Compteur valeur={statistiques.livraisons_terminees || 0} />
                    </TuileIndicateur>
                </div>
            </section>

            <div className={["grid gap-6 sm:gap-8", livraisons.length > 0 && historique.length > 0 ? "lg:grid-cols-[1.2fr_0.8fr] lg:items-start" : ""].join(" ")}>
                <section ref={racineMissions} aria-labelledby="titre-missions-accueil" className="min-w-0">
                    <div className="mb-4">
                        <h2 id="titre-missions-accueil" className="font-against text-4xl leading-none text-jse-theme-heading">
                            Vos missions
                        </h2>
                        <p className="mt-2 text-sm text-jse-theme-muted">Retrait au restaurant, livraison au client, puis code PIN pour clôturer.</p>
                    </div>

                    {livraisons.length === 0 ? (
                        <AttenteMission disponible={disponible} enCours={enCours} onBasculer={onBasculer} />
                    ) : (
                        <ul className="space-y-4">
                            {livraisons.map((mission, index) => (
                                <MissionTicket key={mission.attribution_id} mission={mission} principale={index === 0} onOuvrir={onOuvrir} />
                            ))}
                        </ul>
                    )}
                </section>

                <DernieresLivraisons historique={historique} onNaviguer={onNaviguer} />
            </div>
        </div>
    );
}

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { ArrowRight, CircleDollarSign, Clock3, PackageCheck, ShoppingBag, Timer, UtensilsCrossed } from "lucide-react";
import AdminBadge from "../Admin/AdminBadge";
import AdminButton from "../Admin/AdminButton";
import { initiales, montant, statutSuivant } from "../../lib/restaurant";

const MOUVEMENT_REDUIT = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Étapes d'une commande, de la réception à la livraison ; les trois premières relèvent du restaurant. */
const ETAPES = [
    { code: "EN_ATTENTE", label: "Reçues", restaurant: true },
    { code: "CONFIRMEE", label: "Confirmées", restaurant: true },
    { code: "EN_PREPARATION", label: "En préparation", restaurant: true },
    { code: "PRETE", label: "Prêtes", restaurant: false },
    { code: "EN_LIVRAISON", label: "En livraison", restaurant: false },
    { code: "LIVREE", label: "Livrées", restaurant: false },
];

const COULEUR_BANDE = { EN_ATTENTE: "bg-jse-accent", CONFIRMEE: "bg-jse-information", EN_PREPARATION: "bg-jse-secondaire" };

/** Visuel du héro choisi d'après la carte du restaurant (pains et pâtisseries, grillades, plats). */
function platPour(categories = []) {
    const noms = categories.map((categorie) => categorie.nom.toLowerCase());

    if (noms.some((nom) => /pain|pâtisserie|patisserie|sandwich/.test(nom))) return "/assets/optimises/plat-dessert.webp";
    if (noms.some((nom) => /grillade/.test(nom))) return "/assets/optimises/plat-poulet-braise.webp";

    return "/assets/optimises/plat-attieke-poisson.webp";
}

function minutesDepuis(date, heure) {
    if (!date || !heure) return null;

    const [jour, mois, annee] = date.split("/");
    const minutes = Math.floor((Date.now() - new Date(`${annee}-${mois}-${jour}T${heure}:00`).getTime()) / 60000);

    return Number.isFinite(minutes) && minutes >= 0 ? minutes : null;
}

function libelleDuree(minutes) {
    if (minutes === null) return "—";
    if (minutes < 1) return "à l’instant";
    if (minutes < 60) return `${minutes} min`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} h`;

    return `${Math.floor(minutes / 1440)} j`;
}

/** Nombre qui s'anime de 0 à sa valeur (affiché tel quel si l'utilisateur réduit les animations). */
function Compteur({ valeur, formater = (nombre) => nombre.toLocaleString("fr-FR"), className = "" }) {
    const ref = useRef(null);

    useEffect(() => {
        const cible = Number(valeur || 0);

        if (!ref.current || MOUVEMENT_REDUIT()) return undefined;

        const etat = { v: 0 };
        const animation = gsap.to(etat, {
            v: cible,
            duration: 0.9,
            ease: "power2.out",
            onUpdate: () => {
                if (ref.current) ref.current.textContent = formater(Math.round(etat.v));
            },
        });

        return () => animation.kill();
    }, [valeur]);

    return (
        <span ref={ref} className={className}>
            {formater(Number(valeur || 0))}
        </span>
    );
}

function Heros({ restaurant, prenom, categories, aTraiter, produitsDisponibles, onNaviguer }) {
    const racine = useRef(null);
    const platRef = useRef(null);
    const plat = useMemo(() => platPour(categories), [categories]);

    useLayoutEffect(() => {
        if (!racine.current || MOUVEMENT_REDUIT()) return undefined;

        const contexte = gsap.context(() => {
            gsap.from("[data-hero]", { y: 26, opacity: 0, duration: 0.7, ease: "power3.out", stagger: 0.09 });
            gsap.from("[data-fond]", { scale: 1.08, duration: 1.6, ease: "power2.out" });
            gsap.from(platRef.current, { scale: 0.86, rotate: -8, opacity: 0, duration: 1, delay: 0.2, ease: "back.out(1.4)" });
            gsap.to(platRef.current, { y: -10, duration: 2.6, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 1.2 });
        }, racine);

        return () => contexte.revert();
    }, []);

    const phrase =
        aTraiter > 0
            ? `${aTraiter} commande${aTraiter > 1 ? "s attendent" : " attend"} votre réponse. Chaque minute compte pour vos clients.`
            : "Aucune commande en attente. C’est le bon moment pour soigner votre carte.";

    return (
        <section ref={racine} aria-labelledby="titre-accueil" className="relative isolate overflow-hidden rounded-[2rem] bg-jse-principal text-jse-fond shadow-jse-elevated">
            <img data-fond src="/assets/optimises/fond-marque.webp" alt="" aria-hidden="true" decoding="async" className="absolute inset-0 -z-10 size-full object-cover object-[72%_50%]" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-jse-principal via-jse-principal/90 to-jse-principal/55 sm:bg-gradient-to-r sm:from-jse-principal sm:via-jse-principal/88 sm:to-jse-principal/30" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-jse-principal/85 via-transparent to-jse-principal/25" />

            <div className="relative grid items-center px-6 pb-8 pt-8 sm:px-10 sm:pb-10 lg:min-h-[400px] lg:grid-cols-[1.1fr_0.9fr] lg:px-14">
                <div className="relative z-10 max-w-xl">
                    <p data-hero className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-jse-fond/90">
                        <span className="h-0.5 w-8 shrink-0 rounded-full bg-jse-secondaire" aria-hidden="true" />
                        <span className="min-w-0 break-words">Espace restaurant · {restaurant?.nom}</span>
                    </p>
                    <h1 id="titre-accueil" data-hero className={["mt-4 font-against leading-[0.92] tracking-tight", prenom.length > 9 ? "text-4xl sm:text-5xl lg:text-6xl" : "text-5xl sm:text-6xl lg:text-7xl"].join(" ")}>
                        Bonjour
                        <span className="block break-words text-jse-accent">{prenom}.</span>
                    </h1>
                    <p data-hero className="mt-5 max-w-md text-base leading-7 text-jse-fond/85">
                        {phrase}
                    </p>

                    <div data-hero className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                        <button
                            type="button"
                            onClick={() => onNaviguer(aTraiter > 0 ? "commandes" : "menu")}
                            className="inline-flex h-12 items-center justify-center gap-3 rounded-full bg-jse-accent px-7 text-sm font-semibold text-white shadow-lg shadow-jse-accent/25 transition hover:-translate-y-0.5 hover:bg-jse-accent/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
                        >
                            {aTraiter > 0 ? "Traiter les commandes" : "Gérer mon menu"}
                            <ArrowRight size={17} aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            onClick={() => onNaviguer("horaires")}
                            className="inline-flex h-12 items-center justify-center rounded-full border border-white/30 bg-white/10 px-6 text-sm font-semibold text-jse-fond backdrop-blur-md transition hover:bg-white/15 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
                        >
                            Mes horaires
                        </button>
                    </div>

                    <ul data-hero className="mt-6 flex flex-wrap gap-2 pr-24 sm:pr-0">
                        {restaurant?.horaires && (
                            <li className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm backdrop-blur-md">
                                <Clock3 size={15} className="shrink-0 text-jse-secondaire" aria-hidden="true" />
                                <span className="truncate">{restaurant.horaires}</span>
                            </li>
                        )}
                        <li className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm backdrop-blur-md">
                            <UtensilsCrossed size={15} className="text-jse-secondaire" aria-hidden="true" />
                            {produitsDisponibles} produit{produitsDisponibles > 1 ? "s" : ""} au menu
                        </li>
                    </ul>
                </div>

                <div className="pointer-events-none relative hidden lg:block">
                    <img ref={platRef} src={plat} alt="" decoding="async" className="absolute right-[-3rem] top-1/2 w-[125%] max-w-none -translate-y-1/2 drop-shadow-[0_30px_40px_rgba(0,0,0,0.45)]" />
                </div>
            </div>

            <img src={plat} alt="" aria-hidden="true" decoding="async" className="pointer-events-none absolute -bottom-8 -right-12 z-0 w-48 rotate-6 drop-shadow-2xl sm:w-60 lg:hidden" />
        </section>
    );
}

function Tuile({ icone: Icone, label, children, sombre = false }) {
    return (
        <article
            className={[
                "relative h-full overflow-hidden rounded-3xl p-4 sm:p-6",
                sombre
                    ? "jse-dark-surface bg-jse-principal text-jse-fond shadow-jse-elevated"
                    : "jse-admin-card border border-jse-theme-border bg-jse-theme-surface text-jse-theme-text shadow-jse-carte",
            ].join(" ")}
        >
            <span className={["flex size-11 items-center justify-center rounded-2xl", sombre ? "bg-white/12 text-jse-accent" : "bg-jse-secondaire/15 text-jse-theme-heading"].join(" ")}>
                <Icone size={20} aria-hidden="true" />
            </span>
            <p className={["mt-4 text-3xl font-semibold tabular-nums tracking-tight sm:mt-5 sm:text-5xl", sombre ? "text-jse-fond" : "text-jse-theme-heading"].join(" ")}>{children}</p>
            <p className={["mt-1 text-sm", sombre ? "text-jse-fond/70" : "text-jse-theme-muted"].join(" ")}>{label}</p>
        </article>
    );
}

/** Frise des commandes : où en sont les dernières commandes, de la réception à la livraison. */
function Frise({ commandes }) {
    const compteurs = useMemo(() => Object.fromEntries(ETAPES.map(({ code }) => [code, commandes.filter((commande) => commande.statut?.code === code).length])), [commandes]);

    return (
        <section aria-labelledby="titre-frise" className="jse-admin-card rounded-3xl border border-jse-theme-border bg-jse-theme-surface p-5 shadow-jse-carte sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-2">
                <h2 id="titre-frise" className="font-against text-3xl leading-none text-jse-theme-heading">
                    Le parcours de vos commandes
                </h2>
                <p className="text-sm text-jse-theme-muted">Vos {commandes.length} dernières commandes</p>
            </div>

            <ol className="relative mt-7 grid grid-cols-3 gap-y-6 sm:grid-cols-6">
                <span className="absolute left-[8%] right-[8%] top-6 hidden h-0.5 bg-jse-theme-border sm:block" aria-hidden="true" />
                {ETAPES.map(({ code, label, restaurant }) => {
                    const nombre = compteurs[code];
                    const actif = nombre > 0;

                    return (
                        <li key={code} className="relative flex flex-col items-center text-center">
                            <span
                                className={[
                                    "relative flex size-12 items-center justify-center rounded-full border-2 text-lg font-bold tabular-nums transition",
                                    actif && restaurant
                                        ? "border-jse-accent bg-jse-accent text-white shadow-lg shadow-jse-accent/25"
                                        : actif
                                          ? "border-jse-secondaire bg-jse-secondaire text-jse-principal"
                                          : "border-jse-theme-border bg-jse-theme-surface text-jse-theme-muted",
                                ].join(" ")}
                            >
                                {nombre}
                            </span>
                            <span className={["mt-2 text-xs font-medium leading-4", actif ? "text-jse-theme-text" : "text-jse-theme-muted"].join(" ")}>{label}</span>
                            {restaurant && actif && <span className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-jse-accent">À vous</span>}
                        </li>
                    );
                })}
            </ol>
        </section>
    );
}

function Ticket({ commande, enCours, onAvancer }) {
    const code = commande.statut?.code;
    const action = statutSuivant[code];
    const minutes = minutesDepuis(commande.date, commande.heure);
    const urgent = code === "EN_ATTENTE" && minutes !== null && minutes >= 10;

    return (
        <li data-ticket className="jse-admin-card relative flex flex-col overflow-hidden rounded-3xl border border-jse-theme-border bg-jse-theme-surface p-5 pl-6 shadow-jse-carte">
            <span className={["absolute inset-y-0 left-0 w-1.5", COULEUR_BANDE[code] || "bg-jse-theme-border"].join(" ")} aria-hidden="true" />

            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-jse-theme-muted">{commande.reference}</p>
                    <p className="mt-1 text-4xl font-semibold tabular-nums tracking-tight text-jse-theme-heading">{montant(commande.montant_total)}</p>
                </div>
                <AdminBadge statut={code} libelle={commande.statut?.libelle} />
            </div>

            <div className="mt-4 flex items-center gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-jse-principal/10 text-sm font-bold text-jse-theme-heading">{initiales(commande.client?.nom || "Client")}</span>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-jse-theme-text">{commande.client?.nom || "Client"}</p>
                    <p className="text-sm text-jse-theme-muted">
                        {commande.nombre_articles} article{commande.nombre_articles > 1 ? "s" : ""}
                    </p>
                </div>
                <span className={["inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold", urgent ? "bg-jse-danger/10 text-jse-danger" : "bg-jse-theme-surface-soft text-jse-theme-muted"].join(" ")}>
                    <Timer size={13} aria-hidden="true" />
                    {libelleDuree(minutes)}
                </span>
            </div>

            <div className="mt-5 grid grid-cols-[1fr_auto] gap-2">
                {action ? (
                    <AdminButton chargement={enCours} pleineLargeur onClick={() => onAvancer(commande, action.code)}>
                        {action.label}
                    </AdminButton>
                ) : (
                    <span />
                )}
                <AdminButton href={`/restaurant/commandes/${commande.id}`} variante="contour">
                    Détail
                </AdminButton>
            </div>
        </li>
    );
}

function AucuneCommande({ plat }) {
    return (
        <div className="jse-admin-card relative flex items-center gap-5 overflow-hidden rounded-3xl border border-jse-theme-border bg-jse-theme-surface p-6 shadow-jse-carte sm:p-8">
            <img src={plat} alt="" aria-hidden="true" loading="lazy" decoding="async" className="size-28 shrink-0 object-contain drop-shadow-xl sm:size-36" />
            <div className="min-w-0">
                <p className="font-against text-3xl leading-none text-jse-theme-heading">Tout est à jour.</p>
                <p className="mt-2 max-w-md text-sm leading-6 text-jse-theme-muted">Aucune commande n’attend votre réponse. Les nouvelles commandes apparaîtront ici dès qu’un client en passera une.</p>
            </div>
        </div>
    );
}

/** Anneau de disponibilité du menu, avec les produits à remettre en vente en un geste. */
function SanteMenu({ produits, enCours, onBasculer, onNaviguer }) {
    const total = produits.length;
    const disponibles = produits.filter((produit) => produit.disponible).length;
    const indisponibles = produits.filter((produit) => !produit.disponible);
    const pourcentage = total ? Math.round((disponibles / total) * 100) : 0;
    const rayon = 52;
    const circonference = 2 * Math.PI * rayon;

    return (
        <section aria-labelledby="titre-sante" className="jse-dark-surface relative overflow-hidden rounded-3xl bg-jse-principal p-6 text-jse-fond shadow-jse-elevated sm:p-7">
            <div className="flex items-center gap-6">
                <div className="relative size-32 shrink-0" role="img" aria-label={`${disponibles} produits disponibles sur ${total}`}>
                    <svg viewBox="0 0 120 120" className="size-full -rotate-90">
                        <circle cx="60" cy="60" r={rayon} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="10" />
                        <circle cx="60" cy="60" r={rayon} fill="none" stroke="#45B977" strokeWidth="10" strokeLinecap="round" strokeDasharray={circonference} strokeDashoffset={circonference * (1 - pourcentage / 100)} className="transition-all duration-1000" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold tabular-nums">{pourcentage}%</span>
                        <span className="text-xs text-jse-fond/70">en vente</span>
                    </div>
                </div>
                <div className="min-w-0">
                    <h2 id="titre-sante" className="font-against text-3xl leading-none">
                        Votre carte
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-jse-fond/75">
                        {disponibles} produit{disponibles > 1 ? "s" : ""} disponible{disponibles > 1 ? "s" : ""} sur {total}.
                    </p>
                </div>
            </div>

            {indisponibles.length > 0 ? (
                <div className="mt-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-jse-fond/60">À remettre en vente</p>
                    <ul className="mt-3 space-y-2">
                        {indisponibles.slice(0, 4).map((produit) => (
                            <li key={produit.id} className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 backdrop-blur-md">
                                <span className="min-w-0 flex-1 truncate text-sm font-medium">{produit.nom}</span>
                                <button
                                    type="button"
                                    disabled={enCours === produit.id}
                                    onClick={() => onBasculer(produit)}
                                    className="min-h-9 shrink-0 rounded-full bg-jse-secondaire px-4 text-xs font-bold text-jse-principal transition hover:brightness-105 active:scale-[0.97] disabled:opacity-60"
                                >
                                    Rendre disponible
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <p className="mt-6 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-jse-fond/85 backdrop-blur-md">Tous vos produits sont disponibles pour vos clients.</p>
            )}

            <button type="button" onClick={() => onNaviguer("menu")} className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-jse-accent px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40">
                Gérer mon menu
                <ArrowRight size={16} aria-hidden="true" />
            </button>
        </section>
    );
}

function TuilePhoto({ onNaviguer }) {
    return (
        <button
            type="button"
            onClick={() => onNaviguer("profil")}
            className="group relative isolate flex min-h-[280px] w-full flex-col justify-end overflow-hidden rounded-3xl p-6 text-left text-jse-fond shadow-jse-elevated focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-jse-secondaire/40 sm:p-7"
        >
            <img src="/assets/hero_icon/resto.jpeg" alt="" aria-hidden="true" loading="lazy" decoding="async" className="absolute inset-0 -z-10 size-full object-cover transition duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-jse-principal via-jse-principal/55 to-jse-principal/10" />
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-jse-secondaire">Votre vitrine</p>
            <p className="mt-2 font-against text-4xl leading-[0.95]">Montrez le meilleur de votre restaurant.</p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-jse-fond">
                Compléter mon profil
                <ArrowRight size={16} className="transition group-hover:translate-x-1" aria-hidden="true" />
            </span>
        </button>
    );
}

/**
 * Accueil de l'espace restaurant : héro de marque, indicateurs animés, parcours des commandes,
 * commandes à traiter en « tickets », état de la carte et tuile photo.
 */
export default function AccueilRestaurant({ restaurant, prenom, commandes, commandesATraiter, categories, produits, statistiques, traitementCommande, traitementProduit, onAvancer, onBasculerProduit, onNaviguer }) {
    const produitsDisponibles = statistiques.produits_disponibles || 0;
    const plat = useMemo(() => platPour(categories), [categories]);
    const livrees = commandes.filter((commande) => commande.statut?.code === "LIVREE").length;
    const racineTickets = useRef(null);

    useLayoutEffect(() => {
        if (!racineTickets.current || MOUVEMENT_REDUIT()) return undefined;

        const contexte = gsap.context(() => {
            gsap.from("[data-ticket]", { y: 24, opacity: 0, duration: 0.55, ease: "power3.out", stagger: 0.08, delay: 0.25 });
        }, racineTickets);

        return () => contexte.revert();
    }, [commandesATraiter.length]);

    return (
        <div className="space-y-6 sm:space-y-8">
            <Heros restaurant={restaurant} prenom={prenom} categories={categories} aTraiter={commandesATraiter.length} produitsDisponibles={produitsDisponibles} onNaviguer={onNaviguer} />

            <section aria-label="Indicateurs du jour" className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                <div className="order-2 sm:order-1">
                    <Tuile icone={ShoppingBag} label="Commandes aujourd’hui">
                        <Compteur valeur={statistiques.commandes_du_jour || 0} />
                    </Tuile>
                </div>
                <div className="order-1 col-span-2 sm:order-2 sm:col-span-1">
                    <Tuile icone={CircleDollarSign} label="Revenus du jour" sombre>
                        <Compteur valeur={statistiques.revenus_du_jour || 0} formater={montant} />
                    </Tuile>
                </div>
                <div className="order-3">
                    <Tuile icone={PackageCheck} label="Commandes livrées">
                        <Compteur valeur={statistiques.commandes_livrees ?? livrees} />
                    </Tuile>
                </div>
            </section>

            <Frise commandes={commandes} />

            <section ref={racineTickets} aria-labelledby="titre-a-traiter">
                <div className="mb-4 flex items-end justify-between gap-3">
                    <div>
                        <h2 id="titre-a-traiter" className="font-against text-4xl leading-none text-jse-theme-heading">
                            À traiter maintenant
                        </h2>
                        <p className="mt-2 text-sm text-jse-theme-muted">Confirmez, préparez, puis marquez prêtes pour la livraison.</p>
                    </div>
                    {commandesATraiter.length > 5 && (
                        <button type="button" onClick={() => onNaviguer("commandes")} className="inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-jse-theme-heading hover:underline">
                            Tout voir
                            <ArrowRight size={15} aria-hidden="true" />
                        </button>
                    )}
                </div>

                {commandesATraiter.length === 0 ? (
                    <AucuneCommande plat={plat} />
                ) : (
                    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {commandesATraiter.slice(0, 6).map((commande) => (
                            <Ticket key={commande.id} commande={commande} enCours={traitementCommande === commande.id} onAvancer={onAvancer} />
                        ))}
                    </ul>
                )}
            </section>

            <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
                <SanteMenu produits={produits} enCours={traitementProduit} onBasculer={onBasculerProduit} onNaviguer={onNaviguer} />
                <TuilePhoto onNaviguer={onNaviguer} />
            </div>
        </div>
    );
}

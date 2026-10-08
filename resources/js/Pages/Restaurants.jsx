import { router } from "@inertiajs/react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Clock, MapPin, Search } from "lucide-react";
import { gsap } from "gsap";
import { imageRestaurantFallback } from "../lib/imagesUnsplash";
import { mouvementReduit } from "../lib/mouvement";

const LIENS = [
    { label: "Restaurants", href: "/restaurants", actif: true },
    { label: "À propos", href: "/a-propos" },
    { label: "Aide", href: "/aide" },
];

const TOUTES_LES_ZONES = "toutes";

export default function Restaurants({ restaurants = [], estClient = false }) {
    const pageRef = useRef(null);
    const defilementRef = useRef(null);
    const grilleRef = useRef(null);
    const [recherche, setRecherche] = useState("");
    const [zone, setZone] = useState(TOUTES_LES_ZONES);

    const zones = useMemo(
        () => [...new Set(restaurants.map((restaurant) => restaurant.zone).filter(Boolean))].sort(),
        [restaurants],
    );

    const restaurantsFiltres = useMemo(() => {
        const terme = recherche.trim().toLowerCase();

        return restaurants.filter((restaurant) => {
            if (zone !== TOUTES_LES_ZONES && restaurant.zone !== zone) return false;
            if (!terme) return true;

            return [restaurant.nom, restaurant.description, ...restaurant.categories]
                .filter(Boolean)
                .some((texte) => texte.toLowerCase().includes(terme));
        });
    }, [restaurants, recherche, zone]);

    const ouvrir = (restaurant) => {
        router.visit(estClient ? "/restaurants/" + restaurant.id : "/authentification");
    };

    /* Entrée de la page : titre révélé ligne par ligne, puis éléments d'appui. */
    useLayoutEffect(() => {
        if (!pageRef.current || mouvementReduit()) return;

        const contexte = gsap.context(() => {
            gsap.timeline({ defaults: { ease: "power3.out" } })
                .from("[data-entree-ligne]", { yPercent: 110, duration: 0.95, stagger: 0.12 })
                .from("[data-entree-texte]", { y: 18, opacity: 0, duration: 0.7, stagger: 0.08 }, "-=0.55")
                .from("[data-entree-assiette]", { scale: 0.7, opacity: 0, rotate: -14, duration: 1.1, stagger: 0.14, ease: "power4.out" }, "-=1.1");

            gsap.to("[data-flottant]", {
                y: -14,
                duration: 3.2,
                ease: "sine.inOut",
                yoyo: true,
                repeat: -1,
                stagger: { each: 0.5, from: "random" },
            });

            gsap.utils.toArray("[data-compteur]").forEach((element) => {
                const cible = Number(element.dataset.compteur) || 0;
                const valeur = { n: 0 };
                gsap.to(valeur, { n: cible, duration: 1.4, ease: "power2.out", onUpdate: () => { element.textContent = Math.round(valeur.n); } });
            });
        }, pageRef);

        return () => contexte.revert();
    }, []);

    /* Bandeau défilant des noms de restaurants (données réelles), en boucle continue. */
    useEffect(() => {
        const piste = defilementRef.current;
        if (!piste || mouvementReduit() || restaurants.length === 0) return;

        const tween = gsap.to(piste, { xPercent: -50, duration: Math.max(24, restaurants.length * 3), ease: "none", repeat: -1 });
        const pause = () => tween.pause();
        const reprise = () => tween.resume();
        piste.addEventListener("pointerenter", pause);
        piste.addEventListener("pointerleave", reprise);

        return () => {
            piste.removeEventListener("pointerenter", pause);
            piste.removeEventListener("pointerleave", reprise);
            tween.kill();
        };
    }, [restaurants.length]);

    /* Apparition des cartes au défilement. */
    useEffect(() => {
        const grille = grilleRef.current;
        if (!grille) return;

        const cartes = Array.from(grille.querySelectorAll("[data-carte]"));
        if (mouvementReduit() || !("IntersectionObserver" in window)) {
            gsap.set(cartes, { clearProps: "all" });
            return;
        }

        gsap.set(cartes, { y: 40, opacity: 0 });
        const observateur = new IntersectionObserver(
            (entrees) => {
                const visibles = entrees.filter((entree) => entree.isIntersecting).map((entree) => entree.target);
                if (visibles.length === 0) return;
                gsap.to(visibles, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out", stagger: 0.07, clearProps: "transform" });
                visibles.forEach((carte) => observateur.unobserve(carte));
            },
            { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
        );
        cartes.forEach((carte) => observateur.observe(carte));

        return () => observateur.disconnect();
    }, [restaurantsFiltres]);

    const assiettes = restaurants.slice(0, 3);
    const defilement = restaurants.length > 0 ? [...restaurants, ...restaurants] : [];

    return (
        <main ref={pageRef} className="min-h-screen overflow-x-hidden bg-jse-fond font-sans text-jse-texte">
            <header className="sticky top-0 z-50 border-b border-jse-principal/10 bg-jse-fond/95 backdrop-blur-xl">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
                    <button type="button" onClick={() => router.visit("/bienvenue")} aria-label="Retour à l'accueil" className="shrink-0">
                        <img src="/assets/jse_logo.png?v=20261002" alt="JSE Express" className="h-9 w-auto sm:h-10" />
                    </button>

                    <nav className="hidden items-center gap-1 text-sm font-medium lg:flex" aria-label="Navigation principale">
                        {LIENS.map((lien) =>
                            lien.actif ? (
                                <span key={lien.href} aria-current="page" className="rounded-full bg-jse-secondaire/15 px-4 py-2.5 text-jse-principal">{lien.label}</span>
                            ) : (
                                <button key={lien.href} type="button" onClick={() => router.visit(lien.href)} className="rounded-full px-4 py-2.5 transition hover:bg-jse-principal/5">{lien.label}</button>
                            ),
                        )}
                    </nav>

                    <button
                        type="button"
                        onClick={() => router.visit(estClient ? "/accueil" : "/authentification")}
                        className="rounded-full bg-jse-principal px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-jse-principal/10 transition hover:-translate-y-0.5 hover:bg-jse-principal/90 active:scale-[0.98]"
                    >
                        {estClient ? "Mon espace" : "Se connecter"}
                    </button>
                </div>
            </header>

            <section className="relative overflow-hidden bg-jse-principal text-jse-fond">
                <div className="pointer-events-none absolute -right-32 -top-32 h-[520px] w-[520px] rounded-full bg-jse-secondaire/15 blur-[110px]" />
                <div className="pointer-events-none absolute -bottom-40 left-1/4 h-[420px] w-[420px] rounded-full bg-jse-accent/10 blur-[120px]" />

                <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-10 lg:py-24">
                    <div>
                        <p data-entree-texte className="text-sm font-semibold uppercase tracking-[0.18em] text-jse-secondaire">Restaurants · Adzopé</p>
                        <h1 className="mt-5 font-against text-[clamp(2.8rem,8vw,6.2rem)] leading-[0.92] tracking-tight">
                            <span className="block overflow-hidden pb-2"><span data-entree-ligne className="block">Les tables</span></span>
                            <span className="block overflow-hidden pb-2"><span data-entree-ligne className="block text-jse-accent">d'Adzopé,</span></span>
                            <span className="block overflow-hidden pb-2"><span data-entree-ligne className="block">réunies ici.</span></span>
                        </h1>
                        <p data-entree-texte className="mt-7 max-w-xl text-base leading-7 text-jse-fond/75 sm:text-lg">
                            Parcourez les restaurants disponibles sur JSE Express, découvrez leurs spécialités puis commandez dès que vous êtes connecté.
                        </p>

                        <div data-entree-texte className="mt-9 flex flex-wrap items-center gap-4">
                            <button
                                type="button"
                                onClick={() => document.getElementById("liste-restaurants")?.scrollIntoView({ behavior: mouvementReduit() ? "auto" : "smooth" })}
                                className="inline-flex h-12 items-center gap-3 rounded-full bg-jse-secondaire px-7 text-sm font-semibold text-jse-principal shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-jse-secondaire/90 active:scale-[0.98]"
                            >
                                Voir les restaurants
                                <ArrowRight size={18} aria-hidden="true" />
                            </button>
                            <p className="text-sm text-jse-fond/70">
                                <span data-compteur={restaurants.length} className="font-against text-3xl text-jse-fond">{restaurants.length}</span>{" "}
                                {restaurants.length > 1 ? "restaurants disponibles" : "restaurant disponible"}
                            </p>
                        </div>
                    </div>

                    <div className="relative mx-auto hidden h-[440px] w-full max-w-[480px] lg:block" aria-hidden="true">
                        {assiettes.map((restaurant, position) => (
                            <div
                                key={restaurant.id}
                                data-entree-assiette
                                className={["absolute", "left-0 top-6 h-60 w-60", "right-0 top-0 h-52 w-52", "bottom-0 left-1/4 h-64 w-64"][position]}
                            >
                                <div data-flottant className="h-full w-full overflow-hidden rounded-full border-[6px] border-jse-fond/90 shadow-2xl shadow-black/30">
                                    <img
                                        src={imageRestaurantFallback(restaurant.id)}
                                        alt=""
                                        loading="eager"
                                        draggable="false"
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {defilement.length > 0 && (
                    <div className="relative overflow-hidden border-y border-white/10 bg-black/10 py-4" aria-hidden="true">
                        <div ref={defilementRef} className="flex w-max items-center gap-10 whitespace-nowrap will-change-transform">
                            {defilement.map((restaurant, position) => (
                                <span key={restaurant.id + "-" + position} className="flex items-center gap-10 font-against text-2xl text-jse-fond/80">
                                    {restaurant.nom}
                                    <span className="h-2 w-2 rounded-full bg-jse-accent" />
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </section>

            <section id="liste-restaurants" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-14 sm:px-8 lg:px-10 lg:py-20">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-jse-secondaire">À découvrir</p>
                        <h2 className="mt-3 font-against text-4xl leading-[0.95] text-jse-principal sm:text-5xl">Choisissez votre restaurant</h2>
                    </div>

                    <label className="relative block w-full lg:max-w-sm">
                        <span className="sr-only">Rechercher un restaurant</span>
                        <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-jse-principal/50" />
                        <input
                            type="search"
                            value={recherche}
                            onChange={(event) => setRecherche(event.target.value)}
                            placeholder="Rechercher un restaurant ou un plat"
                            className="h-12 w-full rounded-full border border-jse-principal/15 bg-white pl-11 pr-4 text-base text-jse-texte outline-none transition placeholder:text-jse-texte/40 focus:border-jse-secondaire focus:ring-4 focus:ring-jse-secondaire/15"
                        />
                    </label>
                </div>

                {zones.length > 1 && (
                    <div className="-mx-5 mt-6 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filtrer par zone">
                        {[TOUTES_LES_ZONES, ...zones].map((valeur) => (
                            <button
                                key={valeur}
                                type="button"
                                aria-pressed={zone === valeur}
                                onClick={() => setZone(valeur)}
                                className={
                                    "h-11 shrink-0 rounded-full border px-5 text-sm font-medium transition active:scale-[0.97] " +
                                    (zone === valeur
                                        ? "border-jse-principal bg-jse-principal text-white"
                                        : "border-jse-principal/15 bg-white text-jse-principal hover:border-jse-principal/40")
                                }
                            >
                                {valeur === TOUTES_LES_ZONES ? "Toutes les zones" : valeur}
                            </button>
                        ))}
                    </div>
                )}

                <div ref={grilleRef} className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {restaurantsFiltres.map((restaurant) => (
                        <article
                            key={restaurant.id}
                            data-carte
                            className="group flex flex-col overflow-hidden rounded-3xl border border-jse-principal/10 bg-white shadow-jse-carte transition duration-300 hover:-translate-y-1 hover:shadow-jse-elevated"
                        >
                            <div className="relative aspect-[16/10] overflow-hidden bg-jse-principal/10">
                                <img
                                    src={imageRestaurantFallback(restaurant.id)}
                                    alt=""
                                    loading="lazy"
                                    className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-jse-principal/60 via-transparent to-transparent" />
                                {restaurant.zone && (
                                    <span className="absolute left-4 top-4 rounded-full bg-jse-fond/95 px-3 py-1 text-xs font-semibold text-jse-principal">{restaurant.zone}</span>
                                )}
                            </div>

                            <div className="flex flex-1 flex-col p-5">
                                <h3 className="font-against text-2xl leading-tight text-jse-principal">{restaurant.nom}</h3>
                                {restaurant.description && <p className="mt-2 line-clamp-2 text-sm leading-6 text-jse-texte/65">{restaurant.description}</p>}

                                {restaurant.categories.length > 0 && (
                                    <ul className="mt-4 flex flex-wrap gap-2">
                                        {restaurant.categories.slice(0, 4).map((categorie) => (
                                            <li key={categorie} className="rounded-full bg-jse-secondaire/12 px-3 py-1 text-xs font-medium text-jse-principal">{categorie}</li>
                                        ))}
                                    </ul>
                                )}

                                <dl className="mt-4 space-y-1.5 text-xs text-jse-texte/60">
                                    {restaurant.adresse && (
                                        <div className="flex items-center gap-2"><MapPin size={14} aria-hidden="true" className="shrink-0 text-jse-accent" /><dt className="sr-only">Adresse</dt><dd>{restaurant.adresse}</dd></div>
                                    )}
                                    {restaurant.horaires && (
                                        <div className="flex items-center gap-2"><Clock size={14} aria-hidden="true" className="shrink-0 text-jse-accent" /><dt className="sr-only">Horaires</dt><dd>{restaurant.horaires}</dd></div>
                                    )}
                                </dl>

                                <button
                                    type="button"
                                    onClick={() => ouvrir(restaurant)}
                                    className="mt-6 inline-flex h-12 items-center justify-between rounded-full bg-jse-principal px-6 text-sm font-semibold text-white transition hover:bg-jse-principal/90 active:scale-[0.98]"
                                >
                                    {estClient ? "Voir le menu" : "Se connecter pour commander"}
                                    <ArrowRight size={18} aria-hidden="true" className="transition group-hover:translate-x-1" />
                                </button>
                            </div>
                        </article>
                    ))}
                </div>

                {restaurantsFiltres.length === 0 && (
                    <div className="mt-10 rounded-3xl border border-dashed border-jse-principal/20 bg-white/60 px-6 py-14 text-center">
                        <p className="font-against text-3xl text-jse-principal">
                            {restaurants.length === 0 ? "Aucun restaurant pour le moment" : "Aucun résultat"}
                        </p>
                        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-jse-texte/60">
                            {restaurants.length === 0
                                ? "Les restaurants apparaîtront ici dès qu'ils seront disponibles sur JSE Express."
                                : "Essayez un autre mot-clé ou changez de zone."}
                        </p>
                        {restaurants.length > 0 && (
                            <button
                                type="button"
                                onClick={() => { setRecherche(""); setZone(TOUTES_LES_ZONES); }}
                                className="mt-6 h-11 rounded-full border border-jse-principal/20 px-6 text-sm font-semibold text-jse-principal transition hover:bg-jse-principal/5"
                            >
                                Réinitialiser les filtres
                            </button>
                        )}
                    </div>
                )}
            </section>

            {!estClient && (
                <section className="bg-jse-principal px-5 py-16 text-jse-fond sm:px-8 lg:px-10">
                    <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
                        <h2 className="max-w-2xl font-against text-4xl leading-[0.95] sm:text-5xl">
                            Une envie ? <span className="text-jse-accent">Commandez en quelques étapes.</span>
                        </h2>
                        <div className="flex flex-wrap gap-3">
                            <button type="button" onClick={() => router.visit("/inscription")} className="h-12 rounded-full bg-jse-accent px-7 text-sm font-semibold text-white shadow-lg shadow-black/20 transition hover:-translate-y-0.5 active:scale-[0.98]">
                                Créer un compte
                            </button>
                            <button type="button" onClick={() => router.visit("/authentification")} className="h-12 rounded-full border border-white/30 px-7 text-sm font-semibold transition hover:bg-white/10 active:scale-[0.98]">
                                Se connecter
                            </button>
                        </div>
                    </div>
                </section>
            )}
        </main>
    );
}

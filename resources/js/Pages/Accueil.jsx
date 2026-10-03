import { router, usePage } from "@inertiajs/react";
import NavigationFlottante from "../Composants/Navigation/NavigationFlottante";
import {
    Bell,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Heart,
    Home,
    LogOut,
    MapPin,
    Search,
    SlidersHorizontal,
    ShoppingBag,
    Store,
    Truck,
    CheckCircle2,
    UserRound,
    X,
} from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { basculerFavori, lireFavoris } from "../lib/favoris";
import ThemeToggle from "../Composants/Interface/ThemeToggle";
import { imagesBannieres, imagesCategories, imageRestaurantFallback } from "../lib/imagesUnsplash";

const IMAGE_BANNIERE_SECOURS = imagesBannieres[0];

const bannières = [
    { image: imagesBannieres[0], label: "JSE EXPRESS", titre: "Des saveurs près de chez vous", description: "Commandez vos plats préférés à Adzopé" },
    { image: imagesBannieres[1], label: "LIVRAISON", titre: "Vos plats préférés, livrés à Adzopé", description: "Commandez simplement auprès de vos restaurants locaux." },
    { image: imagesBannieres[2], label: "RESTAURANTS LOCAUX", titre: "Découvrez les restaurants d'Adzopé", description: "Explorez les établissements disponibles près de chez vous." },
    { image: imagesBannieres[3], label: "SIMPLE ET PRATIQUE", titre: "Commandez sans vous déplacer", description: "Quelques étapes suffisent pour préparer votre commande." },
    { image: imagesBannieres[4], label: "À DÉCOUVRIR", titre: "Variez les plaisirs", description: "Trouvez différentes propositions au même endroit." },
];

const raccourcisAccueil = [
    { nom: "Restaurants", image: imagesCategories[0] },
    { nom: "Fast food", image: imagesCategories[1] },
    { nom: "Boissons", image: imagesCategories[2] },
    { nom: "Promotions", image: imagesCategories[3] },
];

const obtenirImageRestaurant = (restaurant, index = 0) =>
    restaurant?.image || imageRestaurantFallback(restaurant?.id ?? index);

const obtenirSecoursImageRestaurant = (restaurant, index = 0) =>
    imageRestaurantFallback(restaurant?.id ?? index);


function calculerDistanceKm(latitudeA, longitudeA, latitudeB, longitudeB) {
    const degresEnRadians = (valeur) => (valeur * Math.PI) / 180;
    const rayonTerreKm = 6371;
    const differenceLatitude = degresEnRadians(latitudeB - latitudeA);
    const differenceLongitude = degresEnRadians(longitudeB - longitudeA);
    const latitudeAEnRadians = degresEnRadians(latitudeA);
    const latitudeBEnRadians = degresEnRadians(latitudeB);

    const a =
        Math.sin(differenceLatitude / 2) ** 2 +
        Math.cos(latitudeAEnRadians) *
            Math.cos(latitudeBEnRadians) *
            Math.sin(differenceLongitude / 2) ** 2;

    return rayonTerreKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const navigation = [
    { label: "Accueil", icon: Home, active: true },
    { label: "Commandes", icon: ShoppingBag, route: "/commandes" },
    { label: "Favoris", icon: Heart, route: "/favoris" },
    { label: "Profil", icon: UserRound, route: "/profil" },
];

function NavigationItem({ item, compact = false }) {
    const Icon = item.icon;

    return (
        <main ref={pageRef} className="jse-client-home min-h-screen overflow-x-hidden bg-jse-fond text-jse-texte">
            <section className="relative min-h-screen overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-jse-fond via-jse-fond to-jse-secondaire/10" />
                <div className="absolute -left-32 top-32 size-72 rounded-full bg-jse-secondaire/10 blur-3xl" />
                <div className="absolute right-0 top-0 h-full w-[58%] overflow-hidden rounded-bl-[7rem]">
                    <img src={bannière.image} alt="" className="jse-banner-image h-full w-full object-cover object-center" onError={(event) => {
                        if (event.currentTarget.src.endsWith(IMAGE_BANNIERE_SECOURS)) return;
                        event.currentTarget.src = IMAGE_BANNIERE_SECOURS;
                    }} />
                    <div className="absolute inset-0 bg-gradient-to-r from-jse-fond via-jse-fond/35 to-transparent" />
                    <div className="absolute inset-0 bg-jse-principal/5" />
                </div>

                <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-10 pt-5 sm:px-6 lg:px-8">
                    <header className="jse-home-header flex items-center justify-between rounded-full border border-white/70 bg-white/65 px-4 py-3 shadow-jse-carte backdrop-blur-xl sm:px-6">
                        <button type="button" onClick={() => router.visit("/accueil")} className="flex items-center gap-3" aria-label="Accueil JSE Express">
                            <img src="/assets/jse_logo.png" alt="JSE Express" className="h-9 w-auto object-contain sm:h-10" />
                            <span className="hidden font-sans text-sm font-bold text-jse-principal sm:block">JSE Express</span>
                        </button>

                        <nav className="hidden items-center gap-1 lg:flex">
                            {[
                                ["Accueil", "accueil"],
                                ["Restaurants", "restaurants-populaires"],
                                ["Comment ça marche", "fonctionnement"],
                                ["À propos", "a-propos"],
                            ].map(([label, id], index) => (
                                <button key={label} type="button" onClick={() => {
                                    if (index === 0) window.scrollTo({ top: 0, behavior: "smooth" });
                                    else document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                                }} className={[
                                    "rounded-full px-4 py-2.5 font-sans text-xs font-semibold transition",
                                    index === 0 ? "bg-white text-jse-principal shadow-sm" : "text-jse-texte/65 hover:bg-white/70 hover:text-jse-principal",
                                ].join(" ")}>
                                    {label}
                                </button>
                            ))}
                        </nav>

                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <button type="button" onClick={() => document.getElementById("recherche-accueil")?.focus()} className="hidden size-10 items-center justify-center rounded-full text-jse-principal transition hover:bg-white/70 sm:flex" aria-label="Rechercher">
                                <Search size={19} strokeWidth={1.8} />
                            </button>
                            <button type="button" onClick={() => router.visit("/commandes")} className="relative flex size-10 items-center justify-center rounded-full text-jse-principal transition hover:bg-white/70" aria-label="Panier">
                                <ShoppingBag size={19} strokeWidth={1.8} />
                                {nombreArticles > 0 && <span className="absolute right-0 top-0 flex min-w-4 items-center justify-center rounded-full bg-jse-accent px-1 py-0.5 font-sans text-[9px] font-bold text-white">{nombreArticles}</span>}
                            </button>
                            {utilisateur ? (
                                <button type="button" onClick={() => router.visit("/profil")} className="hidden rounded-full bg-jse-accent px-5 py-2.5 font-sans text-xs font-bold text-white shadow-sm transition hover:brightness-105 sm:block">Mon profil</button>
                            ) : (
                                <button type="button" onClick={() => router.visit("/authentification")} className="rounded-full bg-jse-accent px-5 py-2.5 font-sans text-xs font-bold text-white shadow-sm transition hover:brightness-105">Se connecter</button>
                            )}
                        </div>
                    </header>

                    <div className="grid min-h-[calc(100vh-6rem)] items-center lg:grid-cols-[0.9fr_1.1fr]">
                        <div className="jse-home-greeting max-w-2xl py-12 sm:py-16 lg:py-20">
                            <div className="inline-flex items-center gap-2 rounded-full border border-jse-accent/15 bg-jse-accent/10 px-3.5 py-2 font-sans text-[10px] font-bold text-jse-accent sm:text-xs">
                                <span className="size-1.5 rounded-full bg-jse-accent" />
                                Bonne cuisine, plus proche de vous
                            </div>

                            <h1 className="mt-6 max-w-xl font-against text-[3.25rem] leading-[0.92] tracking-tight text-jse-principal sm:text-6xl lg:text-7xl">
                                Vos plats<br /><span className="text-jse-accent">favoris</span> à Adzopé,<br />sans vous déplacer.
                            </h1>

                            <p className="mt-6 max-w-lg font-sans text-sm leading-6 text-jse-texte/60 sm:text-base sm:leading-7">
                                Découvrez les restaurants près de chez vous, commandez en quelques clics et faites-vous livrer où que vous soyez à Adzopé.
                            </p>

                            <form ref={searchRef} onSubmit={rechercher} className="mt-7 flex max-w-xl flex-col gap-3 sm:flex-row">
                                <div className="flex min-w-0 flex-1 items-center gap-3 rounded-full border border-white/80 bg-white/80 px-4 py-3 shadow-jse-carte backdrop-blur-xl">
                                    <Search size={18} className="shrink-0 text-jse-principal/55" />
                                    <input id="recherche-accueil" value={rechercheLocale} onChange={(event) => setRechercheLocale(event.target.value)} placeholder="Rechercher un restaurant..." className="min-w-0 flex-1 bg-transparent font-sans text-xs text-jse-texte outline-none placeholder:text-jse-texte/40 sm:text-sm" />
                                    <button type="button" onClick={ouvrirFiltres} className="flex size-9 shrink-0 items-center justify-center rounded-full bg-jse-fond text-jse-principal" aria-label="Ouvrir les filtres">
                                        <SlidersHorizontal size={16} />
                                    </button>
                                </div>
                                <button type="submit" className="rounded-full bg-jse-accent px-6 py-3.5 font-sans text-xs font-bold text-white shadow-sm transition hover:brightness-105 sm:px-7">Commander maintenant</button>
                            </form>

                            <div id="fonctionnement" className="mt-9 grid max-w-xl grid-cols-3 gap-3 sm:gap-5">
                                {[
                                    [Store, "Large choix", "Les meilleurs restaurants d'Adzopé au même endroit."],
                                    [Truck, "Livraison rapide", "Recevez vos plats où vous êtes."],
                                    [CheckCircle2, "Paiement sécurisé", "Plusieurs moyens de paiement."],
                                ].map(([Icon, title, description]) => (
                                    <div key={title} className="min-w-0">
                                        <div className="flex size-11 items-center justify-center rounded-full bg-jse-principal text-white shadow-sm"><Icon size={18} strokeWidth={1.8} /></div>
                                        <h2 className="mt-3 font-sans text-xs font-bold text-jse-principal sm:text-sm">{title}</h2>
                                        <p className="mt-1 font-sans text-[10px] leading-4 text-jse-texte/50 sm:text-xs">{description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative hidden min-h-[32rem] lg:block">
                            <div className="absolute right-[12%] top-[12%] z-20 w-52 rotate-[-5deg] overflow-hidden rounded-[2rem] border-[5px] border-jse-principal bg-white shadow-2xl xl:w-60">
                                <div className="flex items-center justify-between bg-white px-4 pb-2 pt-3">
                                    <span className="font-sans text-[9px] font-bold text-jse-principal">JSE Express</span><span className="size-2 rounded-full bg-jse-accent" />
                                </div>
                                <div className="bg-jse-fond p-3">
                                    <div className="rounded-full bg-white px-3 py-2 font-sans text-[8px] text-jse-texte/45 shadow-sm">Rechercher un restaurant...</div>
                                    <div className="mt-3 grid grid-cols-4 gap-1.5">
                                        {["Tout", "Plats", "Boissons", "Fast food"].map((item) => <span key={item} className="rounded-xl bg-white px-1 py-2 text-center font-sans text-[7px] font-semibold text-jse-principal">{item}</span>)}
                                    </div>
                                    <p className="mt-4 font-sans text-[9px] font-bold text-jse-principal">Restaurants près de vous</p>
                                    <div className="mt-2 grid grid-cols-2 gap-2">
                                        {restaurants.slice(0, 2).map((restaurant, index) => <div key={restaurant.id ?? index} className="overflow-hidden rounded-xl bg-white"><img src={obtenirImageRestaurant(restaurant, index)} alt="" className="aspect-square w-full object-cover" /><p className="truncate px-1.5 py-1 font-sans text-[7px] font-semibold text-jse-texte">{restaurant.nom}</p></div>)}
                                    </div>
                                </div>
                                <div className="flex justify-around border-t border-jse-texte/5 bg-white px-2 py-2">
                                    {["Accueil", "Restaurants", "Panier", "Commandes", "Profil"].map((item) => <span key={item} className="font-sans text-[6px] text-jse-texte/45">{item}</span>)}
                                </div>
                            </div>

                            <div className="absolute right-[-6%] top-[8%] h-[30rem] w-[30rem] rounded-full bg-jse-secondaire/15 blur-3xl" />
                            <div className="absolute right-[-5%] top-[16%] z-10 flex items-center gap-3 rounded-3xl border border-white/80 bg-white/80 px-5 py-4 shadow-jse-carte backdrop-blur-xl">
                                <span className="flex size-11 items-center justify-center rounded-full bg-jse-accent text-white"><Truck size={19} /></span>
                                <span><strong className="block font-sans text-xs font-bold text-jse-principal">Livraison à Adzopé</strong><small className="font-sans text-[10px] text-jse-texte/50">où vous êtes</small></span>
                            </div>
                            <div className="absolute bottom-[17%] right-[1%] z-20 flex items-center gap-3 rounded-3xl border border-white/80 bg-white/80 px-5 py-4 shadow-jse-carte backdrop-blur-xl">
                                <span className="flex size-11 items-center justify-center rounded-full bg-jse-secondaire text-white"><Heart size={19} fill="currentColor" /></span>
                                <span><strong className="block font-sans text-xs font-bold text-jse-principal">Vos restaurants préférés</strong><small className="font-sans text-[10px] text-jse-texte/50">Toujours à portée de main</small></span>
                            </div>
                        </div>
                    </div>

                    <section id="restaurants-populaires" ref={restaurantsRef} className="scroll-mt-8 pb-8">
                        <div className="rounded-[2rem] border border-white/80 bg-white/55 p-4 shadow-jse-carte backdrop-blur-xl sm:p-6">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                                <div><p className="font-sans text-[10px] font-bold uppercase tracking-[0.15em] text-jse-texte/40">Nos restaurants partenaires</p><h2 className="mt-1 font-against text-2xl text-jse-principal sm:text-3xl">Ils nous font confiance</h2></div>
                                <div className="flex items-center gap-2">
                                    <button type="button" onClick={activerLocalisation} disabled={localisationEnCours} className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 font-sans text-[10px] font-semibold text-jse-principal shadow-sm"><MapPin size={14} />{localisationEnCours ? "Localisation..." : "Restaurants près de moi"}</button>
                                    <button type="button" onClick={() => defilerRestaurants(-1)} className="flex size-9 items-center justify-center rounded-full bg-white text-jse-principal shadow-sm" aria-label="Restaurants précédents"><ChevronLeft size={16} /></button>
                                    <button type="button" onClick={() => defilerRestaurants(1)} className="flex size-9 items-center justify-center rounded-full bg-white text-jse-principal shadow-sm" aria-label="Restaurants suivants"><ChevronRight size={16} /></button>
                                </div>
                            </div>

                            {messageLocalisation && <p className="mt-3 font-sans text-[10px] text-jse-danger">{messageLocalisation}</p>}

                            <div ref={categoriesRef} className="mt-5 grid grid-cols-4 gap-2.5 sm:grid-cols-4 lg:max-w-2xl">
                                {raccourcisAccueil.map((raccourci) => (
                                    <button key={raccourci.nom} type="button" onClick={() => {
                                        setCategorieSelectionnee(raccourci.nom);
                                        document.getElementById("restaurants-liste")?.scrollIntoView({ behavior: "smooth", block: "start" });
                                    }} className={[
                                        "jse-category-card overflow-hidden rounded-2xl border bg-white/80 p-1.5 text-center transition sm:p-2",
                                        categorieSelectionnee === raccourci.nom ? "border-jse-secondaire ring-2 ring-jse-secondaire/20" : "border-jse-texte/5 hover:border-jse-secondaire/30",
                                    ].join(" ")}>
                                        <img src={raccourci.image} alt={raccourci.nom} className="aspect-[1.35/1] w-full rounded-xl object-cover" />
                                        <span className="mt-1.5 block truncate font-sans text-[9px] font-semibold text-jse-texte sm:text-[10px]">{raccourci.nom}</span>
                                    </button>
                                ))}
                            </div>

                            <div id="restaurants-liste" className="mt-6 scroll-mt-8">
                                {restaurantsFiltres.length > 0 ? (
                                    <div ref={listeRestaurantsRef} className={["scrollbar-none flex gap-3 overflow-x-auto pb-2", glissementRestaurants ? "cursor-grabbing" : "cursor-grab"].join(" ")} onPointerDown={commencerGlissementRestaurants} onPointerMove={deplacerGlissementRestaurants} onPointerUp={terminerGlissementRestaurants} onPointerCancel={terminerGlissementRestaurants}>
                                        {restaurantsFiltres.map((restaurant, index) => (
                                            <article key={restaurant.id} onClick={() => {
                                                if (clicApresGlissementRef.current) return;
                                                if (Number.isInteger(Number(restaurant.id))) router.visit("/restaurants/" + restaurant.id);
                                            }} className="jse-restaurant-card w-64 shrink-0 overflow-hidden rounded-2xl border border-jse-texte/5 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-jse-carte">
                                                <div className="relative aspect-[1.45/1] overflow-hidden bg-jse-principal">
                                                    <img src={obtenirImageRestaurant(restaurant, index)} alt={restaurant.nom} onError={(event) => {
                                                        event.currentTarget.onerror = null;
                                                        event.currentTarget.src = obtenirSecoursImageRestaurant(restaurant, index);
                                                    }} className="h-full w-full object-cover" />
                                                    <button type="button" onClick={(event) => { event.stopPropagation(); basculerFavoriRestaurant(restaurant); }} className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-white/95 text-jse-principal shadow-md" aria-label={estRestaurantFavori(restaurant) ? "Retirer des favoris" : "Ajouter aux favoris"}>
                                                        <Heart size={16} className={estRestaurantFavori(restaurant) ? "text-jse-accent" : "text-jse-principal"} fill={estRestaurantFavori(restaurant) ? "currentColor" : "none"} />
                                                    </button>
                                                </div>
                                                <div className="p-3.5">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <h3 className="line-clamp-2 font-sans text-sm font-semibold text-jse-texte">{restaurant.nom}</h3>
                                                        {restaurant.note !== null && restaurant.note !== undefined && <span className="shrink-0 rounded-full bg-jse-fond px-2 py-1 font-sans text-[10px] font-bold text-jse-principal">★ {Number(restaurant.note).toFixed(1)}</span>}
                                                    </div>
                                                    <p className="mt-1 line-clamp-1 font-sans text-[10px] text-jse-texte/45">{restaurant.type || restaurant.description || "Restaurant"}{restaurant.avis > 0 ? " · " + restaurant.avis + " avis" : " · Aucun avis"}</p>
                                                    <div className="mt-3 flex items-start gap-2 font-sans text-[10px] leading-4 text-jse-texte/50"><MapPin size={12} className="mt-0.5 shrink-0 text-jse-secondaire" /><span className="line-clamp-2">{restaurant.adresse || restaurant.zone?.nom || "Adzopé"}</span></div>
                                                    {positionUtilisateur && restaurant.distanceKm !== null && restaurant.distanceKm !== undefined && <p className="mt-2 font-sans text-[10px] font-semibold text-jse-secondaire">{restaurant.distanceKm < 1 ? Math.round(restaurant.distanceKm * 1000) + " m" : restaurant.distanceKm.toFixed(1) + " km"} de vous</p>}
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-jse-texte/10 bg-white/50 px-5 py-9 text-center">
                                        <ShoppingBag size={21} className="mx-auto text-jse-secondaire" />
                                        <h3 className="mt-3 font-against text-lg text-jse-principal">{recherche || zoneSelectionnee !== "Toutes les zones" ? "Aucun restaurant trouvé" : "Aucun restaurant disponible"}</h3>
                                        <p className="mx-auto mt-1.5 max-w-md font-sans text-xs leading-5 text-jse-texte/45">{recherche || zoneSelectionnee !== "Toutes les zones" ? "Essayez un autre filtre ou une autre recherche." : "Les restaurants actifs apparaîtront ici dès qu’ils seront disponibles."}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    <section id="a-propos" className="pb-5">
                        <div className="flex flex-col gap-3 rounded-3xl border border-jse-principal/10 bg-jse-principal px-5 py-6 text-white sm:flex-row sm:items-center sm:justify-between sm:px-7">
                            <div><p className="font-sans text-[10px] font-bold uppercase tracking-[0.15em] text-jse-secondaire">JSE Express</p><h2 className="mt-1 font-against text-2xl">La cuisine locale, plus simple.</h2></div>
                            <button type="button" onClick={() => router.visit("/restaurants")} className="w-fit rounded-full bg-jse-accent px-5 py-3 font-sans text-xs font-bold text-white">Découvrir les restaurants</button>
                        </div>
                    </section>
                </div>
            </section>

            {filtreOuvert && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-jse-principal/20 p-0 backdrop-blur-[2px] sm:items-center sm:p-5" onClick={() => setFiltreOuvert(false)}>
                    <div role="dialog" aria-modal="true" aria-labelledby="titre-filtres" className="w-full max-w-md rounded-t-[30px] bg-white p-5 shadow-2xl sm:rounded-[30px]" onClick={(event) => event.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <div><p className="font-sans text-[10px] font-semibold uppercase tracking-[0.15em] text-jse-texte/35">Recherche</p><h2 id="titre-filtres" className="mt-1 font-against text-2xl text-jse-principal">Filtrer les restaurants</h2></div>
                            <button type="button" onClick={() => setFiltreOuvert(false)} className="flex size-10 items-center justify-center rounded-full bg-jse-fond text-jse-principal" aria-label="Fermer les filtres"><X size={19} /></button>
                        </div>
                        <div className="mt-6">
                            <p className="font-sans text-xs font-semibold text-jse-texte">Zone de livraison</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {zones.map((zone) => <button key={zone} type="button" onClick={() => setZoneTemporaire(zone)} className={[
                                    "rounded-full px-4 py-2.5 font-sans text-xs font-semibold transition-all",
                                    zoneTemporaire === zone ? "bg-jse-principal text-white shadow-sm" : "bg-jse-fond text-jse-texte/65 ring-1 ring-jse-texte/5",
                                ].join(" ")}>{zone}</button>)}
                            </div>
                        </div>
                        <div className="mt-7 flex gap-3">
                            <button type="button" onClick={reinitialiserFiltres} className="flex-1 rounded-full border border-jse-principal/15 px-4 py-3 font-sans text-xs font-semibold text-jse-principal">Réinitialiser</button>
                            <button type="button" onClick={appliquerFiltres} className="flex-1 rounded-full bg-jse-accent px-4 py-3 font-sans text-xs font-semibold text-white shadow-sm">Appliquer</button>
                        </div>
                    </div>
                </div>
            )}

            <NavigationFlottante type="client" actif="accueil" />
        </main>
    );
}

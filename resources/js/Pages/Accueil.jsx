import { Link, router, usePage } from "@inertiajs/react";
import NavigationFlottante from "../Composants/Navigation/NavigationFlottante";
import {
    Bell,
    ChevronDown,
    ChevronRight,
    Heart,
    Home,
    LogOut,
    MapPin,
    Search,
    SlidersHorizontal,
    ShoppingBag,
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

const obtenirImageCategorie = (index = 0) =>
    imagesCategories[Math.abs(Number(index) || 0) % imagesCategories.length];

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
        <button
            type="button"
            onClick={() => item.route && router.visit(item.route)}
            disabled={!item.active && !item.route}
            title={item.active ? item.label : `${item.label} — disponible prochainement`}
            className={[
                "group flex items-center transition-all",
                compact
                    ? "min-w-[66px] flex-col justify-center gap-1 rounded-2xl px-2.5 py-2"
                    : "w-full gap-3 rounded-2xl px-4 py-3 text-left",
                item.active
                    ? "bg-jse-secondaire/10 text-jse-principal"
                    : "text-jse-texte/45 hover:bg-jse-fond hover:text-jse-principal disabled:cursor-default",
            ].join(" ")}
        >
            <Icon size={compact ? 20 : 19} strokeWidth={item.active ? 2.2 : 1.8} />
            <span className={compact ? "font-sans text-[10px] font-semibold" : "font-sans text-sm font-medium"}>
                {item.label}
            </span>
        </button>
    );
}

export default function Accueil() {
    const {
        auth,
        restaurants = [],
        panier = {},
        recherche = "",
        favorisRestaurantIds = [],
        notificationsCount = 0,
    } = usePage().props;

    const utilisateur = auth?.user ?? null;
    const [indexBannière, setIndexBannière] = useState(0);
    const [rechercheLocale, setRechercheLocale] = useState(recherche);
    const [filtreOuvert, setFiltreOuvert] = useState(false);
    const [zoneSelectionnee, setZoneSelectionnee] = useState("Toutes les zones");
    const [zoneTemporaire, setZoneTemporaire] = useState("Toutes les zones");
    const [categorieSelectionnee, setCategorieSelectionnee] = useState("");
    const [positionUtilisateur, setPositionUtilisateur] = useState(null);
    const [localisationEnCours, setLocalisationEnCours] = useState(false);
    const [messageLocalisation, setMessageLocalisation] = useState("");
    const [favoris, setFavoris] = useState([]);
    const [favorisServeur, setFavorisServeur] = useState(
        (favorisRestaurantIds || []).map(Number),
    );
    const nombreArticles = Number(panier?.nombre_articles ?? 0);
    const pageRef = useRef(null);
    const searchRef = useRef(null);
    const categoriesRef = useRef(null);
    const bannerRef = useRef(null);
    const restaurantsRef = useRef(null);
    const mouvementReduit = useMemo(
        () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        [],
    );

    useLayoutEffect(() => {
        if (!pageRef.current || mouvementReduit) return;
        const context = gsap.context(() => {
            const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
            intro
                .from(".jse-home-header", { y: -18, opacity: 0, duration: 0.65 })
                .from(".jse-home-greeting", { y: 24, opacity: 0, duration: 0.65 }, "-=0.38")
                .from(searchRef.current, { y: 18, opacity: 0, scale: 0.985, duration: 0.55 }, "-=0.38")
                .from(
                    categoriesRef.current?.querySelectorAll(".jse-category-card") || [],
                    {
                        y: 22,
                        scale: 0.96,
                        duration: 0.5,
                        stagger: 0.07,
                        clearProps: "transform",
                    },
                    "-=0.25",
                )
                .from(
                    bannerRef.current,
                    {
                        y: 24,
                        opacity: 0,
                        duration: 0.6,
                        clearProps: "transform,opacity",
                    },
                    "-=0.2",
                )
                .from(
                    restaurantsRef.current?.querySelectorAll(".jse-restaurant-card") || [],
                    {
                        y: 20,
                        duration: 0.45,
                        stagger: 0.06,
                        clearProps: "transform",
                    },
                    "-=0.25",
                );
        }, pageRef.current);
        return () => context.revert();
    }, []);

    useEffect(() => {
        const synchroniserFavorisLocaux = () => setFavoris(lireFavoris());
        synchroniserFavorisLocaux();
        window.addEventListener("jse:favoris-change", synchroniserFavorisLocaux);
        window.addEventListener("storage", synchroniserFavorisLocaux);
        return () => {
            window.removeEventListener("jse:favoris-change", synchroniserFavorisLocaux);
            window.removeEventListener("storage", synchroniserFavorisLocaux);
        };
    }, []);

    const estRestaurantFavori = (restaurant) => {
        const id = Number(restaurant?.id);

        if (Number.isInteger(id)) {
            return favorisServeur.includes(id);
        }

        return favoris.some(
            (favori) => String(favori.id) === String(restaurant?.id),
        );
    };

    const basculerFavoriRestaurant = (restaurant) => {
        if (Number.isInteger(Number(restaurant.id))) {
            const id = Number(restaurant.id);
            const estActuel = favorisServeur.includes(id);
            setFavorisServeur((anciens) =>
                estActuel ? anciens.filter((item) => item !== id) : [...anciens, id],
            );
            router.visit(estActuel ? `/favoris/${id}` : `/favoris/${id}`, {
                method: estActuel ? "delete" : "post",
                preserveScroll: true,
                preserveState: true,
                onError: () => {
                    setFavorisServeur((anciens) =>
                        estActuel ? [...anciens, id] : anciens.filter((item) => item !== id),
                    );
                },
            });
            return;
        }

        setFavoris(basculerFavori(restaurant));
    };

    const zones = useMemo(() => {
        const valeurs = restaurants
            .map((restaurant) => restaurant.zone?.nom || null)
            .filter(Boolean);

        return ["Toutes les zones", ...new Set(valeurs)];
    }, [restaurants]);

    const categoriesDisponibles = useMemo(() => {
        const noms = restaurants
            .flatMap((restaurant) => Array.isArray(restaurant.categories) ? restaurant.categories : [])
            .map((categorie) => String(categorie?.nom || categorie || "").trim())
            .filter(Boolean);

        return [...new Set(noms)].sort((premier, second) =>
            premier.localeCompare(second, "fr", { sensitivity: "base" }),
        );
    }, [restaurants]);

    const restaurantsDisponibles = useMemo(() => {
        if (!positionUtilisateur) return restaurants;

        const restaurantsAvecDistance = restaurants.map((restaurant, index) => {
            const latitude = Number(restaurant.latitude);
            const longitude = Number(restaurant.longitude);
            const coordonneesValides =
                Number.isFinite(latitude) &&
                Number.isFinite(longitude) &&
                Math.abs(latitude) <= 90 &&
                Math.abs(longitude) <= 180;

            return {
                ...restaurant,
                distanceKm: coordonneesValides
                    ? calculerDistanceKm(
                          positionUtilisateur.latitude,
                          positionUtilisateur.longitude,
                          latitude,
                          longitude,
                      )
                    : null,
                indexOriginal: index,
            };
        });

        const possedeDistances = restaurantsAvecDistance.some(
            (restaurant) => restaurant.distanceKm !== null,
        );

        if (!possedeDistances) return restaurants;

        return restaurantsAvecDistance.sort((premier, second) => {
            if (premier.distanceKm === null) return 1;
            if (second.distanceKm === null) return -1;
            return premier.distanceKm - second.distanceKm;
        });
    }, [restaurants, positionUtilisateur]);

    const restaurantsFiltres = useMemo(() => {
        const terme = String(recherche || "").trim().toLowerCase();

        return restaurantsDisponibles.filter((restaurant) => {
            const correspondZone =
                zoneSelectionnee === "Toutes les zones" ||
                restaurant.zone?.nom === zoneSelectionnee;

            const texte = [
                restaurant.nom,
                restaurant.description,
                restaurant.type,
                restaurant.adresse,
                restaurant.services,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            const categoriesRestaurant = Array.isArray(restaurant.categories)
                ? restaurant.categories.map((categorie) =>
                      String(categorie?.nom || categorie || "").trim().toLowerCase(),
                  )
                : [];

            const correspondCategorie =
                !categorieSelectionnee ||
                categoriesRestaurant.includes(categorieSelectionnee.trim().toLowerCase());

            return correspondZone && correspondCategorie && (!terme || texte.includes(terme));
        });
    }, [restaurantsDisponibles, recherche, zoneSelectionnee, categorieSelectionnee]);

    useEffect(() => {
        if (mouvementReduit) return;

        const intervalle = window.setInterval(() => {
            setIndexBannière((index) => (index + 1) % bannières.length);
        }, 6000);

        return () => window.clearInterval(intervalle);
    }, [mouvementReduit]);

    useEffect(() => {
        setRechercheLocale(recherche);
    }, [recherche]);

    const activerLocalisation = () => {
        if (!("geolocation" in navigator)) {
            setMessageLocalisation("La géolocalisation n’est pas disponible sur cet appareil.");
            return;
        }

        setLocalisationEnCours(true);
        setMessageLocalisation("");

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setPositionUtilisateur({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
                setLocalisationEnCours(false);
                setMessageLocalisation("");
            },
            () => {
                setLocalisationEnCours(false);
                setMessageLocalisation(
                    "Autorisez la localisation dans votre navigateur pour afficher les restaurants les plus proches.",
                );
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000,
            },
        );
    };

    const allerAuxRestaurants = () => {
        document.getElementById("restaurants-populaires")?.scrollIntoView({
            behavior: mouvementReduit ? "auto" : "smooth",
            block: "start",
        });
    };

    const rechercher = (event) => {
        event.preventDefault();
        const valeur = rechercheLocale.trim();

        router.get("/accueil", valeur ? { recherche: valeur } : {}, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const ouvrirFiltres = () => {
        setZoneTemporaire(zoneSelectionnee);
        setFiltreOuvert(true);
    };

    const appliquerFiltres = () => {
        setZoneSelectionnee(zoneTemporaire);
        setFiltreOuvert(false);
    };

    const reinitialiserFiltres = () => {
        setZoneTemporaire("Toutes les zones");
        setZoneSelectionnee("Toutes les zones");
    };

    const bannière = bannières[indexBannière];

    useEffect(() => {
        if (!bannerRef.current || mouvementReduit) return;
        gsap.fromTo(bannerRef.current.querySelector(".jse-banner-image"), { opacity: 0, scale: 1.055 }, { opacity: 1, scale: 1, duration: 0.75, ease: "power2.out" });
        gsap.fromTo(bannerRef.current.querySelectorAll(".jse-banner-copy > *"), { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.48, stagger: 0.06, ease: "power3.out" });
    }, [indexBannière]);

    return (
        <main ref={pageRef} className="jse-client-home min-h-screen bg-jse-fond text-jse-texte">
            <div className="mx-auto flex min-h-screen w-full max-w-none">
                {/* Sidebar desktop */}
                <aside className="sticky top-0 hidden h-screen w-[238px] shrink-0 flex-col border-r border-jse-texte/5 bg-white/75 px-4 py-7 backdrop-blur-xl lg:flex">
                    <div className="px-4">
                        <img src="/assets/jse_logo.png" alt="JSE Express" className="h-11 w-auto object-contain" />
                    </div>

                    <div className="mt-10">
                        <p className="px-4 font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-jse-texte/30">Menu</p>
                        <nav className="mt-3 space-y-1.5">
                            {navigation.map((item) => <NavigationItem key={item.label} item={item} />)}
                        </nav>
                    </div>

                    <div className="mt-auto px-3">
                        <div className="mb-3 rounded-2xl bg-jse-fond p-3.5">
                            <div className="flex items-center gap-3">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-jse-principal font-against text-lg text-white">
                                    {(utilisateur?.prenom?.[0] || utilisateur?.nom?.[0] || "J").toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate font-sans text-xs font-semibold">{utilisateur?.prenom || utilisateur?.nom || "Client"}</p>
                                    <p className="truncate font-sans text-[10px] text-jse-texte/40">Espace client</p>
                                </div>
                            </div>
                        </div>
                        <div className="mb-2 flex items-center justify-between rounded-2xl px-3 py-2">
                            <span className="font-sans text-xs font-medium text-jse-texte/55">Thème</span>
                            <ThemeToggle compact />
                        </div>
                        <button type="button" onClick={() => router.post("/deconnexion")} className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 font-sans text-xs font-medium text-jse-texte/45 hover:bg-jse-danger/5 hover:text-jse-danger">
                            <LogOut size={17} strokeWidth={1.8} />
                            Déconnexion
                        </button>
                    </div>
                </aside>

                <div className="min-w-0 flex-1 pb-24 lg:pb-8">
                    <div className="mx-auto w-full max-w-none px-4 sm:px-7 lg:px-10">
                        {/* En-tête */}
                        <header className="jse-home-header pt-5 sm:pt-7 lg:pt-8">
                            <div className="relative flex h-11 items-center justify-between gap-3 sm:h-12">
                                <div className="flex items-center">
                                    <img src="/assets/jse_logo.png" alt="JSE Express" className="h-10 w-auto object-contain sm:h-11" />
                                </div>

                                <button
                                    type="button"
                                    onClick={activerLocalisation}
                                    disabled={localisationEnCours}
                                    className="flex h-11 min-w-0 items-center gap-2 rounded-full bg-white/75 px-4 shadow-sm ring-1 ring-jse-texte/5 transition hover:bg-white disabled:cursor-wait disabled:opacity-70 lg:bg-transparent lg:px-3 lg:shadow-none"
                                    aria-label="Utiliser ma position pour les restaurants à proximité"
                                >
                                    <MapPin size={19} strokeWidth={2.2} className={positionUtilisateur ? "text-jse-secondaire" : "text-jse-principal"} />
                                    <span className="font-sans text-sm font-semibold text-jse-principal">
                                        {localisationEnCours ? "Localisation..." : positionUtilisateur ? "À proximité" : "Adzopé"}
                                    </span>
                                    <ChevronDown size={16} strokeWidth={2.2} className="text-jse-principal/70" />
                                </button>

                                <div className="flex items-center gap-2">
                                    <button type="button" onClick={() => router.visit("/notifications")} className="relative flex size-11 items-center justify-center rounded-full bg-transparent text-jse-principal lg:bg-white lg:shadow-sm lg:ring-1 lg:ring-jse-texte/5" aria-label={`Notifications${notificationsCount > 0 ? ` : ${notificationsCount} notification${notificationsCount > 1 ? "s" : ""}` : ""}`}>
                                        <Bell size={26} strokeWidth={1.8} />
                                        {notificationsCount > 0 && (
                                            <span className="absolute -right-1 -top-1 flex min-w-5 h-5 items-center justify-center rounded-full bg-jse-accent px-1 font-sans text-[9px] font-bold text-white">
                                                {notificationsCount > 9 ? "9+" : notificationsCount}
                                            </span>
                                        )}
                                    </button>
                                    <button type="button" onClick={() => router.visit("/panier")} className="relative flex size-11 items-center justify-center rounded-full bg-white text-jse-principal shadow-sm ring-1 ring-jse-texte/5" aria-label="Panier">
                                        <ShoppingBag size={19} strokeWidth={1.8} />
                                        {nombreArticles > 0 && <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-jse-accent font-sans text-[9px] font-bold text-white">{nombreArticles > 9 ? "9+" : nombreArticles}</span>}
                                    </button>
                                </div>
                            </div>

                            <div className="jse-home-greeting mt-8 lg:mt-10">
                                <p className="font-against text-[2.7rem] leading-[0.9] text-jse-principal sm:text-[3.4rem] lg:text-[4rem]">Bonjour !</p>
                                <p className="mt-2 font-sans text-[1.15rem] leading-tight text-jse-texte/70 sm:text-xl lg:text-2xl">
                                    Qu’est-ce qu’on vous sert aujourd’hui ?
                                </p>
                            </div>

                            <form ref={searchRef} onSubmit={rechercher} className="mt-6 lg:mt-7">
                                <div className="flex h-[58px] items-center gap-3 rounded-[24px] bg-white px-5 shadow-sm ring-1 ring-jse-texte/5 focus-within:ring-jse-secondaire/30 lg:h-[62px]">
                                    <Search size={25} strokeWidth={1.8} className="shrink-0 text-jse-principal" />
                                    <input
                                        type="search"
                                        value={rechercheLocale}
                                        onChange={(event) => setRechercheLocale(event.target.value)}
                                        placeholder="Rechercher un restaurant, un plat..."
                                        className="min-w-0 flex-1 bg-transparent font-sans text-base outline-none placeholder:text-jse-texte/55"
                                        aria-label="Rechercher un restaurant ou un plat"
                                    />
                                    <button
                                        type="button"
                                        onClick={ouvrirFiltres}
                                        className={[
                                            "flex size-10 shrink-0 items-center justify-center border-l border-jse-texte/10 pl-3 transition-colors",
                                            zoneSelectionnee !== "Toutes les zones"
                                                ? "text-jse-accent"
                                                : "text-jse-principal",
                                        ].join(" ")}
                                        aria-label="Ouvrir les filtres"
                                    >
                                        <SlidersHorizontal size={22} strokeWidth={1.8} />
                                    </button>
                                </div>
                            </form>
                        </header>

                        {/* Raccourcis de l'accueil */}
                        <section ref={categoriesRef} className="pt-7 sm:pt-8 lg:pt-9">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="font-against text-[1.65rem] leading-none text-jse-principal sm:text-2xl">Catégories</h2>
                            </div>

                            <div className="scrollbar-none -mx-4 flex gap-2.5 overflow-x-auto px-4 pb-3 pt-1 sm:-mx-7 sm:gap-3 sm:px-7 lg:mx-0 lg:px-0">
                                {categoriesDisponibles.length > 0 ? (
                                    categoriesDisponibles.map((nomCategorie, index) => (
                                        <button
                                            key={nomCategorie}
                                            type="button"
                                            onClick={() => {
                                                setCategorieSelectionnee((actuelle) =>
                                                    actuelle === nomCategorie ? "" : nomCategorie,
                                                );
                                                window.setTimeout(allerAuxRestaurants, 50);
                                            }}
                                            className={[
                                                "jse-category-card group w-[88px] shrink-0 rounded-[22px] bg-white p-2 text-center shadow-[0_10px_30px_rgba(18,60,50,0.06)] ring-1 ring-jse-texte/5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(18,60,50,0.10)] sm:w-[104px] sm:p-3 lg:w-[120px] lg:p-3.5",
                                                categorieSelectionnee === nomCategorie ? "ring-2 ring-jse-secondaire" : "hover:-translate-y-0.5 hover:shadow-md",
                                            ].join(" ")}
                                        >
                                            <div className="aspect-square overflow-hidden rounded-[18px] bg-jse-fond">
                                                <img
                                                    src={obtenirImageCategorie(index)}
                                                    alt={nomCategorie}
                                                    loading="lazy"
                                                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                                />
                                            </div>
                                            <p className="mt-2 truncate font-sans text-xs font-semibold text-jse-texte">
                                                {nomCategorie}
                                            </p>
                                        </button>
                                    ))
                                ) : (
                                    <div className="w-full rounded-[22px] bg-white p-5 text-center ring-1 ring-jse-texte/5">
                                        <p className="font-sans text-xs text-jse-texte/55">
                                            Aucune catégorie disponible pour les restaurants actuellement proposés.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Bannière */}
                        <section ref={bannerRef} className="pt-7 sm:pt-8 lg:pt-9" aria-label="À la une">
                            <div className="jse-dark-surface relative min-h-[220px] overflow-hidden rounded-[28px] bg-jse-principal shadow-lg shadow-jse-principal/10 sm:min-h-[250px] lg:min-h-[285px]">
                                <img
                                    src={bannière.image}
                                    alt=""
                                    className="jse-banner-image absolute inset-0 h-full w-full object-cover will-change-transform"
                                    onError={(event) => {
                                        if (event.currentTarget.src.endsWith(IMAGE_BANNIERE_SECOURS)) return;
                                        event.currentTarget.src = IMAGE_BANNIERE_SECOURS;
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-jse-principal via-jse-principal/80 to-jse-principal/10" />

                                <div className="jse-banner-copy relative z-10 flex min-h-[220px] max-w-[560px] flex-col justify-center px-5 pb-12 pt-6 sm:min-h-[250px] sm:px-8 lg:min-h-[285px] lg:px-10">
                                    <span className="font-sans text-xs font-bold uppercase tracking-[0.16em] text-jse-secondaire">{bannière.label}</span>
                                    <h2 className="mt-2 max-w-[440px] font-against text-[1.9rem] leading-[1.02] text-white sm:text-[2.25rem] lg:text-[2.7rem]">{bannière.titre}</h2>
                                    <p className="mt-2 max-w-[360px] font-sans text-sm leading-6 text-white/80">{bannière.description}</p>
                                    <button
                                        type="button"
                                        onClick={allerAuxRestaurants}
                                        className="mt-5 flex h-12 w-fit items-center gap-2 rounded-full bg-jse-accent px-6 font-sans text-sm font-semibold text-white shadow-md transition hover:brightness-105 active:scale-[0.98]"
                                    >
                                        Voir les restaurants
                                        <ChevronRight size={16} />
                                    </button>
                                </div>

                                <div className="absolute bottom-3 left-5 z-10 flex items-center gap-1 sm:left-8 lg:left-10" role="group" aria-label="Choisir une bannière">
                                    {bannières.map((item, index) => (
                                        <button
                                            key={item.label}
                                            type="button"
                                            onClick={() => setIndexBannière(index)}
                                            aria-label={`Bannière ${index + 1} sur ${bannières.length}`}
                                            aria-current={index === indexBannière}
                                            className="flex size-6 items-center justify-center"
                                        >
                                            <span className={["h-1.5 rounded-full transition-all", index === indexBannière ? "w-6 bg-jse-secondaire" : "w-1.5 bg-white/50"].join(" ")} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Restaurants */}
                        <section ref={restaurantsRef} id="restaurants-populaires" className="scroll-mt-6 pt-8 sm:pt-9 lg:pt-10" aria-labelledby="titre-restaurants">
                            <div className="mb-4 flex items-end justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-sans text-xs font-medium uppercase tracking-[0.12em] text-jse-texte/55">
                                            {positionUtilisateur ? "Triés par proximité" : "À proximité"}
                                        </p>
                                        {positionUtilisateur && (
                                            <span className="rounded-full bg-jse-secondaire/10 px-2 py-1 font-sans text-xs font-semibold text-jse-principal">
                                                Position active
                                            </span>
                                        )}
                                    </div>
                                    <h2 id="titre-restaurants" className="mt-1 font-against text-[1.65rem] leading-none text-jse-principal sm:text-2xl">Restaurants populaires</h2>
                                </div>
                                <p className="shrink-0 font-sans text-sm text-jse-texte/60" aria-live="polite">
                                    {restaurantsFiltres.length} restaurant{restaurantsFiltres.length > 1 ? "s" : ""}
                                </p>
                            </div>

                            {(zoneSelectionnee !== "Toutes les zones" || categorieSelectionnee) && (
                                <div className="mb-4 flex flex-wrap gap-2">
                                    {zoneSelectionnee !== "Toutes les zones" && (
                                        <button type="button" onClick={reinitialiserFiltres} className="flex h-9 items-center gap-2 rounded-full bg-jse-principal px-4 font-sans text-xs font-semibold text-white">
                                            {zoneSelectionnee}
                                            <X size={14} aria-label="Retirer le filtre de zone" />
                                        </button>
                                    )}
                                    {categorieSelectionnee && (
                                        <button type="button" onClick={() => setCategorieSelectionnee("")} className="flex h-9 items-center gap-2 rounded-full bg-jse-principal px-4 font-sans text-xs font-semibold text-white">
                                            {categorieSelectionnee}
                                            <X size={14} aria-label="Retirer le filtre de catégorie" />
                                        </button>
                                    )}
                                </div>
                            )}

                            {restaurantsFiltres.length > 0 ? (
                                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                    {restaurantsFiltres.map((restaurant, index) => {
                                        const lienValide = Number.isInteger(Number(restaurant.id));
                                        const Conteneur = lienValide ? Link : "div";
                                        const favori = estRestaurantFavori(restaurant);

                                        return (
                                            <article
                                                key={restaurant.id}
                                                className="jse-restaurant-card group relative overflow-hidden rounded-3xl bg-white shadow-jse-carte ring-1 ring-jse-texte/5 transition duration-300 hover:-translate-y-1 hover:shadow-jse-elevated"
                                            >
                                                <Conteneur {...(lienValide ? { href: `/restaurants/${restaurant.id}` } : {})} className="block">
                                                    <div className="relative aspect-[16/10] overflow-hidden bg-jse-principal">
                                                        <img
                                                            src={obtenirImageRestaurant(restaurant, index)}
                                                            alt=""
                                                            loading={index < 2 ? "eager" : "lazy"}
                                                            onError={(event) => {
                                                                event.currentTarget.onerror = null;
                                                                event.currentTarget.src = obtenirSecoursImageRestaurant(restaurant, index);
                                                            }}
                                                            className="size-full object-cover transition duration-500 group-hover:scale-105"
                                                        />
                                                    </div>

                                                    <div className="p-4">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <h3 className="line-clamp-2 font-sans text-base font-semibold text-jse-texte">{restaurant.nom}</h3>
                                                            {restaurant.note !== null && restaurant.note !== undefined && (
                                                                <span className="shrink-0 rounded-full bg-jse-fond px-2.5 py-1 font-sans text-xs font-bold text-jse-principal">★ {Number(restaurant.note).toFixed(1)}</span>
                                                            )}
                                                        </div>
                                                        <p className="mt-1 line-clamp-1 font-sans text-xs text-jse-texte/60">
                                                            {restaurant.type || restaurant.description || "Restaurant"}
                                                            {restaurant.avis > 0 ? ` · ${restaurant.avis} avis` : " · Aucun avis"}
                                                        </p>
                                                        <div className="mt-3 flex items-start gap-2 font-sans text-xs leading-5 text-jse-texte/65">
                                                            <MapPin size={14} className="mt-0.5 shrink-0 text-jse-secondaire" aria-hidden="true" />
                                                            <span className="line-clamp-2">{restaurant.adresse || restaurant.zone?.nom || "Adzopé"}</span>
                                                        </div>
                                                        {positionUtilisateur && restaurant.distanceKm !== null && restaurant.distanceKm !== undefined && (
                                                            <p className="mt-2 font-sans text-xs font-semibold text-jse-principal">
                                                                {restaurant.distanceKm < 1 ? Math.round(restaurant.distanceKm * 1000) + " m" : restaurant.distanceKm.toFixed(1) + " km"} de vous
                                                            </p>
                                                        )}
                                                        {restaurant.services && (
                                                            <p className="mt-2 line-clamp-1 font-sans text-xs text-jse-texte/55">{restaurant.services}</p>
                                                        )}
                                                    </div>
                                                </Conteneur>

                                                <button
                                                    type="button"
                                                    onClick={() => basculerFavoriRestaurant(restaurant)}
                                                    aria-pressed={favori}
                                                    className="jse-favorite-button absolute right-3 top-3 flex size-11 items-center justify-center rounded-full bg-white/95 shadow-md ring-1 ring-black/5 transition active:scale-90"
                                                    aria-label={favori ? `Retirer ${restaurant.nom} des favoris` : `Ajouter ${restaurant.nom} aux favoris`}
                                                >
                                                    <Heart
                                                        size={18}
                                                        strokeWidth={1.8}
                                                        className={favori ? "text-jse-accent" : "text-jse-principal"}
                                                        fill={favori ? "currentColor" : "none"}
                                                    />
                                                </button>
                                            </article>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="rounded-3xl border border-dashed border-jse-texte/15 bg-white/60 px-5 py-10 text-center">
                                    <ShoppingBag size={24} className="mx-auto text-jse-secondaire" aria-hidden="true" />
                                    <h3 className="mt-3 font-against text-xl text-jse-principal">{recherche || zoneSelectionnee !== "Toutes les zones" || categorieSelectionnee ? "Aucun restaurant trouvé" : "Aucun restaurant disponible"}</h3>
                                    <p className="mx-auto mt-2 max-w-[300px] font-sans text-sm leading-6 text-jse-texte/60">{recherche || zoneSelectionnee !== "Toutes les zones" || categorieSelectionnee ? "Essayez un autre filtre ou une autre recherche." : "Les restaurants actifs apparaîtront ici dès qu’ils seront disponibles."}</p>
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </div>

            {/* Panneau de filtres */}
            {filtreOuvert && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-jse-principal/20 p-0 backdrop-blur-[2px] sm:items-center sm:p-5" onClick={() => setFiltreOuvert(false)}>
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="titre-filtres"
                        className="w-full max-w-md rounded-t-[30px] bg-white p-5 shadow-2xl sm:rounded-[30px]"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.15em] text-jse-texte/35">Recherche</p>
                                <h2 id="titre-filtres" className="mt-1 font-against text-2xl text-jse-principal">Filtrer les restaurants</h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setFiltreOuvert(false)}
                                className="flex size-10 items-center justify-center rounded-full bg-jse-fond text-jse-principal"
                                aria-label="Fermer les filtres"
                            >
                                <X size={19} />
                            </button>
                        </div>

                        <div className="mt-6">
                            <p className="font-sans text-xs font-semibold text-jse-texte">Zone de livraison</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {zones.map((zone) => (
                                    <button
                                        key={zone}
                                        type="button"
                                        onClick={() => setZoneTemporaire(zone)}
                                        className={[
                                            "rounded-full px-4 py-2.5 font-sans text-xs font-semibold transition-all",
                                            zoneTemporaire === zone
                                                ? "bg-jse-principal text-white shadow-sm"
                                                : "bg-jse-fond text-jse-texte/65 ring-1 ring-jse-texte/5",
                                        ].join(" ")}
                                    >
                                        {zone}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mt-7 flex gap-3">
                            <button
                                type="button"
                                onClick={reinitialiserFiltres}
                                className="flex-1 rounded-full border border-jse-principal/15 px-4 py-3 font-sans text-xs font-semibold text-jse-principal"
                            >
                                Réinitialiser
                            </button>
                            <button
                                type="button"
                                onClick={appliquerFiltres}
                                className="flex-1 rounded-full bg-jse-accent px-4 py-3 font-sans text-xs font-semibold text-white shadow-sm"
                            >
                                Appliquer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom bar mobile */}
            <NavigationFlottante type="client" actif="accueil" />
        </main>
    );
}

import { router, usePage } from "@inertiajs/react";
import {
    Bell,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Heart,
    Home,
    LogOut,
    MapPin,
    Menu,
    Search,
    Settings,
    ShoppingBag,
    UserRound,
    X,
} from "lucide-react";
import { useEffect, useState } from "react";

const bannières = [
    {
        image: "/assets/banner-plat-ivoirien.jpg",
        label: "À découvrir",
        titre: "Des saveurs près de chez vous",
        description: "Commandez vos plats préférés à Adzopé.",
    },
    {
        image: "/assets/banner-livraison.jpg",
        label: "JSE Express",
        titre: "Vos plats préférés, livrés à Adzopé",
        description: "Commandez simplement auprès de vos restaurants locaux.",
    },
    {
        image: "/assets/banner-restaurants.jpg",
        label: "Restaurants locaux",
        titre: "Découvrez les restaurants d'Adzopé",
        description: "Explorez les établissements disponibles près de chez vous.",
    },
    {
        image: "/assets/banner-commande-simple.jpg",
        label: "Simple et pratique",
        titre: "Commandez sans vous déplacer",
        description: "Quelques étapes suffisent pour préparer votre commande.",
    },
    {
        image: "/assets/banner-decouverte.jpg",
        label: "À découvrir",
        titre: "Variez les plaisirs",
        description: "Trouvez différentes propositions au même endroit.",
    },
];

const imagesFallback = [
    "/assets/hero_icon/fast_food.jpeg",
    "/assets/hero_icon/glacier.jpeg",
    "/assets/hero_icon/promo.jpeg",
    "/assets/hero_icon/resto.jpeg",
];

const navigation = [
    { label: "Accueil", icon: Home, active: true },
    { label: "Commandes", icon: ShoppingBag },
    { label: "Favoris", icon: Heart },
    { label: "Profil", icon: UserRound },
];

function NavigationItem({ item, compact = false }) {
    const Icon = item.icon;

    return (
        <button
            type="button"
            disabled={!item.active}
            title={item.active ? item.label : `${item.label} — disponible prochainement`}
            className={[
                "group flex items-center transition-all",
                compact
                    ? "min-w-[68px] flex-col justify-center gap-1 rounded-2xl px-3 py-2"
                    : "w-full gap-3 rounded-2xl px-4 py-3.5 text-left",
                item.active
                    ? "bg-jse-secondaire/10 text-jse-principal"
                    : "text-jse-texte/45 hover:bg-jse-fond hover:text-jse-principal disabled:cursor-default",
            ].join(" ")}
        >
            <Icon
                size={compact ? 21 : 19}
                strokeWidth={item.active ? 2.2 : 1.8}
                className={item.active ? "text-jse-principal" : ""}
            />
            <span
                className={
                    compact
                        ? "font-sans text-[10px] font-semibold"
                        : "font-sans text-sm font-medium"
                }
            >
                {item.label}
            </span>
        </button>
    );
}

export default function Accueil() {
    const {
        auth,
        categories = [],
        restaurants = [],
        panier = {},
        recherche = "",
    } = usePage().props;

    const utilisateur = auth?.user ?? null;
    const [indexBannière, setIndexBannière] = useState(0);
    const [rechercheLocale, setRechercheLocale] = useState(recherche);
    const [menuMobileOuvert, setMenuMobileOuvert] = useState(false);
    const nombreArticles = Number(panier?.nombre_articles ?? 0);

    useEffect(() => {
        const intervalle = window.setInterval(() => {
            setIndexBannière((index) => (index + 1) % bannières.length);
        }, 5000);

        return () => window.clearInterval(intervalle);
    }, []);

    useEffect(() => {
        setRechercheLocale(recherche);
    }, [recherche]);

    const rechercher = (event) => {
        event.preventDefault();

        const valeur = rechercheLocale.trim();

        router.get("/accueil", valeur ? { recherche: valeur } : {}, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const déconnexion = () => router.post("/deconnexion");

    const bannière = bannières[indexBannière];

    return (
        <main className="min-h-screen bg-jse-fond text-jse-texte">
            {/* Navigation mobile */}
            <div
                className={[
                    "fixed inset-0 z-50 lg:hidden",
                    menuMobileOuvert ? "pointer-events-auto" : "pointer-events-none",
                ].join(" ")}
            >
                <button
                    type="button"
                    onClick={() => setMenuMobileOuvert(false)}
                    aria-label="Fermer le menu"
                    className={[
                        "absolute inset-0 bg-jse-principal/30 backdrop-blur-sm transition-opacity",
                        menuMobileOuvert ? "opacity-100" : "opacity-0",
                    ].join(" ")}
                />

                <aside
                    className={[
                        "absolute left-0 top-0 flex h-full w-[280px] flex-col bg-white p-5 shadow-2xl transition-transform duration-300",
                        menuMobileOuvert ? "translate-x-0" : "-translate-x-full",
                    ].join(" ")}
                >
                    <div className="flex items-center justify-between">
                        <img
                            src="/assets/jse_logo.png"
                            alt="JSE Express"
                            className="h-11 w-auto object-contain"
                        />
                        <button
                            type="button"
                            onClick={() => setMenuMobileOuvert(false)}
                            className="flex size-10 items-center justify-center rounded-full bg-jse-fond text-jse-texte/60"
                            aria-label="Fermer"
                        >
                            <X size={19} />
                        </button>
                    </div>

                    <div className="mt-8 space-y-2">
                        {navigation.map((item) => (
                            <NavigationItem key={item.label} item={item} />
                        ))}
                    </div>

                    <div className="mt-auto space-y-2 border-t border-jse-texte/5 pt-4">
                        <button
                            type="button"
                            disabled
                            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-jse-texte/45"
                        >
                            <Settings size={19} strokeWidth={1.8} />
                            <span className="font-sans text-sm font-medium">
                                Paramètres
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={déconnexion}
                            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-jse-texte/55 transition hover:bg-red-50 hover:text-red-600"
                        >
                            <LogOut size={19} strokeWidth={1.8} />
                            <span className="font-sans text-sm font-medium">
                                Déconnexion
                            </span>
                        </button>
                    </div>
                </aside>
            </div>

            <div className="mx-auto flex min-h-screen w-full max-w-[1600px]">
                {/* Sidebar desktop */}
                <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col border-r border-jse-texte/5 bg-white/70 px-5 py-7 backdrop-blur-xl lg:flex xl:w-[270px]">
                    <div className="px-3">
                        <img
                            src="/assets/jse_logo.png"
                            alt="JSE Express"
                            className="h-12 w-auto object-contain"
                        />
                    </div>

                    <div className="mt-10">
                        <p className="px-4 font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-jse-texte/30">
                            Navigation
                        </p>

                        <nav className="mt-3 space-y-1.5">
                            {navigation.map((item) => (
                                <NavigationItem key={item.label} item={item} />
                            ))}
                        </nav>
                    </div>

                    <div className="mt-auto">
                        <div className="mb-3 rounded-2xl bg-jse-fond p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-jse-principal font-against text-lg text-white">
                                    {(utilisateur?.prenom?.[0] || utilisateur?.nom?.[0] || "J").toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate font-sans text-sm font-semibold text-jse-texte">
                                        {utilisateur?.prenom || utilisateur?.nom || "Client"}
                                    </p>
                                    <p className="truncate font-sans text-[10px] text-jse-texte/40">
                                        Espace client
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={déconnexion}
                            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-jse-texte/50 transition hover:bg-red-50 hover:text-red-600"
                        >
                            <LogOut size={18} strokeWidth={1.8} />
                            <span className="font-sans text-sm font-medium">
                                Déconnexion
                            </span>
                        </button>
                    </div>
                </aside>

                {/* Contenu principal */}
                <div className="min-w-0 flex-1 pb-28 lg:pb-10">
                    <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-7 lg:px-10 xl:px-12">
                        {/* Header */}
                        <header className="py-5 sm:py-7 lg:py-8">
                            <div className="flex items-center justify-between gap-4">
                                <button
                                    type="button"
                                    onClick={() => setMenuMobileOuvert(true)}
                                    className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-jse-texte/5 lg:hidden"
                                    aria-label="Ouvrir le menu"
                                >
                                    <Menu size={20} strokeWidth={1.8} />
                                </button>

                                <div className="hidden items-center gap-2 lg:flex">
                                    <div className="flex size-10 items-center justify-center rounded-full bg-jse-secondaire/10">
                                        <MapPin
                                            size={18}
                                            strokeWidth={2}
                                            className="text-jse-secondaire"
                                        />
                                    </div>
                                    <div>
                                        <p className="font-sans text-[10px] font-medium uppercase tracking-[0.12em] text-jse-texte/35">
                                            Votre localisation
                                        </p>
                                        <div className="flex items-center gap-1">
                                            <span className="font-sans text-sm font-semibold text-jse-texte">
                                                Adzopé
                                            </span>
                                            <ChevronDown size={14} className="text-jse-texte/35" />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setMenuMobileOuvert(true)}
                                    className="lg:hidden"
                                    aria-label="Accueil JSE Express"
                                >
                                    <img
                                        src="/assets/jse_logo.png"
                                        alt="JSE Express"
                                        className="h-10 w-auto object-contain"
                                    />
                                </button>

                                <div className="flex items-center gap-2">
                                    <div className="hidden min-w-0 max-w-[460px] flex-1 xl:block">
                                        <form onSubmit={rechercher}>
                                            <div className="flex h-12 items-center gap-3 rounded-2xl bg-white px-4 shadow-sm ring-1 ring-jse-texte/5 focus-within:ring-jse-secondaire/30">
                                                <Search
                                                    size={19}
                                                    strokeWidth={1.8}
                                                    className="shrink-0 text-jse-texte/35"
                                                />
                                                <input
                                                    type="search"
                                                    value={rechercheLocale}
                                                    onChange={(event) =>
                                                        setRechercheLocale(event.target.value)
                                                    }
                                                    placeholder="Rechercher un restaurant, un plat..."
                                                    className="min-w-0 flex-1 bg-transparent font-sans text-sm outline-none placeholder:text-jse-texte/35"
                                                    aria-label="Rechercher un restaurant ou un plat"
                                                />
                                            </div>
                                        </form>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => window.alert("Vos notifications seront disponibles ici.")}
                                        className="relative flex size-11 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-jse-texte/5"
                                        aria-label="Notifications"
                                    >
                                        <Bell
                                            size={19}
                                            strokeWidth={1.8}
                                            className="text-jse-texte/65"
                                        />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => window.alert("Votre panier sera accessible ici.")}
                                        className="relative flex size-11 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-jse-texte/5"
                                        aria-label="Panier"
                                    >
                                        <ShoppingBag
                                            size={19}
                                            strokeWidth={1.8}
                                            className="text-jse-texte/65"
                                        />
                                        {nombreArticles > 0 && (
                                            <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-jse-accent font-sans text-[9px] font-bold text-white">
                                                {nombreArticles > 9 ? "9+" : nombreArticles}
                                            </span>
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setMenuMobileOuvert(true)}
                                        className="hidden size-11 items-center justify-center rounded-2xl bg-jse-principal text-white lg:flex xl:hidden"
                                        aria-label="Menu"
                                    >
                                        <Menu size={19} />
                                    </button>
                                </div>
                            </div>

                            {/* Recherche mobile/tablette */}
                            <form onSubmit={rechercher} className="mt-5 xl:hidden">
                                <div className="flex h-14 items-center gap-3 rounded-2xl bg-white px-4 shadow-sm ring-1 ring-jse-texte/5 focus-within:ring-jse-secondaire/30">
                                    <Search
                                        size={20}
                                        strokeWidth={1.8}
                                        className="shrink-0 text-jse-texte/40"
                                    />
                                    <input
                                        type="search"
                                        value={rechercheLocale}
                                        onChange={(event) =>
                                            setRechercheLocale(event.target.value)
                                        }
                                        placeholder="Rechercher un restaurant, un plat..."
                                        className="min-w-0 flex-1 bg-transparent font-sans text-sm outline-none placeholder:text-jse-texte/35"
                                        aria-label="Rechercher un restaurant ou un plat"
                                    />
                                    <button
                                        type="submit"
                                        className="hidden rounded-xl bg-jse-principal px-4 py-2 font-sans text-xs font-semibold text-white sm:block"
                                    >
                                        Rechercher
                                    </button>
                                </div>
                            </form>

                            {/* Bloc de bienvenue */}
                            <div className="mt-7 flex items-end justify-between gap-5 lg:mt-10">
                                <div>
                                    <p className="font-sans text-sm text-jse-texte/55">
                                        Bonjour !
                                    </p>
                                    <h1 className="mt-1 max-w-[720px] font-against text-[2.5rem] leading-[0.98] text-jse-principal sm:text-[3.15rem] lg:text-[4rem]">
                                        Qu’est-ce qu’on vous sert aujourd’hui ?
                                    </h1>
                                </div>

                                <div className="hidden shrink-0 rounded-2xl bg-jse-secondaire/10 px-4 py-3 lg:block">
                                    <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-jse-secondaire">
                                        À Adzopé
                                    </p>
                                    <p className="mt-0.5 font-sans text-xs text-jse-principal">
                                        Des saveurs près de chez vous
                                    </p>
                                </div>
                            </div>
                        </header>

                        {/* Catégories */}
                        <section className="pt-2 lg:pt-4">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="font-against text-2xl text-jse-principal sm:text-3xl">
                                    Catégories
                                </h2>
                                {categories.length > 4 && (
                                    <button
                                        type="button"
                                        disabled
                                        className="font-sans text-xs font-semibold text-jse-secondaire"
                                    >
                                        Voir tout
                                    </button>
                                )}
                            </div>

                            <div className="scrollbar-none grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5">
                                {categories.length > 0 ? (
                                    categories.map((categorie, index) => (
                                        <button
                                            key={categorie.id}
                                            type="button"
                                            disabled
                                            className="group rounded-[24px] bg-white p-3 text-left shadow-sm ring-1 ring-jse-texte/5 transition lg:p-4"
                                        >
                                            <div className="aspect-square overflow-hidden rounded-[20px] bg-jse-fond">
                                                <img
                                                    src={
                                                        categorie.image ||
                                                        imagesFallback[index % imagesFallback.length]
                                                    }
                                                    alt={categorie.nom}
                                                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                                />
                                            </div>
                                            <p className="mt-3 truncate text-center font-sans text-xs font-semibold text-jse-texte sm:text-sm">
                                                {categorie.nom}
                                            </p>
                                        </button>
                                    ))
                                ) : (
                                    <p className="font-sans text-xs text-jse-texte/45">
                                        Aucune catégorie disponible pour le moment.
                                    </p>
                                )}
                            </div>
                        </section>

                        {/* Bannière */}
                        <section className="pt-7 sm:pt-8 lg:pt-10">
                            <div className="relative min-h-[235px] overflow-hidden rounded-[28px] bg-jse-principal shadow-xl shadow-jse-principal/10 sm:min-h-[270px] lg:min-h-[320px] lg:rounded-[32px]">
                                <img
                                    src={bannière.image}
                                    alt=""
                                    className="absolute inset-0 h-full w-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-jse-principal via-jse-principal/70 to-jse-principal/5" />

                                <div className="relative z-10 flex min-h-[235px] max-w-[620px] flex-col justify-center px-6 py-7 sm:min-h-[270px] sm:px-9 lg:min-h-[320px] lg:px-12">
                                    <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-jse-secondaire sm:text-xs">
                                        {bannière.label}
                                    </span>
                                    <h2 className="mt-2 max-w-[500px] font-against text-[2rem] leading-[1.02] text-white sm:text-[2.6rem] lg:text-[3.25rem]">
                                        {bannière.titre}
                                    </h2>
                                    <p className="mt-3 max-w-[410px] font-sans text-xs leading-5 text-white/75 sm:text-sm">
                                        {bannière.description}
                                    </p>
                                    <button
                                        type="button"
                                        disabled
                                        className="mt-5 flex w-fit items-center gap-3 rounded-full bg-jse-accent px-5 py-3 font-sans text-xs font-semibold text-white shadow-lg shadow-jse-accent/20 sm:px-6 sm:py-3.5"
                                    >
                                        Commander maintenant
                                        <ChevronRight size={17} />
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setIndexBannière(
                                            (indexBannière - 1 + bannières.length) %
                                                bannières.length,
                                        )
                                    }
                                    className="absolute left-3 top-1/2 z-20 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md lg:left-5"
                                    aria-label="Bannière précédente"
                                >
                                    <ChevronLeft size={17} />
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setIndexBannière(
                                            (indexBannière + 1) % bannières.length,
                                        )
                                    }
                                    className="absolute right-3 top-1/2 z-20 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md lg:right-5"
                                    aria-label="Bannière suivante"
                                >
                                    <ChevronRight size={17} />
                                </button>

                                <div className="absolute bottom-5 left-6 z-20 flex gap-1.5 sm:left-9 lg:left-12">
                                    {bannières.map((_, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => setIndexBannière(index)}
                                            className={
                                                index === indexBannière
                                                    ? "h-1.5 w-7 rounded-full bg-white transition-all"
                                                    : "h-1.5 w-1.5 rounded-full bg-white/45 transition-all"
                                            }
                                            aria-label={`Afficher la bannière ${index + 1}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Restaurants */}
                        <section className="pb-8 pt-9 sm:pt-10 lg:pt-12">
                            <div className="mb-5 flex items-end justify-between gap-4">
                                <div>
                                    <p className="font-sans text-xs font-medium text-jse-texte/40">
                                        À proximité
                                    </p>
                                    <h2 className="mt-1 font-against text-2xl text-jse-principal sm:text-3xl">
                                        Restaurants populaires
                                    </h2>
                                </div>

                                <button
                                    type="button"
                                    disabled
                                    className="hidden items-center gap-1 pb-1 font-sans text-xs font-semibold text-jse-secondaire sm:flex"
                                >
                                    Voir tout
                                    <ChevronRight size={15} />
                                </button>
                            </div>

                            {restaurants.length > 0 ? (
                                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                    {restaurants.map((restaurant, index) => (
                                        <article
                                            key={restaurant.id}
                                            className="overflow-hidden rounded-[24px] bg-white shadow-sm ring-1 ring-jse-texte/5 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-jse-principal/5"
                                        >
                                            <div className="relative aspect-[1.45/1] overflow-hidden bg-jse-principal">
                                                <img
                                                    src={imagesFallback[index % imagesFallback.length]}
                                                    alt=""
                                                    className="h-full w-full object-cover transition duration-500 hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                                                <div className="absolute bottom-3 left-4 right-4">
                                                    <h3 className="font-against text-[1.65rem] leading-none text-white">
                                                        {restaurant.nom}
                                                    </h3>
                                                </div>
                                            </div>

                                            <div className="p-4">
                                                <p className="line-clamp-2 min-h-[40px] font-sans text-xs leading-5 text-jse-texte/50">
                                                    {restaurant.description ||
                                                        "Restaurant disponible sur JSE Express."}
                                                </p>

                                                <div className="mt-4 flex items-center gap-2 border-t border-jse-texte/5 pt-3">
                                                    <span className="flex items-center gap-1 font-sans text-[11px] font-medium text-jse-texte/55">
                                                        <MapPin
                                                            size={13}
                                                            className="text-jse-secondaire"
                                                        />
                                                        {restaurant.zone?.nom ||
                                                            restaurant.adresse ||
                                                            "Adzopé"}
                                                    </span>

                                                    <span className="ml-auto font-sans text-[10px] font-semibold text-jse-secondaire">
                                                        Disponible
                                                    </span>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-[24px] border border-dashed border-jse-texte/10 bg-white/50 px-5 py-10 text-center">
                                    <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-jse-secondaire/10">
                                        <ShoppingBag
                                            size={21}
                                            className="text-jse-secondaire"
                                        />
                                    </div>
                                    <h3 className="mt-4 font-against text-xl text-jse-principal">
                                        {recherche
                                            ? "Aucun restaurant trouvé"
                                            : "Aucun restaurant disponible"}
                                    </h3>
                                    <p className="mx-auto mt-2 max-w-[300px] font-sans text-xs leading-5 text-jse-texte/45">
                                        {recherche
                                            ? "Essayez une autre recherche."
                                            : "Les restaurants actifs apparaîtront ici dès qu'ils seront disponibles."}
                                    </p>
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </div>

            {/* Bottom navigation mobile */}
            <nav className="fixed inset-x-0 bottom-0 z-40 px-4 pb-4 lg:hidden">
                <div className="mx-auto flex h-[70px] w-full max-w-md items-center justify-around rounded-[25px] border border-white/80 bg-white/95 px-1 shadow-xl shadow-jse-principal/10 backdrop-blur-xl">
                    {navigation.map((item) => (
                        <NavigationItem key={item.label} item={item} compact />
                    ))}
                </div>
            </nav>
        </main>
    );
}

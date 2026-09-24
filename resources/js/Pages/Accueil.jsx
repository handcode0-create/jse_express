import { router, usePage } from "@inertiajs/react";
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
} from "lucide-react";
import { useEffect, useState } from "react";

const bannières = [
    {
        image: "/assets/banner-plat-ivoirien.jpg",
        label: "JSE EXPRESS",
        titre: "Des saveurs près de chez vous",
        description: "Commandez vos plats préférés à Adzopé",
    },
    {
        image: "/assets/banner-livraison.jpg",
        label: "LIVRAISON",
        titre: "Vos plats préférés, livrés à Adzopé",
        description: "Commandez simplement auprès de vos restaurants locaux.",
    },
    {
        image: "/assets/banner-restaurants.jpg",
        label: "RESTAURANTS LOCAUX",
        titre: "Découvrez les restaurants d'Adzopé",
        description: "Explorez les établissements disponibles près de chez vous.",
    },
    {
        image: "/assets/banner-commande-simple.jpg",
        label: "SIMPLE ET PRATIQUE",
        titre: "Commandez sans vous déplacer",
        description: "Quelques étapes suffisent pour préparer votre commande.",
    },
    {
        image: "/assets/banner-decouverte.jpg",
        label: "À DÉCOUVRIR",
        titre: "Variez les plaisirs",
        description: "Trouvez différentes propositions au même endroit.",
    },
];

const imagesFallback = [
    "/assets/hero_icon/resto.jpeg",
    "/assets/hero_icon/fast_food.jpeg",
    "/assets/hero_icon/glacier.jpeg",
    "/assets/hero_icon/promo.jpeg",
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
        categories = [],
        restaurants = [],
        panier = {},
        recherche = "",
    } = usePage().props;

    const utilisateur = auth?.user ?? null;
    const [indexBannière, setIndexBannière] = useState(0);
    const [rechercheLocale, setRechercheLocale] = useState(recherche);
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

    const bannière = bannières[indexBannière];

    return (
        <main className="min-h-screen bg-jse-fond text-jse-texte">
            {

            <div className="mx-auto flex min-h-screen w-full max-w-[1440px]">
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
                        <button type="button" onClick={() => router.post("/deconnexion")} className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 font-sans text-xs font-medium text-jse-texte/45 hover:bg-red-50 hover:text-red-600">
                            <LogOut size={17} strokeWidth={1.8} />
                            Déconnexion
                        </button>
                    </div>
                </aside>

                <div className="min-w-0 flex-1 pb-24 lg:pb-8">
                    <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-7 lg:px-10">
                        {/* En-tête */}
                        <header className="pt-5 sm:pt-7 lg:pt-8">
                            <div className="relative flex h-11 items-center justify-between gap-3 sm:h-12">
                                <div className="flex items-center">
                                    <img src="/assets/jse_logo.png" alt="JSE Express" className="h-10 w-auto object-contain sm:h-11" />
                                </div>

                                <button type="button" className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/75 px-4 py-2.5 shadow-sm ring-1 ring-jse-texte/5 lg:static lg:translate-x-0 lg:bg-transparent lg:px-3 lg:py-2 lg:shadow-none">
                                    <MapPin size={19} strokeWidth={2.2} className="text-jse-principal" />
                                    <span className="font-sans text-sm font-semibold text-jse-principal">Adzopé</span>
                                    <ChevronDown size={16} strokeWidth={2.2} className="text-jse-principal/70" />
                                </button>

                                <div className="flex items-center gap-2">
                                    <button type="button" onClick={() => window.alert("Vos notifications seront disponibles ici.")} className="relative flex size-11 items-center justify-center rounded-full bg-transparent text-jse-principal lg:bg-white lg:shadow-sm lg:ring-1 lg:ring-jse-texte/5" aria-label="Notifications">
                                        <Bell size={26} strokeWidth={1.8} />
                                    </button>
                                    <button type="button" onClick={() => window.alert("Votre panier sera accessible ici.")} className="relative hidden size-11 items-center justify-center rounded-full bg-white text-jse-principal shadow-sm ring-1 ring-jse-texte/5 sm:flex" aria-label="Panier">
                                        <ShoppingBag size={19} strokeWidth={1.8} />
                                        {nombreArticles > 0 && <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-jse-accent font-sans text-[9px] font-bold text-white">{nombreArticles > 9 ? "9+" : nombreArticles}</span>}
                                    </button>
                                </div>
                            </div>

                            <div className="mt-8 lg:mt-10">
                                <p className="font-against text-[2.7rem] leading-[0.9] text-jse-principal sm:text-[3.4rem] lg:text-[4rem]">Bonjour !</p>
                                <p className="mt-2 font-sans text-[1.15rem] leading-tight text-jse-texte/70 sm:text-xl lg:text-2xl">
                                    Qu’est-ce qu’on vous sert aujourd’hui ?
                                </p>
                            </div>

                            <form onSubmit={rechercher} className="mt-6 lg:mt-7">
                                <div className="flex h-[58px] items-center gap-3 rounded-[24px] bg-white px-5 shadow-sm ring-1 ring-jse-texte/5 focus-within:ring-jse-secondaire/30 lg:h-[62px]">
                                    <Search size={25} strokeWidth={1.8} className="shrink-0 text-jse-principal" />
                                    <input
                                        type="search"
                                        value={rechercheLocale}
                                        onChange={(event) => setRechercheLocale(event.target.value)}
                                        placeholder="Rechercher un restaurant, un plat..."
                                        className="min-w-0 flex-1 bg-transparent font-sans text-sm outline-none placeholder:text-jse-texte/45 sm:text-base"
                                        aria-label="Rechercher un restaurant ou un plat"
                                    />
                                    <button type="button" disabled className="flex size-10 shrink-0 items-center justify-center border-l border-jse-texte/10 pl-3 text-jse-principal" aria-label="Filtres">
                                        <SlidersHorizontal size={22} strokeWidth={1.8} />
                                    </button>
                                </div>
                            </form>

                        </header>

                        {/* Catégories */}
                        <section className="pt-7 sm:pt-8 lg:pt-9">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="font-against text-[1.65rem] leading-none text-jse-principal sm:text-2xl">Catégories</h2>
                                {categories.length > 4 && <button type="button" disabled className="font-sans text-xs font-semibold text-jse-secondaire">Voir tout</button>}
                            </div>

                            <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
                                {categories.length > 0 ? categories.map((categorie, index) => (
                                    <button key={categorie.id} type="button" disabled className="group min-w-0 rounded-[22px] bg-white p-2 text-center shadow-sm ring-1 ring-jse-texte/5 sm:p-3 lg:p-3.5">
                                        <div className="aspect-square overflow-hidden rounded-[18px] bg-jse-fond">
                                            <img src={categorie.image || imagesFallback[index % imagesFallback.length]} alt={categorie.nom} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                                        </div>
                                        <p className="mt-2 truncate font-sans text-[10px] font-semibold text-jse-texte sm:text-xs">{categorie.nom}</p>
                                    </button>
                                )) : (
                                    <p className="font-sans text-xs text-jse-texte/45">Aucune catégorie disponible pour le moment.</p>
                                )}
                            </div>
                        </section>

                        {/* Bannière */}
                        <section className="pt-7 sm:pt-8 lg:pt-9">
                            <div className="relative min-h-[210px] overflow-hidden rounded-[26px] bg-jse-principal shadow-lg shadow-jse-principal/10 sm:min-h-[240px] lg:min-h-[285px]">
                                <img src={bannière.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-r from-jse-principal via-jse-principal/75 to-transparent" />

                                <div className="relative z-10 flex min-h-[210px] max-w-[540px] flex-col justify-center px-5 py-6 sm:min-h-[240px] sm:px-8 lg:min-h-[285px] lg:px-10">
                                    <span className="font-sans text-[9px] font-bold uppercase tracking-[0.18em] text-jse-secondaire sm:text-[10px]">{bannière.label}</span>
                                    <h2 className="mt-2 max-w-[420px] font-against text-[1.8rem] leading-[1.02] text-white sm:text-[2.25rem] lg:text-[2.7rem]">{bannière.titre}</h2>
                                    <p className="mt-2 max-w-[340px] font-sans text-[11px] leading-5 text-white/75 sm:text-xs">{bannière.description}</p>
                                    <button type="button" disabled className="mt-4 flex w-fit items-center gap-2 rounded-full bg-jse-accent px-4 py-2.5 font-sans text-[11px] font-semibold text-white shadow-md sm:px-5 sm:py-3">
                                        Commander maintenant
                                        <ChevronRight size={15} />
                                    </button>
                                </div>

                                <button type="button" onClick={() => setIndexBannière((indexBannière - 1 + bannières.length) % bannières.length)} className="absolute left-2.5 top-1/2 z-20 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md" aria-label="Bannière précédente">
                                    <ChevronRight size={15} className="rotate-180" />
                                </button>
                                <button type="button" onClick={() => setIndexBannière((indexBannière + 1) % bannières.length)} className="absolute right-2.5 top-1/2 z-20 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md" aria-label="Bannière suivante">
                                    <ChevronRight size={15} />
                                </button>

                                <div className="absolute bottom-4 left-5 z-20 flex gap-1.5 sm:left-8 lg:left-10">
                                    {bannières.map((_, index) => (
                                        <button key={index} type="button" onClick={() => setIndexBannière(index)} className={index === indexBannière ? "h-1.5 w-6 rounded-full bg-white" : "size-1.5 rounded-full bg-white/45"} aria-label={`Afficher la bannière ${index + 1}`} />
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Restaurants */}
                        <section className="pt-8 sm:pt-9 lg:pt-10">
                            <div className="mb-4 flex items-end justify-between gap-4">
                                <div>
                                    <p className="font-sans text-[10px] font-medium uppercase tracking-[0.12em] text-jse-texte/35">À proximité</p>
                                    <h2 className="mt-1 font-against text-[1.65rem] leading-none text-jse-principal sm:text-2xl">Restaurants populaires</h2>
                                </div>
                                <button type="button" disabled className="flex items-center gap-1 pb-0.5 font-sans text-xs font-semibold text-jse-secondaire">
                                    Voir tout <ChevronRight size={14} />
                                </button>
                            </div>

                            {restaurants.length > 0 ? (
                                <div className="scrollbar-none flex gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-3 lg:overflow-visible">
                                    {restaurants.map((restaurant, index) => (
                                        <article key={restaurant.id} className="w-[258px] shrink-0 overflow-hidden rounded-[22px] bg-white shadow-sm ring-1 ring-jse-texte/5 lg:w-auto">
                                            <div className="relative aspect-[1.45/1] overflow-hidden bg-jse-principal">
                                                <img src={imagesFallback[index % imagesFallback.length]} alt="" className="h-full w-full object-cover" />
                                                <button type="button" disabled className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-white/90 text-jse-principal shadow-sm" aria-label="Ajouter aux favoris">
                                                    <Heart size={16} strokeWidth={1.8} />
                                                </button>
                                            </div>

                                            <div className="p-3.5">
                                                <div className="flex items-start justify-between gap-3">
                                                    <h3 className="font-sans text-sm font-semibold text-jse-texte">{restaurant.nom}</h3>
                                                </div>
                                                <p className="mt-1 line-clamp-1 font-sans text-[10px] text-jse-texte/45">
                                                    {restaurant.description || "Cuisine locale"}
                                                </p>
                                                <div className="mt-3 flex items-center gap-2 font-sans text-[10px] text-jse-texte/50">
                                                    <MapPin size={12} className="text-jse-secondaire" />
                                                    <span>{restaurant.zone?.nom || restaurant.adresse || "Adzopé"}</span>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-[22px] border border-dashed border-jse-texte/10 bg-white/50 px-5 py-9 text-center">
                                    <ShoppingBag size={21} className="mx-auto text-jse-secondaire" />
                                    <h3 className="mt-3 font-against text-lg text-jse-principal">{recherche ? "Aucun restaurant trouvé" : "Aucun restaurant disponible"}</h3>
                                    <p className="mx-auto mt-1.5 max-w-[280px] font-sans text-xs leading-5 text-jse-texte/45">{recherche ? "Essayez une autre recherche." : "Les restaurants actifs apparaîtront ici dès qu’ils seront disponibles."}</p>
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </div>

            {/* Bottom bar mobile */}
            <nav className="fixed inset-x-0 bottom-0 z-40 px-4 pb-4 lg:hidden">
                <div className="mx-auto flex h-[66px] w-full max-w-md items-center justify-around rounded-[24px] border border-white/80 bg-white/95 px-1 shadow-xl shadow-jse-principal/10 backdrop-blur-xl">
                    {navigation.map((item) => <NavigationItem key={item.label} item={item} compact />)}
                </div>
            </nav>
        </main>
    );
}

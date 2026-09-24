import { router, usePage } from "@inertiajs/react";
import { Bell, ChevronRight, MapPin, Search, ShoppingBag } from "lucide-react";

const categoriesParDefaut = [
    {
        nom: "Fast-food",
        image: "/assets/hero_icon/fast_food.jpeg",
    },
    {
        nom: "Glacier",
        image: "/assets/hero_icon/glacier.jpeg",
    },
    {
        nom: "Promotions",
        image: "/assets/hero_icon/promo.jpeg",
    },
    {
        nom: "Restaurants",
        image: "/assets/hero_icon/resto.jpeg",
    },
];

export default function Accueil() {
    const { auth, categories, restaurants, panier } = usePage().props;

    const utilisateur = auth?.user ?? null;

    const categoriesAffichees =
        categories?.length > 0 ? categories : categoriesParDefaut;

    const restaurantsAffiches = restaurants ?? [];

    const nombreArticles = panier?.nombre_articles ?? 0;

    const prenom = utilisateur?.prenom || utilisateur?.name || "vous";

    return (
        <main className="min-h-screen bg-jse-fond text-jse-texte">
            <div className="mx-auto min-h-screen w-full max-w-md pb-24">
                {/* =====================================================
                    EN-TÊTE
                ====================================================== */}

                <header className="px-5 pb-5 pt-6">
                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => router.visit("/accueil")}
                            className="shrink-0"
                            aria-label="Accueil JSE Express"
                        >
                            <img
                                src="/assets/jse_logo.png"
                                alt="JSE Express"
                                className="h-10 w-auto object-contain"
                            />
                        </button>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                className="relative flex size-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-jse-texte/5 transition hover:ring-jse-secondaire/20"
                                aria-label="Notifications"
                            >
                                <Bell
                                    size={19}
                                    strokeWidth={1.8}
                                    className="text-jse-texte/70"
                                />

                                <span className="absolute right-2 top-2 size-1.5 rounded-full bg-jse-accent" />
                            </button>

                            <button
                                type="button"
                                onClick={() => router.visit("/panier")}
                                className="relative flex size-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-jse-texte/5 transition hover:ring-jse-secondaire/20"
                                aria-label="Panier"
                            >
                                <ShoppingBag
                                    size={19}
                                    strokeWidth={1.8}
                                    className="text-jse-texte/70"
                                />

                                {nombreArticles > 0 && (
                                    <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-jse-accent font-sans text-[9px] font-bold text-white">
                                        {nombreArticles > 9
                                            ? "9+"
                                            : nombreArticles}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* =================================================
                        LOCALISATION
                    ================================================== */}

                    <div className="mt-7 flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-full bg-jse-secondaire/10">
                            <MapPin
                                size={16}
                                strokeWidth={2}
                                className="text-jse-secondaire"
                            />
                        </div>

                        <div>
                            <p className="font-sans text-[10px] font-medium uppercase tracking-[0.12em] text-jse-texte/40">
                                Votre localisation
                            </p>

                            <p className="font-sans text-sm font-semibold text-jse-texte">
                                Adzopé
                            </p>
                        </div>
                    </div>

                    {/* =================================================
                        SALUTATION
                    ================================================== */}

                    <div className="mt-7">
                        <p className="font-sans text-sm text-jse-texte/55">
                            Bonjour {prenom}
                        </p>

                        <h1 className="mt-1 font-against text-[2.15rem] leading-[1.02] text-jse-texte">
                            Qu'avez-vous
                            <br />
                            envie de manger ?
                        </h1>
                    </div>

                    {/* =================================================
                        RECHERCHE
                    ================================================== */}

                    <div className="mt-6">
                        <button
                            type="button"
                            className="flex h-13 w-full items-center gap-3 rounded-2xl bg-white px-4 text-left shadow-sm ring-1 ring-jse-texte/5 transition hover:ring-jse-secondaire/20"
                        >
                            <Search
                                size={19}
                                strokeWidth={1.8}
                                className="shrink-0 text-jse-texte/35"
                            />

                            <span className="font-sans text-sm text-jse-texte/40">
                                Rechercher un plat ou un restaurant
                            </span>
                        </button>
                    </div>
                </header>

                {/* =====================================================
                    CATÉGORIES
                ====================================================== */}

                <section className="mt-1">
                    <div className="mb-4 flex items-center justify-between px-5">
                        <h2 className="font-against text-2xl text-jse-texte">
                            Catégories
                        </h2>

                        <button
                            type="button"
                            className="flex items-center gap-1 font-sans text-xs font-semibold text-jse-principal"
                        >
                            Voir tout
                            <ChevronRight size={14} />
                        </button>
                    </div>

                    <div className="scrollbar-none flex gap-3 overflow-x-auto px-5 pb-2">
                        {categoriesAffichees.map((categorie, index) => (
                            <button
                                key={
                                    categorie.id ?? `${categorie.nom}-${index}`
                                }
                                type="button"
                                className="group w-[82px] shrink-0"
                            >
                                <div className="relative aspect-square overflow-hidden rounded-[24px] bg-white shadow-sm ring-1 ring-jse-texte/5">
                                    <img
                                        src={categorie.image}
                                        alt={categorie.nom}
                                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                    />
                                </div>

                                <p className="mt-2.5 truncate text-center font-sans text-xs font-semibold text-jse-texte/75">
                                    {categorie.nom}
                                </p>
                            </button>
                        ))}
                    </div>
                </section>

                {/* =====================================================
                    BLOC PROMOTIONNEL
                ====================================================== */}

                <section className="px-5 pt-7">
                    <div className="relative min-h-[150px] overflow-hidden rounded-[28px] bg-jse-principal px-5 py-5 shadow-lg shadow-jse-principal/10">
                        <div className="relative z-10 max-w-[58%]">
                            <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.15em] text-jse-secondaire">
                                JSE Express
                            </p>

                            <h2 className="mt-2 font-against text-[1.65rem] leading-[1.05] text-white">
                                Commandez
                                <br />
                                simplement.
                            </h2>

                            <p className="mt-2 font-sans text-[10px] leading-4 text-white/60">
                                Vos plats préférés,
                                <br />
                                directement chez vous.
                            </p>
                        </div>

                        <img
                            src="/assets/hero_icon/resto.jpeg"
                            alt=""
                            aria-hidden="true"
                            className="absolute -bottom-5 -right-4 size-36 rounded-full object-cover opacity-90"
                        />
                    </div>
                </section>

                {/* =====================================================
                    RESTAURANTS
                ====================================================== */}

                <section className="px-5 pb-6 pt-8">
                    <div className="mb-4 flex items-end justify-between">
                        <div>
                            <p className="font-sans text-xs font-medium text-jse-texte/40">
                                Découvrez
                            </p>

                            <h2 className="mt-1 font-against text-2xl text-jse-texte">
                                Restaurants
                            </h2>
                        </div>

                        {restaurantsAffiches.length > 0 && (
                            <button
                                type="button"
                                className="flex items-center gap-1 font-sans text-xs font-semibold text-jse-principal"
                            >
                                Voir tout
                                <ChevronRight size={14} />
                            </button>
                        )}
                    </div>

                    {restaurantsAffiches.length > 0 ? (
                        <div className="space-y-4">
                            {restaurantsAffiches.map((restaurant) => (
                                <button
                                    key={restaurant.id}
                                    type="button"
                                    onClick={() =>
                                        router.visit(
                                            `/restaurants/${restaurant.id}`,
                                        )
                                    }
                                    className="group w-full overflow-hidden rounded-[24px] bg-white text-left shadow-sm ring-1 ring-jse-texte/5 transition hover:ring-jse-secondaire/20"
                                >
                                    <div className="aspect-[2/1] overflow-hidden bg-jse-principal/5">
                                        {restaurant.image ? (
                                            <img
                                                src={restaurant.image}
                                                alt={restaurant.nom}
                                                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center">
                                                <img
                                                    src="/assets/jse_logo.png"
                                                    alt=""
                                                    className="h-12 w-auto opacity-30"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4">
                                        <h3 className="font-against text-xl text-jse-texte">
                                            {restaurant.nom}
                                        </h3>

                                        {restaurant.description && (
                                            <p className="mt-1 line-clamp-2 font-sans text-xs leading-5 text-jse-texte/50">
                                                {restaurant.description}
                                            </p>
                                        )}

                                        {restaurant.zone?.nom && (
                                            <div className="mt-3 flex items-center gap-1.5">
                                                <MapPin
                                                    size={13}
                                                    className="text-jse-secondaire"
                                                />

                                                <span className="font-sans text-[11px] text-jse-texte/50">
                                                    {restaurant.zone.nom}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-[24px] border border-dashed border-jse-texte/10 bg-white/50 px-5 py-8 text-center">
                            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-jse-secondaire/10">
                                <ShoppingBag
                                    size={21}
                                    className="text-jse-secondaire"
                                />
                            </div>

                            <h3 className="mt-4 font-against text-xl text-jse-texte">
                                Les restaurants arrivent bientôt
                            </h3>

                            <p className="mx-auto mt-2 max-w-[260px] font-sans text-xs leading-5 text-jse-texte/45">
                                Les restaurants disponibles à Adzopé
                                apparaîtront ici.
                            </p>
                        </div>
                    )}
                </section>
            </div>

            {/* =========================================================
                NAVIGATION INFÉRIEURE
            ========================================================== */}

            <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md px-4 pb-4">
                <div className="flex h-[68px] items-center justify-around rounded-[24px] border border-white/70 bg-white/95 px-2 shadow-xl shadow-jse-principal/10 backdrop-blur-xl">
                    <button
                        type="button"
                        onClick={() => router.visit("/accueil")}
                        className="flex min-w-[68px] flex-col items-center gap-1 rounded-2xl px-3 py-2 text-jse-principal"
                    >
                        <div className="flex size-8 items-center justify-center rounded-xl bg-jse-principal/10">
                            <Search size={18} strokeWidth={2} />
                        </div>

                        <span className="font-sans text-[10px] font-semibold">
                            Accueil
                        </span>
                    </button>

                    <button
                        type="button"
                        className="flex min-w-[68px] flex-col items-center gap-1 rounded-2xl px-3 py-2 text-jse-texte/40"
                    >
                        <div className="flex size-8 items-center justify-center rounded-xl">
                            <ShoppingBag size={18} strokeWidth={1.8} />
                        </div>

                        <span className="font-sans text-[10px] font-medium">
                            Commandes
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => router.visit("/panier")}
                        className="flex min-w-[68px] flex-col items-center gap-1 rounded-2xl px-3 py-2 text-jse-texte/40"
                    >
                        <div className="relative flex size-8 items-center justify-center rounded-xl">
                            <ShoppingBag size={18} strokeWidth={1.8} />

                            {nombreArticles > 0 && (
                                <span className="absolute right-0 top-0 flex size-3.5 items-center justify-center rounded-full bg-jse-accent text-[8px] font-bold text-white">
                                    {nombreArticles > 9 ? "9" : nombreArticles}
                                </span>
                            )}
                        </div>

                        <span className="font-sans text-[10px] font-medium">
                            Panier
                        </span>
                    </button>

                    <button
                        type="button"
                        className="flex min-w-[68px] flex-col items-center gap-1 rounded-2xl px-3 py-2 text-jse-texte/40"
                    >
                        <div className="flex size-8 items-center justify-center rounded-xl">
                            <Bell size={18} strokeWidth={1.8} />
                        </div>

                        <span className="font-sans text-[10px] font-medium">
                            Notifications
                        </span>
                    </button>
                </div>
            </nav>
        </main>
    );
}

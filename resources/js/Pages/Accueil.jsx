import { router, usePage } from "@inertiajs/react";
import {
    Bell,
    ChevronLeft,
    ChevronRight,
    LogOut,
    MapPin,
    Search,
    ShoppingBag,
} from "lucide-react";
import { useEffect, useState } from "react";

const bannières = [
    { image: "/assets/banner-livraison.jpg", label: "JSE Express", titre: "Vos plats préférés, livrés à Adzopé.", description: "Commandez simplement et profitez de vos restaurants locaux." },
    { image: "/assets/banner-plat-ivoirien.jpg", label: "Saveurs locales", titre: "Une envie de bon plat ?", description: "Découvrez les plats proposés par les restaurants disponibles." },
    { image: "/assets/banner-restaurants.jpg", label: "Restaurants locaux", titre: "Découvrez les restaurants d'Adzopé.", description: "Explorez les établissements disponibles près de chez vous." },
    { image: "/assets/banner-commande-simple.jpg", label: "Simple et pratique", titre: "Commandez sans vous déplacer.", description: "Quelques étapes suffisent pour préparer votre commande." },
    { image: "/assets/banner-decouverte.jpg", label: "À découvrir", titre: "Variez les plaisirs.", description: "Trouvez différentes propositions au même endroit." },
];

const imagesFallback = [
    "/assets/hero_icon/fast_food.jpeg",
    "/assets/hero_icon/glacier.jpeg",
    "/assets/hero_icon/promo.jpeg",
    "/assets/hero_icon/resto.jpeg",
];

export default function Accueil() {
    const { auth, categories = [], restaurants = [], panier = {}, recherche = "" } = usePage().props;
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

    const déconnexion = () => router.post("/deconnexion");

    const bannière = bannières[indexBannière];

    return (
        <main className="min-h-screen bg-jse-fond text-jse-texte">
            <div className="mx-auto min-h-screen w-full max-w-md pb-28">
                <header className="px-5 pb-5 pt-6">
                    <div className="flex items-center justify-between">
                        <button type="button" onClick={() => router.visit("/accueil")} className="shrink-0" aria-label="Accueil JSE Express">
                            <img src="/assets/jse_logo.png" alt="JSE Express" className="h-10 w-auto object-contain" />
                        </button>

                        <div className="flex items-center gap-2">
                            <button type="button" onClick={() => window.alert("Vos notifications seront disponibles ici.")} className="relative flex size-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-jse-texte/5" aria-label="Notifications">
                                <Bell size={19} strokeWidth={1.8} className="text-jse-texte/70" />
                            </button>

                            <button type="button" onClick={() => window.alert("Votre panier sera accessible ici.")} className="relative flex size-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-jse-texte/5" aria-label="Panier">
                                <ShoppingBag size={19} strokeWidth={1.8} className="text-jse-texte/70" />
                                {nombreArticles > 0 && (
                                    <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-jse-accent font-sans text-[9px] font-bold text-white">
                                        {nombreArticles > 9 ? "9+" : nombreArticles}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="mt-7 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="flex size-8 items-center justify-center rounded-full bg-jse-secondaire/10">
                                <MapPin size={16} strokeWidth={2} className="text-jse-secondaire" />
                            </div>
                            <div>
                                <p className="font-sans text-[10px] font-medium uppercase tracking-[0.12em] text-jse-texte/40">Votre localisation</p>
                                <p className="font-sans text-sm font-semibold text-jse-texte">Adzopé</p>
                            </div>
                        </div>

                        <button type="button" onClick={déconnexion} className="flex size-10 items-center justify-center rounded-full bg-white text-jse-texte/45 shadow-sm ring-1 ring-jse-texte/5 transition hover:text-jse-accent" aria-label="Se déconnecter">
                            <LogOut size={18} strokeWidth={1.8} />
                        </button>
                    </div>

                    <div className="mt-7">
                        <p className="font-sans text-sm text-jse-texte/55">Bonjour {utilisateur?.prenom || "à vous"}</p>
                        <h1 className="mt-1 font-against text-[2.15rem] leading-[1.02] text-jse-texte">
                            Qu'avez-vous
                            <br />
                            envie de manger ?
                        </h1>
                    </div>

                    <form onSubmit={rechercher} className="mt-6">
                        <div className="flex h-[52px] items-center gap-3 rounded-2xl bg-white px-4 shadow-sm ring-1 ring-jse-texte/5 focus-within:ring-jse-secondaire/30">
                            <Search size={19} strokeWidth={1.8} className="shrink-0 text-jse-texte/35" />
                            <input
                                type="search"
                                value={rechercheLocale}
                                onChange={(event) => setRechercheLocale(event.target.value)}
                                placeholder="Rechercher un restaurant"
                                className="min-w-0 flex-1 bg-transparent font-sans text-sm outline-none placeholder:text-jse-texte/35"
                                aria-label="Rechercher un restaurant"
                            />
                        </div>
                    </form>
                </header>

                <section className="px-5 pt-2">
                    <div className="relative min-h-[245px] overflow-hidden rounded-[30px] bg-jse-principal shadow-xl shadow-jse-principal/15">
                        <img src={bannière.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-r from-jse-principal via-jse-principal/55 to-transparent" />

                        <div className="relative z-10 flex min-h-[245px] flex-col justify-center px-6 py-6">
                            <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-jse-secondaire">{bannière.label}</span>
                            <h2 className="mt-2 max-w-[62%] font-against text-[1.85rem] leading-[1.03] text-white">{bannière.titre}</h2>
                            <p className="mt-3 max-w-[58%] font-sans text-[11px] leading-5 text-white/70">{bannière.description}</p>
                        </div>

                        <button type="button" onClick={() => setIndexBannière((indexBannière - 1 + bannières.length) % bannières.length)} className="absolute left-3 top-1/2 z-20 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md" aria-label="Bannière précédente">
                            <ChevronLeft size={16} />
                        </button>

                        <button type="button" onClick={() => setIndexBannière((indexBannière + 1) % bannières.length)} className="absolute right-3 top-1/2 z-20 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md" aria-label="Bannière suivante">
                            <ChevronRight size={16} />
                        </button>

                        <div className="absolute bottom-4 left-6 z-20 flex gap-1.5">
                            {bannières.map((_, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => setIndexBannière(index)}
                                    className={index === indexBannière ? "h-1.5 w-6 rounded-full bg-white transition-all" : "h-1.5 w-1.5 rounded-full bg-white/45 transition-all"}
                                    aria-label={"Afficher la bannière " + (index + 1)}
                                />
                            ))}
                        </div>
                    </div>
                </section>

                <section className="pt-8">
                    <div className="mb-4 flex items-center justify-between px-5">
                        <h2 className="font-against text-2xl text-jse-texte">Catégories</h2>
                    </div>

                    <div className="scrollbar-none flex gap-3 overflow-x-auto px-5 pb-2">
                        {categories.length > 0 ? categories.map((categorie, index) => (
                            <div key={categorie.id} className="w-[82px] shrink-0">
                                <div className="aspect-square overflow-hidden rounded-[24px] bg-white shadow-sm ring-1 ring-jse-texte/5">
                                    <img src={categorie.image || imagesFallback[index % imagesFallback.length]} alt={categorie.nom} className="h-full w-full object-cover" />
                                </div>
                                <p className="mt-2.5 truncate text-center font-sans text-xs font-semibold text-jse-texte/75">{categorie.nom}</p>
                            </div>
                        )) : (
                            <p className="px-5 font-sans text-xs text-jse-texte/45">Aucune catégorie disponible pour le moment.</p>
                        )}
                    </div>
                </section>

                <section className="px-5 pb-6 pt-8">
                    <div className="mb-4">
                        <p className="font-sans text-xs font-medium text-jse-texte/40">À proximité</p>
                        <h2 className="mt-1 font-against text-2xl text-jse-texte">Restaurants</h2>
                    </div>

                    {restaurants.length > 0 ? (
                        <div className="space-y-4">
                            {restaurants.map((restaurant, index) => (
                                <article key={restaurant.id} className="overflow-hidden rounded-[24px] bg-white shadow-sm ring-1 ring-jse-texte/5">
                                    <div className="relative aspect-[2/1] overflow-hidden bg-jse-principal">
                                        <img src={imagesFallback[index % imagesFallback.length]} alt="" className="h-full w-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-jse-principal/80 via-transparent to-transparent" />
                                        <div className="absolute bottom-3 left-4 right-4">
                                            <p className="font-against text-2xl text-white">{restaurant.nom}</p>
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        {restaurant.description && <p className="line-clamp-2 font-sans text-xs leading-5 text-jse-texte/50">{restaurant.description}</p>}
                                        <div className="mt-3 flex items-center gap-1.5">
                                            <MapPin size={13} className="text-jse-secondaire" />
                                            <span className="font-sans text-[11px] text-jse-texte/50">{restaurant.zone?.nom || restaurant.adresse || "Adzopé"}</span>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-[24px] border border-dashed border-jse-texte/10 bg-white/50 px-5 py-8 text-center">
                            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-jse-secondaire/10">
                                <ShoppingBag size={21} className="text-jse-secondaire" />
                            </div>
                            <h3 className="mt-4 font-against text-xl text-jse-texte">{recherche ? "Aucun restaurant trouvé" : "Aucun restaurant disponible"}</h3>
                            <p className="mx-auto mt-2 max-w-[260px] font-sans text-xs leading-5 text-jse-texte/45">{recherche ? "Essayez une autre recherche." : "Les restaurants actifs apparaîtront ici dès qu'ils seront disponibles."}</p>
                        </div>
                    )}
                </section>
            </div>

            <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md px-4 pb-4">
                <div className="flex h-[68px] items-center justify-around rounded-[24px] border border-white/70 bg-white/95 px-2 shadow-xl shadow-jse-principal/10 backdrop-blur-xl">
                    <button type="button" onClick={() => router.visit("/accueil")} className="flex min-w-[68px] flex-col items-center gap-1 rounded-2xl px-3 py-2 text-jse-principal">
                        <div className="flex size-8 items-center justify-center rounded-xl bg-jse-principal/10"><Search size={18} strokeWidth={2} /></div>
                        <span className="font-sans text-[10px] font-semibold">Accueil</span>
                    </button>

                    <button type="button" onClick={() => window.alert("Votre historique de commandes sera disponible ici.")} className="flex min-w-[68px] flex-col items-center gap-1 rounded-2xl px-3 py-2 text-jse-texte/40">
                        <div className="flex size-8 items-center justify-center rounded-xl"><ShoppingBag size={18} strokeWidth={1.8} /></div>
                        <span className="font-sans text-[10px] font-medium">Commandes</span>
                    </button>

                    <button type="button" onClick={() => window.alert("Votre panier sera accessible ici.")} className="flex min-w-[68px] flex-col items-center gap-1 rounded-2xl px-3 py-2 text-jse-texte/40">
                        <div className="relative flex size-8 items-center justify-center rounded-xl">
                            <ShoppingBag size={18} strokeWidth={1.8} />
                            {nombreArticles > 0 && <span className="absolute right-0 top-0 flex size-3.5 items-center justify-center rounded-full bg-jse-accent text-[8px] font-bold text-white">{nombreArticles > 9 ? "9" : nombreArticles}</span>}
                        </div>
                        <span className="font-sans text-[10px] font-medium">Panier</span>
                    </button>

                    <button type="button" onClick={() => window.alert("Vos notifications seront disponibles ici.")} className="flex min-w-[68px] flex-col items-center gap-1 rounded-2xl px-3 py-2 text-jse-texte/40">
                        <div className="flex size-8 items-center justify-center rounded-xl"><Bell size={18} strokeWidth={1.8} /></div>
                        <span className="font-sans text-[10px] font-medium">Notifications</span>
                    </button>
                </div>
            </nav>
        </main>
    );
}

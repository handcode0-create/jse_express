import { router, usePage } from "@inertiajs/react";
import { ArrowLeft, Check, ChevronRight, Bike, Clock3, Heart, Info, MapPin, MessageCircle, Minus, Plus, Search, Share2, ShoppingBag, UtensilsCrossed, X } from "lucide-react";
import { useMemo, useState } from "react";

const imagesRestaurants = [
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=90",
    "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=90",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=90",
];
const imagesPlats = [
    "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=85",
];
const prix = (value) => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Number(value || 0));

function Action({ label, onClick, active = false, children }) {
    return <button type="button" onClick={onClick} aria-label={label} className={`flex size-11 items-center justify-center rounded-full bg-white/95 text-jse-principal shadow-lg shadow-black/10 backdrop-blur-md active:scale-95 ${active ? "text-jse-accent" : ""}`}>{children}</button>;
}

export default function RestaurantDetail() {
    const { restaurant, categories = [], panier = {} } = usePage().props;
    const [onglet, setOnglet] = useState("menu");
    const [recherche, setRecherche] = useState("");
    const [categorie, setCategorie] = useState("Toutes");
    const [favori, setFavori] = useState(false);
    const [panierOuvert, setPanierOuvert] = useState(false);
    const [ajout, setAjout] = useState(null);

    const imageRestaurant = imagesRestaurants[(Number(restaurant?.id || 1) - 1) % imagesRestaurants.length];
    const produits = useMemo(() => categories.flatMap((cat) => (cat.produits || []).map((produit) => ({ ...produit, categorieId: cat.id, categorieNom: cat.nom }))), [categories]);
    const produitsFiltres = useMemo(() => {
        const terme = recherche.trim().toLowerCase();
        return produits.filter((produit) => {
            const matchCat = categorie === "Toutes" || produit.categorieId === categorie;
            const texte = [produit.nom, produit.description, produit.categorieNom].filter(Boolean).join(" ").toLowerCase();
            return matchCat && (!terme || texte.includes(terme));
        });
    }, [produits, recherche, categorie]);

    const ajouter = (produit) => {
        setAjout(produit.id);
        router.post(`/panier/produits/${produit.id}/ajouter`, { quantite: 1 }, {
            preserveScroll: true,
            preserveState: true,
            onFinish: () => setAjout(null),
        });
    };
    const modifier = (ligne, quantite) => router.patch(`/panier/lignes/${ligne.id}`, { quantite }, { preserveScroll: true, preserveState: true });
    const supprimer = (ligne) => router.delete(`/panier/lignes/${ligne.id}`, { preserveScroll: true, preserveState: true });
    const partager = async () => {
        const url = window.location.href;
        if (navigator.share) {
            await navigator.share({ title: restaurant?.nom || "JSE Express", text: `Découvrez ${restaurant?.nom || "ce restaurant"} sur JSE Express.`, url });
        } else if (navigator.clipboard) {
            await navigator.clipboard.writeText(url);
            window.alert("Lien du restaurant copié.");
        }
    };

    const lignes = panier?.lignes || [];
    const nombre = Number(panier?.nombre_articles || 0);
    const total = Number(panier?.montant_total || 0);

    return <main className="min-h-screen bg-jse-fond text-jse-texte">
        <div className="mx-auto min-h-screen w-full max-w-[1440px] lg:px-8">
            <div className="relative mx-auto min-h-screen w-full max-w-[760px] overflow-hidden bg-jse-fond shadow-none lg:my-6 lg:rounded-[32px] lg:shadow-2xl">
                <section className="relative h-[345px] overflow-hidden bg-jse-principal sm:h-[390px]">
                    <img src={imageRestaurant} alt={restaurant?.nom || "Restaurant"} className="absolute inset-0 h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/35" />
                    <div className="absolute inset-x-0 top-0 flex items-center justify-between px-5 pt-6 sm:px-7 sm:pt-7">
                        <Action label="Retour" onClick={() => router.visit("/accueil")}><ArrowLeft size={22} /></Action>
                        <div className="flex gap-2.5">
                            <Action label="Favori" active={favori} onClick={() => setFavori(!favori)}><Heart size={22} fill={favori ? "currentColor" : "none"} /></Action>
                            <Action label="Partager" onClick={partager}><Share2 size={21} /></Action>
                        </div>
                    </div>
                    <span className="absolute bottom-5 right-5 rounded-full bg-black/45 px-3 py-1.5 font-sans text-xs font-semibold text-white">1/1</span>
                </section>

                <section className="relative -mt-1 rounded-t-[34px] bg-jse-fond px-5 pt-6 sm:px-8">
                    <h1 className="font-against text-[2.15rem] leading-[0.98] text-jse-principal sm:text-[2.65rem]">{restaurant?.nom}</h1>
                    <div className="mt-2 flex items-center gap-2 font-sans text-sm text-jse-texte/60"><span className="text-jse-accent">★</span><strong className="text-jse-principal">—</strong><span>Aucun avis</span></div>
                    <p className="mt-2 line-clamp-2 font-sans text-sm leading-5 text-jse-texte/65">{restaurant?.description || "Aucune description renseignée."}</p>

                    <div className="mt-5 grid grid-cols-3 gap-2.5">
                        <div className="flex min-w-0 items-center gap-2.5 rounded-[20px] bg-white px-3 py-3.5 shadow-sm ring-1 ring-jse-texte/6 sm:px-3.5">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-jse-accent/10 text-jse-accent"><Clock3 size={20} strokeWidth={2.2} /></span>
                            <div className="min-w-0">
                                <p className="font-sans text-xs font-bold text-jse-principal">Livraison</p>
                                <p className="mt-1 truncate font-sans text-[10px] text-jse-texte/50">Selon disponibilité</p>
                            </div>
                        </div>
                        <div className="flex min-w-0 items-center gap-2.5 rounded-[20px] bg-white px-3 py-3.5 shadow-sm ring-1 ring-jse-texte/6 sm:px-3.5">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-jse-accent/10 text-jse-accent"><Bike size={20} strokeWidth={2.2} /></span>
                            <div className="min-w-0">
                                <p className="font-sans text-xs font-bold text-jse-principal">Menu</p>
                                <p className="mt-1 truncate font-sans text-[10px] text-jse-texte/50">{produits.length} article{produits.length > 1 ? "s" : ""}</p>
                            </div>
                        </div>
                        <div className="flex min-w-0 items-center gap-2.5 rounded-[20px] bg-jse-secondaire/10 px-3 py-3.5 sm:px-3.5">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/55 text-jse-secondaire"><span className="size-3 rounded-full bg-jse-secondaire" /></span>
                            <div className="min-w-0">
                                <p className="font-sans text-xs font-bold text-jse-principal">Actif</p>
                                <p className="mt-1 truncate font-sans text-[10px] text-jse-texte/50">{restaurant?.horaires || "Horaires non renseignés"}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <nav className="sticky top-0 z-30 mt-5 grid grid-cols-3 border-y border-jse-texte/5 bg-jse-fond/95 backdrop-blur-xl">
                    {[["menu","Menu",UtensilsCrossed],["avis","Avis",MessageCircle],["infos","Infos",Info]].map(([id,label,Icon]) => {
                        const active = onglet === id;
                        return <button key={id} type="button" onClick={() => setOnglet(id)} className={`relative flex h-[62px] items-center justify-center gap-2 font-sans text-sm font-semibold ${active ? "text-jse-principal" : "text-jse-texte/45"}`}>
                            <Icon size={21} strokeWidth={active ? 2 : 1.7} />{label}{active && <span className="absolute bottom-0 left-1/2 h-1 w-[82%] -translate-x-1/2 rounded-full bg-jse-secondaire" />}
                        </button>;
                    })}
                </nav>

                {onglet === "menu" && <section className="px-5 pb-36 pt-6 sm:px-8">
                    <div className="flex h-[62px] items-center gap-3 rounded-[20px] bg-white px-4 ring-1 ring-jse-texte/5">
                        <Search size={24} className="shrink-0 text-jse-principal" />
                        <input value={recherche} onChange={(e) => setRecherche(e.target.value)} placeholder="Rechercher un plat..." className="min-w-0 flex-1 bg-transparent font-sans text-sm outline-none placeholder:text-jse-texte/40" />
                        {recherche && <button type="button" onClick={() => setRecherche("")} className="flex size-8 items-center justify-center rounded-full bg-jse-fond"><X size={16} /></button>}
                    </div>

                    <div className="scrollbar-none mt-4 flex gap-2.5 overflow-x-auto pb-1">
                        <button type="button" onClick={() => setCategorie("Toutes")} className={`shrink-0 rounded-full px-6 py-3 font-sans text-sm font-semibold ${categorie === "Toutes" ? "bg-jse-principal text-white" : "bg-white text-jse-texte/65 ring-1 ring-jse-texte/5"}`}>Tout</button>
                        {categories.map((cat) => <button key={cat.id} type="button" onClick={() => setCategorie(cat.id)} className={`shrink-0 rounded-full px-6 py-3 font-sans text-sm font-semibold ${categorie === cat.id ? "bg-jse-principal text-white" : "bg-white text-jse-texte/65 ring-1 ring-jse-texte/5"}`}>{cat.nom}</button>)}
                    </div>

                    <div className="mt-5 space-y-3">
                        {produitsFiltres.length ? produitsFiltres.map((produit, index) => <article key={produit.id} onClick={() => router.visit(`/restaurants/${restaurant.id}/produits/${produit.id}`)} className="flex min-h-[126px] cursor-pointer items-center gap-3 rounded-[22px] bg-white p-2.5 shadow-sm ring-1 ring-jse-texte/5 transition hover:-translate-y-0.5 hover:shadow-md">
                            <img src={produit.image || imagesPlats[index % imagesPlats.length]} alt={produit.nom} className="h-[106px] w-[116px] shrink-0 rounded-[17px] object-cover" />
                            <div className="min-w-0 flex-1 py-1">
                                <p className="font-sans text-base font-bold">{produit.nom}</p>
                                <p className="mt-1 line-clamp-2 font-sans text-xs leading-5 text-jse-texte/55">{produit.description || "Produit disponible au menu."}</p>
                                <p className="mt-2 font-sans text-lg font-extrabold text-jse-principal">{prix(produit.prix)} FCFA</p>
                            </div>
                            <button type="button" onClick={() => ajouter(produit)} disabled={ajout === produit.id} className="flex size-12 shrink-0 items-center justify-center rounded-full bg-jse-secondaire text-white shadow-md active:scale-90 disabled:opacity-60">{ajout === produit.id ? <Check size={24} /> : <Plus size={25} />}</button>
                        </article>) : <div className="rounded-[24px] bg-white px-5 py-12 text-center ring-1 ring-jse-texte/5"><Search size={25} className="mx-auto text-jse-secondaire" /><h3 className="mt-3 font-against text-xl text-jse-principal">Aucun plat trouvé</h3><p className="mt-1 font-sans text-xs text-jse-texte/45">Modifiez votre recherche ou choisissez une autre catégorie.</p></div>}
                    </div>
                </section>}

                {onglet === "avis" && <section className="px-5 pb-36 pt-10 sm:px-8"><div className="rounded-[26px] bg-white px-6 py-12 text-center ring-1 ring-jse-texte/5"><MessageCircle size={30} className="mx-auto text-jse-secondaire" /><h2 className="mt-4 font-against text-2xl text-jse-principal">Avis clients</h2><p className="mx-auto mt-2 max-w-sm font-sans text-sm leading-6 text-jse-texte/50">Aucun avis client n’est encore enregistré pour ce restaurant.</p></div></section>}

                {onglet === "infos" && <section className="px-5 pb-36 pt-6 sm:px-8"><div className="space-y-3">
                    <div className="rounded-[22px] bg-white p-5 ring-1 ring-jse-texte/5"><p className="font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-jse-texte/35">À propos</p><p className="mt-2 font-sans text-sm leading-6 text-jse-texte/70">{restaurant?.description || "Aucune description renseignée."}</p></div>
                    <div className="rounded-[22px] bg-white p-5 ring-1 ring-jse-texte/5">
                        <div className="flex items-start gap-3"><MapPin size={20} className="mt-0.5 shrink-0 text-jse-secondaire" /><div><p className="font-sans text-xs font-semibold">Adresse</p><p className="mt-1 font-sans text-sm text-jse-texte/60">{restaurant?.adresse || "Adresse non renseignée."}</p></div></div>
                        <div className="mt-5 flex items-start gap-3"><Clock3 size={20} className="mt-0.5 shrink-0 text-jse-accent" /><div><p className="font-sans text-xs font-semibold">Horaires</p><p className="mt-1 font-sans text-sm text-jse-texte/60">{restaurant?.horaires || "Horaires non renseignés."}</p></div></div>
                        <div className="mt-5 flex items-start gap-3"><Info size={20} className="mt-0.5 shrink-0 text-jse-principal" /><div><p className="font-sans text-xs font-semibold">Contact</p><p className="mt-1 font-sans text-sm text-jse-texte/60">{restaurant?.telephone || "Téléphone non renseigné."}</p></div></div>
                    </div>
                </div></section>}
            </div>

            {nombre > 0 && <>
                <button type="button" onClick={() => router.visit("/panier")} className="fixed inset-x-5 bottom-5 z-40 mx-auto flex h-[72px] w-[calc(100%-40px)] max-w-[700px] items-center rounded-full bg-jse-principal px-5 text-white shadow-2xl shadow-jse-principal/25">
                    <div className="relative flex size-12 items-center justify-center rounded-full bg-white/10"><ShoppingBag size={27} /><span className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full bg-jse-accent font-sans text-[10px] font-bold">{nombre > 9 ? "9+" : nombre}</span></div>
                    <span className="ml-4 flex-1 text-left font-sans text-base font-bold">Voir mon panier</span>
                    <span className="font-sans text-base font-bold">{prix(total)} FCFA</span><ChevronRight className="ml-2" size={23} />
                </button>

                {false && <div className="fixed inset-0 z-50 flex items-end justify-center bg-jse-principal/25 p-0 backdrop-blur-[2px] sm:items-center sm:p-5" onClick={() => setPanierOuvert(false)}>
                    <div className="max-h-[88vh] w-full max-w-lg overflow-hidden rounded-t-[32px] bg-jse-fond shadow-2xl sm:rounded-[32px]" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between border-b border-jse-texte/5 px-5 py-4"><div><p className="font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-jse-texte/35">Votre sélection</p><h2 className="font-against text-2xl text-jse-principal">Mon panier</h2></div><button type="button" onClick={() => setPanierOuvert(false)} className="flex size-10 items-center justify-center rounded-full bg-white"><X size={19} /></button></div>
                        <div className="max-h-[55vh] overflow-y-auto px-5 py-4 space-y-3">
                            {lignes.map((ligne, index) => <div key={ligne.id} className="flex items-center gap-3 rounded-[20px] bg-white p-3 ring-1 ring-jse-texte/5">
                                <img src={ligne.image || imagesPlats[index % imagesPlats.length]} alt={ligne.nom} className="size-16 shrink-0 rounded-2xl object-cover" />
                                <div className="min-w-0 flex-1"><p className="truncate font-sans text-sm font-semibold">{ligne.nom}</p><p className="mt-1 font-sans text-xs text-jse-principal">{prix(ligne.prix_unitaire)} FCFA</p>
                                    <div className="mt-2 flex items-center gap-2"><button type="button" onClick={() => modifier(ligne, Number(ligne.quantite) - 1)} className="flex size-7 items-center justify-center rounded-full bg-jse-fond"><Minus size={14} /></button><span className="min-w-5 text-center font-sans text-xs font-bold">{ligne.quantite}</span><button type="button" onClick={() => modifier(ligne, Number(ligne.quantite) + 1)} className="flex size-7 items-center justify-center rounded-full bg-jse-principal text-white"><Plus size={14} /></button></div>
                                </div>
                                <div className="text-right"><p className="font-sans text-sm font-bold text-jse-principal">{prix(ligne.total)} FCFA</p><button type="button" onClick={() => supprimer(ligne)} className="mt-2 font-sans text-[10px] font-semibold text-red-500">Supprimer</button></div>
                            </div>)}
                        </div>
                        <div className="border-t border-jse-texte/5 bg-white px-5 py-4 flex items-center justify-between"><span className="font-sans text-sm text-jse-texte/55">Sous-total</span><strong className="font-sans text-lg text-jse-principal">{prix(total)} FCFA</strong></div>
                    </div>
                </div>}
            </>}
        </div>
    </main>;
}

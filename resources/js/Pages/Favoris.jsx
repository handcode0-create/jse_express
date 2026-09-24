import React, { useEffect, useState } from "react";
import { router } from "@inertiajs/react";
import { ArrowLeft, ChevronRight, Heart, Home, MapPin, ShoppingBag, UserRound, X } from "lucide-react";
import { basculerFavori, lireFavoris } from "../lib/favoris";

const fallbacks = [
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=85",
];

function NavigationItem({ label, icon: Icon, active = false, onClick }) {
    return <button type="button" onClick={onClick} className={"flex min-w-[66px] flex-col items-center justify-center gap-1 rounded-[20px] px-2.5 py-2 " + (active ? "bg-jse-secondaire text-white shadow-sm" : "text-jse-texte/80 hover:bg-jse-fond")}>
        <Icon size={21} strokeWidth={active ? 2.2 : 1.8} />
        <span className="font-sans text-[10px] font-semibold">{label}</span>
    </button>;
}

export default function Favoris() {
    const [favoris, setFavoris] = useState([]);

    useEffect(() => {
        const sync = () => setFavoris(lireFavoris());
        sync();
        window.addEventListener("jse:favoris-change", sync);
        window.addEventListener("storage", sync);
        return () => {
            window.removeEventListener("jse:favoris-change", sync);
            window.removeEventListener("storage", sync);
        };
    }, []);

    const retirer = (restaurant) => setFavoris(basculerFavori(restaurant));

    return <main className="min-h-screen bg-jse-fond pb-28 text-jse-texte">
        <div className="mx-auto min-h-screen w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-10">
                <aside className="hidden lg:block">
                    <div className="sticky top-6 pt-6">
                        <button type="button" onClick={() => router.visit("/accueil")} className="flex size-12 items-center justify-center rounded-full bg-white text-jse-principal shadow-sm ring-1 ring-jse-texte/5"><ArrowLeft size={21} /></button>
                        <div className="mt-8"><img src="/assets/jse_logo.png" alt="JSE Express" className="h-14 w-auto object-contain" /></div>
                        <nav className="mt-10 space-y-2">
                            <NavigationItem label="Accueil" icon={Home} onClick={() => router.visit("/accueil")} />
                            <NavigationItem label="Commandes" icon={ShoppingBag} onClick={() => router.visit("/commandes")} />
                            <NavigationItem label="Favoris" icon={Heart} active />
                            <NavigationItem label="Profil" icon={UserRound} />
                        </nav>
                    </div>
                </aside>

                <div className="mx-auto w-full max-w-4xl lg:mx-0">
                    <header className="pt-5 sm:pt-7 lg:pt-10">
                        <div className="flex items-center justify-between lg:hidden">
                            <button type="button" onClick={() => router.visit("/accueil")} className="flex size-11 items-center justify-center rounded-full bg-white text-jse-principal shadow-sm ring-1 ring-jse-texte/5"><ArrowLeft size={21} /></button>
                            <img src="/assets/jse_logo.png" alt="JSE Express" className="h-14 w-auto object-contain" />
                            <div className="flex size-11 items-center justify-center rounded-full bg-white text-jse-accent shadow-sm ring-1 ring-jse-texte/5"><Heart size={19} fill="currentColor" /></div>
                        </div>
                        <div className="mt-7 lg:mt-0">
                            <h1 className="font-against text-[2.65rem] leading-[0.95] text-jse-principal sm:text-[3.3rem]">Mes favoris</h1>
                            <p className="mt-2 font-sans text-sm leading-5 text-jse-texte/60 sm:text-base">Retrouvez les restaurants que vous aimez.</p>
                        </div>
                    </header>

                    <section className="pt-6">
                        {favoris.length > 0 ? <div className="grid gap-4 sm:grid-cols-2">
                            {favoris.map((restaurant, index) => <article key={restaurant.id} className="overflow-hidden rounded-[26px] bg-white shadow-sm ring-1 ring-jse-texte/5">
                                <div className="relative aspect-[1.55/1] overflow-hidden bg-jse-principal">
                                    <img src={restaurant.image || fallbacks[index % fallbacks.length]} alt={restaurant.nom} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = fallbacks[index % fallbacks.length]; }} className="h-full w-full object-cover" />
                                    <button type="button" onClick={() => retirer(restaurant)} className="absolute right-3 top-3 flex size-10 items-center justify-center rounded-full bg-white/95 text-jse-accent shadow-lg" aria-label="Retirer des favoris"><Heart size={19} fill="currentColor" /></button>
                                </div>
                                <div className="p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <h2 className="line-clamp-2 font-against text-[1.35rem] leading-[1.05] text-jse-principal">{restaurant.nom}</h2>
                                        {restaurant.note !== null && restaurant.note !== undefined && <span className="shrink-0 rounded-full bg-jse-fond px-2.5 py-1.5 font-sans text-[10px] font-bold text-jse-principal">★ {Number(restaurant.note).toFixed(1)}</span>}
                                    </div>
                                    <p className="mt-1 font-sans text-[10px] text-jse-texte/45">{restaurant.type || "Restaurant"}{Number(restaurant.avis || 0) > 0 ? " · " + restaurant.avis + " avis" : " · Aucun avis"}</p>
                                    <div className="mt-3 flex items-start gap-2 font-sans text-[10px] leading-4 text-jse-texte/50"><MapPin size={13} className="mt-0.5 shrink-0 text-jse-secondaire" /><span>{restaurant.adresse || "Adzopé"}</span></div>
                                    <div className="mt-4 flex gap-2">
                                        {Number.isInteger(Number(restaurant.id)) && <button type="button" onClick={() => router.visit("/restaurants/" + restaurant.id)} className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-jse-secondaire/10 font-sans text-xs font-semibold text-jse-secondaire">Voir le restaurant <ChevronRight size={15} /></button>}
                                        <button type="button" onClick={() => retirer(restaurant)} className="flex size-11 shrink-0 items-center justify-center rounded-full bg-jse-fond text-jse-principal" aria-label="Retirer des favoris"><X size={17} /></button>
                                    </div>
                                </div>
                            </article>)}
                        </div> : <div className="rounded-[28px] bg-white px-6 py-16 text-center shadow-sm ring-1 ring-jse-texte/5">
                            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-jse-accent/10 text-jse-accent"><Heart size={30} strokeWidth={1.7} /></div>
                            <h2 className="mt-5 font-against text-2xl text-jse-principal">Aucun favori pour le moment</h2>
                            <p className="mx-auto mt-2 max-w-sm font-sans text-sm leading-5 text-jse-texte/50">Appuyez sur le cœur d’un restaurant pour le retrouver facilement ici.</p>
                            <button type="button" onClick={() => router.visit("/accueil")} className="mt-6 rounded-full bg-jse-accent px-6 py-3 font-sans text-xs font-semibold text-white shadow-sm">Découvrir les restaurants</button>
                        </div>}
                    </section>
                </div>
            </div>
        </div>

        <nav className="fixed inset-x-0 bottom-0 z-40 px-4 pb-4 lg:hidden">
            <div className="mx-auto flex h-[66px] w-full max-w-md items-center justify-around rounded-[24px] border border-white/80 bg-white/95 px-1 shadow-xl shadow-jse-principal/10 backdrop-blur-xl">
                <NavigationItem label="Accueil" icon={Home} onClick={() => router.visit("/accueil")} />
                <NavigationItem label="Commandes" icon={ShoppingBag} onClick={() => router.visit("/commandes")} />
                <NavigationItem label="Favoris" icon={Heart} active />
                <NavigationItem label="Profil" icon={UserRound} />
            </div>
        </nav>
    </main>;
}

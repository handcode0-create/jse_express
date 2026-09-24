import React, { useState } from "react";
import { router, usePage } from "@inertiajs/react";
import {
    Bell, ChevronRight, Heart, HelpCircle, Home, Info, LogOut,
    MapPin, Package, Settings, UserRound, WalletCards, X,
} from "lucide-react";
import { BoutonChargement } from "../Composants/Interface/EtatsChargement";

function NavigationItem({ label, icon: Icon, active = false, onClick }) {
    return <button type="button" onClick={onClick} className={["flex min-w-[66px] flex-col items-center justify-center gap-1 rounded-[20px] px-2.5 py-2 transition-all", active ? "bg-jse-secondaire text-white shadow-sm" : "text-jse-texte/80 hover:bg-jse-fond"].join(" ")}>
        <Icon size={21} strokeWidth={active ? 2.2 : 1.8} /><span className="font-sans text-[10px] font-semibold">{label}</span>
    </button>;
}

const actions = [
    { id: "informations", label: "Mes informations", icon: UserRound, action: "modal" },
    { id: "adresses", label: "Mes adresses", icon: MapPin, action: "indisponible" },
    { id: "paiements", label: "Mes moyens de paiement", icon: WalletCards, action: "indisponible" },
    { id: "commandes", label: "Mes commandes", icon: Package, action: "route", route: "/commandes" },
    { id: "favoris", label: "Mes favoris", icon: Heart, action: "route", route: "/favoris" },
    { id: "notifications", label: "Notifications", icon: Bell, action: "route", route: "/notifications" },
    { id: "support", label: "Aide & support", icon: HelpCircle, action: "indisponible" },
    { id: "about", label: "À propos de JSE Express", icon: Info, action: "modal" },
];

export default function Profil() {
    const { utilisateur, notificationsCount = 0 } = usePage().props;
    const [modal, setModal] = useState(null);
    const [chargement, setChargement] = useState(false);
    const [erreur, setErreur] = useState("");
    const [formulaire, setFormulaire] = useState({
        nom: utilisateur?.nom || "",
        prenom: utilisateur?.prenom || "",
        telephone: utilisateur?.telephone || "",
        email: utilisateur?.email || "",
    });

    const executer = (item) => {
        if (item.action === "route") return router.visit(item.route);
        setErreur("");
        setModal(item.action === "modal" ? item.id : "indisponible");
    };

    const enregistrer = (event) => {
        event.preventDefault();
        setErreur("");
        setChargement(true);
        router.patch("/profil", formulaire, {
            preserveScroll: true,
            onError: (errors) => setErreur(Object.values(errors || {})[0] || "Impossible d’enregistrer les modifications."),
            onFinish: () => setChargement(false),
            onSuccess: () => setModal(null),
        });
    };

    return <main className="min-h-screen bg-jse-fond pb-28 text-jse-texte">
        <div className="mx-auto min-h-screen w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-10">
                <aside className="hidden lg:block">
                    <div className="sticky top-6 pt-6">
                        <button type="button" onClick={() => router.visit("/accueil")} className="flex size-12 items-center justify-center rounded-full bg-white text-jse-principal shadow-sm ring-1 ring-jse-texte/5" aria-label="Accueil"><Home size={20} /></button>
                        <div className="mt-8"><img src="/assets/jse_logo.png" alt="JSE Express" className="h-14 w-auto object-contain" /></div>
                        <nav className="mt-10 space-y-2">
                            <NavigationItem label="Accueil" icon={Home} onClick={() => router.visit("/accueil")} />
                            <NavigationItem label="Commandes" icon={Package} onClick={() => router.visit("/commandes")} />
                            <NavigationItem label="Favoris" icon={Heart} onClick={() => router.visit("/favoris")} />
                            <NavigationItem label="Profil" icon={UserRound} active />
                        </nav>
                    </div>
                </aside>

                <div className="mx-auto w-full max-w-3xl lg:mx-0">
                    <section className="-mx-4 overflow-hidden rounded-b-[34px] bg-jse-principal px-5 pb-8 pt-6 sm:-mx-6 sm:px-8 lg:mx-0 lg:rounded-[34px] lg:pt-8">
                        <div className="flex items-start justify-between">
                            <button type="button" onClick={() => router.visit("/accueil")} className="flex size-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md lg:hidden" aria-label="Retour"><Home size={18} /></button>
                            <button type="button" onClick={() => setModal("informations")} className="flex size-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md" aria-label="Modifier mon profil"><Settings size={18} /></button>
                        </div>
                        <div className="mt-2 flex items-center gap-4">
                            <div className="flex size-[78px] shrink-0 items-center justify-center rounded-full border-4 border-white/20 bg-jse-secondaire text-2xl font-semibold text-white shadow-lg">
                                {((utilisateur?.prenom?.[0] || "") + (utilisateur?.nom?.[0] || "")).toUpperCase() || "J"}
                            </div>
                            <div className="min-w-0 text-white">
                                <h1 className="font-against text-[1.65rem] leading-none">{[utilisateur?.prenom, utilisateur?.nom].filter(Boolean).join(" ") || "Client JSE Express"}</h1>
                                <p className="mt-1 font-sans text-xs text-white/70">{utilisateur?.telephone || "Téléphone non renseigné"}</p>
                            </div>
                        </div>
                    </section>

                    <section className="pt-5 lg:pt-7">
                        <div className="overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-jse-texte/5">
                            {actions.map((item, index) => {
                                const Icon = item.icon;
                                return <button key={item.id} type="button" onClick={() => executer(item)} className={["group flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-jse-fond/70", index < actions.length - 1 ? "border-b border-jse-texte/5" : ""].join(" ")}>
                                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-jse-fond text-jse-principal"><Icon size={18} strokeWidth={1.8} /></span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block font-sans text-xs font-semibold text-jse-texte">{item.label}</span>
                                        {item.id === "notifications" && notificationsCount > 0 && <span className="mt-0.5 block font-sans text-[10px] text-jse-secondaire">{notificationsCount} notification{notificationsCount > 1 ? "s" : ""}</span>}
                                    </span>
                                    <ChevronRight size={17} className="shrink-0 text-jse-texte/25 transition-transform group-hover:translate-x-0.5" />
                                </button>;
                            })}
                        </div>

                        <button type="button" onClick={() => router.post("/deconnexion")} className="mt-4 flex w-full items-center gap-3 rounded-[28px] bg-white px-5 py-4 text-left text-jse-danger shadow-sm ring-1 ring-jse-danger/10 transition-colors hover:bg-red-50">
                            <span className="flex size-10 items-center justify-center rounded-full bg-red-50"><LogOut size={18} /></span>
                            <span className="font-sans text-xs font-semibold">Déconnexion</span>
                        </button>
                        <p className="px-5 py-6 text-center font-sans text-[10px] leading-5 text-jse-texte/35">JSE Express · Des saveurs plus proche de vous</p>
                    </section>
                </div>
            </div>
        </div>

        <nav className="fixed inset-x-0 bottom-0 z-40 px-4 pb-4 lg:hidden">
            <div className="mx-auto flex h-[66px] w-full max-w-md items-center justify-around rounded-[24px] border border-white/80 bg-white/95 px-1 shadow-xl shadow-jse-principal/10 backdrop-blur-xl">
                <NavigationItem label="Accueil" icon={Home} onClick={() => router.visit("/accueil")} />
                <NavigationItem label="Commandes" icon={Package} onClick={() => router.visit("/commandes")} />
                <NavigationItem label="Favoris" icon={Heart} onClick={() => router.visit("/favoris")} />
                <NavigationItem label="Profil" icon={UserRound} active />
            </div>
        </nav>

        {modal && <div className="fixed inset-0 z-[80] flex items-end justify-center bg-jse-principal/25 p-0 backdrop-blur-sm sm:items-center sm:p-5" onClick={() => setModal(null)}>
            <div className="w-full max-w-md rounded-t-[30px] bg-white p-5 shadow-2xl sm:rounded-[30px]" onClick={(event) => event.stopPropagation()}>
                {modal === "informations" && <><div className="flex items-center justify-between"><div><p className="font-sans text-[10px] font-semibold uppercase tracking-[0.15em] text-jse-texte/35">Compte</p><h2 className="mt-1 font-against text-2xl text-jse-principal">Mes informations</h2></div><button type="button" onClick={() => setModal(null)} className="flex size-10 items-center justify-center rounded-full bg-jse-fond text-jse-principal" aria-label="Fermer"><X size={18} /></button></div>
                    <form onSubmit={enregistrer} className="mt-6 space-y-4">
                        <ChampProfil label="Prénom" value={formulaire.prenom} onChange={(value) => setFormulaire({ ...formulaire, prenom: value })} />
                        <ChampProfil label="Nom" value={formulaire.nom} onChange={(value) => setFormulaire({ ...formulaire, nom: value })} />
                        <ChampProfil label="Téléphone" type="tel" value={formulaire.telephone} onChange={(value) => setFormulaire({ ...formulaire, telephone: value })} />
                        <ChampProfil label="E-mail" type="email" value={formulaire.email} onChange={(value) => setFormulaire({ ...formulaire, email: value })} />
                        {erreur && <p className="rounded-[16px] bg-red-50 px-4 py-3 font-sans text-xs text-red-600">{erreur}</p>}
                        {chargement ? <BoutonChargement className="w-full" /> : <button type="submit" className="flex h-12 w-full items-center justify-center rounded-full bg-jse-secondaire font-sans text-xs font-semibold text-white shadow-sm">Enregistrer les modifications</button>}
                    </form>
                </>}

                {modal === "about" && <><div className="flex items-center justify-between"><h2 className="font-against text-2xl text-jse-principal">À propos de JSE Express</h2><button type="button" onClick={() => setModal(null)} className="flex size-10 items-center justify-center rounded-full bg-jse-fond text-jse-principal" aria-label="Fermer"><X size={18} /></button></div><div className="mt-6 rounded-[22px] bg-jse-fond p-5"><img src="/assets/jse_logo.png" alt="JSE Express" className="h-14 w-auto object-contain" /><p className="mt-4 font-sans text-sm leading-6 text-jse-texte/65">JSE Express rapproche les clients des restaurants locaux d’Adzopé pour découvrir, commander et se faire livrer leurs plats préférés.</p></div></>}

                {modal === "indisponible" && <><div className="flex items-center justify-between"><div><p className="font-sans text-[10px] font-semibold uppercase tracking-[0.15em] text-jse-texte/35">JSE Express</p><h2 className="mt-1 font-against text-2xl text-jse-principal">Fonction à venir</h2></div><button type="button" onClick={() => setModal(null)} className="flex size-10 items-center justify-center rounded-full bg-jse-fond text-jse-principal" aria-label="Fermer"><X size={18} /></button></div><p className="mt-5 font-sans text-sm leading-6 text-jse-texte/60">Cette fonctionnalité ne possède pas encore de données dans le modèle actuel de JSE Express.</p><button type="button" onClick={() => setModal(null)} className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-jse-secondaire font-sans text-xs font-semibold text-white">Fermer</button></>}
            </div>
        </div>}
    </main>;
}

function ChampProfil({ label, type = "text", value, onChange }) {
    return <label className="block"><span className="mb-1.5 block font-sans text-xs font-semibold text-jse-texte">{label}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="h-12 w-full rounded-[16px] border border-jse-texte/10 bg-jse-fond px-4 font-sans text-sm text-jse-texte outline-none transition focus:border-jse-secondaire focus:ring-2 focus:ring-jse-secondaire/10" /></label>;
}

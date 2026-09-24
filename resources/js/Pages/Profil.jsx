import React, { useState } from "react";
import { router, usePage } from "@inertiajs/react";
import {
    Bell, Check, ChevronRight, Heart, HelpCircle, Home, Info, LogOut,
    MapPin, Package, Plus, Settings, Trash2, UserRound, WalletCards, X,
} from "lucide-react";
import { BoutonChargement } from "../Composants/Interface/EtatsChargement";
import SidebarJSE from "../Composants/Navigation/SidebarJSE";

function NavigationItem({ label, icon: Icon, active = false, onClick }) {
    return <button type="button" onClick={onClick} className={["flex min-w-[66px] flex-col items-center justify-center gap-1 rounded-[20px] px-2.5 py-2 transition-all", active ? "bg-jse-secondaire text-white shadow-sm" : "text-jse-texte/80 hover:bg-jse-fond"].join(" ")}>
        <Icon size={21} strokeWidth={active ? 2.2 : 1.8} /><span className="font-sans text-[10px] font-semibold">{label}</span>
    </button>;
}

const actions = [
    { id: "informations", label: "Mes informations", icon: UserRound, action: "modal" },
    { id: "adresses", label: "Mes adresses", icon: MapPin, action: "modal" },
    { id: "paiements", label: "Mes moyens de paiement", icon: WalletCards, action: "modal" },
    { id: "commandes", label: "Mes commandes", icon: Package, action: "route", route: "/commandes" },
    { id: "favoris", label: "Mes favoris", icon: Heart, action: "route", route: "/favoris" },
    { id: "notifications", label: "Notifications", icon: Bell, action: "route", route: "/notifications" },
    { id: "support", label: "Aide & support", icon: HelpCircle, action: "modal" },
    { id: "about", label: "À propos de JSE Express", icon: Info, action: "modal" },
];

export default function Profil() {
    const { utilisateur, notificationsCount = 0, adresses = [], zones = [], moyensPaiement = [], flash = {} } = usePage().props;
    const [modal, setModal] = useState(null);
    const [chargement, setChargement] = useState(false);
    const [erreur, setErreur] = useState("");
    const [succes, setSucces] = useState(flash?.success || "");
    const [formulaire, setFormulaire] = useState({
        nom: utilisateur?.nom || "", prenom: utilisateur?.prenom || "",
        telephone: utilisateur?.telephone || "", email: utilisateur?.email || "",
    });
    const [adresse, setAdresse] = useState({ libelle: "", adresse: "", complement: "", telephone: utilisateur?.telephone || "", zone_id: "", par_defaut: adresses.length === 0 });
    const [paiement, setPaiement] = useState({ type: "mobile_money", operateur: "Orange Money", libelle: "", identifiant_masque: "" });

    const executer = (item) => {
        setErreur("");
        setSucces("");
        if (item.action === "route") return router.visit(item.route);
        setModal(item.id);
    };

    const action = (method, url, data = {}, options = {}) => {
        setErreur("");
        setSucces("");
        setChargement(true);
        const callbacks = {
            preserveScroll: true,
            onSuccess: (page) => setSucces(page?.props?.flash?.success || "Modification enregistrée."),
            onError: (errors) => setErreur(Object.values(errors || {})[0] || "Impossible de traiter la demande."),
            onFinish: () => setChargement(false),
            ...options,
        };
        if (method === "delete") {
            router.delete(url, callbacks);
        } else {
            router[method](url, data, callbacks);
        }
    };

    const enregistrer = (event) => {
        event.preventDefault();
        action("patch", "/profil", formulaire, { onSuccess: (page) => { setSucces(page?.props?.flash?.success || "Vos informations ont été mises à jour."); setModal(null); } });
    };

    const ajouterAdresse = (event) => {
        event.preventDefault();
        action("post", "/profil/adresses", adresse, {
            onSuccess: () => {
                setAdresse({ libelle: "", adresse: "", complement: "", telephone: utilisateur?.telephone || "", zone_id: "", par_defaut: false });
                setModal("adresses");
            },
        });
    };

    const ajouterPaiement = (event) => {
        event.preventDefault();
        action("post", "/profil/moyens-paiement", paiement, {
            onSuccess: () => {
                setPaiement({ type: "mobile_money", operateur: "Orange Money", libelle: "", identifiant_masque: "" });
                setModal("paiements");
            },
        });
    };

    return <main className="min-h-screen bg-jse-fond pb-28 text-jse-texte">
        <div className="mx-auto min-h-screen w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-10">
                <SidebarJSE active="profil" />

                <div className="mx-auto w-full max-w-3xl lg:mx-0">
                    <section className="-mx-4 overflow-hidden rounded-b-[34px] bg-jse-principal px-5 pb-8 pt-6 sm:-mx-6 sm:px-8 lg:mx-0 lg:rounded-[34px] lg:pt-8">
                        <div className="flex items-start justify-between">
                            <button type="button" onClick={() => router.visit("/accueil")} className="flex size-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md lg:hidden"><Home size={18} /></button>
                            <button type="button" aria-label="Modifier mon profil" onClick={() => setModal("informations")} className="flex size-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md"><Settings size={18} /></button>
                        </div>
                        <div className="mt-2 flex items-center gap-4">
                            <div className="flex size-[78px] shrink-0 items-center justify-center rounded-full border-4 border-white/20 bg-jse-secondaire text-2xl font-semibold text-white shadow-lg">{((utilisateur?.prenom?.[0] || "") + (utilisateur?.nom?.[0] || "")).toUpperCase() || "J"}</div>
                            <div className="min-w-0 text-white"><h1 className="font-against text-[1.65rem] leading-none">{[utilisateur?.prenom, utilisateur?.nom].filter(Boolean).join(" ") || "Client JSE Express"}</h1><p className="mt-1 font-sans text-xs text-white/70">{utilisateur?.telephone || "Téléphone non renseigné"}</p></div>
                        </div>
                    </section>

                    <section className="pt-5 lg:pt-7">
                        <div className="overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-jse-texte/5">
                            {actions.map((item, index) => {
                                const Icon = item.icon;
                                return <button key={item.id} type="button" onClick={() => executer(item)} className={["group flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-jse-fond/70", index < actions.length - 1 ? "border-b border-jse-texte/5" : ""].join(" ")}>
                                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-jse-fond text-jse-principal"><Icon size={18} strokeWidth={1.8} /></span>
                                    <span className="min-w-0 flex-1"><span className="block font-sans text-xs font-semibold text-jse-texte">{item.label}</span>{item.id === "notifications" && notificationsCount > 0 && <span className="mt-0.5 block font-sans text-[10px] text-jse-secondaire">{notificationsCount} notification{notificationsCount > 1 ? "s" : ""}</span>}</span>
                                    <ChevronRight size={17} className="shrink-0 text-jse-texte/25" />
                                </button>;
                            })}
                        </div>
                        <button type="button" onClick={() => router.post("/deconnexion")} className="mt-4 flex w-full items-center gap-3 rounded-[28px] bg-white px-5 py-4 text-left text-jse-danger shadow-sm ring-1 ring-jse-danger/10"><span className="flex size-10 items-center justify-center rounded-full bg-red-50"><LogOut size={18} /></span><span className="font-sans text-xs font-semibold">Déconnexion</span></button>
                        <p className="px-5 py-6 text-center font-sans text-[10px] leading-5 text-jse-texte/35">JSE Express · Des saveurs plus proche de vous</p>
                    </section>
                </div>
            </div>
        </div>

        <nav className="fixed inset-x-0 bottom-0 z-40 px-4 pb-4 lg:hidden"><div className="mx-auto flex h-[66px] w-full max-w-md items-center justify-around rounded-[24px] border border-white/80 bg-white/95 px-1 shadow-xl shadow-jse-principal/10 backdrop-blur-xl">
            <NavigationItem label="Accueil" icon={Home} onClick={() => router.visit("/accueil")} />
            <NavigationItem label="Commandes" icon={Package} onClick={() => router.visit("/commandes")} />
            <NavigationItem label="Favoris" icon={Heart} onClick={() => router.visit("/favoris")} />
            <NavigationItem label="Profil" icon={UserRound} active />
        </div></nav>

        {modal && <div className="fixed inset-0 z-[80] flex items-end justify-center bg-jse-principal/25 p-0 backdrop-blur-sm sm:items-center sm:p-5" onClick={() => setModal(null)}>
            <div className="max-h-[calc(100vh-1rem)] w-full max-w-md overflow-y-auto rounded-t-[30px] bg-white p-5 shadow-2xl sm:rounded-[30px]" onClick={(event) => event.stopPropagation()}>
                <div className="flex items-center justify-between"><div><p className="font-sans text-[10px] font-semibold uppercase tracking-[0.15em] text-jse-texte/35">JSE Express</p><h2 className="mt-1 font-against text-2xl text-jse-principal">{modal === "informations" ? "Mes informations" : modal === "adresses" ? "Mes adresses" : modal === "paiements" ? "Mes moyens de paiement" : modal === "about" ? "À propos" : "Aide & support"}</h2></div><button type="button" aria-label="Fermer" onClick={() => setModal(null)} className="flex size-10 items-center justify-center rounded-full bg-jse-fond text-jse-principal"><X size={18} /></button></div>
                {erreur && <p role="alert" className="mt-4 rounded-[16px] bg-red-50 px-4 py-3 font-sans text-xs text-red-600">{erreur}</p>}
                {succes && <p role="status" className="mt-4 rounded-[16px] bg-jse-secondaire/10 px-4 py-3 font-sans text-xs text-jse-principal">{succes}</p>}

                {modal === "informations" && <form onSubmit={enregistrer} className="mt-6 space-y-4">
                    <Champ label="Prénom" autoComplete="given-name" value={formulaire.prenom} onChange={(v) => setFormulaire({ ...formulaire, prenom: v })} />
                    <Champ label="Nom" autoComplete="family-name" value={formulaire.nom} onChange={(v) => setFormulaire({ ...formulaire, nom: v })} />
                    <Champ label="Téléphone" type="tel" autoComplete="tel" value={formulaire.telephone} onChange={(v) => setFormulaire({ ...formulaire, telephone: v })} />
                    <Champ label="E-mail" type="email" autoComplete="email" value={formulaire.email} onChange={(v) => setFormulaire({ ...formulaire, email: v })} />
                    {chargement ? <BoutonChargement className="w-full" /> : <button className="h-12 w-full rounded-full bg-jse-secondaire font-sans text-xs font-semibold text-white">Enregistrer les modifications</button>}
                </form>}

                {modal === "adresses" && <div className="mt-5 space-y-3">
                    {adresses.map((item) => <div key={item.id} className="rounded-[20px] bg-jse-fond p-4 ring-1 ring-jse-texte/5"><div className="flex gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-jse-secondaire"><MapPin size={18} /></span><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="font-sans text-xs font-semibold">{item.libelle}</p>{item.par_defaut && <span className="rounded-full bg-jse-secondaire/10 px-2 py-1 font-sans text-[9px] font-bold text-jse-secondaire">Par défaut</span>}</div><p className="mt-1 font-sans text-xs leading-5 text-jse-texte/60">{item.adresse}</p>{item.complement && <p className="font-sans text-[10px] text-jse-texte/45">{item.complement}</p>}</div><div className="flex shrink-0 flex-col gap-2"><button type="button" onClick={() => action("patch", `/profil/adresses/${item.id}/defaut`)} className="flex size-8 items-center justify-center rounded-full bg-white text-jse-secondaire" title="Définir par défaut"><Check size={15} /></button><button type="button" onClick={() => action("delete", `/profil/adresses/${item.id}`)} className="flex size-8 items-center justify-center rounded-full bg-white text-red-500" title="Supprimer"><Trash2 size={15} /></button></div></div></div>)}
                    {adresses.length === 0 && <p className="rounded-[20px] bg-jse-fond p-5 text-center font-sans text-xs text-jse-texte/50">Aucune adresse enregistrée.</p>}
                    <form onSubmit={ajouterAdresse} className="rounded-[22px] border border-jse-texte/10 p-4">
                        <div className="flex items-center gap-2 font-sans text-xs font-semibold text-jse-principal"><Plus size={16} /> Ajouter une adresse</div>
                        <div className="mt-4 space-y-3"><Champ label="Libellé" required placeholder="Maison, travail..." value={adresse.libelle} onChange={(v) => setAdresse({ ...adresse, libelle: v })} /><Champ label="Adresse" required placeholder="Quartier, rue, repère..." value={adresse.adresse} onChange={(v) => setAdresse({ ...adresse, adresse: v })} /><Champ label="Complément" placeholder="Immeuble, étage..." value={adresse.complement} onChange={(v) => setAdresse({ ...adresse, complement: v })} /><Champ label="Téléphone" type="tel" autoComplete="tel" value={adresse.telephone} onChange={(v) => setAdresse({ ...adresse, telephone: v })} /><label className="block"><span className="mb-1.5 block font-sans text-xs font-semibold">Zone</span><select value={adresse.zone_id} onChange={(e) => setAdresse({ ...adresse, zone_id: e.target.value })} className="h-12 w-full rounded-[16px] border border-jse-texte/10 bg-jse-fond px-4 font-sans text-sm outline-none"><option value="">Sélectionner une zone</option>{zones.map((zone) => <option key={zone.id} value={zone.id}>{zone.nom}</option>)}</select></label></div>
                        {chargement ? <div className="mt-4"><BoutonChargement className="w-full" /></div> : <button className="mt-4 flex h-12 w-full items-center justify-center rounded-full bg-jse-secondaire font-sans text-xs font-semibold text-white">Enregistrer l'adresse</button>}
                    </form>
                </div>}

                {modal === "paiements" && <div className="mt-5 space-y-3">
                    {moyensPaiement.map((item) => <div key={item.id} className="flex items-center gap-3 rounded-[20px] bg-jse-fond p-4 ring-1 ring-jse-texte/5"><span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-jse-principal"><WalletCards size={18} /></span><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="font-sans text-xs font-semibold">{item.operateur}</p>{item.par_defaut && <span className="rounded-full bg-jse-secondaire/10 px-2 py-1 font-sans text-[9px] font-bold text-jse-secondaire">Par défaut</span>}</div><p className="mt-1 font-sans text-[10px] text-jse-texte/50">{item.libelle || item.type}{item.identifiant_masque ? ` · ${item.identifiant_masque}` : ""}</p></div><div className="flex gap-2"><button type="button" onClick={() => action("patch", `/profil/moyens-paiement/${item.id}/defaut`)} className="flex size-8 items-center justify-center rounded-full bg-white text-jse-secondaire"><Check size={15} /></button><button type="button" onClick={() => action("delete", `/profil/moyens-paiement/${item.id}`)} className="flex size-8 items-center justify-center rounded-full bg-white text-red-500"><Trash2 size={15} /></button></div></div>)}
                    {moyensPaiement.length === 0 && <p className="rounded-[20px] bg-jse-fond p-5 text-center font-sans text-xs text-jse-texte/50">Aucun moyen de paiement enregistré.</p>}
                    <form onSubmit={ajouterPaiement} className="rounded-[22px] border border-jse-texte/10 p-4">
                        <div className="flex items-center gap-2 font-sans text-xs font-semibold text-jse-principal"><Plus size={16} /> Ajouter un moyen</div>
                        <div className="mt-4 space-y-3"><label className="block"><span className="mb-1.5 block font-sans text-xs font-semibold">Opérateur</span><select value={paiement.operateur} onChange={(e) => setPaiement({ ...paiement, operateur: e.target.value })} className="h-12 w-full rounded-[16px] border border-jse-texte/10 bg-jse-fond px-4 font-sans text-sm outline-none"><option>Orange Money</option><option>MTN Mobile Money</option><option>Moov Money</option><option>Wave</option></select></label><Champ label="Libellé" placeholder="Mon compte principal..." value={paiement.libelle} onChange={(v) => setPaiement({ ...paiement, libelle: v })} /><Champ label="Identifiant masqué" placeholder="07 ** ** 12 34" value={paiement.identifiant_masque} onChange={(v) => setPaiement({ ...paiement, identifiant_masque: v })} /></div>
                        {chargement ? <div className="mt-4"><BoutonChargement className="w-full" /></div> : <button className="mt-4 flex h-12 w-full items-center justify-center rounded-full bg-jse-secondaire font-sans text-xs font-semibold text-white">Enregistrer le moyen</button>}
                    </form>
                </div>}

                {modal === "about" && <div className="mt-5 rounded-[22px] bg-jse-fond p-5"><img src="/assets/jse_logo.png" alt="JSE Express" className="h-14 w-auto object-contain" /><p className="mt-4 font-sans text-sm leading-6 text-jse-texte/65">JSE Express rapproche les clients des restaurants locaux d’Adzopé pour découvrir, commander et se faire livrer leurs plats préférés.</p></div>}
                {modal === "support" && <div className="mt-5 rounded-[22px] bg-jse-fond p-5"><p className="font-sans text-sm leading-6 text-jse-texte/60">Pour le support, contactez l’administration JSE Express. Aucun canal de support dédié n’est encore défini dans le modèle actuel.</p></div>}
            </div>
        </div>}
    </main>;
}

function Champ({ label, value, onChange, type = "text", placeholder = "", required = false, autoComplete }) {
    return <label className="block"><span className="mb-1.5 block font-sans text-xs font-semibold text-jse-texte">{label}{required && <span className="ml-1 text-jse-accent">*</span>}</span><input type={type} required={required} autoComplete={autoComplete} value={value ?? ""} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="h-12 w-full rounded-[16px] border border-jse-texte/10 bg-jse-fond px-4 font-sans text-sm text-jse-texte outline-none transition focus:border-jse-secondaire focus:ring-2 focus:ring-jse-secondaire/10" /></label>;
}

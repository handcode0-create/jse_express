import React, { useEffect, useRef, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import NavigationFlottante from "../Composants/Navigation/NavigationFlottante";
import {
    Bell, Check, ChevronRight, Clock3, Heart, HelpCircle, Info, LogOut,
    Mail, MapPin, MessageCircle, Package, Pencil, Phone, Plus, Trash2,
    Palette, ShieldCheck, UserRound, WalletCards, X,
} from "lucide-react";
import { BoutonChargement } from "../Composants/Interface/EtatsChargement";
import SidebarJSE from "../Composants/Navigation/SidebarJSE";
import CouvertureProfil from "../Composants/Profil/CouvertureProfil";
import FormulaireMotDePasse from "../Composants/Interface/FormulaireMotDePasse";
import PreferencesCompte from "../Composants/Interface/PreferencesCompte";
import { formaterTelephone } from "../lib/format";

const actions = [
    { id: "informations", label: "Mes informations", icon: UserRound, action: "modal" },
    { id: "adresses", label: "Mes adresses", icon: MapPin, action: "modal" },
    { id: "paiements", label: "Mes moyens de paiement", icon: WalletCards, action: "modal" },
    { id: "securite", label: "Sécurité et mot de passe", icon: ShieldCheck, action: "modal" },
    { id: "preferences", label: "Préférences", icon: Palette, action: "modal" },
    { id: "commandes", label: "Mes commandes", icon: Package, action: "route", route: "/commandes" },
    { id: "favoris", label: "Mes favoris", icon: Heart, action: "route", route: "/favoris" },
    { id: "notifications", label: "Notifications", icon: Bell, action: "route", route: "/notifications" },
    { id: "support", label: "Aide & support", icon: HelpCircle, action: "modal" },
    { id: "about", label: "À propos de JSE Express", icon: Info, action: "modal" },
];

function Modal({ title, children, onClose, initialFocusRef }) {
    const closeRef = useRef(null);

    useEffect(() => {
        closeRef.current?.focus();
        const handleKeyDown = (event) => {
            if (event.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            initialFocusRef?.current?.focus();
        };
    }, [onClose, initialFocusRef]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-jse-principal/25 p-0 backdrop-blur-sm sm:items-center sm:p-5"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-jse-xxl bg-jse-theme-surface p-5 shadow-jse-elevated sm:rounded-jse-xxl"
            >
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="font-sans text-xs font-semibold uppercase tracking-widest text-jse-theme-muted">
                            JSE Express
                        </p>
                        <h2 className="mt-1 font-against text-2xl text-jse-principal">
                            {title}
                        </h2>
                    </div>
                    <button
                        ref={closeRef}
                        type="button"
                        aria-label="Fermer"
                        onClick={onClose}
                        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-jse-theme-surface-soft text-jse-principal"
                    >
                        <X size={18} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

function ConfirmationModal({ title, message, onClose, onConfirm, loading, initialFocusRef }) {
    return (
        <Modal title={title} onClose={onClose} initialFocusRef={initialFocusRef}>
            <p className="mt-5 font-sans text-sm leading-6 text-jse-theme-muted">{message}</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="h-11 rounded-jse-grand border border-jse-theme-border bg-transparent px-4 font-sans text-xs font-semibold text-jse-theme-text"
                >
                    Annuler
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={loading}
                    className="h-11 rounded-jse-grand bg-jse-danger px-4 font-sans text-xs font-semibold text-jse-fond"
                >
                    {loading ? "Traitement…" : "Confirmer"}
                </button>
            </div>
        </Modal>
    );
}

function Champ({ label, value, onChange, type = "text", placeholder = "", required = false, autoComplete }) {
    return (
        <label className="block">
            <span className="mb-1.5 block font-sans text-xs font-semibold text-jse-theme-text">
                {label}{required && <span className="ml-1 text-jse-accent">*</span>}
            </span>
            <input
                type={type}
                required={required}
                autoComplete={autoComplete}
                value={value ?? ""}
                placeholder={placeholder}
                onChange={(event) => onChange(event.target.value)}
                className="h-12 w-full rounded-jse-grand border border-jse-theme-border bg-jse-theme-surface-soft px-4 font-sans text-sm text-jse-theme-text outline-none transition focus:border-jse-secondaire focus:ring-2 focus:ring-jse-secondaire/10"
            />
        </label>
    );
}

function Question({ title, children }) {
    const [ouvert, setOuvert] = useState(false);

    return (
        <div className="overflow-hidden rounded-jse-grand border border-jse-theme-border">
            <button
                type="button"
                onClick={() => setOuvert((value) => !value)}
                aria-expanded={ouvert}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left font-sans text-xs font-semibold text-jse-theme-text"
            >
                {title}
                <ChevronRight size={15} className={ouvert ? "rotate-90" : ""} />
            </button>
            {ouvert && (
                <p className="border-t border-jse-theme-border px-4 py-3 font-sans text-xs leading-5 text-jse-theme-muted">
                    {children}
                </p>
            )}
        </div>
    );
}

export default function Profil() {
    const {
        utilisateur,
        notificationsCount = 0,
        adresses = [],
        zones = [],
        moyensPaiement = [],
        support = {},
        flash = {},
    } = usePage().props;

    const [modal, setModal] = useState(null);
    const [chargement, setChargement] = useState(false);
    const [erreur, setErreur] = useState("");
    const [succes, setSucces] = useState(flash?.success || "");
    const [toast, setToast] = useState(null);
    const [confirmation, setConfirmation] = useState(null);
    const [confirmationEnCours, setConfirmationEnCours] = useState(false);
    const [adresseEditionId, setAdresseEditionId] = useState(null);
    const triggerRef = useRef(null);

    const [formulaire, setFormulaire] = useState({
        nom: utilisateur?.nom || "",
        prenom: utilisateur?.prenom || "",
        telephone: formaterTelephone(utilisateur?.telephone || ""),
        email: utilisateur?.email || "",
    });

    const [adresse, setAdresse] = useState({
        libelle: "",
        adresse: "",
        complement: "",
        telephone: utilisateur?.telephone || "",
        zone_id: "",
        par_defaut: adresses.length === 0,
    });

    const [paiement, setPaiement] = useState({
        type: "mobile_money",
        operateur: "Orange Money",
        libelle: "",
        identifiant_masque: "",
    });

    useEffect(() => {
        if (!toast) return undefined;
        const timeout = window.setTimeout(() => setToast(null), 3200);
        return () => window.clearTimeout(timeout);
    }, [toast]);

    const ouvrirModal = (id, element = null) => {
        setErreur("");
        setSucces("");
        triggerRef.current = element || document.activeElement;
        setModal(id);
    };

    const fermerModal = () => {
        setModal(null);
        setErreur("");
        setSucces("");
    };

    const executer = (item, event) => {
        if (item.action === "route") return router.visit(item.route);
        ouvrirModal(item.id, event?.currentTarget);
    };

    const action = (method, url, data = {}, options = {}) => {
        setErreur("");
        setSucces("");
        setChargement(true);

        const callbacks = {
            preserveScroll: true,
            ...options,
            onSuccess: (page) => {
                const message = page?.props?.flash?.success || "Modifications enregistrées.";
                setSucces(message);
                setToast({ type: "succes", message });
                options.onSuccess?.(page);
            },
            onError: (errors) => {
                const premier = Object.values(errors || {})[0];
                setErreur(Array.isArray(premier) ? premier[0] : premier || "Une erreur est survenue. Réessayez dans un instant.");
                options.onError?.(errors);
            },
            onFinish: () => {
                setChargement(false);
                options.onFinish?.();
            },
        };

        if (method === "delete") router.delete(url, callbacks);
        else router[method](url, data, callbacks);
    };

    const enregistrer = (event) => {
        event.preventDefault();
        action("patch", "/profil", formulaire, {
            onSuccess: () => fermerModal(),
        });
    };

    const preparerAjoutAdresse = () => {
        setAdresseEditionId(null);
        setAdresse({
            libelle: "",
            adresse: "",
            complement: "",
            telephone: utilisateur?.telephone || "",
            zone_id: "",
            par_defaut: adresses.length === 0,
        });
        setErreur("");
    };

    const preparerEditionAdresse = (item) => {
        setAdresseEditionId(item.id);
        setAdresse({
            libelle: item.libelle || "",
            adresse: item.adresse || "",
            complement: item.complement || "",
            telephone: item.telephone || utilisateur?.telephone || "",
            zone_id: item.zone?.id ? String(item.zone.id) : "",
            par_defaut: Boolean(item.par_defaut),
        });
        setErreur("");
    };

    const enregistrerAdresse = (event) => {
        event.preventDefault();
        const url = adresseEditionId
            ? `/profil/adresses/${adresseEditionId}`
            : "/profil/adresses";

        action(adresseEditionId ? "patch" : "post", url, adresse, {
            onSuccess: () => {
                setToast({
                    type: "succes",
                    message: adresseEditionId ? "Adresse mise à jour." : "Adresse ajoutée.",
                });
                preparerAjoutAdresse();
            },
        });
    };

    const ajouterPaiement = (event) => {
        event.preventDefault();
        action("post", "/profil/moyens-paiement", paiement, {
            onSuccess: () => {
                setPaiement({
                    type: "mobile_money",
                    operateur: "Orange Money",
                    libelle: "",
                    identifiant_masque: "",
                });
            },
        });
    };

    const confirmerSuppression = () => {
        if (!confirmation || confirmationEnCours) return;

        setConfirmationEnCours(true);
        action("delete", confirmation.url, {}, {
            onSuccess: () => {
                setToast({ type: "succes", message: confirmation.success });
                setConfirmation(null);
            },
            onFinish: () => setConfirmationEnCours(false),
        });
    };

    const demanderSuppressionAdresse = (item, event) => {
        triggerRef.current = event.currentTarget;
        setConfirmation({
            title: "Supprimer cette adresse ?",
            message: "Elle ne sera plus proposée pour vos prochaines commandes.",
            success: "Adresse supprimée.",
            url: `/profil/adresses/${item.id}`,
        });
    };

    const demanderSuppressionPaiement = (item, event) => {
        triggerRef.current = event.currentTarget;
        setConfirmation({
            title: "Supprimer ce moyen de paiement ?",
            message: "Vos commandes passées ne sont pas modifiées.",
            success: "Moyen de paiement supprimé.",
            url: `/profil/moyens-paiement/${item.id}`,
        });
    };

    const supportDisponible = Object.values(support || {}).some(Boolean);
    const whatsapp = String(support?.whatsapp || "").replace(/\D/g, "");

    return (
        <main className="min-h-screen bg-jse-theme-bg pb-28 text-jse-theme-text">
            <div className="mx-auto min-h-screen w-full max-w-none px-4 sm:px-6 lg:px-8">
                <div className="lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-10">
                    <SidebarJSE active="profil" />

                    <div className="mx-auto w-full max-w-none lg:mx-0">
                        <CouvertureProfil user={utilisateur} />

                        <section className="pt-5 lg:pt-7">
                            <div className="overflow-hidden rounded-jse-xxl bg-jse-theme-surface shadow-jse-carte ring-1 ring-jse-theme-border">
                                {actions.map((item, index) => {
                                    const Icon = item.icon;
                                    return (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={(event) => executer(item, event)}
                                            className={[
                                                "group flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-jse-theme-surface-soft",
                                                index < actions.length - 1 ? "border-b border-jse-theme-border" : "",
                                            ].join(" ")}
                                        >
                                            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-jse-theme-surface-soft text-jse-principal">
                                                <Icon size={18} strokeWidth={1.8} />
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="block font-sans text-xs font-semibold text-jse-theme-text">{item.label}</span>
                                                {item.id === "notifications" && notificationsCount > 0 && (
                                                    <span className="mt-0.5 block font-sans text-xs text-jse-secondaire">
                                                        {notificationsCount} notification{notificationsCount > 1 ? "s" : ""}
                                                    </span>
                                                )}
                                            </span>
                                            <ChevronRight size={17} className="shrink-0 text-jse-theme-muted" />
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                type="button"
                                onClick={() => router.post("/deconnexion")}
                                className="mt-4 flex w-full items-center gap-3 rounded-jse-xxl bg-jse-theme-surface px-5 py-4 text-left text-jse-danger shadow-jse-carte ring-1 ring-jse-theme-border"
                            >
                                <span className="flex size-10 items-center justify-center rounded-full bg-jse-danger/10">
                                    <LogOut size={18} />
                                </span>
                                <span className="font-sans text-xs font-semibold">Se déconnecter</span>
                            </button>

                            <p className="px-5 py-6 text-center font-sans text-xs leading-5 text-jse-theme-muted">
                                JSE Express · Des saveurs plus proche de vous
                            </p>
                        </section>
                    </div>
                </div>
            </div>

            <NavigationFlottante type="client" actif="profil" />

            {modal === "informations" && (
                <Modal title="Mes informations" onClose={fermerModal} initialFocusRef={triggerRef}>
                    <form onSubmit={enregistrer} className="mt-6 space-y-4">
                        <Champ label="Prénom" autoComplete="given-name" value={formulaire.prenom} onChange={(v) => setFormulaire({ ...formulaire, prenom: v })} />
                        <Champ label="Nom" autoComplete="family-name" value={formulaire.nom} onChange={(v) => setFormulaire({ ...formulaire, nom: v })} />
                        <Champ label="Téléphone" type="tel" autoComplete="tel" value={formulaire.telephone} onChange={(v) => setFormulaire({ ...formulaire, telephone: v })} />
                        <Champ label="E-mail" type="email" autoComplete="email" value={formulaire.email} onChange={(v) => setFormulaire({ ...formulaire, email: v })} />
                        {erreur && <p role="alert" className="rounded-jse-grand bg-jse-danger/10 px-4 py-3 font-sans text-xs text-jse-danger">{erreur}</p>}
                        {succes && <p role="status" className="rounded-jse-grand bg-jse-secondaire/10 px-4 py-3 font-sans text-xs text-jse-principal">{succes}</p>}
                        {chargement ? <BoutonChargement className="w-full" /> : <button className="h-12 w-full rounded-full bg-jse-secondaire font-sans text-xs font-semibold text-jse-fond">Enregistrer les modifications</button>}
                    </form>
                </Modal>
            )}

            {modal === "adresses" && (
                <Modal title="Mes adresses" onClose={fermerModal} initialFocusRef={triggerRef}>
                    <div className="mt-5 space-y-3">
                        {adresses.map((item) => (
                            <div key={item.id} className="rounded-jse-xl bg-jse-theme-surface-soft p-4 ring-1 ring-jse-theme-border">
                                <div className="flex gap-3">
                                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-jse-theme-surface text-jse-secondaire">
                                        <MapPin size={18} />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="font-sans text-xs font-semibold text-jse-theme-text">{item.libelle}</p>
                                            {item.par_defaut && <span className="rounded-full bg-jse-secondaire/10 px-2 py-1 font-sans text-xs font-bold text-jse-secondaire">Par défaut</span>}
                                        </div>
                                        <p className="mt-1 font-sans text-xs leading-5 text-jse-theme-muted">{item.adresse}</p>
                                        {item.complement && <p className="font-sans text-xs text-jse-theme-muted">{item.complement}</p>}
                                    </div>
                                    <div className="flex shrink-0 flex-col gap-2">
                                        <button type="button" onClick={() => action("patch", `/profil/adresses/${item.id}/defaut`)} className="flex size-8 items-center justify-center rounded-full bg-jse-theme-surface text-jse-secondaire" title="Définir par défaut">
                                            <Check size={15} />
                                        </button>
                                        <button type="button" onClick={() => preparerEditionAdresse(item)} className="flex size-8 items-center justify-center rounded-full bg-jse-theme-surface text-jse-principal" title="Modifier">
                                            <Pencil size={15} />
                                        </button>
                                        <button type="button" onClick={(event) => demanderSuppressionAdresse(item, event)} className="flex size-8 items-center justify-center rounded-full bg-jse-theme-surface text-jse-danger" title="Supprimer">
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {adresses.length === 0 && (
                            <p className="rounded-jse-xl bg-jse-theme-surface-soft p-5 text-center font-sans text-xs text-jse-theme-muted">
                                Aucune adresse enregistrée. Ajoutez-en une pour commander plus vite.
                            </p>
                        )}

                        <form onSubmit={enregistrerAdresse} className="rounded-jse-xl border border-jse-theme-border p-4">
                            <div className="flex items-center gap-2 font-sans text-xs font-semibold text-jse-principal">
                                {adresseEditionId ? <Pencil size={16} /> : <Plus size={16} />}
                                {adresseEditionId ? "Modifier l'adresse" : "Ajouter une adresse"}
                            </div>
                            <div className="mt-4 space-y-3">
                                <Champ label="Libellé" required value={adresse.libelle} onChange={(v) => setAdresse({ ...adresse, libelle: v })} />
                                <Champ label="Adresse" required value={adresse.adresse} onChange={(v) => setAdresse({ ...adresse, adresse: v })} />
                                <Champ label="Complément" value={adresse.complement} onChange={(v) => setAdresse({ ...adresse, complement: v })} />
                                <Champ label="Téléphone" type="tel" autoComplete="tel" value={adresse.telephone} onChange={(v) => setAdresse({ ...adresse, telephone: v })} />
                                <label className="block">
                                    <span className="mb-1.5 block font-sans text-xs font-semibold text-jse-theme-text">Zone</span>
                                    <select
                                        value={adresse.zone_id}
                                        onChange={(event) => setAdresse({ ...adresse, zone_id: event.target.value })}
                                        className="h-12 w-full rounded-jse-grand border border-jse-theme-border bg-jse-theme-surface-soft px-4 font-sans text-sm text-jse-theme-text outline-none"
                                    >
                                        <option value="">Sélectionner une zone</option>
                                        {zones.map((zone) => <option key={zone.id} value={zone.id}>{zone.nom}</option>)}
                                    </select>
                                </label>
                            </div>
                            {erreur && <p role="alert" className="mt-4 rounded-jse-grand bg-jse-danger/10 px-4 py-3 font-sans text-xs text-jse-danger">{erreur}</p>}
                            {succes && <p role="status" className="mt-4 rounded-jse-grand bg-jse-secondaire/10 px-4 py-3 font-sans text-xs text-jse-principal">{succes}</p>}
                            <div className="mt-4 grid grid-cols-2 gap-3">
                                {adresseEditionId && (
                                    <button type="button" onClick={preparerAjoutAdresse} className="h-12 rounded-jse-grand border border-jse-theme-border px-4 font-sans text-xs font-semibold text-jse-theme-text">
                                        Annuler
                                    </button>
                                )}
                                <button className={[`h-12 rounded-jse-grand bg-jse-secondaire px-4 font-sans text-xs font-semibold text-jse-fond`, adresseEditionId ? "" : "col-span-2"].join(" ")}>
                                    {chargement ? "Traitement…" : adresseEditionId ? "Mettre à jour" : "Enregistrer l'adresse"}
                                </button>
                            </div>
                        </form>
                    </div>
                </Modal>
            )}

            {modal === "paiements" && (
                <Modal title="Mes moyens de paiement" onClose={fermerModal} initialFocusRef={triggerRef}>
                    <div className="mt-5 space-y-3">
                        {moyensPaiement.map((item) => (
                            <div key={item.id} className="flex items-center gap-3 rounded-jse-xl bg-jse-theme-surface-soft p-4 ring-1 ring-jse-theme-border">
                                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-jse-theme-surface text-jse-principal">
                                    <WalletCards size={18} />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="font-sans text-xs font-semibold text-jse-theme-text">{item.operateur}</p>
                                        {item.par_defaut && <span className="rounded-full bg-jse-secondaire/10 px-2 py-1 font-sans text-xs font-bold text-jse-secondaire">Par défaut</span>}
                                    </div>
                                    <p className="mt-1 font-sans text-xs text-jse-theme-muted">{item.libelle || item.type}{item.identifiant_masque ? ` · ${item.identifiant_masque}` : ""}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => action("patch", `/profil/moyens-paiement/${item.id}/defaut`)} className="flex size-8 items-center justify-center rounded-full bg-jse-theme-surface text-jse-secondaire" title="Définir par défaut">
                                        <Check size={15} />
                                    </button>
                                    <button type="button" onClick={(event) => demanderSuppressionPaiement(item, event)} className="flex size-8 items-center justify-center rounded-full bg-jse-theme-surface text-jse-danger" title="Supprimer">
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {moyensPaiement.length === 0 && (
                            <p className="rounded-jse-xl bg-jse-theme-surface-soft p-5 text-center font-sans text-xs text-jse-theme-muted">
                                Aucun moyen de paiement enregistré.
                            </p>
                        )}

                        <form onSubmit={ajouterPaiement} className="rounded-jse-xl border border-jse-theme-border p-4">
                            <div className="flex items-center gap-2 font-sans text-xs font-semibold text-jse-principal">
                                <Plus size={16} /> Ajouter un moyen
                            </div>
                            <div className="mt-4 space-y-3">
                                <label className="block">
                                    <span className="mb-1.5 block font-sans text-xs font-semibold text-jse-theme-text">Opérateur</span>
                                    <select value={paiement.operateur} onChange={(event) => setPaiement({ ...paiement, operateur: event.target.value })} className="h-12 w-full rounded-jse-grand border border-jse-theme-border bg-jse-theme-surface-soft px-4 font-sans text-sm text-jse-theme-text outline-none">
                                        <option>Orange Money</option>
                                        <option>MTN Mobile Money</option>
                                        <option>Moov Money</option>
                                        <option>Wave</option>
                                    </select>
                                </label>
                                <Champ label="Libellé" value={paiement.libelle} onChange={(v) => setPaiement({ ...paiement, libelle: v })} />
                                <Champ label="Identifiant masqué" value={paiement.identifiant_masque} onChange={(v) => setPaiement({ ...paiement, identifiant_masque: v })} />
                            </div>
                            {erreur && <p role="alert" className="mt-4 rounded-jse-grand bg-jse-danger/10 px-4 py-3 font-sans text-xs text-jse-danger">{erreur}</p>}
                            {succes && <p role="status" className="mt-4 rounded-jse-grand bg-jse-secondaire/10 px-4 py-3 font-sans text-xs text-jse-principal">{succes}</p>}
                            {chargement ? <div className="mt-4"><BoutonChargement className="w-full" /></div> : <button className="mt-4 h-12 w-full rounded-full bg-jse-secondaire font-sans text-xs font-semibold text-jse-fond">Enregistrer le moyen</button>}
                        </form>
                    </div>
                </Modal>
            )}

            {modal === "securite" && (
                <Modal title="Sécurité" onClose={fermerModal} initialFocusRef={triggerRef}>
                    <div className="mt-5">
                        <FormulaireMotDePasse />
                    </div>
                </Modal>
            )}

            {modal === "preferences" && (
                <Modal title="Préférences" onClose={fermerModal} initialFocusRef={triggerRef}>
                    <div className="mt-5">
                        <PreferencesCompte photoProfil={utilisateur?.photo_profil} />
                    </div>
                </Modal>
            )}

            {modal === "about" && (
                <Modal title="À propos" onClose={fermerModal} initialFocusRef={triggerRef}>
                    <div className="mt-5 space-y-5">
                        <p className="font-sans text-sm leading-6 text-jse-theme-muted">
                            JSE Express est une plateforme de commande et de livraison de repas et de boissons à Adzopé. Vous choisissez un restaurant, commandez, payez et suivez votre livraison depuis votre téléphone.
                        </p>
                        <p className="font-sans text-sm leading-6 text-jse-theme-muted">
                            Chaque livraison est sécurisée par un code PIN à 6 chiffres. Vous ne le donnez au livreur qu'à la remise de votre commande.
                        </p>
                        <button
                            type="button"
                            onClick={() => router.visit("/politique-de-confidentialite")}
                            className="flex w-full items-center justify-between rounded-jse-grand border border-jse-theme-border px-4 py-3 font-sans text-xs font-semibold text-jse-principal"
                        >
                            Politique de confidentialité
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </Modal>
            )}

            {modal === "support" && (
                <Modal title="Aide & support" onClose={fermerModal} initialFocusRef={triggerRef}>
                    <div className="mt-5 space-y-5">
                        <p className="font-sans text-sm leading-6 text-jse-theme-muted">
                            Une question sur une commande ? Contactez-nous en indiquant son numéro (ex. JSE-000123).
                        </p>

                        {supportDisponible ? (
                            <div className="space-y-2">
                                {support?.telephone && <a href={`tel:${support.telephone}`} className="flex items-center gap-3 rounded-jse-grand bg-jse-theme-surface-soft px-4 py-3 font-sans text-xs font-semibold text-jse-principal"><Phone size={17} /> {support.telephone}</a>}
                                {support?.whatsapp && <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-jse-grand bg-jse-theme-surface-soft px-4 py-3 font-sans text-xs font-semibold text-jse-principal"><MessageCircle size={17} /> WhatsApp</a>}
                                {support?.email && <a href={`mailto:${support.email}`} className="flex items-center gap-3 rounded-jse-grand bg-jse-theme-surface-soft px-4 py-3 font-sans text-xs font-semibold text-jse-principal"><Mail size={17} /> {support.email}</a>}
                                {support?.horaires && <div className="flex items-start gap-3 rounded-jse-grand bg-jse-theme-surface-soft px-4 py-3 font-sans text-xs text-jse-theme-text"><Clock3 size={17} className="mt-0.5 shrink-0" /> {support.horaires}</div>}
                            </div>
                        ) : (
                            <p className="rounded-jse-grand bg-jse-theme-surface-soft p-4 font-sans text-sm leading-6 text-jse-theme-muted">
                                Le support est joint depuis l'administration JSE Express.
                            </p>
                        )}

                        <div>
                            <p className="font-sans text-xs font-semibold text-jse-principal">Questions fréquentes</p>
                            <div className="mt-3 space-y-2">
                                <Question title="Comment fonctionne le code PIN ?">Un code à 6 chiffres est associé à chaque commande, visible dans son détail. Donnez-le au livreur uniquement à la remise. La livraison n'est clôturée qu'après vérification du code.</Question>
                                <Question title="Puis-je annuler ma commande ?">Oui, tant qu'elle est reçue ou confirmée, avant le début de la préparation. Utilisez le bouton Annuler dans le détail de la commande.</Question>
                                <Question title="Comment sont calculés les frais de livraison ?">Selon la distance entre le restaurant et votre position. Le montant s'affiche avant la validation.</Question>
                                <Question title="Quels moyens de paiement puis-je utiliser ?">Ceux proposés à l'étape Paiement de votre commande.</Question>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}

            {confirmation && (
                <ConfirmationModal
                    title={confirmation.title}
                    message={confirmation.message}
                    loading={confirmationEnCours}
                    initialFocusRef={triggerRef}
                    onClose={() => {
                        if (!confirmationEnCours) setConfirmation(null);
                    }}
                    onConfirm={confirmerSuppression}
                />
            )}

            {toast && (
                <div
                    role={toast.type === "erreur" ? "alert" : "status"}
                    className={[
                        "fixed bottom-24 left-4 right-4 z-50 mx-auto flex max-w-md items-center gap-3 rounded-jse-grand border px-4 py-3 shadow-jse-elevated sm:left-auto sm:right-6",
                        toast.type === "erreur"
                            ? "border-jse-danger/20 bg-jse-theme-surface text-jse-danger"
                            : "border-jse-secondaire/20 bg-jse-theme-surface text-jse-principal",
                    ].join(" ")}
                >
                    <Check size={17} className={toast.type === "erreur" ? "text-jse-danger" : "text-jse-secondaire"} />
                    <span className="font-sans text-xs font-semibold">{toast.message}</span>
                </div>
            )}
        </main>
    );
}

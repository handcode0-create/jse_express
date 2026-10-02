import { router, useForm, usePage } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";
import {
    ArrowLeft,
    Bike,
    Building2,
    Check,
    ChevronLeft,
    ChevronRight,
    Eye,
    EyeOff,
    MapPin,
    ShoppingBag,
    UserRound,
} from "lucide-react";

const roles = [
    {
        value: "client",
        title: "Je veux commander",
        description: "Je souhaite découvrir les restaurants et me faire livrer.",
        icon: ShoppingBag,
    },
    {
        value: "restaurant",
        title: "Je gère un restaurant",
        description: "Je souhaite proposer mes plats et recevoir des commandes.",
        icon: Building2,
    },
    {
        value: "livreur",
        title: "Je veux livrer",
        description: "Je souhaite effectuer les livraisons JSE Express.",
        icon: Bike,
    },
];

const inputClass =
    "h-12 w-full rounded-xl border border-white/10 bg-white/[0.045] px-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-jse-secondaire/70 focus:bg-white/[0.065] focus:ring-4 focus:ring-jse-secondaire/10";

export default function Inscription() {
    const { zones = [], errors = {} } = usePage().props;
    const [etape, setEtape] = useState(1);
    const [afficherMotDePasse, setAfficherMotDePasse] = useState(false);
    const [afficherConfirmation, setAfficherConfirmation] = useState(false);

    const { data, setData, post, processing } = useForm({
        role: "",
        nom: "",
        prenom: "",
        telephone: "",
        email: "",
        mot_de_passe: "",
        confirmation_mot_de_passe: "",
        consentement: false,
        restaurant_nom: "",
        restaurant_description: "",
        restaurant_telephone: "",
        restaurant_email: "",
        restaurant_adresse: "",
        restaurant_zone_id: "",
        livreur_matricule: "",
        livreur_zone_id: "",
        livreur_disponibilite: "indisponible",
        livreur_telephone_secondaire: "",
    });

    const erreurs = useMemo(() => Object.values(errors || {}), [errors]);

    useEffect(() => {
        if (Object.keys(errors || {}).length > 0) {
            const champsProfil = [
                "restaurant_",
                "livreur_",
            ];
            const aErreurProfil = Object.keys(errors).some((key) =>
                champsProfil.some((prefix) => key.startsWith(prefix)),
            );
            if (aErreurProfil) setEtape(2);
            else setEtape(3);
        }
    }, [errors]);

    const modifier = (champ, valeur) => setData(champ, valeur);

    const roleSelectionne = roles.find((role) => role.value === data.role);

    const continuer = () => {
        if (etape === 1 && data.role) setEtape(2);
        else if (etape === 2) setEtape(3);
    };

    const soumettre = (event) => {
        event.preventDefault();
        post("/inscription", {
            preserveScroll: true,
        });
    };

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#07110F] font-sans text-white">\n            <img src="/assets/login_page_fond.png" alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 size-full object-cover object-center" />\n            <div className="pointer-events-none absolute inset-0 bg-[#07110F]/78" />\n            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#123C32]/75 via-[#07110F]/70 to-[#07110F]/90" />\n            <div className="pointer-events-none absolute -left-32 top-20 size-96 rounded-full bg-jse-secondaire/15 blur-3xl" />\n            <div className="pointer-events-none absolute -bottom-40 right-0 size-[32rem] rounded-full bg-jse-accent/10 blur-3xl" />
            <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-5 sm:px-8 lg:px-10">
                <header className="flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => router.visit("/authentification")}
                        className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/65 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                    >
                        <ArrowLeft size={18} />
                        Retour
                    </button>

                    <img
                        src="/assets/jse_logo.png"
                        alt="JSE Express"
                        className="h-11 w-auto object-contain"
                    />
                </header>

                <section className="flex flex-1 items-center justify-center py-10 lg:py-14">
                    <div className="w-full max-w-5xl">
                        <aside className="relative hidden min-h-[620px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#123C32]/55 p-9 text-white shadow-2xl shadow-black/30 backdrop-blur-2xl lg:flex lg:flex-col lg:justify-between">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-jse-secondaire">
                                    JSE Express
                                </p>
                                <h1 className="mt-5 font-against text-4xl leading-tight xl:text-5xl">
                                    Créons votre
                                    <br />
                                    espace.
                                </h1>
                                <p className="mt-5 max-w-sm text-sm leading-7 text-white/65">
                                    Quelques questions suffisent pour créer le
                                    profil correspondant à votre utilisation de
                                    JSE Express.
                                </p>
                            </div>

                            <div className="space-y-4">
                                {[1, 2, 3].map((numero) => (
                                    <div key={numero} className="flex items-center gap-3">
                                        <span
                                            className={
                                                "flex size-9 items-center justify-center rounded-full text-xs font-bold " +
                                                (etape >= numero
                                                    ? "bg-jse-secondaire text-jse-principal"
                                                    : "bg-white/10 text-white/40")
                                            }
                                        >
                                            {etape > numero ? <Check size={16} /> : numero}
                                        </span>
                                        <span className="text-sm text-white/60">
                                            {numero === 1
                                                ? "Votre utilisation"
                                                : numero === 2
                                                  ? "Votre profil"
                                                  : "Vos identifiants"}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </aside>

                        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#0B1513]/80 p-6 shadow-2xl shadow-black/30 backdrop-blur-2xl sm:p-9">
                            <div className="mb-8">
                                <p className="text-sm font-semibold text-jse-secondaire">
                                    Étape {etape} sur 3
                                </p>
                                <h2 className="mt-2 font-against text-3xl leading-tight sm:text-4xl">
                                    {etape === 1
                                        ? "Comment allez-vous utiliser JSE ?"
                                        : etape === 2
                                          ? roleSelectionne?.value === "restaurant"
                                              ? "Parlez-nous de votre restaurant"
                                              : roleSelectionne?.value === "livreur"
                                                ? "Complétons votre profil livreur"
                                                : "Votre profil client"
                                          : "Créons vos identifiants"}
                                </h2>
                                <p className="mt-3 text-sm leading-6 text-white/45">
                                    {etape === 1
                                        ? "Votre réponse détermine le profil créé dans JSE Express."
                                        : etape === 2
                                          ? "Ces informations sont enregistrées dans le profil correspondant à votre rôle."
                                          : "Ces informations permettront de sécuriser votre compte."}
                                </p>
                            </div>

                            {erreurs.length > 0 && (
                                <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-600">
                                    {erreurs.map((erreur, index) => (
                                        <p key={index}>{erreur}</p>
                                    ))}
                                </div>
                            )}

                            <form onSubmit={soumettre}>
                                {etape === 1 && (
                                    <div className="grid gap-3 sm:grid-cols-3">
                                        {roles.map((role) => {
                                            const Icon = role.icon;
                                            const active = data.role === role.value;

                                            return (
                                                <button
                                                    key={role.value}
                                                    type="button"
                                                    onClick={() => modifier("role", role.value)}
                                                    className={
                                                        "group relative min-h-[190px] rounded-2xl border p-5 text-left transition duration-200 " +
                                                        (active
                                                            ? "border-jse-secondaire/70 bg-jse-secondaire/[0.09] shadow-lg shadow-jse-secondaire/5"
                                                            : "border-white/10 bg-white/[0.025] hover:border-white/20 hover:bg-white/[0.05]")
                                                    }
                                                >
                                                    <span className={"flex size-12 shrink-0 items-center justify-center rounded-2xl " + (active ? "bg-jse-secondaire text-jse-principal" : "bg-jse-principal/5 text-jse-principal")}>
                                                        <Icon size={21} />
                                                    </span>
                                                    <span className="min-w-0 flex-1">
                                                        <span className="block text-sm font-bold">{role.title}</span>
                                                        <span className="mt-2 block text-xs leading-5 text-white/40">{role.description}</span>
                                                    </span>
                                                    <span className={"absolute right-4 top-4 flex size-5 items-center justify-center rounded-full border " + (active ? "border-jse-secondaire bg-jse-secondaire text-jse-principal" : "border-jse-texte/15")}>
                                                        {active && <Check size={14} />}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                {etape === 2 && (
                                    <div className="space-y-5">
                                        {data.role === "client" && (
                                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-6 text-white/45">
                                                Votre profil client sera créé à partir de vos informations personnelles. Les adresses de livraison pourront être ajoutées ensuite depuis votre espace.
                                            </div>
                                        )}

                                        {data.role === "restaurant" && (
                                            <>
                                                <Champ label="Nom du restaurant" value={data.restaurant_nom} onChange={(v) => modifier("restaurant_nom", v)} placeholder="Ex. Restaurant..." />
                                                <Champ label="Téléphone du restaurant" value={data.restaurant_telephone} onChange={(v) => modifier("restaurant_telephone", v)} placeholder="Votre numéro professionnel" type="tel" />
                                                <Champ label="Adresse du restaurant" value={data.restaurant_adresse} onChange={(v) => modifier("restaurant_adresse", v)} placeholder="Adresse du restaurant" />
                                                <Champ label="Description" value={data.restaurant_description} onChange={(v) => modifier("restaurant_description", v)} placeholder="Présentez brièvement votre restaurant" textarea />
                                                <Select label="Zone du restaurant" value={data.restaurant_zone_id} onChange={(v) => modifier("restaurant_zone_id", v)} zones={zones} />
                                            </>
                                        )}

                                        {data.role === "livreur" && (
                                            <>
                                                <Champ label="Matricule livreur" value={data.livreur_matricule} onChange={(v) => modifier("livreur_matricule", v)} placeholder="Votre matricule" />
                                                <Select label="Zone d'activité" value={data.livreur_zone_id} onChange={(v) => modifier("livreur_zone_id", v)} zones={zones} />
                                                <div>
                                                    <label className="mb-2 block text-xs font-semibold text-white/70">Disponibilité</label>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {[
                                                            ["disponible", "Disponible"],
                                                            ["indisponible", "Indisponible"],
                                                        ].map(([value, label]) => (
                                                            <button
                                                                key={value}
                                                                type="button"
                                                                onClick={() => modifier("livreur_disponibilite", value)}
                                                                className={"rounded-2xl border px-4 py-3 text-sm font-semibold transition " + (data.livreur_disponibilite === value ? "border-jse-secondaire/60 bg-jse-secondaire/10 text-jse-secondaire" : "border-white/10 bg-white/[0.025] text-white/45 hover:bg-white/[0.05]")}
                                                            >
                                                                {label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <Champ label="Téléphone secondaire" value={data.livreur_telephone_secondaire} onChange={(v) => modifier("livreur_telephone_secondaire", v)} placeholder="Facultatif" type="tel" />
                                            </>
                                        )}
                                    </div>
                                )}

                                {etape === 3 && (
                                    <div className="space-y-5">
                                        <div className="grid gap-5 sm:grid-cols-2">
                                            <Champ label="Prénom" value={data.prenom} onChange={(v) => modifier("prenom", v)} placeholder="Votre prénom" />
                                            <Champ label="Nom" value={data.nom} onChange={(v) => modifier("nom", v)} placeholder="Votre nom" />
                                        </div>
                                        <Champ label="Téléphone" value={data.telephone} onChange={(v) => modifier("telephone", v)} placeholder="Votre numéro" type="tel" />
                                        <Champ label="E-mail" value={data.email} onChange={(v) => modifier("email", v)} placeholder="Facultatif" type="email" />
                                        <PasswordChamp label="Mot de passe" value={data.mot_de_passe} onChange={(v) => modifier("mot_de_passe", v)} visible={afficherMotDePasse} toggle={() => setAfficherMotDePasse(!afficherMotDePasse)} />
                                        <PasswordChamp label="Confirmer le mot de passe" value={data.confirmation_mot_de_passe} onChange={(v) => modifier("confirmation_mot_de_passe", v)} visible={afficherConfirmation} toggle={() => setAfficherConfirmation(!afficherConfirmation)} />
                                        <label className="flex items-start gap-3 rounded-2xl bg-jse-principal/5 p-4 text-xs leading-5 text-jse-texte/55">
                                            <input type="checkbox" checked={data.consentement} onChange={(e) => modifier("consentement", e.target.checked)} className="mt-1 size-4 accent-jse-secondaire" />
                                            <span>J’accepte la politique de confidentialité et consens au traitement de mes données personnelles par JSE Express.</span>
                                        </label>
                                    </div>
                                )}

                                <div className="mt-8 flex items-center justify-between gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setEtape((value) => Math.max(1, value - 1))}
                                        disabled={etape === 1}
                                        className="flex h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.025] px-5 text-sm font-semibold text-white/55 transition hover:bg-white/[0.06] hover:text-white disabled:pointer-events-none disabled:opacity-25"
                                    >
                                        <ChevronLeft size={18} />
                                        Retour
                                    </button>

                                    {etape < 3 ? (
                                        <button
                                            type="button"
                                            onClick={continuer}
                                            disabled={etape === 1 && !data.role}
                                            className="flex h-11 items-center gap-2 rounded-full bg-jse-secondaire px-6 text-sm font-bold text-jse-principal transition hover:brightness-105 disabled:pointer-events-none disabled:opacity-35"
                                        >
                                            Continuer
                                            <ChevronRight size={18} />
                                        </button>
                                    ) : (
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="flex h-11 items-center gap-2 rounded-full bg-jse-secondaire px-6 text-sm font-bold text-jse-principal transition hover:brightness-105 disabled:opacity-50"
                                        >
                                            {processing ? "Création..." : "Créer mon compte"}
                                            <Check size={18} />
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}

function Champ({ label, value, onChange, placeholder, type = "text", textarea = false }) {
    return (
        <div>
            <label className="mb-2 block text-sm font-semibold">{label}</label>
            {textarea ? (
                <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={4} className={inputClass + " h-auto py-3 resize-none"} />
            ) : (
                <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputClass} />
            )}
        </div>
    );
}

function Select({ label, value, onChange, zones }) {
    return (
        <div>
            <label className="mb-2 block text-sm font-semibold">{label}</label>
            <div className="relative">
                <MapPin size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <select value={value} onChange={(e) => onChange(e.target.value)} className={inputClass + " appearance-none pl-11"}>
                    <option value="">Sélectionner une zone</option>
                    {zones.map((zone) => <option key={zone.id} value={zone.id}>{zone.nom}</option>)}
                </select>
            </div>
        </div>
    );
}

function PasswordChamp({ label, value, onChange, visible, toggle }) {
    return (
        <div>
            <label className="mb-2 block text-sm font-semibold">{label}</label>
            <div className="relative">
                <input type={visible ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} placeholder="8 caractères minimum" className={inputClass + " pr-12"} />
                <button type="button" onClick={toggle} className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-white/35 transition hover:bg-white/5 hover:text-white">
                    {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
        </div>
    );
}

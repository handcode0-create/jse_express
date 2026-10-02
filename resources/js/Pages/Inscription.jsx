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
    "h-13 w-full rounded-2xl border border-jse-texte/10 bg-white px-4 text-sm outline-none transition placeholder:text-jse-texte/30 focus:border-jse-secondaire focus:ring-4 focus:ring-jse-secondaire/10";

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
        <main className="min-h-screen bg-[#FFF7E8] font-sans text-jse-texte">
            <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-5 sm:px-8 lg:px-10">
                <header className="flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => router.visit("/authentification")}
                        className="flex items-center gap-2 text-sm font-medium text-jse-texte/55 transition hover:text-jse-principal"
                    >
                        <ArrowLeft size={18} />
                        Retour
                    </button>

                    <img
                        src="/assets/jse_logo.png"
                        alt="JSE Express"
                        className="h-10 w-auto object-contain"
                    />
                </header>

                <section className="flex flex-1 items-center justify-center py-10 lg:py-14">
                    <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[0.72fr_1.28fr]">
                        <aside className="hidden rounded-[2rem] bg-jse-principal p-8 text-white lg:flex lg:flex-col lg:justify-between">
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

                        <div className="rounded-[2rem] border border-jse-texte/8 bg-white p-6 shadow-xl shadow-jse-principal/5 sm:p-9">
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
                                <p className="mt-3 text-sm leading-6 text-jse-texte/50">
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
                                    <div className="grid gap-3">
                                        {roles.map((role) => {
                                            const Icon = role.icon;
                                            const active = data.role === role.value;

                                            return (
                                                <button
                                                    key={role.value}
                                                    type="button"
                                                    onClick={() => modifier("role", role.value)}
                                                    className={
                                                        "flex items-center gap-4 rounded-2xl border p-4 text-left transition " +
                                                        (active
                                                            ? "border-jse-secondaire bg-jse-secondaire/8 ring-4 ring-jse-secondaire/10"
                                                            : "border-jse-texte/10 hover:border-jse-secondaire/40 hover:bg-jse-principal/[0.025]")
                                                    }
                                                >
                                                    <span className={"flex size-12 shrink-0 items-center justify-center rounded-xl " + (active ? "bg-jse-secondaire text-jse-principal" : "bg-jse-principal/5 text-jse-principal")}>
                                                        <Icon size={21} />
                                                    </span>
                                                    <span className="min-w-0 flex-1">
                                                        <span className="block text-sm font-bold">{role.title}</span>
                                                        <span className="mt-1 block text-xs leading-5 text-jse-texte/50">{role.description}</span>
                                                    </span>
                                                    <span className={"flex size-6 items-center justify-center rounded-full border " + (active ? "border-jse-secondaire bg-jse-secondaire text-jse-principal" : "border-jse-texte/15")}>
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
                                            <div className="rounded-2xl bg-jse-principal/5 p-5 text-sm leading-6 text-jse-texte/60">
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
                                                    <label className="mb-2 block text-sm font-semibold">Disponibilité</label>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {[
                                                            ["disponible", "Disponible"],
                                                            ["indisponible", "Indisponible"],
                                                        ].map(([value, label]) => (
                                                            <button
                                                                key={value}
                                                                type="button"
                                                                onClick={() => modifier("livreur_disponibilite", value)}
                                                                className={"rounded-2xl border px-4 py-3 text-sm font-semibold transition " + (data.livreur_disponibilite === value ? "border-jse-secondaire bg-jse-secondaire/10 text-jse-principal" : "border-jse-texte/10")}
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
                                            <input type="checkbox" checked={data.consentement} onChange={(e) => modifier("consentement", e.target.checked)} className="mt-1 size-4 accent-jse-principal" />
                                            <span>J’accepte la politique de confidentialité et consens au traitement de mes données personnelles par JSE Express.</span>
                                        </label>
                                    </div>
                                )}

                                <div className="mt-8 flex items-center justify-between gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setEtape((value) => Math.max(1, value - 1))}
                                        disabled={etape === 1}
                                        className="flex h-12 items-center gap-2 rounded-full border border-jse-texte/10 px-5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-30"
                                    >
                                        <ChevronLeft size={18} />
                                        Retour
                                    </button>

                                    {etape < 3 ? (
                                        <button
                                            type="button"
                                            onClick={continuer}
                                            disabled={etape === 1 && !data.role}
                                            className="flex h-12 items-center gap-2 rounded-full bg-jse-principal px-6 text-sm font-semibold text-white transition hover:bg-jse-principal/90 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            Continuer
                                            <ChevronRight size={18} />
                                        </button>
                                    ) : (
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="flex h-12 items-center gap-2 rounded-full bg-jse-principal px-7 text-sm font-semibold text-white transition hover:bg-jse-principal/90 disabled:opacity-50"
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
                <MapPin size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-jse-texte/35" />
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
                <button type="button" onClick={toggle} className="absolute right-4 top-1/2 -translate-y-1/2 text-jse-texte/35">
                    {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
        </div>
    );
}

import { router, useForm, usePage } from "@inertiajs/react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    ArrowLeft,
    Check,
    ChevronLeft,
    ChevronRight,
    Eye,
    EyeOff,
    BadgeCheck,
    Bike,
    Building2,
    Clock3,
    Mail,
    MapPin,
    Phone,
    ShieldCheck,
} from "lucide-react";

const roles = [
    {
        value: "client",
        title: "Commander mes plats",
        description: "Découvrir les restaurants et me faire livrer.",
        image: "/assets/inscription/shopping_bag.png",
    },
    {
        value: "restaurant",
        title: "Gérer mon restaurant",
        description: "Gérer mes plats, menus et commandes.",
        image: "/assets/inscription/resto.png",
    },
    {
        value: "livreur",
        title: "Livreur indépendant",
        description: "Effectuer les livraisons JSE Express.",
        image: "/assets/inscription/livreur.png",
    },
];

const inputClass =
    "h-12 w-full rounded-xl border border-white/10 bg-white/[0.045] px-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-jse-secondaire/70 focus:bg-white/[0.065] focus:ring-4 focus:ring-jse-secondaire/10";

export default function Inscription() {
    const { zones = [], captcha = {} } = usePage().props;
    const [etape, setEtape] = useState(1);
    const [afficherMotDePasse, setAfficherMotDePasse] = useState(false);
    const [afficherConfirmation, setAfficherConfirmation] = useState(false);
    const captchaRef = useRef(null);
    const captchaWidgetRef = useRef(null);

    const { data, setData, post, processing, errors, clearErrors, setError } = useForm({
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
        recaptcha_token: "",
    });

    const erreursEtape = useMemo(() => {
        const toutes = errors || {};
        const keys = Object.keys(toutes);

        if (etape === 1) {
            return keys
                .filter((key) => key === "role")
                .map((key) => toutes[key]);
        }

        if (etape === 2) {
            const prefixos =
                data.role === "restaurant"
                    ? ["restaurant_"]
                    : data.role === "livreur"
                      ? ["livreur_"]
                      : [];
            return keys
                .filter((key) => prefixos.some((prefix) => key.startsWith(prefix)))
                .map((key) => toutes[key]);
        }

        const profilPrefixes = ["restaurant_", "livreur_"];
        return keys
            .filter((key) => key !== "role" && !profilPrefixes.some((prefix) => key.startsWith(prefix)))
            .map((key) => toutes[key]);
    }, [errors, etape, data.role]);

    const roleSelectionne = roles.find((role) => role.value === data.role);

    useEffect(() => {
        if (!Object.keys(errors || {}).length) return;

        const profilPrefixes = ["restaurant_", "livreur_"];
        const erreurProfil = Object.keys(errors).some((key) =>
            profilPrefixes.some((prefix) => key.startsWith(prefix)),
        );

        if (erreurProfil) {
            setEtape(2);
        } else if (errors.role) {
            setEtape(1);
        } else {
            setEtape(3);
        }
    }, [errors]);

    const modifier = (champ, valeur) => {
        setData(champ, valeur);
        if (errors?.[champ]) clearErrors(champ);
    };

    const selectionnerRole = (role) => {
        clearErrors("role");
        setData("role", role);
    };

    const continuer = () => {
        clearErrors();

        if (etape === 1) {
            if (!data.role) {
                setError("role", "Veuillez sélectionner votre utilisation de JSE Express.");
                return;
            }

            // Un client n'a pas de profil métier supplémentaire dans le MCD.
            // Il passe donc directement aux informations du compte.
            setEtape(data.role === "client" ? 3 : 2);
            return;
        }

        if (etape === 2) {
            if (data.role === "restaurant") {
                const champs = [
                    ["restaurant_nom", "Le nom du restaurant est obligatoire."],
                    ["restaurant_telephone", "Le téléphone du restaurant est obligatoire."],
                    ["restaurant_adresse", "L'adresse du restaurant est obligatoire."],
                ];
                const manquants = champs.filter(([champ]) => !String(data[champ] || "").trim());

                if (manquants.length > 0) {
                    manquants.forEach(([champ, message]) => setError(champ, message));
                    return;
                }
            }

            if (data.role === "livreur") {
                const champs = [
                    ["livreur_matricule", "Le matricule livreur est obligatoire."],
                    ["livreur_disponibilite", "Veuillez indiquer votre disponibilité."],
                ];
                const manquants = champs.filter(([champ]) => !String(data[champ] || "").trim());

                if (manquants.length > 0) {
                    manquants.forEach(([champ, message]) => setError(champ, message));
                    return;
                }
            }

            setEtape(3);
        }
    };

    useEffect(() => {
        if (!captcha?.enabled || !captcha?.site_key || !captchaRef.current) return;

        const rendreCaptcha = () => {
            if (!window.grecaptcha || !captchaRef.current || captchaWidgetRef.current !== null) return;
            captchaWidgetRef.current = window.grecaptcha.render(captchaRef.current, {
                sitekey: captcha.site_key,
                theme: "dark",
                callback: (token) => setData("recaptcha_token", token),
                "expired-callback": () => setData("recaptcha_token", ""),
                "error-callback": () => setData("recaptcha_token", ""),
            });
        };

        if (window.grecaptcha) {
            rendreCaptcha();
            return;
        }

        const script = document.createElement("script");
        script.src = "https://www.google.com/recaptcha/api.js?render=explicit&hl=fr";
        script.async = true;
        script.defer = true;
        script.onload = rendreCaptcha;
        document.head.appendChild(script);

        return () => {
            script.onload = null;
        };
    }, [captcha?.enabled, captcha?.site_key]);

    const soumettre = (event) => {
        event.preventDefault();
        post("/inscription", { preserveScroll: true });
    };

    const labelsEtapes = ["Votre utilisation", "Votre profil", "Vos identifiants"];

    return (
        <main className="relative min-h-screen overflow-x-hidden bg-jse-principal font-sans text-white">
            <img
                src="/assets/login_page_fond.png"
                alt=""
                aria-hidden="true"
                className="pointer-events-none fixed inset-0 size-full object-cover object-center opacity-30"
            />
            <div className="pointer-events-none fixed inset-0 bg-jse-principal/80" />
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_45%,rgba(69,185,119,.22),transparent_30%),radial-gradient(circle_at_80%_60%,rgba(242,140,40,.08),transparent_28%)]" />

            <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1240px] flex-col px-4 py-4 sm:px-6 lg:px-8">
                <header className="flex h-14 shrink-0 items-center justify-between">
                    <button
                        type="button"
                        onClick={() => router.visit("/authentification")}
                        className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-4 py-2.5 text-xs font-semibold text-white/60 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                    >
                        <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-0.5" />
                        Retour
                    </button>

                    <img
                        src="/assets/jse_logo.png"
                        alt="JSE Express"
                        className="h-10 w-auto object-contain"
                    />
                </header>

                <section className="flex flex-1 items-center justify-center py-5 sm:py-8">
                    <div className="grid w-full max-w-[1080px] overflow-hidden rounded-[28px] border border-white/10 bg-[#0A1211]/90 shadow-[0_30px_100px_rgba(0,0,0,.45)] backdrop-blur-2xl lg:grid-cols-[.78fr_1.22fr]">
                        <aside className="relative hidden min-h-[650px] overflow-hidden border-r border-white/10 bg-[var(--color-jse-principal)]/90 p-8 lg:flex lg:flex-col lg:justify-between">
                            <div className="pointer-events-none absolute -right-28 -top-28 size-72 rounded-full bg-jse-secondaire/20 blur-3xl" />
                            <div className="pointer-events-none absolute -bottom-32 -left-24 size-80 rounded-full bg-jse-accent/10 blur-3xl" />

                            <div className="relative">
                                <p className="text-[11px] font-bold uppercase tracking-[.24em] text-jse-secondaire">
                                    JSE EXPRESS
                                </p>
                                <h1 className="mt-5 max-w-xs font-against text-[48px] leading-[.92] text-[var(--color-jse-fond)] xl:text-[56px]">
                                    Créons
                                    <br />
                                    votre
                                    <br />
                                    espace.
                                </h1>
                                <p className="mt-7 max-w-xs text-sm leading-6 text-white/55">
                                    Quelques questions suffisent pour créer le profil
                                    correspondant à votre utilisation de JSE Express.
                                </p>
                            </div>

                            <div className="relative">
                                <div className="mb-7 h-px w-full bg-white/10" />
                                <div className="space-y-4">
                                    {labelsEtapes.map((label, index) => {
                                        const numero = index + 1;
                                        const active = etape === numero;
                                        const complete = etape > numero;

                                        return (
                                            <div key={label} className="flex items-center gap-3">
                                                <span
                                                    className={
                                                        "flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition " +
                                                        (active
                                                            ? "bg-jse-secondaire text-jse-principal shadow-lg shadow-jse-secondaire/25"
                                                            : complete
                                                              ? "bg-jse-secondaire/20 text-jse-secondaire"
                                                              : "bg-white/[0.08] text-white/35")
                                                    }
                                                >
                                                    {complete ? <Check size={14} /> : numero}
                                                </span>
                                                <span
                                                    className={
                                                        "text-xs transition " +
                                                        (active ? "font-semibold text-white" : "text-white/45")
                                                    }
                                                >
                                                    {label}
                                                </span>
                                                {active && (
                                                    <span className="ml-auto h-px w-12 bg-gradient-to-r from-jse-secondaire to-transparent" />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </aside>

                        <div className="min-w-0 p-5 sm:p-8 lg:p-9">
                            <div className="mb-7 flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-[.18em] text-jse-secondaire">
                                        Étape {etape} sur 3
                                    </p>
                                    <h2 className="mt-2 max-w-2xl font-against text-[32px] leading-[1.02] text-[var(--color-jse-fond)] sm:text-[38px]">
                                        {etape === 1
                                            ? "Comment utiliserez-vous JSE Express ?"
                                            : etape === 2
                                              ? roleSelectionne?.value === "restaurant"
                                                  ? "Parlons de votre restaurant."
                                                  : roleSelectionne?.value === "livreur"
                                                    ? "Complétons votre profil."
                                                    : "Votre profil client."
                                              : "Créons vos identifiants."}
                                    </h2>
                                    <p className="mt-3 max-w-xl text-xs leading-5 text-white/40 sm:text-sm">
                                        {etape === 1
                                            ? "Votre réponse détermine le profil créé dans JSE Express."
                                            : etape === 2
                                              ? "Ces informations complètent le profil correspondant à votre activité."
                                              : "Dernière étape : renseignez les informations nécessaires à votre compte."}
                                    </p>
                                </div>

                                <div className="flex shrink-0 items-center gap-1.5 lg:hidden">
                                    {[1, 2, 3].map((numero) => (
                                        <span
                                            key={numero}
                                            className={
                                                "size-2 rounded-full transition " +
                                                (etape >= numero ? "bg-jse-secondaire" : "bg-white/15")
                                            }
                                        />
                                    ))}
                                </div>
                            </div>

                            {erreursEtape.length > 0 && (
                                <div className="mb-5 rounded-xl border border-jse-danger/20 bg-jse-danger/5 p-3 text-xs leading-5 text-jse-danger">
                                    {erreursEtape.map((erreur, index) => (
                                        <p key={index}>{erreur}</p>
                                    ))}
                                </div>
                            )}

                            <form onSubmit={soumettre}>
                                {etape === 1 && (
                                    <div className="grid gap-3 md:grid-cols-3">
                                        {roles.map((role) => {
                                            const active = data.role === role.value;

                                            return (
                                                <button
                                                    key={role.value}
                                                    type="button"
                                                    onClick={() => selectionnerRole(role.value)}
                                                    className={
                                                        "group relative overflow-hidden rounded-2xl border text-left transition-all duration-300 " +
                                                        (active
                                                            ? "border-jse-secondaire/80 bg-jse-secondaire/[0.10] shadow-[0_0_28px_rgba(69,185,119,.16)]"
                                                            : "border-white/10 bg-white/[0.025] hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.05]")
                                                    }
                                                >
                                                    <div className="relative flex h-[145px] items-end justify-center overflow-hidden bg-gradient-to-b from-white/[0.03] to-transparent px-3 pt-3">
                                                        <img
                                                            src={role.image}
                                                            alt=""
                                                            className={
                                                                "h-full w-full object-contain transition duration-500 " +
                                                                (active ? "scale-105" : "group-hover:scale-105")
                                                            }
                                                        />
                                                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#0A1211] to-transparent" />
                                                    </div>

                                                    <div className="relative px-4 pb-4 pt-2">
                                                        <span
                                                            className={
                                                                "absolute right-4 top-2 flex size-5 items-center justify-center rounded-full border transition " +
                                                                (active
                                                                    ? "border-jse-secondaire bg-jse-secondaire text-jse-principal"
                                                                    : "border-white/15 bg-black/10")
                                                            }
                                                        >
                                                            {active && <Check size={12} />}
                                                        </span>
                                                        <p className="pr-7 text-sm font-bold text-white">
                                                            {role.title}
                                                        </p>
                                                        <p className="mt-1.5 text-[11px] leading-4 text-white/40">
                                                            {role.description}
                                                        </p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                {etape === 2 && (
                                    <div className="space-y-5">
                                        <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                                            <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-jse-principal">
                                                <img
                                                    src={roleSelectionne?.image}
                                                    alt=""
                                                    className="size-full object-contain p-1"
                                                />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-bold uppercase tracking-[.16em] text-jse-secondaire">
                                                    Profil sélectionné
                                                </p>
                                                <p className="mt-1 text-sm font-bold text-white">
                                                    {roleSelectionne?.title}
                                                </p>
                                                <p className="mt-1 text-xs text-white/40">
                                                    {roleSelectionne?.description}
                                                </p>
                                            </div>
                                        </div>

                                        {data.role === "client" && (
                                            <div className="rounded-2xl border border-jse-secondaire/20 bg-jse-secondaire/[0.055] p-5">
                                                <div className="flex items-start gap-4">
                                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-jse-secondaire/10 text-jse-secondaire">
                                                        <ShieldCheck size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-white">
                                                            Votre profil client est prêt.
                                                        </p>
                                                        <p className="mt-1.5 text-xs leading-5 text-white/45">
                                                            Aucune information supplémentaire n'est nécessaire à cette étape.
                                                            Vos adresses de livraison pourront être ajoutées depuis votre espace personnel.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {data.role === "restaurant" && (
                                            <div className="space-y-4">
                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    <Champ label="Nom du restaurant" value={data.restaurant_nom} onChange={(v) => modifier("restaurant_nom", v)} placeholder="Ex. Chez nous" icon={Building2} />
                                                    <Champ label="Téléphone" value={data.restaurant_telephone} onChange={(v) => modifier("restaurant_telephone", v)} placeholder="Numéro du restaurant" type="tel" icon={Phone} />
                                                </div>
                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    <Champ label="E-mail du restaurant" value={data.restaurant_email} onChange={(v) => modifier("restaurant_email", v)} placeholder="contact@restaurant.ci" type="email" icon={Mail} />
                                                    <Select label="Zone du restaurant" value={data.restaurant_zone_id} onChange={(v) => modifier("restaurant_zone_id", v)} zones={zones} />
                                                </div>
                                                <Champ label="Adresse" value={data.restaurant_adresse} onChange={(v) => modifier("restaurant_adresse", v)} placeholder="Adresse ou repère du restaurant" icon={MapPin} />
                                                <Champ label="Présentation" value={data.restaurant_description} onChange={(v) => modifier("restaurant_description", v)} placeholder="Présentez brièvement votre restaurant et sa cuisine." textarea />
                                                <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.025] p-4">
                                                    <Clock3 size={16} className="mt-0.5 shrink-0 text-jse-secondaire" />
                                                    <p className="text-[11px] leading-5 text-white/40">
                                                        Les horaires et les informations détaillées de votre établissement pourront être complétés depuis votre espace restaurant.
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {data.role === "livreur" && (
                                            <div className="space-y-4">
                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    <Champ label="Matricule livreur" value={data.livreur_matricule} onChange={(v) => modifier("livreur_matricule", v)} placeholder="Votre matricule" icon={BadgeCheck} />
                                                    <Select label="Zone d'activité" value={data.livreur_zone_id} onChange={(v) => modifier("livreur_zone_id", v)} zones={zones} />
                                                </div>
                                                <div>
                                                    <label className="mb-2 block text-xs font-semibold text-white/70">Disponibilité</label>
                                                    <div className="grid gap-2 sm:grid-cols-2">
                                                        {[
                                                            ["disponible", "Disponible", "Je peux recevoir des livraisons."],
                                                            ["indisponible", "Indisponible", "Je ne suis pas disponible maintenant."],
                                                        ].map(([value, label, description]) => {
                                                            const active = data.livreur_disponibilite === value;
                                                            return (
                                                                <button
                                                                    key={value}
                                                                    type="button"
                                                                    onClick={() => modifier("livreur_disponibilite", value)}
                                                                    className={
                                                                        "flex min-h-[72px] items-center gap-3 rounded-xl border px-4 text-left transition " +
                                                                        (active
                                                                            ? "border-jse-secondaire/60 bg-jse-secondaire/10"
                                                                            : "border-white/10 bg-white/[0.025] hover:border-white/20 hover:bg-white/[0.05]")
                                                                    }
                                                                >
                                                                    <span className={"flex size-9 shrink-0 items-center justify-center rounded-lg " + (active ? "bg-jse-secondaire text-jse-principal" : "bg-white/[0.06] text-white/35")}>
                                                                        <Bike size={16} />
                                                                    </span>
                                                                    <span>
                                                                        <span className={"block text-xs font-bold " + (active ? "text-white" : "text-white/65")}>{label}</span>
                                                                        <span className="mt-0.5 block text-[10px] leading-4 text-white/35">{description}</span>
                                                                    </span>
                                                                    <span className={"ml-auto flex size-4 shrink-0 items-center justify-center rounded-full border " + (active ? "border-jse-secondaire bg-jse-secondaire" : "border-white/15")}>
                                                                        {active && <Check size={10} className="text-jse-principal" />}
                                                                    </span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                                <Champ label="Téléphone secondaire" value={data.livreur_telephone_secondaire} onChange={(v) => modifier("livreur_telephone_secondaire", v)} placeholder="Numéro secondaire (facultatif)" type="tel" icon={Phone} />
                                            </div>
                                        )}
                                    </div>
                                )}

                                {etape === 3 && (
                                    <div className="space-y-4">
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <Champ
                                                label="Prénom"
                                                value={data.prenom}
                                                onChange={(v) => modifier("prenom", v)}
                                                placeholder="Votre prénom"
                                            />
                                            <Champ
                                                label="Nom"
                                                value={data.nom}
                                                onChange={(v) => modifier("nom", v)}
                                                placeholder="Votre nom"
                                            />
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <Champ
                                                label="Téléphone"
                                                value={data.telephone}
                                                onChange={(v) => modifier("telephone", v)}
                                                placeholder="Votre numéro"
                                                type="tel"
                                                icon={Phone}
                                            />
                                            <Champ
                                                label="E-mail"
                                                value={data.email}
                                                onChange={(v) => modifier("email", v)}
                                                placeholder="Facultatif"
                                                type="email"
                                                icon={Mail}
                                            />
                                        </div>

                                        <PasswordChamp
                                            label="Mot de passe"
                                            value={data.mot_de_passe}
                                            onChange={(v) => modifier("mot_de_passe", v)}
                                            visible={afficherMotDePasse}
                                            toggle={() => setAfficherMotDePasse(!afficherMotDePasse)}
                                        />
                                        <PasswordChamp
                                            label="Confirmer le mot de passe"
                                            value={data.confirmation_mot_de_passe}
                                            onChange={(v) => modifier("confirmation_mot_de_passe", v)}
                                            visible={afficherConfirmation}
                                            toggle={() => setAfficherConfirmation(!afficherConfirmation)}
                                        />

                                        <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.025] p-4 text-xs leading-5 text-white/45">
                                            <input
                                                type="checkbox"
                                                checked={data.consentement}
                                                onChange={(event) => modifier("consentement", event.target.checked)}
                                                className="mt-1 size-4 accent-jse-secondaire"
                                            />
                                            <span>
                                                J’accepte la politique de confidentialité et consens au traitement de mes données personnelles par JSE Express.
                                            </span>
                                        </label>
                                    </div>
                                )}

                                <div className="mt-7 flex items-center justify-between gap-3 border-t border-white/10 pt-5">
                                    <button
                                        type="button"
                                        onClick={() => setEtape((value) => Math.max(1, value - 1))}
                                        disabled={etape === 1}
                                        className="flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.025] px-4 text-xs font-semibold text-white/45 transition hover:bg-white/[0.06] hover:text-white disabled:pointer-events-none disabled:opacity-20"
                                    >
                                        <ChevronLeft size={16} />
                                        Retour
                                    </button>

                                    {etape < 3 ? (
                                        <button
                                            type="button"
                                            onClick={continuer}
                                            className="flex h-10 items-center gap-2 rounded-full bg-jse-secondaire px-5 text-xs font-bold text-jse-principal shadow-lg shadow-jse-secondaire/15 transition hover:brightness-105 disabled:pointer-events-none disabled:opacity-30"
                                        >
                                            Continuer
                                            <ChevronRight size={16} />
                                        </button>
                                    ) : (
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="flex h-10 items-center gap-2 rounded-full bg-jse-secondaire px-5 text-xs font-bold text-jse-principal shadow-lg shadow-jse-secondaire/15 transition hover:brightness-105 disabled:opacity-50"
                                        >
                                            {processing ? "Création..." : "Créer mon compte"}
                                            <Check size={16} />
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

function Champ({ label, value, onChange, placeholder, type = "text", textarea = false, icon: Icon }) {
    return (
        <div>
            <label className="mb-2 block text-xs font-semibold text-white/70">{label}</label>
            <div className="relative">
                {Icon && !textarea && (
                    <Icon
                        size={16}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/25"
                    />
                )}

                {textarea ? (
                    <textarea
                        value={value}
                        onChange={(event) => onChange(event.target.value)}
                        placeholder={placeholder}
                        rows={3}
                        className={inputClass + " h-auto resize-none py-3"}
                    />
                ) : (
                    <input
                        type={type}
                        value={value}
                        onChange={(event) => onChange(event.target.value)}
                        placeholder={placeholder}
                        className={inputClass + (Icon ? " pl-11" : "")}
                    />
                )}
            </div>
        </div>
    );
}

function Select({ label, value, onChange, zones }) {
    return (
        <div>
            <label className="mb-2 block text-xs font-semibold text-white/70">{label}</label>
            <div className="relative">
                <MapPin
                    size={17}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                />
                <select
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    className={inputClass + " appearance-none pl-11"}
                >
                    <option value="">Sélectionner une zone</option>
                    {zones.map((zone) => (
                        <option key={zone.id} value={zone.id}>
                            {zone.nom}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}

function PasswordChamp({ label, value, onChange, visible, toggle }) {
    return (
        <div>
            <label className="mb-2 block text-xs font-semibold text-white/70">{label}</label>
            <div className="relative">
                <input
                    type={visible ? "text" : "password"}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    placeholder="8 caractères minimum"
                    className={inputClass + " pr-12"}
                />
                <button
                    type="button"
                    onClick={toggle}
                    className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-white/35 transition hover:bg-white/5 hover:text-white"
                >
                    {visible ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
            </div>
        </div>
    );
}

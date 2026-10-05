import { router, useForm, usePage } from "@inertiajs/react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
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

const imageInscription =
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1800&q=85";

const inputClass =
    "h-13 w-full rounded-2xl border border-jse-texte/10 bg-white px-4 text-sm text-jse-texte outline-none transition placeholder:text-jse-texte/30 focus:border-jse-secondaire focus:ring-4 focus:ring-jse-secondaire/10";

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
                theme: "light",
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

    const titreEtape =
        etape === 1
            ? "Comment utiliserez-vous JSE Express ?"
            : etape === 2
              ? roleSelectionne?.value === "restaurant"
                  ? "Parlons de votre restaurant."
                  : roleSelectionne?.value === "livreur"
                    ? "Complétons votre profil."
                    : "Votre profil client."
              : "Créons vos identifiants.";

    const descriptionEtape =
        etape === 1
            ? "Votre réponse détermine le profil créé dans JSE Express."
            : etape === 2
              ? "Ces informations complètent le profil correspondant à votre activité."
              : "Dernière étape : renseignez les informations nécessaires à votre compte.";

    return (
        <main className="relative min-h-screen overflow-x-hidden bg-jse-fond font-sans text-jse-texte">
            <div className="flex min-h-screen w-full flex-col lg:flex-row">
                {/* =====================================================
                    BANNIÈRE MOBILE
                ====================================================== */}

                <header className="relative h-52 shrink-0 overflow-hidden bg-jse-principal sm:h-64 lg:hidden">
                    <img src={imageInscription} alt="" aria-hidden="true" className="absolute inset-0 size-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-jse-principal/90 via-jse-principal/45 to-jse-principal/25" />

                    <div className="relative z-10 flex h-full flex-col justify-between px-5 pb-12 pt-5 sm:px-8">
                        <button
                            type="button"
                            onClick={() => router.visit("/authentification")}
                            className="flex w-fit items-center gap-2 rounded-full bg-white/15 px-3.5 py-2 text-sm font-medium text-white backdrop-blur-md transition hover:bg-white/25"
                        >
                            <ArrowLeft size={16} />
                            Retour
                        </button>

                        <div className="flex items-end justify-between gap-4">
                            <h1 className="font-against text-3xl leading-[0.95] text-white sm:text-4xl">
                                Créons
                                <br />
                                votre espace.
                            </h1>
                            <img src="/assets/jse_logo.png" alt="JSE Express" className="h-12 w-auto shrink-0 object-contain" />
                        </div>
                    </div>
                </header>

                {/* =====================================================
                    PANNEAU VISUEL DESKTOP
                ====================================================== */}

                <aside className="relative hidden overflow-hidden bg-jse-principal lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-[42%] xl:w-[40%]">
                    <img src={imageInscription} alt="" aria-hidden="true" className="absolute inset-0 size-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-jse-principal/95 via-jse-principal/55 to-jse-principal/35" />

                    <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-14">
                        <div className="flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => router.visit("/authentification")}
                                className="group flex items-center gap-2 text-sm font-medium text-white/75 transition hover:text-white"
                            >
                                <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-0.5" />
                                Retour
                            </button>
                            <img src="/assets/jse_logo.png" alt="JSE Express" className="h-12 w-auto object-contain" />
                        </div>

                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-jse-secondaire">JSE Express</p>
                            <h1 className="mt-4 max-w-sm font-against text-5xl leading-[0.92] text-white xl:text-6xl">
                                Créons votre espace.
                            </h1>
                            <p className="mt-6 max-w-sm text-sm leading-7 text-white/70">
                                Quelques questions suffisent pour créer le profil correspondant à votre utilisation de JSE Express.
                            </p>

                            <ol className="mt-10 space-y-4 border-t border-white/15 pt-8">
                                {labelsEtapes.map((label, index) => {
                                    const numero = index + 1;
                                    const active = etape === numero;
                                    const complete = etape > numero;

                                    return (
                                        <li key={label} className="flex items-center gap-3" aria-current={active ? "step" : undefined}>
                                            <span
                                                className={
                                                    "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition " +
                                                    (active
                                                        ? "bg-jse-secondaire text-jse-principal"
                                                        : complete
                                                          ? "bg-jse-secondaire/25 text-jse-secondaire"
                                                          : "bg-white/10 text-white/50")
                                                }
                                            >
                                                {complete ? <Check size={14} /> : numero}
                                            </span>
                                            <span className={"text-sm transition " + (active ? "font-semibold text-white" : "text-white/60")}>
                                                {label}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ol>
                        </div>
                    </div>
                </aside>

                {/* =====================================================
                    FORMULAIRE
                ====================================================== */}

                <section className="relative z-10 -mt-8 flex w-full flex-1 items-start justify-center rounded-t-[2rem] bg-jse-fond px-5 pb-12 pt-8 sm:px-8 lg:mt-0 lg:min-h-screen lg:items-center lg:rounded-none lg:px-12 lg:py-12 xl:px-16">
                    <div className="w-full max-w-xl">
                        <div className="mb-7 flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm font-semibold text-jse-secondaire">Étape {etape} sur 3</p>
                                <h2 className="mt-2 max-w-lg font-against text-3xl leading-[1.02] tracking-tight text-jse-principal sm:text-4xl">
                                    {titreEtape}
                                </h2>
                                <p className="mt-3 max-w-md text-sm leading-6 text-jse-texte/60">{descriptionEtape}</p>
                            </div>

                            <div className="flex shrink-0 items-center gap-1.5 pt-2 lg:hidden" aria-hidden="true">
                                {[1, 2, 3].map((numero) => (
                                    <span
                                        key={numero}
                                        className={"size-2 rounded-full transition " + (etape >= numero ? "bg-jse-secondaire" : "bg-jse-principal/15")}
                                    />
                                ))}
                            </div>
                        </div>

                        {erreursEtape.length > 0 && (
                            <div role="alert" className="mb-5 rounded-2xl border border-jse-danger/20 bg-jse-danger/5 p-4 text-xs leading-5 text-jse-danger">
                                {erreursEtape.map((erreur, index) => (
                                    <p key={index}>{erreur}</p>
                                ))}
                            </div>
                        )}

                        <form onSubmit={soumettre}>
                            {etape === 1 && (
                                <div className="space-y-3" role="radiogroup" aria-label="Utilisation de JSE Express">
                                    {roles.map((role) => {
                                        const active = data.role === role.value;

                                        return (
                                            <button
                                                key={role.value}
                                                type="button"
                                                role="radio"
                                                aria-checked={active}
                                                onClick={() => selectionnerRole(role.value)}
                                                className={
                                                    "group flex w-full items-center gap-4 rounded-3xl border p-3 text-left transition duration-300 " +
                                                    (active
                                                        ? "border-jse-secondaire bg-white shadow-jse-carte ring-4 ring-jse-secondaire/15"
                                                        : "border-jse-principal/10 bg-white hover:-translate-y-0.5 hover:shadow-jse-carte")
                                                }
                                            >
                                                <span className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-jse-principal sm:size-24">
                                                    <img
                                                        src={role.image}
                                                        alt=""
                                                        className={"size-full object-contain p-2 transition duration-500 " + (active ? "scale-105" : "group-hover:scale-105")}
                                                    />
                                                </span>
                                                <span className="min-w-0 flex-1">
                                                    <span className="block text-base font-semibold text-jse-principal">{role.title}</span>
                                                    <span className="mt-1 block text-sm leading-5 text-jse-texte/60">{role.description}</span>
                                                </span>
                                                <span
                                                    className={
                                                        "mr-2 flex size-6 shrink-0 items-center justify-center rounded-full border transition " +
                                                        (active ? "border-jse-secondaire bg-jse-secondaire text-jse-principal" : "border-jse-principal/20 bg-white")
                                                    }
                                                >
                                                    {active && <Check size={14} />}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {etape === 2 && (
                                <div className="space-y-5">
                                    <div className="flex items-center gap-4 rounded-3xl border border-jse-principal/10 bg-white p-3">
                                        <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-jse-principal">
                                            <img src={roleSelectionne?.image} alt="" className="size-full object-contain p-1.5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-jse-secondaire">Profil sélectionné</p>
                                            <p className="mt-1 text-sm font-semibold text-jse-principal">{roleSelectionne?.title}</p>
                                            <p className="mt-0.5 text-xs text-jse-texte/55">{roleSelectionne?.description}</p>
                                        </div>
                                    </div>

                                    {data.role === "client" && (
                                        <div className="rounded-3xl border border-jse-secondaire/25 bg-jse-secondaire/10 p-5">
                                            <div className="flex items-start gap-4">
                                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-jse-secondaire">
                                                    <ShieldCheck size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-jse-principal">Votre profil client est prêt.</p>
                                                    <p className="mt-1.5 text-xs leading-5 text-jse-texte/60">
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
                                            <div className="flex items-start gap-3 rounded-2xl bg-jse-principal/5 p-4">
                                                <Clock3 size={16} className="mt-0.5 shrink-0 text-jse-secondaire" />
                                                <p className="text-xs leading-5 text-jse-texte/60">
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
                                                <span className="mb-2 block text-sm font-semibold text-jse-texte">Disponibilité</span>
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
                                                                aria-pressed={active}
                                                                onClick={() => modifier("livreur_disponibilite", value)}
                                                                className={
                                                                    "flex min-h-[72px] items-center gap-3 rounded-2xl border px-4 text-left transition " +
                                                                    (active
                                                                        ? "border-jse-secondaire bg-white ring-4 ring-jse-secondaire/15"
                                                                        : "border-jse-principal/10 bg-white hover:border-jse-principal/25")
                                                                }
                                                            >
                                                                <span className={"flex size-9 shrink-0 items-center justify-center rounded-xl " + (active ? "bg-jse-secondaire text-jse-principal" : "bg-jse-principal/5 text-jse-principal/50")}>
                                                                    <Bike size={16} />
                                                                </span>
                                                                <span>
                                                                    <span className="block text-sm font-semibold text-jse-principal">{label}</span>
                                                                    <span className="mt-0.5 block text-xs leading-4 text-jse-texte/55">{description}</span>
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
                                        <Champ label="Prénom" value={data.prenom} onChange={(v) => modifier("prenom", v)} placeholder="Votre prénom" />
                                        <Champ label="Nom" value={data.nom} onChange={(v) => modifier("nom", v)} placeholder="Votre nom" />
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <Champ label="Téléphone" value={data.telephone} onChange={(v) => modifier("telephone", v)} placeholder="Votre numéro" type="tel" icon={Phone} />
                                        <Champ label="E-mail" value={data.email} onChange={(v) => modifier("email", v)} placeholder="Facultatif" type="email" icon={Mail} />
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

                                    <label className="flex items-start gap-3 rounded-2xl bg-jse-principal/5 p-4 text-xs leading-5 text-jse-texte/60">
                                        <input
                                            type="checkbox"
                                            checked={data.consentement}
                                            onChange={(event) => modifier("consentement", event.target.checked)}
                                            className="mt-1 size-4 shrink-0 cursor-pointer accent-jse-principal"
                                        />
                                        <span>
                                            J’accepte la politique de confidentialité et consens au traitement de mes données personnelles par JSE Express.
                                        </span>
                                    </label>
                                </div>
                            )}

                            <div className="mt-8 flex items-center justify-between gap-3 border-t border-jse-principal/10 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setEtape((value) => Math.max(1, value - 1))}
                                    disabled={etape === 1}
                                    className="flex h-12 items-center gap-2 rounded-full border border-jse-principal/15 bg-white px-5 text-sm font-semibold text-jse-principal transition hover:bg-jse-principal/5 disabled:pointer-events-none disabled:opacity-30"
                                >
                                    <ChevronLeft size={16} />
                                    Retour
                                </button>

                                {etape < 3 ? (
                                    <button
                                        type="button"
                                        onClick={continuer}
                                        className="flex h-12 items-center gap-2 rounded-full bg-jse-principal px-6 text-sm font-semibold text-white shadow-lg shadow-jse-principal/10 transition hover:-translate-y-0.5 hover:bg-jse-principal/90 active:scale-[0.98]"
                                    >
                                        Continuer
                                        <ChevronRight size={16} />
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex h-12 items-center gap-2 rounded-full bg-jse-secondaire px-6 text-sm font-semibold text-jse-principal shadow-lg shadow-jse-secondaire/20 transition hover:brightness-105 active:scale-[0.98] disabled:opacity-50"
                                    >
                                        {processing ? "Création..." : "Créer mon compte"}
                                        <Check size={16} />
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </section>
            </div>
        </main>
    );
}

function Champ({ label, value, onChange, placeholder, type = "text", textarea = false, icon: Icon }) {
    const id = useId();

    return (
        <div>
            <label htmlFor={id} className="mb-2 block text-sm font-semibold text-jse-texte">{label}</label>
            <div className="relative">
                {Icon && !textarea && (
                    <Icon size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-jse-texte/35" />
                )}

                {textarea ? (
                    <textarea
                        id={id}
                        value={value}
                        onChange={(event) => onChange(event.target.value)}
                        placeholder={placeholder}
                        rows={3}
                        className={inputClass + " h-auto resize-none py-3"}
                    />
                ) : (
                    <input
                        id={id}
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
    const id = useId();

    return (
        <div>
            <label htmlFor={id} className="mb-2 block text-sm font-semibold text-jse-texte">{label}</label>
            <div className="relative">
                <MapPin size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-jse-texte/35" />
                <select
                    id={id}
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
    const id = useId();

    return (
        <div>
            <label htmlFor={id} className="mb-2 block text-sm font-semibold text-jse-texte">{label}</label>
            <div className="relative">
                <input
                    id={id}
                    type={visible ? "text" : "password"}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    placeholder="8 caractères minimum"
                    className={inputClass + " pr-12"}
                />
                <button
                    type="button"
                    onClick={toggle}
                    aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-jse-texte/35 transition hover:bg-jse-principal/5 hover:text-jse-principal"
                >
                    {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
        </div>
    );
}

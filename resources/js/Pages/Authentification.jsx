import { useEffect, useState } from "react";
import { router, usePage } from "@inertiajs/react";

import {
    ArrowLeft,
    CheckCircle2,
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
    Phone,
    User,
    X,
} from "lucide-react";

export default function Authentification() {
    const { flash = {}, errors = {} } = usePage().props;

    const [mode, setMode] = useState("connexion");

    const [toastVisible, setToastVisible] = useState(
        Boolean(flash?.success),
    );

    const [afficherMotDePasse, setAfficherMotDePasse] =
        useState(false);

    const [afficherConfirmation, setAfficherConfirmation] =
        useState(false);

    const [soumissionEnCours, setSoumissionEnCours] = useState(false);

    const [formulaire, setFormulaire] = useState({
        nom: "",
        prenom: "",
        telephone: "",
        email: "",
        mot_de_passe: "",
        confirmation_mot_de_passe: "",
        consentement: false,
    });

    /*
    |--------------------------------------------------------------------------
    | Toast de succès
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (!flash?.success) {
            return;
        }

        setToastVisible(true);

        const timer = setTimeout(() => {
            setToastVisible(false);
        }, 5000);

        return () => clearTimeout(timer);
    }, [flash?.success]);

    /*
    |--------------------------------------------------------------------------
    | Erreurs
    |--------------------------------------------------------------------------
    */

    const erreurs = Object.values(errors || {});

    const afficherErreurs = erreurs.length > 0;

    useEffect(() => {
        if (Object.keys(errors || {}).length > 0) {
            setSoumissionEnCours(false);
        }
    }, [errors]);

    /*
    |--------------------------------------------------------------------------
    | Modification d'un champ
    |--------------------------------------------------------------------------
    */

    const modifierChamp = (champ, valeur) => {
        setFormulaire((ancien) => ({
            ...ancien,
            [champ]: valeur,
        }));
    };

    /*
    |--------------------------------------------------------------------------
    | Réinitialisation du formulaire
    |--------------------------------------------------------------------------
    */

    const reinitialiserFormulaire = () => {
        setFormulaire({
            nom: "",
            prenom: "",
            telephone: "",
            email: "",
            mot_de_passe: "",
            confirmation_mot_de_passe: "",
            consentement: false,
        });

        setAfficherMotDePasse(false);
        setAfficherConfirmation(false);
    };

    /*
    |--------------------------------------------------------------------------
    | Changement de mode
    |--------------------------------------------------------------------------
    */

    const changerMode = (nouveauMode) => {
        setMode(nouveauMode);

        reinitialiserFormulaire();
    };

    /*
    |--------------------------------------------------------------------------
    | Soumission
    |--------------------------------------------------------------------------
    */

    const soumettre = (event) => {
        event.preventDefault();

        if (soumissionEnCours) {
            return;
        }

        setSoumissionEnCours(true);

        const route = mode === "inscription" ? "/inscription" : "/connexion";

        router.post(route, formulaire, {
            preserveScroll: true,
            preserveState: true,

            onSuccess: () => {
                setSoumissionEnCours(false);

                if (mode === "inscription") {
                    reinitialiserFormulaire();
                    setMode("connexion");
                }
            },

            onError: () => {
                setSoumissionEnCours(false);
            },

            onFinish: () => {
                setSoumissionEnCours(false);
            },
        });
    };

    return (
        <main className="min-h-screen bg-jse-fond text-jse-texte font-sans">
            <div className="mx-auto flex min-h-screen w-full max-w-7xl">

                {/* =====================================================
                    PARTIE VISUELLE DESKTOP
                ====================================================== */}

                <section className="relative hidden overflow-hidden bg-jse-principal lg:flex lg:w-1/2">

                    <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-jse-secondaire/20 blur-3xl" />

                    <div className="absolute -bottom-40 -right-32 h-[32rem] w-[32rem] rounded-full bg-jse-accent/20 blur-3xl" />

                    <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">

                        {/* Retour */}

                        <button
                            type="button"
                            onClick={() => router.visit("/bienvenue")}
                            className="flex w-fit items-center gap-2 text-sm font-medium text-white/70 transition hover:text-white"
                        >
                            <ArrowLeft size={18} />

                            <span>Retour</span>
                        </button>

                        {/* Contenu */}

                        <div className="max-w-md">

                            <img
                                src="/assets/jse_logo.png"
                                alt="JSE Express"
                                className="mb-10 h-20 w-auto object-contain"
                            />

                            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-jse-secondaire">
                                JSE Express
                            </p>

                            <h1 className="font-against text-4xl leading-tight text-white xl:text-5xl">
                                Commandez.
                                <br />
                                Savourez.
                                <br />
                                Faites-vous livrer.
                            </h1>

                            <p className="mt-6 max-w-sm text-sm leading-7 text-white/65">
                                Retrouvez vos restaurants préférés et passez
                                vos commandes simplement depuis JSE Express.
                            </p>
                        </div>

                        {/* Copyright */}

                        <p className="text-xs text-white/40">
                            © {new Date().getFullYear()} JSE Express
                        </p>
                    </div>
                </section>

                {/* =====================================================
                    TOAST DE SUCCÈS
                ====================================================== */}

                {toastVisible && flash?.success && (
                    <div className="fixed right-5 top-5 z-[100] w-[calc(100%-2.5rem)] max-w-sm animate-in slide-in-from-right-5 fade-in duration-300">

                        <div className="flex items-start gap-3 rounded-2xl border border-jse-secondaire/20 bg-white p-4 shadow-xl shadow-jse-principal/10">

                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-jse-secondaire/10">
                                <CheckCircle2
                                    size={21}
                                    className="text-jse-secondaire"
                                />
                            </div>

                            <div className="min-w-0 flex-1">

                                <p className="font-against text-lg text-jse-texte">
                                    Compte créé
                                </p>

                                <p className="mt-1 text-xs leading-5 text-jse-texte/55">
                                    {flash.success}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setToastVisible(false)}
                                className="flex size-7 shrink-0 items-center justify-center rounded-lg text-jse-texte/35 transition hover:bg-jse-texte/5 hover:text-jse-texte"
                                aria-label="Fermer la notification"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {/* =====================================================
                    FORMULAIRE
                ====================================================== */}

                <section className="flex w-full items-center justify-center px-5 py-10 sm:px-8 lg:w-1/2 lg:px-12 xl:px-20">

                    <div className="w-full max-w-md">

                        {/* Retour mobile */}

                        <button
                            type="button"
                            onClick={() => router.visit("/bienvenue")}
                            className="mb-8 flex items-center gap-2 text-sm font-medium text-jse-texte/55 transition hover:text-jse-principal lg:hidden"
                        >
                            <ArrowLeft size={18} />

                            <span>Retour</span>
                        </button>

                        {/* Logo mobile */}

                        <div className="mb-8 lg:hidden">
                            <img
                                src="/assets/jse_logo.png"
                                alt="JSE Express"
                                className="h-14 w-auto object-contain"
                            />
                        </div>

                        {/* =================================================
                            EN-TÊTE
                        ================================================== */}

                        <div className="mb-8">

                            <p className="mb-2 text-sm font-semibold text-jse-secondaire">
                                Bienvenue
                            </p>

                            <h2 className="font-against text-3xl leading-tight tracking-tight text-jse-texte">
                                {mode === "connexion"
                                    ? "Connexion"
                                    : "Créer un compte"}
                            </h2>

                            <p className="mt-3 text-sm leading-6 text-jse-texte/55">
                                {mode === "connexion"
                                    ? "Connectez-vous pour accéder à votre espace JSE Express."
                                    : "Créez votre compte pour commencer à commander."}
                            </p>
                        </div>

                        {/* =================================================
                            ONGLETS
                        ================================================== */}

                        <div className="mb-8 grid grid-cols-2 rounded-2xl bg-jse-principal/5 p-1">

                            <button
                                type="button"
                                onClick={() => changerMode("connexion")}
                                className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                                    mode === "connexion"
                                        ? "bg-white text-jse-principal shadow-sm"
                                        : "text-jse-texte/45 hover:text-jse-texte"
                                }`}
                            >
                                Connexion
                            </button>

                            <button
                                type="button"
                                onClick={() => changerMode("inscription")}
                                className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                                    mode === "inscription"
                                        ? "bg-white text-jse-principal shadow-sm"
                                        : "text-jse-texte/45 hover:text-jse-texte"
                                }`}
                            >
                                Inscription
                            </button>
                        </div>

                        {/* =================================================
                            ERREURS
                        ================================================== */}

                        {afficherErreurs && (
                            <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-4">

                                <p className="mb-2 text-sm font-semibold text-red-600">
                                    Vérifiez les informations saisies.
                                </p>

                                <ul className="space-y-1 text-xs text-red-600/80">
                                    {erreurs.map((erreur, index) => (
                                        <li key={index}>
                                            {erreur}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* =================================================
                            FORMULAIRE
                        ================================================== */}

                        <form
                            onSubmit={soumettre}
                            className="space-y-5"
                        >

                            {/* Nom + prénom */}

                            {mode === "inscription" && (
                                <>
                                    <div className="grid gap-5 sm:grid-cols-2">

                                        {/* Nom */}

                                        <div>

                                            <label
                                                htmlFor="nom"
                                                className="mb-2 block text-sm font-semibold"
                                            >
                                                Nom
                                            </label>

                                            <div className="relative">

                                                <User
                                                    size={18}
                                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-jse-texte/35"
                                                />

                                                <input
                                                    id="nom"
                                                    name="nom"
                                                    type="text"
                                                    autoComplete="family-name"
                                                    value={formulaire.nom}
                                                    onChange={(event) =>
                                                        modifierChamp(
                                                            "nom",
                                                            event.target.value,
                                                        )
                                                    }
                                                    placeholder="Votre nom"
                                                    required
                                                    className="h-13 w-full rounded-2xl border border-jse-texte/10 bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-jse-texte/30 focus:border-jse-secondaire focus:ring-4 focus:ring-jse-secondaire/10"
                                                />
                                            </div>
                                        </div>

                                        {/* Prénom */}

                                        <div>

                                            <label
                                                htmlFor="prenom"
                                                className="mb-2 block text-sm font-semibold"
                                            >
                                                Prénom
                                            </label>

                                            <div className="relative">

                                                <User
                                                    size={18}
                                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-jse-texte/35"
                                                />

                                                <input
                                                    id="prenom"
                                                    name="prenom"
                                                    type="text"
                                                    autoComplete="given-name"
                                                    value={formulaire.prenom}
                                                    onChange={(event) =>
                                                        modifierChamp(
                                                            "prenom",
                                                            event.target.value,
                                                        )
                                                    }
                                                    placeholder="Votre prénom"
                                                    required
                                                    className="h-13 w-full rounded-2xl border border-jse-texte/10 bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-jse-texte/30 focus:border-jse-secondaire focus:ring-4 focus:ring-jse-secondaire/10"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* E-mail */}

                                    <div>

                                        <label
                                            htmlFor="email"
                                            className="mb-2 block text-sm font-semibold"
                                        >
                                            Adresse e-mail
                                        </label>

                                        <div className="relative">

                                            <Mail
                                                size={18}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 text-jse-texte/35"
                                            />

                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                autoComplete="email"
                                                value={formulaire.email}
                                                onChange={(event) =>
                                                    modifierChamp(
                                                        "email",
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="exemple@email.com"
                                                className="h-13 w-full rounded-2xl border border-jse-texte/10 bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-jse-texte/30 focus:border-jse-secondaire focus:ring-4 focus:ring-jse-secondaire/10"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* =================================================
                                TÉLÉPHONE
                            ================================================== */}

                            <div>

                                <label
                                    htmlFor="telephone"
                                    className="mb-2 block text-sm font-semibold"
                                >
                                    Numéro de téléphone
                                </label>

                                <div className="relative">

                                    <Phone
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-jse-texte/35"
                                    />

                                    <input
                                        id="telephone"
                                        name="telephone"
                                        type="tel"
                                        autoComplete="tel"
                                        value={formulaire.telephone}
                                        onChange={(event) =>
                                            modifierChamp(
                                                "telephone",
                                                event.target.value,
                                            )
                                        }
                                        placeholder="+225 07 00 00 00 00"
                                        required
                                        className="h-13 w-full rounded-2xl border border-jse-texte/10 bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-jse-texte/30 focus:border-jse-secondaire focus:ring-4 focus:ring-jse-secondaire/10"
                                    />
                                </div>
                            </div>

                            {/* =================================================
                                MOT DE PASSE
                            ================================================== */}

                            <div>

                                <label
                                    htmlFor="mot_de_passe"
                                    className="mb-2 block text-sm font-semibold"
                                >
                                    Mot de passe
                                </label>

                                <div className="relative">

                                    <LockKeyhole
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-jse-texte/35"
                                    />

                                    <input
                                        id="mot_de_passe"
                                        name="mot_de_passe"
                                        type={
                                            afficherMotDePasse
                                                ? "text"
                                                : "password"
                                        }
                                        autoComplete={
                                            mode === "connexion"
                                                ? "current-password"
                                                : "new-password"
                                        }
                                        value={formulaire.mot_de_passe}
                                        onChange={(event) =>
                                            modifierChamp(
                                                "mot_de_passe",
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Votre mot de passe"
                                        required
                                        className="h-13 w-full rounded-2xl border border-jse-texte/10 bg-white pl-11 pr-12 text-sm outline-none transition placeholder:text-jse-texte/30 focus:border-jse-secondaire focus:ring-4 focus:ring-jse-secondaire/10"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setAfficherMotDePasse(
                                                !afficherMotDePasse,
                                            )
                                        }
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-jse-texte/35 transition hover:text-jse-principal"
                                        aria-label={
                                            afficherMotDePasse
                                                ? "Masquer le mot de passe"
                                                : "Afficher le mot de passe"
                                        }
                                    >
                                        {afficherMotDePasse ? (
                                            <EyeOff size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* =================================================
                                CONFIRMATION
                            ================================================== */}

                            {mode === "inscription" && (
                                <div>

                                    <label
                                        htmlFor="confirmation_mot_de_passe"
                                        className="mb-2 block text-sm font-semibold"
                                    >
                                        Confirmer le mot de passe
                                    </label>

                                    <div className="relative">

                                        <LockKeyhole
                                            size={18}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-jse-texte/35"
                                        />

                                        <input
                                            id="confirmation_mot_de_passe"
                                            name="confirmation_mot_de_passe"
                                            type={
                                                afficherConfirmation
                                                    ? "text"
                                                    : "password"
                                            }
                                            autoComplete="new-password"
                                            value={
                                                formulaire.confirmation_mot_de_passe
                                            }
                                            onChange={(event) =>
                                                modifierChamp(
                                                    "confirmation_mot_de_passe",
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Confirmez votre mot de passe"
                                            required
                                            className="h-13 w-full rounded-2xl border border-jse-texte/10 bg-white pl-11 pr-12 text-sm outline-none transition placeholder:text-jse-texte/30 focus:border-jse-secondaire focus:ring-4 focus:ring-jse-secondaire/10"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setAfficherConfirmation(
                                                    !afficherConfirmation,
                                                )
                                            }
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-jse-texte/35 transition hover:text-jse-principal"
                                            aria-label={
                                                afficherConfirmation
                                                    ? "Masquer la confirmation du mot de passe"
                                                    : "Afficher la confirmation du mot de passe"
                                            }
                                        >
                                            {afficherConfirmation ? (
                                                <EyeOff size={18} />
                                            ) : (
                                                <Eye size={18} />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* =================================================
                                CONSENTEMENT
                            ================================================== */}

                            <div className="flex items-start gap-3 rounded-2xl bg-jse-principal/5 p-4">

                                <input
                                    id={`consentement-${mode}`}
                                    name="consentement"
                                    type="checkbox"
                                    checked={formulaire.consentement}
                                    onChange={(event) =>
                                        modifierChamp(
                                            "consentement",
                                            event.target.checked,
                                        )
                                    }
                                    required
                                    className="mt-1 size-4 shrink-0 cursor-pointer rounded border-jse-texte/20 accent-jse-principal focus:ring-jse-secondaire"
                                />

                                <label
                                    htmlFor={`consentement-${mode}`}
                                    className="text-xs leading-5 text-jse-texte/55"
                                >
                                    J’accepte la{" "}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            router.visit(
                                                "/politique-de-confidentialite",
                                            )
                                        }
                                        className="font-semibold text-jse-principal underline underline-offset-2"
                                    >
                                        Politique de confidentialité
                                    </button>

                                    {mode === "inscription" &&
                                        " et consens au traitement de mes données personnelles par JSE Express."}
                                </label>
                            </div>

                            {/* =================================================
                                BOUTON
                            ================================================== */}

                            <button
                                type="submit"
                                className="flex h-13 w-full items-center justify-center rounded-2xl bg-jse-principal px-6 text-sm font-semibold text-white shadow-lg shadow-jse-principal/15 transition hover:bg-jse-principal/90 active:scale-[0.99]"
                            >
                                {soumissionEnCours
                                    ? "Connexion en cours..."
                                    : mode === "connexion"
                                      ? "Se connecter"
                                      : "Créer mon compte"}
                            </button>
                        </form>

                        {/* =================================================
                            CHANGEMENT DE MODE
                        ================================================== */}

                        <p className="mt-7 text-center text-sm text-jse-texte/50">

                            {mode === "connexion"
                                ? "Vous n'avez pas encore de compte ?"
                                : "Vous avez déjà un compte ?"}{" "}

                            <button
                                type="button"
                                onClick={() =>
                                    changerMode(
                                        mode === "connexion"
                                            ? "inscription"
                                            : "connexion",
                                    )
                                }
                                className="font-semibold text-jse-principal hover:underline"
                            >
                                {mode === "connexion"
                                    ? "Créer un compte"
                                    : "Se connecter"}
                            </button>
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}
import { router } from "@inertiajs/react";
import {
    ArrowRight,
    ChevronDown,
    CreditCard,
    LockKeyhole,
    Search,
    ShoppingBag,
    Store,
    Truck,
    UtensilsCrossed,
    X,
} from "lucide-react";
import { useMemo, useState } from "react";

const images = {
    hero: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1800&q=85",
    restaurant: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=85",
};

const categories = [
    { id: "tout", label: "Toutes les questions" },
    { id: "commande", label: "Commande" },
    { id: "livraison", label: "Livraison" },
    { id: "paiement", label: "Paiement" },
    { id: "securite", label: "Sécurité" },
];

const faq = [
    {
        category: "commande",
        icon: ShoppingBag,
        question: "Comment passer une commande ?",
        answer: "Connectez-vous à votre compte client, ouvrez l'espace restaurants, choisissez un restaurant, consultez ses produits puis ajoutez les articles souhaités au panier avant de valider.",
    },
    {
        category: "commande",
        icon: Store,
        question: "Où trouver les restaurants disponibles ?",
        answer: "Les restaurants sont regroupés dans l'espace restaurants. Vous pouvez y découvrir leurs menus avant de composer votre panier.",
    },
    {
        category: "livraison",
        icon: Truck,
        question: "Comment fonctionne la livraison ?",
        answer: "Après validation de la commande, la livraison est organisée selon les zones et secteurs prévus par JSE Express. Le livreur prend ensuite la mission en charge et la livraison est suivie dans votre espace.",
    },
    {
        category: "paiement",
        icon: CreditCard,
        question: "Comment le paiement est-il géré ?",
        answer: "Le parcours de commande utilise les moyens de paiement mobile prévus par JSE Express. Le mode de paiement associé à la commande est conservé pour son suivi.",
    },
    {
        category: "securite",
        icon: LockKeyhole,
        question: "À quoi sert le PIN de livraison ?",
        answer: "Le PIN sert à sécuriser la validation de la livraison. Il ne doit pas être partagé inutilement et n'est pas affiché comme une information administrative ordinaire.",
    },
];

const parcours = [
    {
        icon: UtensilsCrossed,
        title: "Choisir",
        text: "Parcourez les restaurants et leurs produits.",
    },
    {
        icon: ShoppingBag,
        title: "Commander",
        text: "Composez votre panier puis validez la commande.",
    },
    {
        icon: Truck,
        title: "Suivre",
        text: "La livraison est organisée et suivie depuis votre espace.",
    },
    {
        icon: LockKeyhole,
        title: "Valider",
        text: "Le PIN de livraison sécurise la remise de la commande.",
    },
];

const raccourcis = [
    {
        icon: Store,
        title: "Découvrir les restaurants",
        text: "Consultez les menus disponibles à Adzopé.",
        href: "/accueil",
    },
    {
        icon: ShoppingBag,
        title: "Accéder à mon espace",
        text: "Connectez-vous pour commander et suivre vos livraisons.",
        href: "/authentification",
    },
    {
        icon: ArrowRight,
        title: "Connaître JSE Express",
        text: "Comprendre le service, côté client, restaurant et livreur.",
        href: "/a-propos",
    },
];

function normaliser(texte) {
    return texte
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "");
}

export default function Aide() {
    const [ouvert, setOuvert] = useState(faq[0].question);
    const [categorie, setCategorie] = useState("tout");
    const [recherche, setRecherche] = useState("");

    const resultats = useMemo(() => {
        const terme = normaliser(recherche.trim());
        return faq.filter((item) => {
            const dansCategorie =
                categorie === "tout" || item.category === categorie;
            const dansRecherche =
                terme === "" ||
                normaliser(`${item.question} ${item.answer}`).includes(terme);
            return dansCategorie && dansRecherche;
        });
    }, [categorie, recherche]);

    const reinitialiser = () => {
        setRecherche("");
        setCategorie("tout");
    };

    return (
        <main className="min-h-screen overflow-x-hidden bg-jse-fond font-sans text-jse-texte">
            <header className="sticky top-0 z-50 border-b border-jse-principal/10 bg-jse-fond/95 backdrop-blur-xl">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
                    <button
                        type="button"
                        onClick={() => router.visit("/bienvenue")}
                        aria-label="Retour à l'accueil"
                        className="shrink-0"
                    >
                        <img
                            src="/assets/jse_logo.png?v=20261002"
                            alt="JSE Express"
                            className="h-9 w-auto sm:h-10"
                        />
                    </button>

                    <nav
                        className="hidden items-center gap-1 text-sm font-medium lg:flex"
                        aria-label="Navigation principale"
                    >
                        <button
                            type="button"
                            onClick={() => router.visit("/accueil")}
                            className="rounded-full px-4 py-2.5 transition hover:bg-jse-principal/5"
                        >
                            Restaurants
                        </button>
                        <button
                            type="button"
                            onClick={() => router.visit("/a-propos")}
                            className="rounded-full px-4 py-2.5 transition hover:bg-jse-principal/5"
                        >
                            À propos
                        </button>
                        <span
                            aria-current="page"
                            className="rounded-full bg-jse-secondaire/15 px-4 py-2.5 text-jse-principal"
                        >
                            Aide
                        </span>
                    </nav>

                    <button
                        type="button"
                        onClick={() => router.visit("/authentification")}
                        className="rounded-full bg-jse-principal px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-jse-principal/10 transition hover:-translate-y-0.5 hover:bg-jse-principal/90 active:scale-[0.98]"
                    >
                        Se connecter
                    </button>
                </div>
            </header>

            <section className="relative overflow-hidden bg-jse-fond">
                <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:px-10 lg:py-20">
                    <div className="relative z-10">
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-jse-secondaire">
                            Centre d'aide
                        </p>
                        <h1 className="mt-5 max-w-3xl font-against text-6xl leading-[0.9] tracking-tight text-jse-principal sm:text-7xl lg:text-8xl">
                            Besoin d'un coup de{" "}
                            <span className="text-jse-accent">main ?</span>
                        </h1>
                        <p className="mt-7 max-w-xl text-base leading-7 text-jse-texte/70 sm:text-lg">
                            Retrouvez ici les réponses essentielles pour
                            utiliser JSE Express et comprendre le parcours
                            d'une commande.
                        </p>

                        <form
                            role="search"
                            onSubmit={(event) => event.preventDefault()}
                            className="mt-8 max-w-xl"
                        >
                            <label htmlFor="recherche-aide" className="sr-only">
                                Rechercher dans l'aide
                            </label>
                            <div className="flex items-center gap-3 rounded-full border border-jse-principal/15 bg-white px-5 py-3.5 shadow-lg shadow-jse-principal/5 transition focus-within:border-jse-secondaire focus-within:ring-4 focus-within:ring-jse-secondaire/20">
                                <Search
                                    className="h-5 w-5 shrink-0 text-jse-principal/50"
                                    aria-hidden="true"
                                />
                                <input
                                    id="recherche-aide"
                                    type="search"
                                    value={recherche}
                                    onChange={(event) =>
                                        setRecherche(event.target.value)
                                    }
                                    placeholder="Rechercher : commande, livraison, PIN…"
                                    className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-jse-texte placeholder:text-jse-texte/40 focus:outline-none focus:ring-0"
                                />
                                {recherche !== "" && (
                                    <button
                                        type="button"
                                        onClick={() => setRecherche("")}
                                        aria-label="Effacer la recherche"
                                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-jse-principal/60 transition hover:bg-jse-principal/5"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="relative min-h-[22rem] overflow-hidden rounded-[2rem] lg:min-h-[30rem]">
                        <img
                            src={images.hero}
                            alt="Livraison d'un repas"
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-jse-principal/45 via-transparent to-transparent" />
                        <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/30 bg-white/85 p-4 shadow-xl backdrop-blur-md sm:bottom-7 sm:left-7 sm:right-auto sm:max-w-sm">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-jse-secondaire">
                                JSE Express
                            </p>
                            <p className="mt-2 text-base font-semibold text-jse-principal">
                                De la commande à la livraison, tout est
                                expliqué ici.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-jse-principal px-5 py-16 text-white sm:px-8 lg:px-10 lg:py-20">
                <div className="mx-auto max-w-7xl">
                    <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-jse-secondaire">
                                Le parcours
                            </p>
                            <h2 className="mt-4 max-w-xl font-against text-5xl leading-[0.92] sm:text-6xl">
                                Une commande, quatre étapes.
                            </h2>
                        </div>
                        <p className="max-w-2xl text-sm leading-7 text-white/65 sm:text-base">
                            Voici le chemin d'une commande sur JSE Express,
                            depuis le choix du restaurant jusqu'à la
                            validation de la livraison.
                        </p>
                    </div>

                    <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {parcours.map(({ icon: Icon, title, text }, index) => (
                            <li
                                key={title}
                                className="rounded-3xl border border-white/10 bg-white/[0.06] p-6"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/90 text-jse-principal">
                                        <Icon
                                            className="h-5 w-5"
                                            aria-hidden="true"
                                        />
                                    </span>
                                    <span className="font-against text-3xl text-jse-secondaire">
                                        {index + 1}
                                    </span>
                                </div>
                                <h3 className="mt-6 text-lg font-semibold">
                                    {title}
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-white/60">
                                    {text}
                                </p>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            <section className="bg-jse-fond px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
                <div className="mx-auto max-w-7xl">
                    <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
                        <div className="lg:sticky lg:top-28">
                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-jse-secondaire">
                                Questions fréquentes
                            </p>
                            <h2 className="mt-4 font-against text-5xl leading-[0.92] text-jse-principal sm:text-6xl">
                                Les réponses essentielles.
                            </h2>

                            <div
                                className="mt-8 flex flex-wrap gap-2"
                                role="group"
                                aria-label="Filtrer par thème"
                            >
                                {categories.map(({ id, label }) => {
                                    const actif = categorie === id;
                                    return (
                                        <button
                                            key={id}
                                            type="button"
                                            onClick={() => setCategorie(id)}
                                            aria-pressed={actif}
                                            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                                                actif
                                                    ? "border-jse-principal bg-jse-principal text-white"
                                                    : "border-jse-principal/15 bg-white text-jse-principal hover:bg-jse-principal/5"
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div aria-live="polite">
                            {resultats.length === 0 ? (
                                <div className="rounded-3xl border border-dashed border-jse-principal/20 bg-white/60 p-10 text-center">
                                    <p className="text-lg font-semibold text-jse-principal">
                                        Aucune réponse ne correspond.
                                    </p>
                                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-jse-texte/60">
                                        Essayez un autre mot-clé ou revenez à
                                        toutes les questions.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={reinitialiser}
                                        className="mt-6 rounded-full bg-jse-principal px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-jse-principal/90"
                                    >
                                        Voir toutes les questions
                                    </button>
                                </div>
                            ) : (
                                <div className="divide-y divide-jse-principal/10 border-y border-jse-principal/10">
                                    {resultats.map(
                                        ({ icon: Icon, question, answer }) => {
                                            const actif = ouvert === question;
                                            const idReponse = `reponse-${normaliser(question).replace(/[^a-z0-9]+/g, "-")}`;
                                            return (
                                                <article key={question}>
                                                    <h3>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setOuvert(
                                                                    actif
                                                                        ? null
                                                                        : question,
                                                                )
                                                            }
                                                            aria-expanded={actif}
                                                            aria-controls={idReponse}
                                                            className="group flex w-full items-center gap-4 py-6 text-left"
                                                        >
                                                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-jse-secondaire/15 text-jse-principal transition group-hover:bg-jse-secondaire/25">
                                                                <Icon
                                                                    className="h-5 w-5"
                                                                    aria-hidden="true"
                                                                />
                                                            </span>
                                                            <span className="flex-1 text-base font-semibold text-jse-principal sm:text-lg">
                                                                {question}
                                                            </span>
                                                            <ChevronDown
                                                                aria-hidden="true"
                                                                className={`h-5 w-5 shrink-0 text-jse-principal/50 motion-safe:transition ${actif ? "rotate-180" : ""}`}
                                                            />
                                                        </button>
                                                    </h3>
                                                    {actif && (
                                                        <p
                                                            id={idReponse}
                                                            className="max-w-2xl pb-7 pl-[3.75rem] text-sm leading-7 text-jse-texte/65 sm:text-base"
                                                        >
                                                            {answer}
                                                        </p>
                                                    )}
                                                </article>
                                            );
                                        },
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <section className="px-5 pb-16 sm:px-8 lg:px-10 lg:pb-20">
                <div className="mx-auto max-w-7xl">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-jse-secondaire">
                        Aller plus loin
                    </p>
                    <div className="mt-6 grid gap-5 md:grid-cols-3">
                        {raccourcis.map(({ icon: Icon, title, text, href }) => (
                            <button
                                key={href}
                                type="button"
                                onClick={() => router.visit(href)}
                                className="group flex flex-col items-start rounded-3xl border border-jse-principal/10 bg-white p-6 text-left shadow-jse-carte transition hover:-translate-y-1 hover:shadow-jse-elevated"
                            >
                                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-jse-secondaire/15 text-jse-principal">
                                    <Icon
                                        className="h-5 w-5"
                                        aria-hidden="true"
                                    />
                                </span>
                                <span className="mt-5 text-lg font-semibold text-jse-principal">
                                    {title}
                                </span>
                                <span className="mt-2 text-sm leading-6 text-jse-texte/60">
                                    {text}
                                </span>
                                <ArrowRight
                                    aria-hidden="true"
                                    className="mt-5 h-5 w-5 text-jse-accent motion-safe:transition group-hover:translate-x-1"
                                />
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            <section className="px-5 pb-16 sm:px-8 lg:px-10 lg:pb-24">
                <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-jse-principal px-6 py-10 text-white sm:px-10 lg:px-14 lg:py-14">
                    <img
                        src={images.restaurant}
                        alt=""
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-15"
                    />
                    <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-jse-secondaire">
                                Prêt à commander ?
                            </p>
                            <h2 className="mt-3 max-w-3xl font-against text-4xl leading-[0.95] sm:text-5xl">
                                Connectez-vous et retrouvez les restaurants
                                disponibles.
                            </h2>
                        </div>
                        <button
                            type="button"
                            onClick={() => router.visit("/authentification")}
                            className="inline-flex items-center justify-center gap-3 rounded-full bg-jse-secondaire px-6 py-3.5 text-sm font-semibold text-jse-principal transition hover:bg-jse-secondaire/90 active:scale-[0.98]"
                        >
                            Se connecter
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </section>
        </main>
    );
}

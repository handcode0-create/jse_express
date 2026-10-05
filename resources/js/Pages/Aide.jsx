import { router } from "@inertiajs/react";
import {
    ChevronDown,
    CircleHelp,
    CreditCard,
    LockKeyhole,
    ShoppingBag,
    Truck,
} from "lucide-react";
import { useState } from "react";

const faq = [
    {
        icon: ShoppingBag,
        question: "Comment passer une commande ?",
        answer: "Connectez-vous à votre compte client, ouvrez l'espace restaurants, choisissez un restaurant, consultez ses produits puis ajoutez les articles souhaités au panier avant de valider.",
    },
    {
        icon: Truck,
        question: "Comment fonctionne la livraison ?",
        answer: "Après validation de la commande, la livraison est organisée selon les zones et secteurs prévus par JSE Express. Le livreur prend ensuite la mission en charge et la livraison est suivie dans votre espace.",
    },
    {
        icon: CreditCard,
        question: "Comment le paiement est-il géré ?",
        answer: "Le parcours de commande utilise les moyens de paiement mobile prévus par JSE Express. Le mode de paiement associé à la commande est conservé pour son suivi.",
    },
    {
        icon: LockKeyhole,
        question: "À quoi sert le PIN de livraison ?",
        answer: "Le PIN sert à sécuriser la validation de la livraison. Il ne doit pas être partagé inutilement et n'est pas affiché comme une information administrative ordinaire.",
    },
];

export default function Aide() {
    const [ouvert, setOuvert] = useState(0);
    return (
        <main className="min-h-screen bg-jse-fond text-jse-texte">
            <header className="sticky top-0 z-30 border-b border-jse-principal/10 bg-jse-fond/90 backdrop-blur-xl">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
                    <button
                        type="button"
                        onClick={() => router.visit("/bienvenue")}
                        aria-label="Retour à l'accueil"
                    >
                        <img
                            src="/assets/jse_logo.png?v=20261002"
                            alt="JSE Express"
                            className="h-9 w-auto"
                        />
                    </button>
                    <nav className="hidden items-center gap-5 font-sans text-sm font-medium sm:flex">
                        <button
                            type="button"
                            onClick={() => router.visit("/accueil")}
                            className="rounded-full px-3 py-2 transition hover:bg-jse-principal/5"
                        >
                            Restaurants
                        </button>
                        <button
                            type="button"
                            onClick={() => router.visit("/a-propos")}
                            className="rounded-full px-3 py-2 transition hover:bg-jse-principal/5"
                        >
                            À propos
                        </button>
                        <span className="rounded-full bg-jse-secondaire/15 px-3 py-2 text-jse-principal">
                            Aide
                        </span>
                    </nav>
                    <button
                        type="button"
                        onClick={() => router.visit("/authentification")}
                        className="rounded-full bg-jse-principal px-4 py-2 font-sans text-sm font-semibold text-white transition hover:bg-jse-principal/90"
                    >
                        Se connecter
                    </button>
                </div>
            </header>

            <section className="bg-jse-principal px-5 py-16 text-white sm:px-8 lg:py-24">
                <div className="mx-auto max-w-4xl text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-jse-secondaire/15 text-jse-secondaire">
                        <CircleHelp className="h-6 w-6" />
                    </div>
                    <p className="mt-5 font-sans text-sm font-semibold uppercase tracking-[0.18em] text-jse-secondaire">
                        Centre d'aide
                    </p>
                    <h1 className="mt-3 font-against text-5xl leading-none sm:text-7xl">
                        Besoin d'un coup de main ?
                    </h1>
                    <p className="mx-auto mt-6 max-w-2xl font-sans text-base leading-7 text-white/70">
                        Retrouvez ici les réponses essentielles pour utiliser
                        JSE Express et comprendre le parcours d'une commande.
                    </p>
                </div>
            </section>

            <section className="mx-auto max-w-4xl px-5 py-14 sm:px-8 lg:py-20">
                <div className="space-y-3">
                    {faq.map(({ icon: Icon, question, answer }, index) => {
                        const actif = ouvert === index;
                        return (
                            <article
                                key={question}
                                className="overflow-hidden rounded-2xl border border-jse-principal/10 bg-white"
                            >
                                <button
                                    type="button"
                                    onClick={() =>
                                        setOuvert(actif ? -1 : index)
                                    }
                                    aria-expanded={actif}
                                    className="flex w-full items-center gap-4 px-5 py-5 text-left transition hover:bg-jse-fond/60"
                                >
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-jse-secondaire/15 text-jse-principal">
                                        <Icon className="h-5 w-5" />
                                    </span>
                                    <span className="flex-1 font-sans text-sm font-semibold sm:text-base">
                                        {question}
                                    </span>
                                    <ChevronDown
                                        className={`h-5 w-5 shrink-0 transition ${actif ? "rotate-180" : ""}`}
                                    />
                                </button>
                                {actif && (
                                    <div className="px-5 pb-5 pl-[4.75rem] font-sans text-sm leading-6 text-jse-texte/65">
                                        {answer}
                                    </div>
                                )}
                            </article>
                        );
                    })}
                </div>
                <div className="mt-10 rounded-3xl border border-jse-principal/10 bg-white p-7 text-center shadow-sm sm:p-9">
                    <h2 className="font-sans text-lg font-semibold">
                        Prêt à commander ?
                    </h2>
                    <p className="mx-auto mt-2 max-w-xl font-sans text-sm leading-6 text-jse-texte/65">
                        Connectez-vous pour accéder à votre espace client et
                        retrouver les restaurants disponibles.
                    </p>
                    <button
                        type="button"
                        onClick={() => router.visit("/authentification")}
                        className="mt-6 rounded-full bg-jse-principal px-6 py-3 font-sans text-sm font-semibold text-white transition hover:bg-jse-principal/90"
                    >
                        Se connecter
                    </button>
                </div>
            </section>
        </main>
    );
}

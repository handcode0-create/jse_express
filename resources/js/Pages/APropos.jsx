import { router } from "@inertiajs/react";
import { ArrowRight, CheckCircle2, MapPin, Search, ShoppingBag, Truck } from "lucide-react";

const images = {
    hero: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1800&q=85",
    restaurant: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=85",
    order: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=85",
    delivery: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=85",
};

const points = [
    {
        icon: Search,
        number: "01",
        title: "Choisissez",
        text: "Explorez les restaurants disponibles à Adzopé et découvrez leurs menus.",
    },
    {
        icon: ShoppingBag,
        number: "02",
        title: "Commandez",
        text: "Sélectionnez vos produits, composez votre panier puis validez votre commande.",
    },
    {
        icon: Truck,
        number: "03",
        title: "Recevez",
        text: "Votre commande est prise en charge et sa livraison est organisée selon les zones prévues.",
    },
];

const roles = [
    {
        icon: CheckCircle2,
        title: "Pour le client",
        text: "Un parcours clair pour découvrir, commander et suivre la prise en charge de ses repas.",
    },
    {
        icon: ShoppingBag,
        title: "Pour le restaurant",
        text: "Un espace pensé pour présenter les produits disponibles et traiter les commandes reçues.",
    },
    {
        icon: Truck,
        title: "Pour le livreur",
        text: "Des missions organisées selon les zones et secteurs prévus par le service.",
    },
];

export default function APropos() {
    return (
        <main className="min-h-screen overflow-x-hidden bg-jse-fond text-jse-texte font-sans">
            <header className="sticky top-0 z-50 border-b border-jse-principal/10 bg-jse-fond/95 backdrop-blur-xl">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
                    <button
                        type="button"
                        onClick={() => router.visit("/bienvenue")}
                        aria-label="Retour à l'accueil"
                        className="shrink-0"
                    >
                        <img src="/assets/jse_logo.png?v=20261002" alt="JSE Express" className="h-9 w-auto sm:h-10" />
                    </button>

                    <nav className="hidden items-center gap-1 text-sm font-medium lg:flex" aria-label="Navigation principale">
                        <button type="button" onClick={() => router.visit("/restaurants")} className="rounded-full px-4 py-2.5 transition hover:bg-jse-principal/5">
                            Restaurants
                        </button>
                        <span className="rounded-full bg-jse-secondaire/15 px-4 py-2.5 text-jse-principal">À propos</span>
                        <button type="button" onClick={() => router.visit("/aide")} className="rounded-full px-4 py-2.5 transition hover:bg-jse-principal/5">
                            Aide
                        </button>
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
                <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-10 px-5 py-12 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:px-10 lg:py-16">
                    <div className="relative z-10">
                        <p className="font-sans text-sm font-semibold uppercase tracking-[0.18em] text-jse-secondaire">JSE Express</p>
                        <h1 className="mt-5 max-w-3xl font-against text-6xl leading-[0.9] tracking-tight text-jse-principal sm:text-7xl lg:text-8xl">
                            La commande locale, pensée pour <span className="text-jse-accent">Adzopé.</span>
                        </h1>
                        <p className="mt-7 max-w-2xl text-base leading-7 text-jse-texte/70 sm:text-lg">
                            JSE Express facilite la découverte des restaurants, la commande de repas et leur livraison à Adzopé, dans un parcours simple pour le client, le restaurant et le livreur.
                        </p>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                            <button
                                type="button"
                                onClick={() => router.visit("/accueil")}
                                className="inline-flex items-center justify-center gap-3 rounded-full bg-jse-principal px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-jse-principal/15 transition hover:-translate-y-0.5 hover:bg-jse-principal/90 active:scale-[0.98]"
                            >
                                Découvrir les restaurants
                                <ArrowRight className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => router.visit("/authentification")}
                                className="rounded-full border border-jse-principal/15 bg-white/60 px-6 py-3.5 text-sm font-semibold text-jse-principal transition hover:bg-white"
                            >
                                Commencer
                            </button>
                        </div>

                        <div className="mt-10 grid max-w-2xl grid-cols-3 gap-4 border-t border-jse-principal/10 pt-6">
                            {[
                                ["Client", "Commander simplement"],
                                ["Restaurant", "Présenter ses menus"],
                                ["Livreur", "Prendre en charge"],
                            ].map(([title, text]) => (
                                <div key={title}>
                                    <p className="text-sm font-semibold text-jse-principal">{title}</p>
                                    <p className="mt-1 text-xs leading-5 text-jse-texte/55">{text}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative min-h-[28rem] overflow-hidden rounded-[2rem] lg:min-h-[38rem]">
                        <img src={images.hero} alt="Repas servi dans un restaurant" className="absolute inset-0 h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-jse-principal/45 via-transparent to-transparent" />
                        <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/30 bg-white/85 p-4 shadow-xl backdrop-blur-md sm:bottom-7 sm:left-7 sm:right-auto sm:max-w-sm">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-jse-secondaire">JSE Express</p>
                            <p className="mt-2 text-base font-semibold text-jse-principal">Des restaurants locaux, une commande pensée pour Adzopé.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-jse-principal px-5 py-16 text-white sm:px-8 lg:px-10 lg:py-20">
                <div className="mx-auto max-w-7xl">
                    <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-jse-secondaire">Notre approche</p>
                            <h2 className="mt-4 max-w-xl font-against text-5xl leading-[0.92] sm:text-6xl">
                                Un service local, pensé autour du terrain.
                            </h2>
                        </div>
                        <p className="max-w-2xl text-sm leading-7 text-white/65 sm:text-base">
                            JSE Express relie les différents acteurs du parcours sans compliquer l'expérience : découvrir un restaurant, choisir ses produits, commander, puis organiser la livraison.
                        </p>
                    </div>

                    <div className="mt-12 grid gap-5 md:grid-cols-3">
                        {roles.map(({ icon: Icon, title, text }, index) => (
                            <article key={title} className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06]">
                                <div className="relative aspect-[4/3] overflow-hidden">
                                    <img
                                        src={[images.restaurant, images.order, images.delivery][index]}
                                        alt=""
                                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-jse-principal/80 via-transparent to-transparent" />
                                    <div className="absolute left-5 top-5 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/90 text-jse-principal">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold">{title}</h3>
                                    <p className="mt-3 text-sm leading-6 text-white/60">{text}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-jse-fond px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
                <div className="mx-auto max-w-7xl">
                    <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-jse-secondaire">Comment ça marche ?</p>
                            <h2 className="mt-4 font-against text-5xl leading-[0.92] text-jse-principal sm:text-6xl">
                                Un parcours simple, du choix à la livraison.
                            </h2>
                        </div>

                        <div className="divide-y divide-jse-principal/10 border-y border-jse-principal/10">
                            {points.map(({ icon: Icon, number, title, text }) => (
                                <article key={number} className="grid gap-5 py-7 sm:grid-cols-[auto_1fr_auto] sm:items-center">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-jse-accent text-sm font-bold text-white">{number}</span>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <Icon className="h-5 w-5 text-jse-secondaire" />
                                            <h3 className="text-lg font-semibold text-jse-principal">{title}</h3>
                                        </div>
                                        <p className="mt-2 max-w-xl text-sm leading-6 text-jse-texte/60">{text}</p>
                                    </div>
                                    <ArrowRight className="hidden h-5 w-5 text-jse-principal/30 sm:block" />
                                </article>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="px-5 pb-16 sm:px-8 lg:px-10 lg:pb-24">
                <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-jse-principal px-6 py-10 text-white sm:px-10 lg:px-14 lg:py-14">
                    <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-jse-secondaire">Adzopé</p>
                            <h2 className="mt-3 max-w-3xl font-against text-4xl leading-[0.95] sm:text-5xl">
                                Découvrez les restaurants et composez votre prochaine commande.
                            </h2>
                        </div>
                        <button
                            type="button"
                            onClick={() => router.visit("/accueil")}
                            className="inline-flex items-center justify-center gap-3 rounded-full bg-jse-secondaire px-6 py-3.5 text-sm font-semibold text-jse-principal transition hover:bg-jse-secondaire/90 active:scale-[0.98]"
                        >
                            Voir les restaurants
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </section>
        </main>
    );
}

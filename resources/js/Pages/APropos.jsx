import { router } from "@inertiajs/react";
import { ArrowRight, MapPin, ShieldCheck, Store, Truck } from "lucide-react";

const points = [
    { icon: Store, title: "Les restaurants d'Adzopé", text: "JSE Express rassemble les restaurants disponibles sur la plateforme pour vous permettre de découvrir leurs menus et commander." },
    { icon: Truck, title: "Une livraison organisée", text: "Les commandes sont prises en charge par des livreurs et attribuées selon les zones et secteurs prévus par le service." },
    { icon: ShieldCheck, title: "Un parcours sécurisé", text: "La validation d'une livraison s'appuie notamment sur un PIN. Les informations sensibles ne sont pas exposées inutilement." },
];

export default function APropos() {
    return (
        <main className="min-h-screen bg-jse-fond text-jse-texte">
            <header className="sticky top-0 z-30 border-b border-jse-principal/10 bg-jse-fond/90 backdrop-blur-xl">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
                    <button type="button" onClick={() => router.visit("/bienvenue")} aria-label="Retour à l'accueil">
                        <img src="/assets/jse_logo.png?v=20261002" alt="JSE Express" className="h-9 w-auto" />
                    </button>
                    <nav className="flex items-center gap-2 font-sans text-sm font-medium sm:gap-5">
                        <button type="button" onClick={() => router.visit("/accueil")} className="rounded-full px-3 py-2 transition hover:bg-jse-principal/5">Restaurants</button>
                        <span className="rounded-full bg-jse-secondaire/15 px-3 py-2 text-jse-principal">À propos</span>
                        <button type="button" onClick={() => router.visit("/aide")} className="rounded-full px-3 py-2 transition hover:bg-jse-principal/5">Aide</button>
                    </nav>
                    <button type="button" onClick={() => router.visit("/authentification")} className="rounded-full bg-jse-principal px-4 py-2 font-sans text-sm font-semibold text-white transition hover:bg-jse-principal/90">Se connecter</button>
                </div>
            </header>

            <section className="relative overflow-hidden bg-jse-principal px-5 py-20 text-white sm:px-8 lg:py-28">
                <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-jse-secondaire/20 blur-3xl" />
                <div className="relative mx-auto max-w-6xl">
                    <p className="font-sans text-sm font-semibold uppercase tracking-[0.18em] text-jse-secondaire">JSE Express</p>
                    <h1 className="mt-4 max-w-4xl font-against text-5xl leading-[0.96] sm:text-6xl lg:text-8xl">La commande locale,<br />pensée pour Adzopé.</h1>
                    <p className="mt-7 max-w-2xl font-sans text-base leading-7 text-white/75 sm:text-lg">JSE Express facilite la découverte des restaurants, la commande de repas et leur livraison à Adzopé, dans un parcours simple pour le client, le restaurant et le livreur.</p>
                    <div className="mt-8 flex items-center gap-2 font-sans text-sm text-white/70"><MapPin className="h-4 w-4 text-jse-secondaire" />Adzopé, Côte d'Ivoire</div>
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
                <div className="grid gap-5 md:grid-cols-3">
                    {points.map(({ icon: Icon, title, text }) => (
                        <article key={title} className="rounded-3xl border border-jse-principal/10 bg-white p-7 shadow-sm">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-jse-secondaire/15 text-jse-principal"><Icon className="h-5 w-5" /></div>
                            <h2 className="mt-6 font-sans text-lg font-semibold">{title}</h2>
                            <p className="mt-3 font-sans text-sm leading-6 text-jse-texte/65">{text}</p>
                        </article>
                    ))}
                </div>
                <div className="mt-10 rounded-3xl bg-jse-principal p-7 text-white sm:p-10">
                    <p className="max-w-3xl font-sans text-base leading-7 text-white/75">Notre objectif est de garder le parcours clair : choisir un restaurant, consulter ses produits, composer son panier, valider la commande puis suivre sa prise en charge et sa livraison.</p>
                    <button type="button" onClick={() => router.visit("/accueil")} className="mt-7 inline-flex items-center gap-2 rounded-full bg-jse-secondaire px-6 py-3 font-sans text-sm font-semibold text-jse-principal transition hover:bg-jse-secondaire/90">Découvrir les restaurants<ArrowRight className="h-4 w-4" /></button>
                </div>
            </section>
        </main>
    );
}

import { useLayoutEffect, useRef } from "react";
import { Link } from "@inertiajs/react";
import { gsap } from "gsap";
import { ChevronLeft } from "lucide-react";
import { mouvementReduit } from "../../lib/mouvement";

const PLATS = {
    poulet: "/assets/optimises/plat-poulet-braise.webp",
    attieke: "/assets/optimises/plat-attieke-poisson.webp",
    dessert: "/assets/optimises/plat-dessert.webp",
};

/** Cadrage de la photo de marque : chaque rubrique montre une partie différente de la scène. */
const CADRAGES = {
    motos: "object-[60%_50%]",
    "motos-gauche": "object-[12%_50%]",
    poulet: "object-[78%_40%]",
    attieke: "object-[40%_60%]",
    dessert: "object-[92%_55%]",
};

/**
 * Bandeau d'en-tête de rubrique : photo de marque, dégradés vert, titre Against, description et actions.
 * `visuel` choisit le cadrage de la photo et, pour `poulet`, `attieke` et `dessert`, un plat détouré.
 * Les boutons principaux (`.jse-admin-primary`) passent en orange pour rester lisibles sur le vert.
 *
 * @param {{ surtitre?: string, titre: string, description?: string|null, retour?: { href: string, label: string }|null, actions?: import("react").ReactNode, visuel?: keyof typeof CADRAGES, idTitre?: string }} props
 */
export default function BandeauRubrique({ surtitre = null, titre, description = null, retour = null, actions = null, visuel = "motos", idTitre }) {
    const racine = useRef(null);
    const plat = PLATS[visuel] ?? null;

    useLayoutEffect(() => {
        if (!racine.current || mouvementReduit()) return undefined;

        const contexte = gsap.context(() => {
            gsap.from("[data-bandeau]", { y: 18, opacity: 0, duration: 0.55, ease: "power3.out", stagger: 0.07 });
            gsap.from("[data-bandeau-fond]", { scale: 1.08, duration: 1.4, ease: "power2.out" });
            if (plat) gsap.from("[data-bandeau-plat]", { scale: 0.85, rotate: -8, opacity: 0, duration: 0.8, delay: 0.15, ease: "back.out(1.4)" });
        }, racine);

        return () => contexte.revert();
    }, [titre]);

    return (
        <header ref={racine} className="relative isolate overflow-hidden rounded-[2rem] bg-jse-principal text-jse-fond shadow-jse-elevated">
            <img data-bandeau-fond src="/assets/optimises/fond-marque.webp" alt="" aria-hidden="true" decoding="async" className={["absolute inset-0 -z-10 size-full object-cover", CADRAGES[visuel] ?? CADRAGES.motos].join(" ")} />
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-jse-principal via-jse-principal/92 to-jse-principal/70 sm:bg-gradient-to-r sm:from-jse-principal sm:via-jse-principal/88 sm:to-jse-principal/40" />

            <div className="relative px-6 py-7 sm:px-10 sm:py-9">
                <div className="relative z-10 max-w-2xl">
                    {retour && (
                        <Link
                            data-bandeau
                            href={retour.href}
                            className="mb-4 inline-flex min-h-9 items-center gap-1 rounded-full border border-white/25 bg-white/10 py-1 pl-2 pr-4 text-sm font-medium text-jse-fond backdrop-blur-md transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
                        >
                            <ChevronLeft size={16} aria-hidden="true" />
                            {retour.label}
                        </Link>
                    )}
                    {surtitre && (
                        <p data-bandeau className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-jse-fond/90">
                            <span className="h-0.5 w-8 shrink-0 rounded-full bg-jse-secondaire" aria-hidden="true" />
                            <span className="min-w-0 break-words">{surtitre}</span>
                        </p>
                    )}
                    <h1 id={idTitre} data-bandeau className="mt-3 break-words font-against text-4xl leading-[0.95] tracking-tight sm:text-5xl">
                        {titre}
                    </h1>
                    {description && (
                        <p data-bandeau className="mt-3 max-w-xl text-base leading-7 text-jse-fond/85">
                            {description}
                        </p>
                    )}
                    {actions && (
                        <div
                            data-bandeau
                            className="mt-6 flex flex-col gap-2 sm:flex-row [&_.jse-admin-primary:hover]:bg-jse-accent/90 [&_.jse-admin-primary]:bg-jse-accent [&_.jse-admin-primary]:text-white [&_.jse-admin-primary]:shadow-lg [&_.jse-admin-primary]:shadow-jse-accent/25"
                        >
                            {actions}
                        </div>
                    )}
                </div>
            </div>

            {plat && <img data-bandeau-plat src={plat} alt="" aria-hidden="true" decoding="async" className="pointer-events-none absolute -bottom-10 -right-8 z-0 w-40 rotate-6 drop-shadow-2xl sm:-right-4 sm:w-60 lg:right-6 lg:w-72" />}
        </header>
    );
}

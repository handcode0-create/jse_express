import { router } from "@inertiajs/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, MapPin, Pause, Play } from "lucide-react";
import { gsap } from "gsap";

/* ------------------------------------------------------------------ */
/*  Contenu                                                            */
/* ------------------------------------------------------------------ */

const SLIDES = [
    {
        image: "/assets/bienvenue/web/poulet_braise.webp",
        plat: "Poulet braisé",
        eyebrow: "Bienvenue",
        lignes: ["Vos plats favoris", "à Adzopé, sans", "vous déplacer."],
        texte: "Découvrez, commandez, faites-vous livrer en toute simplicité.",
    },
    {
        image: "/assets/bienvenue/web/attieke_poisson.webp",
        plat: "Attiéké poisson",
        eyebrow: "Saveurs locales",
        lignes: ["Les saveurs", "d'ici,", "chez vous."],
        texte: "Retrouvez les grands classiques ivoiriens près de chez vous.",
    },
    {
        image: "/assets/bienvenue/web/burger.webp",
        plat: "Burger",
        eyebrow: "Envie de variété",
        lignes: ["Une envie ?", "Trouvez le plat", "qu'il vous faut."],
        texte: "Explorez les restaurants et composez votre prochaine commande.",
    },
    {
        image: "/assets/bienvenue/web/boisson_fraiche.webp",
        plat: "Boisson fraîche",
        eyebrow: "Fraîcheur",
        lignes: ["Commandez.", "Nous nous", "occupons du", "reste."],
        texte: "Des plats, des boissons et une livraison pensée pour vous.",
    },
    {
        image: "/assets/bienvenue/web/dessert.webp",
        plat: "Dessert",
        eyebrow: "JSE Express",
        lignes: ["Découvrez.", "Commandez.", "Savourez."],
        texte: "Une nouvelle façon de profiter des saveurs d'Adzopé.",
    },
];

/* Parcours client officiel, résumé (aucune fonctionnalité hors MVP). */
const ETAPES = [
    { numero: "01", titre: "Choisissez", texte: "Restaurants et menus d'Adzopé" },
    { numero: "02", titre: "Commandez", texte: "Panier, adresse et paiement" },
    { numero: "03", titre: "Suivez", texte: "Chaque étape de votre commande" },
    { numero: "04", titre: "Recevez", texte: "Un code PIN sécurise la remise" },
];

/* ------------------------------------------------------------------ */
/*  Système de mouvement (tokens)                                      */
/* ------------------------------------------------------------------ */

const MOTION = {
    lent: 0.9,
    normal: 0.7,
    rapide: 0.35,
    stagger: 0.08,
    sortie: "power3.in",
    entree: "power3.out",
    emphase: "power4.out",
    autoplay: 6,
};

const AUTHENTIFICATION = "/authentification";
const GRAIN =
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='.55'/></svg>\")";

const prefereMoinsDeMouvement = () =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function BienvenueWeb() {
    const racine = useRef(null);
    const rideau = useRef(null);
    const anneau = useRef(null);
    const progression = useRef(null);
    const api = useRef({});
    const occupe = useRef(false);
    const survol = useRef(false);
    const indexRef = useRef(0);
    const lectureRef = useRef(true);
    const reduit = useRef(null);
    if (reduit.current === null) reduit.current = prefereMoinsDeMouvement();

    const [index, setIndex] = useState(0);
    const [lecture, setLecture] = useState(!reduit.current);

    lectureRef.current = lecture;

    /* ---------------- Autoplay piloté par l'anneau ---------------- */

    api.current.demarrerProgression = () => {
        progression.current?.kill();
        if (!anneau.current) return;
        gsap.set(anneau.current, { strokeDashoffset: 1 });
        if (!lectureRef.current || reduit.current) return;

        progression.current = gsap.to(anneau.current, {
            strokeDashoffset: 0,
            duration: MOTION.autoplay,
            ease: "none",
            onComplete: () => api.current.aller(indexRef.current + 1, 1),
        });
        if (survol.current) progression.current.pause();
    };

    /* ---------------- Changement de slide ---------------- */

    api.current.aller = (cible, sens) => {
        const el = racine.current;
        if (!el || occupe.current) return;

        const de = indexRef.current;
        const vers = (cible + SLIDES.length) % SLIDES.length;
        if (vers === de) return;
        const dir = sens ?? (vers > de ? 1 : -1);

        occupe.current = true;
        indexRef.current = vers;
        setIndex(vers);
        progression.current?.kill();
        gsap.set(anneau.current, { strokeDashoffset: 1 });

        const s = gsap.utils.selector(el);
        const pick = (type, i) => s(`[data-${type}="${i}"]`)[0];
        const copieA = pick("copy", de);
        const copieB = pick("copy", vers);
        const platA = pick("dish", de);
        const platB = pick("dish", vers);
        const puceA = pick("chip", de);
        const puceB = pick("chip", vers);

        const fin = () => {
            occupe.current = false;
            api.current.demarrerProgression();
        };

        if (reduit.current) {
            gsap
                .timeline({ onComplete: fin })
                .to([copieA, platA, puceA], { autoAlpha: 0, duration: 0.2 })
                .to([copieB, platB, puceB], { autoAlpha: 1, duration: 0.25 });
            return;
        }

        const lignesA = s(`[data-copy="${de}"] [data-line]`);
        const lignesB = s(`[data-copy="${vers}"] [data-line]`);
        const fadeA = s(`[data-copy="${de}"] [data-fade]`);
        const fadeB = s(`[data-copy="${vers}"] [data-fade]`);

        gsap
            .timeline({ onComplete: fin })
            /* sortie */
            .to(lignesA, { yPercent: -115, duration: MOTION.rapide + 0.1, stagger: 0.04, ease: MOTION.sortie }, 0)
            .to(fadeA, { autoAlpha: 0, y: -10, duration: MOTION.rapide, ease: MOTION.sortie }, 0)
            .to(platA, {
                xPercent: -26 * dir,
                rotation: -14 * dir,
                scale: 0.84,
                autoAlpha: 0,
                duration: MOTION.rapide + 0.2,
                ease: MOTION.sortie,
            }, 0)
            .to(puceA, { autoAlpha: 0, y: 8, duration: MOTION.rapide, ease: MOTION.sortie }, 0)
            .set(copieA, { autoAlpha: 0 })
            .set(lignesA, { yPercent: 0 })
            .set(fadeA, { y: 0 })
            /* entrée */
            .set(copieB, { autoAlpha: 1 }, 0.4)
            .fromTo(lignesB, { yPercent: 115 }, { yPercent: 0, duration: MOTION.normal, stagger: 0.07, ease: MOTION.emphase }, 0.4)
            .fromTo(fadeB, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: MOTION.normal, stagger: 0.06, ease: MOTION.entree }, 0.55)
            .fromTo(platB, {
                xPercent: 26 * dir,
                rotation: 14 * dir,
                scale: 0.84,
                autoAlpha: 0,
            }, {
                xPercent: 0,
                rotation: 0,
                scale: 1,
                autoAlpha: 1,
                duration: MOTION.lent,
                ease: MOTION.emphase,
            }, 0.35)
            .fromTo(puceB, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: MOTION.normal, ease: MOTION.entree }, 0.7);
    };

    /* ---------------- Départ vers l'authentification (rideau) ---------------- */

    const quitter = (event) => {
        if (reduit.current) {
            router.visit(AUTHENTIFICATION);
            return;
        }
        const zone = event.currentTarget.getBoundingClientRect();
        const cx = zone.left + zone.width / 2;
        const cy = zone.top + zone.height / 2;
        const rayon = Math.hypot(window.innerWidth, window.innerHeight);

        progression.current?.pause();
        gsap.set(rideau.current, { autoAlpha: 1, clipPath: `circle(0px at ${cx}px ${cy}px)` });
        gsap.to(rideau.current, {
            clipPath: `circle(${rayon}px at ${cx}px ${cy}px)`,
            duration: 0.75,
            ease: "power3.inOut",
            onComplete: () =>
                router.visit(AUTHENTIFICATION, {
                    onCancel: () => gsap.set(rideau.current, { autoAlpha: 0 }),
                    onError: () => gsap.set(rideau.current, { autoAlpha: 0 }),
                }),
        });
    };

    /* ---------------- Mise en scène initiale ---------------- */

    useLayoutEffect(() => {
        const contexte = gsap.context(() => {
            const inactifs = SLIDES.flatMap((_, i) =>
                i === 0 ? [] : [`[data-copy="${i}"]`, `[data-dish="${i}"]`, `[data-chip="${i}"]`],
            );
            gsap.set(inactifs, { autoAlpha: 0 });
            gsap.set(rideau.current, { autoAlpha: 0 });
            gsap.set(anneau.current, { strokeDashoffset: 1 });

            if (reduit.current) return;

            const tl = gsap.timeline({
                defaults: { ease: MOTION.entree },
                onComplete: () => api.current.demarrerProgression(),
            });

            tl.from("[data-intro='entete'] > *", { y: -16, autoAlpha: 0, duration: MOTION.normal, stagger: 0.08 }, 0)
                .from("[data-intro='ghost']", { autoAlpha: 0, yPercent: 14, duration: 1.4, ease: MOTION.emphase }, 0.1)
                .from("[data-intro='disque']", { scale: 0.55, autoAlpha: 0, duration: 1.1, ease: MOTION.emphase }, 0.15)
                .from("[data-intro='anneau']", { rotation: -40, autoAlpha: 0, duration: 1.2, ease: MOTION.emphase }, 0.25)
                .from(
                    `[data-dish="0"]`,
                    { xPercent: 22, rotation: 16, scale: 0.8, autoAlpha: 0, duration: 1.1, ease: MOTION.emphase },
                    0.35,
                )
                .from(`[data-copy="0"] [data-line]`, { yPercent: 115, duration: 0.9, stagger: 0.09, ease: MOTION.emphase }, 0.4)
                .from(`[data-copy="0"] [data-fade]`, { y: 16, autoAlpha: 0, duration: MOTION.normal, stagger: 0.07 }, 0.65)
                .from(`[data-chip="0"]`, { y: 14, autoAlpha: 0, duration: MOTION.normal }, 0.9)
                .from("[data-intro='actions'] > *", { y: 18, autoAlpha: 0, duration: MOTION.normal, stagger: 0.08 }, 0.85)
                .from("[data-intro='etape']", { y: 22, autoAlpha: 0, duration: MOTION.normal, stagger: 0.08 }, 1)
                .from("[data-intro='filet']", { scaleX: 0, transformOrigin: "left center", duration: 1, stagger: 0.08, ease: "power3.inOut" }, 0.95);
        }, racine);

        return () => {
            progression.current?.kill();
            contexte.revert();
        };
    }, []);

    /* ---------------- Parallaxe pointeur (desktop uniquement) ---------------- */

    useEffect(() => {
        if (reduit.current) return;
        if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

        const contexte = gsap.context(() => {
            const options = { duration: 1, ease: "power3.out" };
            const sx = gsap.quickTo("[data-parallax='scene']", "x", options);
            const sy = gsap.quickTo("[data-parallax='scene']", "y", options);
            const gx = gsap.quickTo("[data-parallax='ghost']", "x", options);
            const gy = gsap.quickTo("[data-parallax='ghost']", "y", options);

            const surMouvement = (event) => {
                const nx = event.clientX / window.innerWidth - 0.5;
                const ny = event.clientY / window.innerHeight - 0.5;
                sx(nx * -24);
                sy(ny * -16);
                gx(nx * 40);
                gy(ny * 20);
            };
            window.addEventListener("pointermove", surMouvement, { passive: true });
            return () => window.removeEventListener("pointermove", surMouvement);
        }, racine);

        return () => contexte.revert();
    }, []);

    /* ---------------- Clavier + onglet masqué ---------------- */

    useEffect(() => {
        const surClavier = (event) => {
            if (event.key === "ArrowRight") api.current.aller(indexRef.current + 1, 1);
            if (event.key === "ArrowLeft") api.current.aller(indexRef.current - 1, -1);
        };
        const surVisibilite = () => {
            if (!progression.current) return;
            if (document.hidden) progression.current.pause();
            else if (!survol.current) progression.current.resume();
        };
        window.addEventListener("keydown", surClavier);
        document.addEventListener("visibilitychange", surVisibilite);
        return () => {
            window.removeEventListener("keydown", surClavier);
            document.removeEventListener("visibilitychange", surVisibilite);
        };
    }, []);

    /* ---------------- Lecture / pause ---------------- */

    const basculerLecture = () => {
        const suivant = !lectureRef.current;
        lectureRef.current = suivant;
        setLecture(suivant);
        if (suivant) api.current.demarrerProgression();
        else {
            progression.current?.kill();
            gsap.set(anneau.current, { strokeDashoffset: 1 });
        }
    };

    const survolerDebut = () => {
        survol.current = true;
        progression.current?.pause();
    };
    const survolerFin = () => {
        survol.current = false;
        progression.current?.resume();
    };

    /* ---------------- Bouton magnétique ---------------- */

    const magnetique = {
        onPointerMove: (event) => {
            if (reduit.current || event.pointerType !== "mouse") return;
            const zone = event.currentTarget.getBoundingClientRect();
            gsap.to(event.currentTarget, {
                x: (event.clientX - (zone.left + zone.width / 2)) * 0.22,
                y: (event.clientY - (zone.top + zone.height / 2)) * 0.3,
                duration: 0.4,
                ease: "power3.out",
            });
        },
        onPointerLeave: (event) => {
            gsap.to(event.currentTarget, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.5)" });
        },
    };

    /* ---------------- Rendu ---------------- */

    return (
        <main
            ref={racine}
            className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-jse-principal text-[var(--color-jse-fond)]"
        >
            {/* Atmosphère : lumière chaude + halo vert, sans image lourde */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10"
                style={{
                    background: [
                        "radial-gradient(60% 70% at 78% 52%, color-mix(in srgb, var(--color-jse-secondaire) 24%, transparent), transparent 70%)",
                        "radial-gradient(40% 50% at 96% 100%, color-mix(in srgb, var(--color-jse-accent) 16%, transparent), transparent 72%)",
                        "radial-gradient(70% 80% at 0% 0%, color-mix(in srgb, black 34%, transparent), transparent 65%)",
                    ].join(","),
                }}
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07] mix-blend-overlay"
                style={{ backgroundImage: GRAIN }}
            />

            {/* Mot-signature géant, derrière la scène */}
            <div
                aria-hidden="true"
                data-parallax="ghost"
                className="pointer-events-none absolute inset-x-0 bottom-[10%] -z-10 flex justify-center"
            >
                <span
                    data-intro="ghost"
                    className="select-none whitespace-nowrap font-against leading-none tracking-[0.02em] text-transparent"
                    style={{
                        fontSize: "clamp(9rem, 27vw, 30rem)",
                        WebkitTextStroke: "1.5px color-mix(in srgb, var(--color-jse-fond) 8%, transparent)",
                    }}
                >
                    ADZOPÉ
                </span>
            </div>

            <div className="relative z-10 mx-auto flex w-full max-w-[1760px] flex-1 flex-col px-10 xl:px-16 2xl:px-20">
                {/* ------------------------------ En-tête ------------------------------ */}
                <header data-intro="entete" className="flex items-center justify-between pt-8">
                    <a
                        href="/"
                        onClick={(event) => {
                            event.preventDefault();
                            router.visit("/");
                        }}
                        aria-label="JSE Express — accueil"
                        className="flex items-center gap-3"
                    >
                        <img
                            src="/assets/jse_logo.png?v=20261002"
                            alt=""
                            width="44"
                            height="44"
                            className="size-11 rounded-xl object-contain"
                        />
                        <span className="font-against text-[1.7rem] leading-none tracking-[-0.01em]">JSE Express</span>
                    </a>

                    <div className="flex items-center gap-6">
                        <span className="hidden items-center gap-2 text-sm text-[var(--color-jse-fond)]/70 xl:inline-flex">
                            <MapPin className="size-4 text-jse-accent" aria-hidden="true" />
                            Adzopé · Côte d'Ivoire
                        </span>
                        <button
                            type="button"
                            onClick={quitter}
                            className="h-11 rounded-full border border-[var(--color-jse-fond)]/25 px-6 text-sm font-medium transition-colors duration-300 hover:border-[var(--color-jse-fond)] hover:bg-[var(--color-jse-fond)] hover:text-jse-principal"
                        >
                            Se connecter
                        </button>
                    </div>
                </header>

                {/* ------------------------------ Scène ------------------------------ */}
                <section
                    className="grid flex-1 items-center gap-10 py-8 [@media(max-height:800px)]:py-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] xl:gap-16"
                    aria-roledescription="carrousel"
                    aria-label="Présentation de JSE Express"
                >
                    {/* Texte */}
                    <div
                        className="relative z-10 min-w-0"
                        onPointerEnter={survolerDebut}
                        onPointerLeave={survolerFin}
                    >
                        <div className="grid" aria-live={lecture ? "off" : "polite"}>
                            {SLIDES.map((slide, i) => (
                                <div key={slide.plat} data-copy={i} className="[grid-area:1/1]">
                                    <p data-fade className="mb-6 [@media(max-height:800px)]:mb-3 flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.18em] text-jse-secondaire">
                                        <span className="relative flex size-2.5">
                                            <span className="absolute inline-flex size-full rounded-full bg-jse-accent opacity-60 motion-safe:animate-ping" />
                                            <span className="relative inline-flex size-2.5 rounded-full bg-jse-accent" />
                                        </span>
                                        {slide.eyebrow}
                                    </p>

                                    <h1
                                        className="font-against leading-[1.02] tracking-[-0.02em]"
                                        style={{ fontSize: "clamp(2.4rem, min(4.4vw, 7.4svh), 5.2rem)" }}
                                    >
                                        {slide.lignes.map((ligne) => (
                                            <span key={ligne} className="-mt-[0.12em] block overflow-hidden pb-[0.06em] pt-[0.12em]">
                                                <span data-line className="block whitespace-nowrap will-change-transform">
                                                    {ligne}
                                                </span>
                                            </span>
                                        ))}
                                    </h1>

                                    <p data-fade className="mt-7 max-w-[30rem] text-lg leading-8 [@media(max-height:800px)]:mt-4 [@media(max-height:800px)]:text-base [@media(max-height:800px)]:leading-7 text-[var(--color-jse-fond)]/75">
                                        {slide.texte}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div data-intro="actions" className="mt-10 [@media(max-height:800px)]:mt-6 flex flex-wrap items-center gap-x-8 gap-y-5">
                            <button
                                type="button"
                                onClick={quitter}
                                {...magnetique}
                                className="group inline-flex h-14 items-center gap-4 rounded-full bg-jse-secondaire py-2 pl-8 pr-2 text-base font-semibold text-jse-principal shadow-[0_18px_40px_-12px_color-mix(in_srgb,var(--color-jse-secondaire)_55%,transparent)] will-change-transform"
                            >
                                Commencer
                                <span className="grid size-10 place-items-center rounded-full bg-jse-principal text-jse-secondaire transition-transform duration-300 group-hover:translate-x-1">
                                    <ArrowRight className="size-5" aria-hidden="true" />
                                </span>
                            </button>

                            <p className="text-sm text-[var(--color-jse-fond)]/65">
                                Déjà un compte ?{" "}
                                <button
                                    type="button"
                                    onClick={quitter}
                                    className="font-semibold text-[var(--color-jse-fond)] underline decoration-jse-accent decoration-2 underline-offset-[6px] transition-colors hover:text-jse-accent"
                                >
                                    Se connecter
                                </button>
                            </p>
                        </div>

                        {/* Navigation du carrousel */}
                        <div className="mt-12 flex items-center gap-6 [@media(max-height:800px)]:mt-6">
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => api.current.aller(index - 1, -1)}
                                    aria-label="Présentation précédente"
                                    className="grid size-11 place-items-center rounded-full border border-[var(--color-jse-fond)]/20 transition-colors hover:border-[var(--color-jse-fond)]/60"
                                >
                                    <ArrowLeft className="size-4" aria-hidden="true" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => api.current.aller(index + 1, 1)}
                                    aria-label="Présentation suivante"
                                    className="grid size-11 place-items-center rounded-full border border-[var(--color-jse-fond)]/20 transition-colors hover:border-[var(--color-jse-fond)]/60"
                                >
                                    <ArrowRight className="size-4" aria-hidden="true" />
                                </button>
                                <button
                                    type="button"
                                    onClick={basculerLecture}
                                    aria-label={lecture ? "Mettre le défilement en pause" : "Reprendre le défilement"}
                                    className="grid size-11 place-items-center rounded-full border border-[var(--color-jse-fond)]/20 transition-colors hover:border-[var(--color-jse-fond)]/60"
                                >
                                    {lecture ? <Pause className="size-4" aria-hidden="true" /> : <Play className="size-4" aria-hidden="true" />}
                                </button>
                            </div>

                            <div className="flex items-center gap-4">
                                <p className="font-against text-lg tabular-nums" aria-live="off">
                                    {String(index + 1).padStart(2, "0")}
                                    <span className="text-[var(--color-jse-fond)]/40"> / {String(SLIDES.length).padStart(2, "0")}</span>
                                </p>
                                <div className="flex items-center" role="group" aria-label="Choisir une présentation">
                                    {SLIDES.map((slide, i) => (
                                        <button
                                            key={slide.plat}
                                            type="button"
                                            onClick={() => api.current.aller(i)}
                                            aria-label={`Afficher : ${slide.plat}`}
                                            aria-current={i === index}
                                            className="group grid h-11 w-8 place-items-center"
                                        >
                                            <span
                                                className={
                                                    "block h-[3px] rounded-full transition-all duration-500 " +
                                                    (i === index
                                                        ? "w-7 bg-jse-accent"
                                                        : "w-4 bg-[var(--color-jse-fond)]/25 group-hover:bg-[var(--color-jse-fond)]/60")
                                                }
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Assiette-scène */}
                    <div
                        className="relative flex justify-center lg:justify-end"
                        onPointerEnter={survolerDebut}
                        onPointerLeave={survolerFin}
                    >
                        <div
                            data-parallax="scene"
                            className="relative aspect-square will-change-transform"
                            style={{ width: "min(100%, max(22rem, calc(100svh - 17rem)))" }}
                        >
                            {/* Disque */}
                            <div
                                data-intro="disque"
                                aria-hidden="true"
                                className="absolute inset-[6%] rounded-full"
                                style={{
                                    background:
                                        "radial-gradient(circle at 32% 26%, color-mix(in srgb, var(--color-jse-secondaire) 34%, var(--color-jse-principal)), color-mix(in srgb, black 30%, var(--color-jse-principal)) 72%)",
                                    boxShadow:
                                        "inset 0 0 0 1px color-mix(in srgb, var(--color-jse-fond) 10%, transparent), 0 50px 90px -30px color-mix(in srgb, black 60%, transparent)",
                                }}
                            />

                            {/* Anneau de progression */}
                            <svg
                                data-intro="anneau"
                                aria-hidden="true"
                                viewBox="0 0 100 100"
                                className="absolute inset-0 size-full -rotate-90 overflow-visible"
                            >
                                <circle cx="50" cy="50" r="49" fill="none" stroke="var(--color-jse-fond)" strokeOpacity="0.14" strokeWidth="0.2" />
                                <circle
                                    ref={anneau}
                                    cx="50"
                                    cy="50"
                                    r="49"
                                    fill="none"
                                    stroke="var(--color-jse-accent)"
                                    strokeWidth="0.45"
                                    strokeLinecap="round"
                                    pathLength="1"
                                    strokeDasharray="1"
                                    strokeDashoffset="1"
                                />
                            </svg>

                            {/* Plats */}
                            {SLIDES.map((slide, i) => (
                                <div key={slide.plat} data-dish={i} className="absolute inset-[3%] grid place-items-center will-change-transform">
                                    <img
                                        src={slide.image}
                                        alt={slide.plat}
                                        width="820"
                                        height="820"
                                        draggable="false"
                                        loading={i === 0 ? "eager" : "lazy"}
                                        decoding="async"
                                        fetchPriority={i === 0 ? "high" : "auto"}
                                        className="size-full select-none object-contain"
                                        style={{ filter: "drop-shadow(0 34px 38px rgb(0 0 0 / .42))" }}
                                    />
                                </div>
                            ))}

                            {/* Étiquette du plat */}
                            <div className="pointer-events-none absolute -left-[2%] bottom-[8%] z-10 grid">
                                {SLIDES.map((slide, i) => (
                                    <div
                                        key={slide.plat}
                                        data-chip={i}
                                        className="inline-flex items-center gap-3 rounded-full bg-[var(--color-jse-fond)] py-2 pl-3 pr-5 text-sm font-semibold text-jse-principal shadow-[0_16px_30px_-12px_rgb(0_0_0/.5)] [grid-area:1/1]"
                                    >
                                        <span className="grid size-7 place-items-center rounded-full bg-jse-principal font-against text-sm text-[var(--color-jse-fond)]">
                                            {String(i + 1).padStart(2, "0")}
                                        </span>
                                        {slide.plat}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ------------------------------ Parcours ------------------------------ */}
                <footer className="pb-8 [@media(max-height:800px)]:pb-5">
                    <p className="sr-only">Comment ça marche</p>
                    <ol className="grid grid-cols-4 gap-6 xl:gap-10">
                        {ETAPES.map((etape) => (
                            <li key={etape.numero} data-intro="etape" className="group">
                                <div
                                    data-intro="filet"
                                    aria-hidden="true"
                                    className="mb-4 h-px bg-[var(--color-jse-fond)]/20 transition-colors duration-500 group-hover:bg-jse-accent"
                                />
                                <div className="flex items-baseline gap-4">
                                    <span className="font-against text-xl text-jse-accent">{etape.numero}</span>
                                    <div>
                                        <p className="text-base font-semibold">{etape.titre}</p>
                                        <p className="mt-1 text-sm leading-6 text-[var(--color-jse-fond)]/65">{etape.texte}</p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ol>
                </footer>
            </div>

            {/* Rideau de transition */}
            <div
                ref={rideau}
                aria-hidden="true"
                className="pointer-events-none fixed inset-0 z-50 grid place-items-center bg-jse-secondaire"
            >
                <img src="/assets/jse_logo.png?v=20261002" alt="" width="96" height="96" className="size-24 rounded-3xl object-contain" />
            </div>
        </main>
    );
}

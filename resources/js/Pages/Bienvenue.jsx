import { router } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const slides = [
    {
        image: "/assets/bienvenue/poulet_braise.png",
        eyebrow: "Bienvenue",
        title: <>Vos plats favoris<br />à Adzopé,<br />sans vous déplacer.</>,
        description: "Découvrez, commandez, faites-vous livrer en toute simplicité.",
    },
    {
        image: "/assets/bienvenue/attieke_poisson.png",
        eyebrow: "Saveurs locales",
        title: <>Les saveurs<br />d'ici,<br />chez vous.</>,
        description: "Retrouvez les grands classiques ivoiriens près de chez vous.",
    },
    {
        image: "/assets/bienvenue/burger.png",
        eyebrow: "Envie de variété",
        title: <>Une envie ?<br />Trouvez le plat<br />qu'il vous faut.</>,
        description: "Explorez les restaurants et composez votre prochaine commande.",
    },
    {
        image: "/assets/bienvenue/boisson_fraiche.png",
        eyebrow: "Fraîcheur",
        title: <>Commandez.<br />Nous nous occupons<br />du reste.</>,
        description: "Des plats, des boissons et une livraison pensée pour vous.",
    },
    {
        image: "/assets/bienvenue/dessert.png",
        eyebrow: "JSE Express",
        title: <>Découvrez.<br />Commandez.<br />Savourez.</>,
        description: "Une nouvelle façon de profiter des saveurs d'Adzopé.",
    },
];

const AUTOPLAY_DELAY = 5200;

export default function Bienvenue() {
    const pageRef = useRef(null);
    const imageRef = useRef(null);
    const backgroundRef = useRef(null);
    const pointerStart = useRef(null);
    const autoplayRef = useRef(null);
    const [index, setIndex] = useState(0);
    const slide = slides[index];

    const changerSlide = (direction) => {
        const nextIndex = (index + direction + slides.length) % slides.length;
        const image = imageRef.current;

        if (!image) {
            setIndex(nextIndex);
            return;
        }

        gsap.timeline({
            defaults: { ease: "power3.out" },
            onComplete: () => setIndex(nextIndex),
        })
            .to(image, { x: -direction * 30, opacity: 0, scale: 0.97, duration: 0.24 })
            .to(backgroundRef.current, { scale: 1.015, duration: 0.35 }, "<")
            .call(() => {
                image.src = slides[nextIndex].image;
            })
            .set(image, { x: direction * 42, opacity: 0, scale: 0.94 })
            .to(image, {
                x: 0,
                opacity: 1,
                scale: 1,
                duration: 0.58,
                clearProps: "transform,opacity",
            })
            .to(backgroundRef.current, {
                scale: 1,
                duration: 0.6,
                clearProps: "transform",
            }, "<");
    };

    const pauseAutoplay = () => {
        if (autoplayRef.current) {
            window.clearInterval(autoplayRef.current);
        }
    };

    const reprendreAutoplay = () => {
        pauseAutoplay();
        autoplayRef.current = window.setInterval(() => changerSlide(1), AUTOPLAY_DELAY);
    };

    useEffect(() => {
        reprendreAutoplay();
        return pauseAutoplay;
    }, [index]);

    useEffect(() => {
        if (!pageRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            return;
        }

        const contexte = gsap.context(() => {
            gsap.fromTo("[data-landing-header]", { y: -16, opacity: 0 }, {
                y: 0,
                opacity: 1,
                duration: 0.65,
                ease: "power3.out",
            });
            gsap.fromTo("[data-landing-copy]", { x: -24, opacity: 0 }, {
                x: 0,
                opacity: 1,
                duration: 0.75,
                delay: 0.08,
                ease: "power3.out",
            });
            gsap.fromTo("[data-landing-visual]", { x: 30, scale: 0.92, opacity: 0 }, {
                x: 0,
                scale: 1,
                opacity: 1,
                duration: 0.9,
                delay: 0.12,
                ease: "power3.out",
            });
            gsap.fromTo("[data-landing-float]", { y: 18, opacity: 0 }, {
                y: 0,
                opacity: 1,
                duration: 0.55,
                delay: 0.28,
                stagger: 0.08,
                ease: "power3.out",
            });
        }, pageRef);

        return () => contexte.revert();
    }, []);

    useEffect(() => {
        const onKeyDown = (event) => {
            if (event.key === "ArrowRight") changerSlide(1);
            if (event.key === "ArrowLeft") changerSlide(-1);
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [index]);

    const debuterGeste = (event) => {
        pointerStart.current = event.clientX;
    };

    const terminerGeste = (event) => {
        if (pointerStart.current === null) return;

        const distance = event.clientX - pointerStart.current;
        pointerStart.current = null;

        if (Math.abs(distance) >= 55) {
            changerSlide(distance < 0 ? 1 : -1);
        }
    };

    return (
        <main ref={pageRef} className="relative min-h-screen overflow-hidden bg-jse-principal text-jse-fond">
            <img
                ref={backgroundRef}
                src="/assets/bg.png"
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center opacity-100"
            />

            <div className="pointer-events-none absolute inset-0 bg-jse-principal/35" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-jse-principal/80 via-jse-principal/35 to-transparent" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-jse-principal/60 via-transparent to-jse-principal/20" />

            <div className="relative z-10 flex min-h-screen flex-col px-5 py-5 sm:px-8 lg:px-12 xl:px-16">
                <header
                    data-landing-header
                    className="mx-auto flex w-full max-w-screen-2xl items-center justify-between rounded-full border border-white/10 bg-jse-principal/35 px-4 py-3 shadow-2xl backdrop-blur-xl sm:px-6"
                >
                    <button
                        type="button"
                        onClick={() => router.visit("/")}
                        className="flex items-center"
                        aria-label="Accueil JSE Express"
                    >
                        <img
                            src="/assets/jse_logo.png?v=20261002"
                            alt="JSE Express"
                            className="h-9 w-auto object-contain sm:h-10"
                        />
                    </button>

                    <nav className="hidden items-center gap-2 md:flex">
                        <button
                            type="button"
                            onClick={() => router.visit("/bienvenue")}
                            className="rounded-full bg-white/10 px-5 py-2.5 font-sans text-xs font-semibold text-jse-fond backdrop-blur-md"
                        >
                            Accueil
                        </button>
                        <button
                            type="button"
                            onClick={() => router.visit("/authentification")}
                            className="rounded-full px-5 py-2.5 font-sans text-xs font-semibold text-jse-fond/70 transition hover:bg-white/10 hover:text-jse-fond"
                        >
                            Se connecter
                        </button>
                    </nav>

                    <button
                        type="button"
                        onClick={() => router.visit("/authentification")}
                        className="rounded-full bg-jse-accent px-5 py-2.5 font-sans text-xs font-semibold text-white shadow-lg shadow-jse-accent/20 transition hover:-translate-y-0.5"
                    >
                        Commencer
                    </button>
                </header>

                <section
                    className="relative mx-auto grid w-full max-w-screen-2xl flex-1 items-center gap-8 py-8 lg:grid-cols-[0.78fr_1.22fr] lg:gap-6 xl:grid-cols-[0.72fr_1.28fr] xl:py-4"
                    onPointerEnter={pauseAutoplay}
                    onPointerLeave={reprendreAutoplay}
                >
                    <div data-landing-copy className="relative z-20 max-w-2xl lg:pr-4">
                        <p className="font-sans text-sm font-semibold text-jse-secondaire sm:text-base">
                            {slide.eyebrow}
                        </p>

                        <h1 className="mt-3 max-w-2xl font-against text-5xl leading-[0.94] tracking-tight text-jse-fond sm:text-6xl lg:text-7xl xl:text-8xl">
                            {slide.title}
                        </h1>

                        <p className="mt-6 max-w-lg font-sans text-sm leading-6 text-jse-fond/65 sm:text-base sm:leading-7">
                            {slide.description}
                        </p>

                        <div className="mt-8 flex flex-wrap items-center gap-4">
                            <button
                                type="button"
                                onClick={() => router.visit("/authentification")}
                                className="rounded-full bg-jse-accent px-7 py-3.5 font-sans text-sm font-semibold text-white shadow-xl shadow-jse-accent/20 transition hover:-translate-y-0.5"
                            >
                                Commencer
                            </button>

                            <button
                                type="button"
                                onClick={() => router.visit("/authentification")}
                                className="font-sans text-xs font-semibold text-jse-fond/70 underline decoration-jse-secondaire/60 underline-offset-4 transition hover:text-jse-fond"
                            >
                                Déjà un compte ? Se connecter
                            </button>
                        </div>
                    </div>

                    <div
                        data-landing-visual
                        className="relative flex min-h-[24rem] items-center justify-center lg:min-h-[34rem] xl:min-h-[38rem]"
                        onPointerDown={debuterGeste}
                        onPointerUp={terminerGeste}
                        onPointerCancel={() => { pointerStart.current = null; }}
                    >
                        <div className="pointer-events-none absolute inset-1/4 rounded-full bg-jse-secondaire/20 blur-3xl" />

                        <img
                            ref={imageRef}
                            src={slide.image}
                            alt=""
                            draggable="false"
                            className="relative z-10 w-full max-w-xl object-contain drop-shadow-2xl sm:max-w-2xl xl:max-w-3xl"
                        />

                        <div
                            data-landing-float
                            className="absolute bottom-8 left-2 z-20 hidden rounded-3xl border border-white/10 bg-jse-principal/45 px-4 py-3 shadow-2xl backdrop-blur-xl sm:block"
                        >
                            <p className="font-sans text-[10px] font-semibold uppercase tracking-widest text-jse-secondaire">
                                Livraison locale
                            </p>
                            <p className="mt-1 font-sans text-xs font-medium text-jse-fond/80">
                                Simple, rapide, proche de vous
                            </p>
                        </div>

                        <div
                            data-landing-float
                            className="absolute right-0 top-10 z-20 hidden rounded-3xl border border-white/10 bg-white/10 px-4 py-3 shadow-2xl backdrop-blur-xl sm:block"
                        >
                            <p className="font-sans text-[10px] font-semibold uppercase tracking-widest text-jse-accent">
                                Adzopé
                            </p>
                            <p className="mt-1 font-sans text-xs font-medium text-jse-fond/80">
                                Vos restaurants préférés
                            </p>
                        </div>
                    </div>

                    <div
                        className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2"
                        aria-label="Présentation"
                    >
                        {slides.map((item, itemIndex) => (
                            <button
                                key={item.image}
                                type="button"
                                aria-label={"Afficher la présentation " + (itemIndex + 1)}
                                onClick={() => {
                                    if (itemIndex === index) return;
                                    changerSlide(itemIndex > index ? 1 : -1);
                                }}
                                className={
                                    "h-1.5 rounded-full transition-all duration-300 " +
                                    (itemIndex === index
                                        ? "w-8 bg-jse-accent"
                                        : "w-1.5 bg-jse-fond/30")
                                }
                            />
                        ))}
                    </div>
                </section>

                <footer className="mx-auto flex w-full max-w-screen-2xl items-center justify-between pb-1 font-sans text-[10px] text-jse-fond/45">
                    <span>JSE Express · Adzopé</span>
                    <span className="hidden sm:block">Commandez localement. Savourez simplement.</span>
                </footer>
            </div>
        </main>
    );
}

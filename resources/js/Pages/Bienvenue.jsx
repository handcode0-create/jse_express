import { router } from "@inertiajs/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const slides = [
    { image: "/assets/bienvenue/poulet_braise.png", eyebrow: "Bienvenue", title: <>Vos plats favoris<br />à Adzopé,<br />sans vous déplacer.</>, description: "Découvrez, commandez, faites-vous livrer en toute simplicité." },
    { image: "/assets/bienvenue/attieke_poisson.png", eyebrow: "Saveurs locales", title: <>Les saveurs<br />d'ici,<br />chez vous.</>, description: "Retrouvez les grands classiques ivoiriens près de chez vous." },
    { image: "/assets/bienvenue/burger.png", eyebrow: "Envie de variété", title: <>Une envie ?<br />Trouvez le plat<br />qu'il vous faut.</>, description: "Explorez les restaurants et composez votre prochaine commande." },
    { image: "/assets/bienvenue/boisson_fraiche.png", eyebrow: "Fraîcheur", title: <>Commandez.<br />Nous nous occupons<br />du reste.</>, description: "Des plats, des boissons et une livraison pensée pour vous." },
    { image: "/assets/bienvenue/dessert.png", eyebrow: "JSE Express", title: <>Découvrez.<br />Commandez.<br />Savourez.</>, description: "Une nouvelle façon de profiter des saveurs d'Adzopé." },
];

const AUTOPLAY_DELAY = 5200;

export default function Bienvenue() {
    const pageRef = useRef(null);
    const visualRef = useRef(null);
    const backgroundRef = useRef(null);
    const imageRef = useRef(null);
    const copyRef = useRef(null);
    const pointerStart = useRef(null);
    const autoplayRef = useRef(null);
    const [index, setIndex] = useState(0);
    const [menuOuvert, setMenuOuvert] = useState(false);
    const slide = slides[index];

    const animerSlide = (direction = 1, nextIndex = index) => {
        if (!imageRef.current) return;
        const image = imageRef.current;
        const next = slides[nextIndex];

        gsap.timeline({
            defaults: { ease: "power3.out" },
            onComplete: () => setIndex(nextIndex),
        })
            .to(image, { x: -direction * 44, opacity: 0, scale: 0.96, duration: 0.28 })
            .to(backgroundRef.current, { xPercent: -direction * 1.5, scale: 1.025, duration: 0.42 }, "<")
            .call(() => { image.src = next.image; })
            .set(image, { x: direction * 56, opacity: 0, scale: 0.92 })
            .to(image, { x: 0, opacity: 1, scale: 1, duration: 0.68, clearProps: "transform,opacity" })
            .to(backgroundRef.current, { xPercent: 0, scale: 1, duration: 0.7, ease: "power3.out", clearProps: "transform" }, "<");
    };

    const changerSlide = (direction) => {
        animerSlide(direction, (index + direction + slides.length) % slides.length);
    };

    const pauseAutoplay = () => {
        if (autoplayRef.current) window.clearInterval(autoplayRef.current);
    };

    const reprendreAutoplay = () => {
        pauseAutoplay();
        autoplayRef.current = window.setInterval(() => changerSlide(1), AUTOPLAY_DELAY);
    };

    useEffect(() => {
        reprendreAutoplay();
        return pauseAutoplay;
    }, [index]);

    useLayoutEffect(() => {
        if (!pageRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const contexte = gsap.context(() => {
            gsap.fromTo("[data-welcome-header]", { y: -14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.65, ease: "power3.out" });
            gsap.fromTo("[data-welcome-copy]", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.75, delay: 0.08, ease: "power3.out" });
            gsap.fromTo(visualRef.current, { scale: 0.9, opacity: 0, y: 24 }, { scale: 1, opacity: 1, y: 0, duration: 0.9, delay: 0.12, ease: "power3.out" });
            gsap.fromTo("[data-welcome-action]", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, delay: 0.2, ease: "power3.out" });
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

    const debuterGeste = (event) => { pointerStart.current = event.clientX; };

    const terminerGeste = (event) => {
        if (pointerStart.current === null) return;
        const distance = event.clientX - pointerStart.current;
        pointerStart.current = null;
        if (Math.abs(distance) >= 55) changerSlide(distance < 0 ? 1 : -1);
    };

    return (
        <main ref={pageRef} className="relative min-h-screen overflow-hidden bg-jse-principal text-jse-fond">
            <img
                ref={backgroundRef}
                src="/assets/bg_bienvenue.png"
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center opacity-100"
            />
            <div className="pointer-events-none absolute inset-0 bg-jse-principal/8" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-jse-principal/34 via-jse-principal/10 to-transparent" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-jse-principal/28 via-transparent to-jse-principal/5" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/5" />
            <div className="pointer-events-none absolute inset-0 border border-white/[0.045]" />
            <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[393px] flex-col px-5 lg:max-w-none lg:px-10 xl:px-16">
                <header data-welcome-header className="relative z-40 flex items-center justify-between py-5 sm:py-6 lg:py-7">
                    <button type="button" onClick={() => router.visit("/")} className="flex items-center" aria-label="Accueil">
                        <img src="/assets/jse_logo.png?v=20261002" alt="JSE Express" className="h-9 w-auto object-contain sm:h-10" />
                    </button>

                    <nav className="hidden items-center gap-7 font-sans text-sm font-medium text-jse-fond/90 lg:flex" aria-label="Navigation principale">
                        <button type="button" onClick={() => router.visit("/accueil")} className="transition hover:text-jse-secondaire">Restaurants</button>
                        <button type="button" onClick={() => router.visit("/a-propos")} className="transition hover:text-jse-secondaire">À propos</button>
                        <button type="button" onClick={() => router.visit("/aide")} className="transition hover:text-jse-secondaire">Aide</button>
                        <button
                            type="button"
                            onClick={() => router.visit("/authentification")}
                            className="rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-jse-fond backdrop-blur-md transition hover:border-white/50 hover:bg-white/15 active:scale-[0.98]"
                        >
                            Se connecter
                        </button>
                        <button
                            type="button"
                            onClick={() => router.visit("/inscription")}
                            className="rounded-full bg-jse-accent px-5 py-2.5 text-white shadow-lg shadow-jse-accent/20 transition hover:-translate-y-0.5 hover:bg-jse-accent/90 active:scale-[0.98]"
                        >
                            S'inscrire
                        </button>
                    </nav>

                    <div className="relative flex items-center gap-2 lg:hidden">
                        <button
                            type="button"
                            onClick={() => router.visit("/authentification")}
                            className="rounded-full border border-white/25 bg-white/10 px-4 py-2 font-sans text-xs font-semibold text-jse-fond backdrop-blur-md transition hover:bg-white/15 active:scale-[0.98]"
                        >
                            Se connecter
                        </button>
                        <button
                            type="button"
                            aria-label={menuOuvert ? "Fermer le menu" : "Ouvrir le menu"}
                            aria-expanded={menuOuvert}
                            onClick={() => setMenuOuvert((ouvert) => !ouvert)}
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/10 text-jse-fond backdrop-blur-md transition hover:bg-white/15 active:scale-[0.96]"
                        >
                            <span className="sr-only">{menuOuvert ? "Fermer" : "Menu"}</span>
                            <span className="flex w-4 flex-col gap-1">
                                <span className="h-px w-full bg-current" />
                                <span className="h-px w-full bg-current" />
                                <span className="h-px w-full bg-current" />
                            </span>
                        </button>

                        {menuOuvert && (
                            <nav
                                className="absolute right-0 top-12 z-50 min-w-44 rounded-2xl border border-white/15 bg-jse-principal p-2 font-sans text-sm text-jse-fond shadow-2xl"
                                aria-label="Navigation mobile"
                            >
                                <button type="button" onClick={() => { setMenuOuvert(false); router.visit("/accueil"); }} className="w-full rounded-xl px-4 py-3 text-left transition hover:bg-white/10">Restaurants</button>
                                <button type="button" onClick={() => { setMenuOuvert(false); router.visit("/a-propos"); }} className="w-full rounded-xl px-4 py-3 text-left transition hover:bg-white/10">À propos</button>
                                <button type="button" onClick={() => { setMenuOuvert(false); router.visit("/aide"); }} className="w-full rounded-xl px-4 py-3 text-left transition hover:bg-white/10">Aide</button>
                                <button type="button" onClick={() => { setMenuOuvert(false); router.visit("/inscription"); }} className="mt-1 w-full rounded-xl bg-jse-accent px-4 py-3 text-left font-semibold text-white transition hover:bg-jse-accent/90">S'inscrire</button>
                            </nav>
                        )}
                    </div>
                </header>

                <section
                    className="relative flex flex-1 flex-col lg:grid lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-10 xl:grid-cols-[0.85fr_1.15fr] xl:gap-16"
                    onPointerEnter={pauseAutoplay}
                    onPointerLeave={reprendreAutoplay}
                >
                    <div data-welcome-copy className="relative z-10 pt-8 text-center sm:pt-10 lg:max-w-[600px] lg:-translate-y-3 lg:pt-0 lg:text-left xl:-translate-y-5">
                        <p className="mb-3 font-sans text-sm font-semibold text-jse-secondaire drop-shadow-sm lg:text-base">{slide.eyebrow}</p>
                        <h1 className="font-against text-[clamp(2.5rem,10vw,4rem)] leading-[0.94] tracking-[-0.02em] text-jse-fond drop-shadow-[0_2px_10px_color-mix(in_srgb,var(--color-jse-principal)_35%,transparent)] sm:text-[3.5rem] lg:text-[4.5rem] xl:text-[5.4rem]">
                            {slide.title}
                        </h1>
                        <p className="mx-auto mt-5 max-w-[390px] font-sans text-sm leading-6 text-jse-fond/85 drop-shadow-sm lg:mx-0 lg:mt-7 lg:text-base lg:leading-7">{slide.description}</p>

                        <div data-welcome-action className="mt-7 hidden items-center gap-4 lg:flex">
                            <button type="button" onClick={() => router.visit("/authentification")} className="h-12 rounded-full bg-jse-secondaire px-7 font-sans text-sm font-semibold text-jse-principal shadow-lg shadow-jse-principal/15 transition hover:-translate-y-0.5 hover:bg-jse-secondaire/90 active:scale-[0.98]">
                                Commencer
                            </button>
                            <span className="font-sans text-xs text-jse-fond/65">
                                Déjà un compte ?{" "}
                                <button type="button" onClick={() => router.visit("/authentification")} className="font-semibold text-jse-secondaire underline underline-offset-2 transition hover:text-jse-fond">Se connecter</button>
                            </span>
                        </div>
                    </div>

                    <div
                        ref={visualRef}
                        className="relative mt-2 flex min-h-[310px] flex-1 touch-pan-y select-none items-center justify-center sm:min-h-[360px] lg:mt-0 lg:min-h-[620px] lg:translate-x-4 xl:translate-x-8"
                        onPointerDown={debuterGeste}
                        onPointerUp={terminerGeste}
                        onPointerCancel={() => { pointerStart.current = null; }}
                    >
                        <div className="pointer-events-none absolute inset-1/4 rounded-full bg-jse-secondaire/10 blur-[90px]" />
                        <img
                            ref={imageRef}
                            src={slide.image}
                            alt=""
                            draggable="false"
                            className="relative z-10 w-full max-w-[320px] object-contain drop-shadow-[0_24px_35px_color-mix(in srgb, var(--color-jse-principal) 18%, transparent)] sm:max-w-[370px] lg:max-w-[650px] xl:max-w-[760px]"
                        />
                    </div>

                    <div data-welcome-action className="mt-3 flex items-center justify-center gap-2 lg:absolute lg:bottom-10 lg:left-1/2 lg:-translate-x-1/2" aria-label="Présentation">
                        {slides.map((item, itemIndex) => (
                            <button
                                key={item.image}
                                type="button"
                                aria-label={"Afficher la présentation " + (itemIndex + 1)}
                                onClick={() => {
                                    if (itemIndex === index) return;
                                    changerSlide(itemIndex > index ? 1 : -1);
                                }}
                                className={"h-1.5 rounded-full transition-all duration-300 " + (itemIndex === index ? "w-5 bg-jse-accent" : "w-1.5 bg-jse-fond/35")}
                            />
                        ))}
                    </div>

                    <div data-welcome-action className="pb-8 pt-4 sm:pt-6 lg:hidden">
                        <button type="button" onClick={() => router.visit("/authentification")} className="flex h-12 w-full items-center justify-center rounded-full bg-jse-secondaire px-6 font-sans text-sm font-semibold text-jse-principal shadow-lg shadow-jse-principal/15 transition hover:bg-jse-secondaire/90 active:scale-[0.99]">
                            Commencer
                        </button>
                        <p className="mt-5 text-center font-sans text-xs text-jse-fond/65">
                            Déjà un compte ?{" "}
                            <button type="button" onClick={() => router.visit("/authentification")} className="font-semibold text-jse-principal underline underline-offset-2">Se connecter</button>
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}

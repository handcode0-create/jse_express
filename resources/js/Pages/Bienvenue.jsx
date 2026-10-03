import { router } from "@inertiajs/react";
import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
    const imageRef = useRef(null);
    const pointerStart = useRef(null);
    const autoplayRef = useRef(null);
    const [index, setIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [reducedMotion, setReducedMotion] = useState(false);
    const slide = slides[index];

    const stopAutoplay = () => {
        if (autoplayRef.current) window.clearInterval(autoplayRef.current);
        autoplayRef.current = null;
    };

    const startAutoplay = () => {
        stopAutoplay();
        if (reducedMotion || !isPlaying) return;
        autoplayRef.current = window.setInterval(() => {
            setIndex((current) => (current + 1) % slides.length);
        }, AUTOPLAY_DELAY);
    };

    const goToSlide = (nextIndex) => {
        const target = (nextIndex + slides.length) % slides.length;
        if (target === index) return;
        if (reducedMotion || !imageRef.current) {
            setIndex(target);
            return;
        }

        const direction = target > index ? 1 : -1;
        gsap.timeline({
            defaults: { ease: "power3.out" },
            onComplete: () => setIndex(target),
        })
            .to(imageRef.current, { x: -direction * 5, opacity: 0, scale: 0.98, duration: 0.24 })
            .set(imageRef.current, { x: direction * 5 })
            .to(imageRef.current, { x: 0, opacity: 1, scale: 1, duration: 0.42, clearProps: "transform,opacity" });
    };

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        const sync = () => setReducedMotion(mediaQuery.matches);
        sync();
        mediaQuery.addEventListener?.("change", sync);
        return () => mediaQuery.removeEventListener?.("change", sync);
    }, []);

    useEffect(() => {
        startAutoplay();
        return stopAutoplay;
    }, [index, isPlaying, reducedMotion]);

    useEffect(() => {
        if (!pageRef.current || reducedMotion) return;
        const context = gsap.context(() => {
            gsap.fromTo("[data-landing-header]", { y: -16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.65, ease: "power3.out" });
            gsap.fromTo("[data-landing-copy]", { x: -24, opacity: 0 }, { x: 0, opacity: 1, duration: 0.75, delay: 0.08, ease: "power3.out" });
            gsap.fromTo("[data-landing-visual]", { x: 30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.85, delay: 0.12, ease: "power3.out" });
        }, pageRef);
        return () => context.revert();
    }, [reducedMotion]);

    useEffect(() => {
        const onKeyDown = (event) => {
            if (event.key === "ArrowRight") goToSlide(index + 1);
            if (event.key === "ArrowLeft") goToSlide(index - 1);
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [index, reducedMotion]);

    const debuterGeste = (event) => { pointerStart.current = event.clientX; };
    const terminerGeste = (event) => {
        if (pointerStart.current === null) return;
        const distance = event.clientX - pointerStart.current;
        pointerStart.current = null;
        if (Math.abs(distance) >= 55) goToSlide(index + (distance < 0 ? 1 : -1));
    };

    return (
        <main ref={pageRef} className="min-h-screen overflow-x-hidden bg-jse-principal text-jse-fond">
            <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-jse-principal via-jse-principal to-jse-texte">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-jse-principal via-jse-principal/95 to-transparent" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-jse-texte/50 to-transparent" />

                <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-screen-2xl flex-col px-5 py-5 sm:px-8 lg:px-12 xl:px-16">
                    <header data-landing-header className="flex items-center justify-between border-b border-jse-fond/20 pb-4">
                        <button type="button" onClick={() => router.visit("/bienvenue")} className="flex items-center gap-3 rounded-jse-petit py-2 pr-3 focus-visible:outline-none" aria-label="Accueil JSE Express">
                            <img src="/assets/jse_logo.png?v=20261002" alt="JSE Express" className="h-10 w-auto object-contain sm:h-12" />
                            <span className="font-sans text-base font-semibold tracking-tight text-jse-fond sm:text-lg">JSE Express</span>
                        </button>

                        <nav className="hidden items-center gap-7 md:flex" aria-label="Navigation principale">
                            <button type="button" onClick={() => router.visit("/bienvenue")} className="rounded-jse-petit px-3 py-2 font-sans text-sm font-semibold text-jse-fond focus-visible:outline-none">Accueil</button>
                            <button type="button" onClick={() => router.visit("/authentification")} className="rounded-jse-petit px-3 py-2 font-sans text-sm font-medium text-jse-fond/75 transition hover:text-jse-fond focus-visible:outline-none">Se connecter</button>
                            <button type="button" onClick={() => router.visit("/inscription")} className="rounded-jse-petit bg-jse-accent px-5 py-3 font-sans text-sm font-semibold text-white transition hover:bg-jse-accent/90 focus-visible:outline-none">Commencer</button>
                        </nav>

                        <button type="button" onClick={() => router.visit("/inscription")} className="rounded-jse-petit bg-jse-accent px-5 py-3 font-sans text-sm font-semibold text-white transition hover:bg-jse-accent/90 focus-visible:outline-none md:hidden">Commencer</button>
                    </header>

                    <section
                        className="relative grid flex-1 items-center gap-8 py-10 md:grid-cols-12 md:gap-6 lg:py-12 xl:py-16"
                        onPointerEnter={stopAutoplay}
                        onPointerLeave={startAutoplay}
                        aria-roledescription="carousel"
                        aria-label="Présentation JSE Express"
                    >
                        <div data-landing-copy className="relative z-20 md:col-span-6 lg:col-span-5">
                            <p className="font-sans text-sm font-semibold uppercase tracking-widest text-jse-secondaire sm:text-base">{slide.eyebrow}</p>
                            <div className="mt-4 flex items-start gap-4">
                                <span className="mt-2 hidden h-20 w-1 shrink-0 bg-jse-accent md:block" aria-hidden="true" />
                                <h1 className="font-against text-jse-landing-title leading-tight tracking-tight text-jse-fond">{slide.title}</h1>
                            </div>
                            <p className="mt-6 max-w-xl font-sans text-base leading-7 text-jse-fond/75 sm:text-lg">{slide.description}</p>
                            <button type="button" onClick={() => router.visit("/authentification")} className="mt-6 rounded-jse-petit py-2 font-sans text-sm font-semibold text-jse-fond underline decoration-jse-secondaire/70 underline-offset-4 focus-visible:outline-none md:hidden">Se connecter</button>
                            <div className="mt-8 hidden items-center gap-5 md:flex">
                                <span className="font-sans text-sm font-semibold tabular-nums text-jse-fond/70">{String(index + 1).padStart(2, "0")}</span>
                                <span className="h-px w-16 bg-jse-fond/30" aria-hidden="true" />
                                <span className="font-sans text-sm font-medium tabular-nums text-jse-fond/50">{String(slides.length).padStart(2, "0")}</span>
                            </div>
                        </div>

                        <div
                            data-landing-visual
                            className="relative md:col-span-6 lg:col-span-7"
                            onPointerDown={debuterGeste}
                            onPointerUp={terminerGeste}
                            onPointerCancel={() => { pointerStart.current = null; }}
                        >
                            <div className="relative overflow-hidden rounded-jse-xxl border border-jse-fond/20 bg-jse-principal/60 p-4 sm:p-6 lg:p-8">
                                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-jse-secondaire/15 via-transparent to-jse-accent/20" />
                                <div className="pointer-events-none absolute bottom-0 left-0 top-0 w-1 bg-jse-accent" />
                                <div className="relative flex min-h-72 items-center justify-center sm:min-h-96 lg:min-h-96">
                                    <img
                                        ref={imageRef}
                                        src={slide.image}
                                        alt=""
                                        draggable="false"
                                        fetchPriority={index === 0 ? "high" : "auto"}
                                        loading={index === 0 ? "eager" : "lazy"}
                                        className="max-h-72 w-full object-contain sm:max-h-96 lg:max-h-96"
                                    />
                                </div>
                                <div className="relative mt-4 flex items-center justify-between border-t border-jse-fond/20 pt-4">
                                    <span className="font-sans text-xs font-semibold uppercase tracking-widest text-jse-fond/60">Adzopé</span>
                                    <button
                                        type="button"
                                        onClick={() => setIsPlaying((current) => !current)}
                                        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-jse-petit border border-jse-fond/25 text-jse-fond transition hover:border-jse-fond/50 focus-visible:outline-none"
                                        aria-label={isPlaying ? "Mettre le carrousel en pause" : "Lire le carrousel"}
                                        aria-pressed={!isPlaying}
                                    >
                                        {isPlaying ? <Pause size="1.125rem" aria-hidden="true" /> : <Play size="1.125rem" aria-hidden="true" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="order-last grid gap-3 border-t border-jse-fond/20 pt-5 md:col-span-12 md:grid-cols-3 md:gap-6">
                            {["Des restaurants d'Adzopé", "Suivi de votre commande", "Livraison sécurisée par code PIN"].map((item) => (
                                <div key={item} className="border-l border-jse-secondaire/70 pl-4">
                                    <p className="font-sans text-sm font-semibold leading-6 text-jse-fond/85">{item}</p>
                                </div>
                            ))}
                        </div>

                        <div className="order-last flex items-center justify-between gap-4 md:col-span-12">
                            <div className="flex items-center gap-1" aria-label="Navigation du carrousel">
                                {slides.map((item, itemIndex) => (
                                    <button
                                        key={item.image}
                                        type="button"
                                        aria-label={`Afficher la présentation ${itemIndex + 1}`}
                                        aria-current={itemIndex === index ? "true" : undefined}
                                        onClick={() => goToSlide(itemIndex)}
                                        className="flex min-h-11 min-w-11 items-center justify-center rounded-jse-petit focus-visible:outline-none"
                                    >
                                        <span className={`block h-1.5 rounded-full transition-all ${itemIndex === index ? "w-8 bg-jse-accent" : "w-3 bg-jse-fond/30"}`} aria-hidden="true" />
                                    </button>
                                ))}
                            </div>
                            <p className="font-sans text-xs text-jse-fond/60 sm:text-sm">JSE Express · Adzopé</p>
                        </div>
                    </section>

                    <footer className="border-t border-jse-fond/20 pt-4 font-sans text-xs text-jse-fond/60">JSE Express · Adzopé</footer>
                </div>
            </div>
        </main>
    );
}

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
        <main ref={pageRef} className="relative min-h-screen overflow-hidden bg-[#07110F] text-jse-texte">
            <img
                ref={backgroundRef}
                src="/assets/bg.png"
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute inset-[-2%] h-[104%] w-[104%] object-cover object-center opacity-100"
            />
            <div className="pointer-events-none absolute inset-0 bg-[#07110F]/72 backdrop-blur-[3px]" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#07110F]/88 via-[#123C32]/38 to-[#07110F]/55" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_48%,rgba(69,185,119,0.10),transparent_36%),linear-gradient(to_bottom,rgba(7,17,15,0.12),rgba(7,17,15,0.38))]" />
            <div className="pointer-events-none absolute inset-0 border border-white/[0.045] bg-white/[0.018] backdrop-blur-[1px]" />
            <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[393px] flex-col px-5 lg:max-w-none lg:px-10 xl:px-16">
                <header data-welcome-header className="flex items-center justify-between pt-6 lg:pt-8">
                    <button type="button" onClick={() => router.visit("/")} className="flex items-center" aria-label="Accueil">
                        <img src="/assets/jse_logo.png" alt="JSE Express" className="h-9 w-auto object-contain lg:h-10" />
                    </button>
                    <button type="button" onClick={() => router.visit("/authentification")} className="font-sans text-sm font-medium text-jse-texte/65 transition hover:text-jse-principal">
                        Passer
                    </button>
                </header>

                <section
                    className="relative flex flex-1 flex-col lg:grid lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-12 xl:grid-cols-[0.8fr_1.2fr] xl:gap-20"
                    onPointerEnter={pauseAutoplay}
                    onPointerLeave={reprendreAutoplay}
                >
                    <div data-welcome-copy className="relative z-10 pt-10 text-center lg:max-w-[610px] lg:pt-0 lg:text-left">
                        <p className="mb-3 font-sans text-sm font-semibold text-jse-secondaire lg:text-base">{slide.eyebrow}</p>
                        <h1 className="font-against text-[2rem] leading-[0.98] tracking-[-0.02em] text-jse-texte sm:text-[2.2rem] lg:text-[4.5rem] xl:text-[5.4rem]">
                            {slide.title}
                        </h1>
                        <p className="mx-auto mt-5 max-w-[390px] font-sans text-sm leading-6 text-jse-texte/60 lg:mx-0 lg:mt-7 lg:text-base lg:leading-7">{slide.description}</p>

                        <div data-welcome-action className="mt-7 hidden items-center gap-4 lg:flex">
                            <button type="button" onClick={() => router.visit("/authentification")} className="h-12 rounded-full bg-jse-principal px-7 font-sans text-sm font-semibold text-white shadow-lg shadow-jse-principal/15 transition hover:-translate-y-0.5 hover:bg-jse-principal/90">
                                Commencer
                            </button>
                            <span className="font-sans text-xs text-jse-texte/45">
                                Déjà un compte ?{" "}
                                <button type="button" onClick={() => router.visit("/authentification")} className="font-semibold text-jse-principal underline underline-offset-2">Se connecter</button>
                            </span>
                        </div>
                    </div>

                    <div
                        ref={visualRef}
                        className="relative mt-5 flex min-h-[360px] flex-1 touch-pan-y select-none items-center justify-center lg:mt-0 lg:min-h-[620px]"
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
                            className="relative z-10 w-full max-w-[330px] object-contain drop-shadow-[0_24px_35px_rgba(18,60,50,0.18)] sm:max-w-[350px] lg:max-w-[650px] xl:max-w-[760px]"
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
                                className={"h-1.5 rounded-full transition-all duration-300 " + (itemIndex === index ? "w-5 bg-jse-accent" : "w-1.5 bg-jse-texte/20")}
                            />
                        ))}
                    </div>

                    <div data-welcome-action className="pb-7 pt-6 lg:hidden">
                        <button type="button" onClick={() => router.visit("/authentification")} className="flex h-12 w-full items-center justify-center rounded-full bg-jse-principal px-6 font-sans text-sm font-semibold text-white shadow-lg shadow-jse-principal/15 transition hover:bg-jse-principal/90 active:scale-[0.99]">
                            Commencer
                        </button>
                        <p className="mt-5 text-center font-sans text-xs text-jse-texte/50">
                            Déjà un compte ?{" "}
                            <button type="button" onClick={() => router.visit("/authentification")} className="font-semibold text-jse-principal underline underline-offset-2">Se connecter</button>
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}

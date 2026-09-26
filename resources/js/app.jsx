import "../css/app.css";

import { Suspense, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { createInertiaApp, router } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { ChargementPage } from "./Composants/Interface/EtatsChargement";
import InstallationApplication from "./Composants/Interface/InstallationApplication";
import { gsap } from "gsap";

const themeInitial = localStorage.getItem("jse-theme") || "light";
document.documentElement.dataset.theme = themeInitial;

createInertiaApp({
    title: (title) => `${title} - JSE Express`,

    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob("./Pages/**/*.jsx"),
        ),

    setup({ el, App, props }) {
        createRoot(el).render(<Application App={App} props={props} />);
    },

    progress: {
        color: "#45B977",
    },
});

function Application({ App, props }) {
    const [chargement, setChargement] = useState(false);
    const applicationRef = useRef(null);
    const prefersReducedMotion = useRef(false);

    useEffect(() => {
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("/sw.js").catch(() => {});
        }

        prefersReducedMotion.current = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;
    }, []);

    useEffect(() => {
        const retirerStart = router.on("start", () => {
            setChargement(true);

            if (!applicationRef.current || prefersReducedMotion.current) return;

            gsap.to(applicationRef.current, {
                y: -2,
                opacity: 0.94,
                duration: 0.22,
                ease: "power2.out",
            });
        });

        const retirerFinish = router.on("finish", () => {
            setChargement(false);

            if (!applicationRef.current || prefersReducedMotion.current) return;

            const contexte = gsap.context(() => {
                const page = applicationRef.current.querySelector(
                    "main, [role='main'], .jse-page-content",
                );

                gsap.fromTo(
                    applicationRef.current,
                    { y: 8, opacity: 0.96 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 0.48,
                        ease: "power3.out",
                    },
                );

                if (window.matchMedia("(max-width: 1023px)").matches) {
                    const logos = applicationRef.current.querySelectorAll('img[alt="JSE Express"]');
                    gsap.fromTo(logos, { y: 18, opacity: 0.7 }, { y: 0, opacity: 1, duration: 0.58, stagger: 0.04, ease: "power3.out", clearProps: "transform,opacity" });
                }

                if (page) {
                    gsap.fromTo(
                        page,
                        { y: 10 },
                        {
                            y: 0,
                            duration: 0.52,
                            ease: "power3.out",
                            clearProps: "transform",
                        },
                    );
                }
            }, applicationRef.current);

            window.setTimeout(() => contexte.revert(), 650);
        });

        return () => {
            retirerStart();
            retirerFinish();
        };
    }, []);

    useEffect(() => {
        if (!applicationRef.current || prefersReducedMotion.current) return;

        gsap.fromTo(
            applicationRef.current,
            { opacity: 0.92, y: 8 },
            {
                opacity: 1,
                y: 0,
                duration: 0.55,
                ease: "power3.out",
                clearProps: "transform,opacity",
            },
        );

        if (window.matchMedia("(max-width: 1023px)").matches) {
            const logos = applicationRef.current.querySelectorAll('img[alt="JSE Express"]');
            gsap.fromTo(logos, { y: 18, opacity: 0.7 }, {
                y: 0, opacity: 1, duration: 0.58, stagger: 0.04,
                ease: "power3.out", clearProps: "transform,opacity",
            });
        }
    }, []);

    return (
        <>
            <div ref={applicationRef} className="jse-app-shell">
                <Suspense fallback={<ChargementPage />}>
                    <App {...props} />
                </Suspense>
            </div>

            <InstallationApplication />

            {chargement && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-jse-fond/70 p-6 backdrop-blur-[2px]"
                    aria-live="polite"
                >
                    <div className="flex w-full max-w-xs flex-col items-center rounded-[30px] bg-white/95 px-7 py-8 text-center shadow-2xl shadow-jse-principal/10 ring-1 ring-jse-texte/5">
                        <span className="size-10 animate-spin rounded-full border-[3px] border-jse-principal/15 border-t-jse-secondaire" />
                        <p className="mt-5 font-against text-2xl leading-none text-jse-principal">
                            Chargement...
                        </p>
                        <p className="mt-2 font-sans text-[11px] leading-5 text-jse-texte/50">
                            Veuillez patienter pendant le chargement de la page.
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}

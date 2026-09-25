import "../css/app.css";

import { Suspense, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { createInertiaApp, router } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { ChargementPage } from "./Composants/Interface/EtatsChargement";
import InstallationApplication from "./Composants/Interface/InstallationApplication";

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

    useEffect(() => {
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("/sw.js").catch(() => {});
        }
    }, []);

    useEffect(() => {
        const retirerStart = router.on("start", () => setChargement(true));
        const retirerFinish = router.on("finish", () => setChargement(false));

        return () => {
            retirerStart();
            retirerFinish();
        };
    }, []);

    return (
        <>
            <Suspense fallback={<ChargementPage />}>
                <App {...props} />
            </Suspense>

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

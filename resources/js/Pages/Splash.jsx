import { useEffect } from "react";
import { router } from "@inertiajs/react";

export default function Splash() {
    useEffect(() => {
        const minuteur = setTimeout(() => {
            router.visit("/bienvenue");
        }, 2500);

        return () => clearTimeout(minuteur);
    }, []);

    return (
        <main
            className="relative flex min-h-screen items-center justify-center overflow-hidden bg-jse-principal bg-cover bg-center bg-no-repeat"
            style={{
                backgroundImage: "url('/assets/bg.png')",
            }}
        >
            <div className="absolute inset-0 bg-jse-principal/10" />

            <div className="relative z-10 flex flex-col items-center px-6 text-center">
                <img
                    src="/assets/jse_logo.png"
                    alt="JSE Express"
                    className="w-52 max-w-[65vw] object-contain sm:w-60"
                />

                <p className="mt-8 max-w-xs text-base font-medium leading-7 text-white/95 sm:text-lg">
                    Un mouvement au service de votre quotidien.
                </p>

                <div
                    className="mt-12 size-5 animate-spin rounded-full border-2 border-white/25 border-t-jse-secondaire"
                    aria-label="Chargement"
                />
            </div>
        </main>
    );
}
import { useEffect } from "react";

export default function Splash() {
    useEffect(() => {
        const minuteur = window.setTimeout(() => {
            window.location.replace("/bienvenue");
        }, 2500);

        return () => window.clearTimeout(minuteur);
    }, []);

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-jse-principal text-white">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(69,185,119,0.16),transparent_34%),linear-gradient(145deg,#123C32_0%,#0d2d25_55%,#07110F_100%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(69,185,119,0.10),transparent_34%),linear-gradient(to_bottom,rgba(7,17,15,0.08),rgba(7,17,15,0.30))]" />

            <div className="relative z-10 flex flex-col items-center px-6 text-center">
                <div className="flex items-center justify-center rounded-[28px] border border-white/10 bg-white/[0.04] px-7 py-5 shadow-2xl shadow-black/20 backdrop-blur-sm">
                    <img
                        src="/assets/jse_logo.png"
                        alt="JSE Express"
                        className="h-20 w-auto object-contain sm:h-24"
                        draggable="false"
                    />
                </div>

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

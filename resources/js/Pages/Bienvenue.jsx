import { router } from "@inertiajs/react";
import { ArrowRight } from "lucide-react";

export default function Bienvenue() {
    return (
        <main className="min-h-screen bg-jse-fond text-jse-texte">
            <div className="mx-auto flex min-h-screen w-full max-w-[393px] flex-col px-5">
                {/* =====================================================
                    EN-TÊTE
                ====================================================== */}

                <header className="flex items-center justify-between pt-6">
                    <button
                        type="button"
                        onClick={() => router.visit("/")}
                        className="flex items-center"
                        aria-label="Accueil"
                    >
                        <img
                            src="/assets/jse_logo.png"
                            alt="JSE Express"
                            className="h-9 w-auto object-contain"
                        />
                    </button>

                    <button
                        type="button"
                        onClick={() => router.visit("/authentification")}
                        className="font-sans text-sm font-medium text-jse-texte/65 transition hover:text-jse-principal"
                    >
                        Passer
                    </button>
                </header>

                {/* =====================================================
                    CONTENU PRINCIPAL
                ====================================================== */}

                <section className="flex flex-1 flex-col pt-10">
                    {/* Introduction */}

                    <div>
                        <p className="mb-3 font-sans text-sm font-semibold text-jse-secondaire">
                            Bienvenue
                        </p>

                        <h1 className="font-against text-[2rem] leading-[0.98] tracking-[-0.02em] text-jse-texte">
                            Vos plats favoris
                            <br />
                            à Adzopé,
                            <br />
                            sans vous déplacer.
                        </h1>

                        <p className="mt-5 max-w-[300px] font-sans text-sm leading-6 text-jse-texte/60">
                            Découvrez, commandez,
                            <br />
                            faites-vous livrer en toute simplicité.
                        </p>
                    </div>

                    {/* =================================================
                        VISUEL PRINCIPAL
                    ================================================== */}

                    <div className="relative mt-8 flex flex-1 items-center justify-center">
                        <img
                            src="/assets/plat-hero.png"
                            alt="Plat JSE Express"
                            className="w-full max-w-[330px] object-contain drop-shadow-[0_18px_25px_rgba(18,60,50,0.12)]"
                        />
                    </div>

                    {/* =================================================
                        INDICATEURS
                    ================================================== */}

                    <div
                        className="mt-3 flex items-center justify-center gap-2"
                        aria-label="Présentation"
                    >
                        <span className="h-1.5 w-5 rounded-full bg-jse-accent" />

                        <span className="size-1.5 rounded-full bg-jse-texte/20" />

                        <span className="size-1.5 rounded-full bg-jse-texte/20" />

                        <span className="size-1.5 rounded-full bg-jse-texte/20" />

                        <span className="size-1.5 rounded-full bg-jse-texte/20" />
                    </div>

                    {/* =================================================
                        ACTION PRINCIPALE
                    ================================================== */}

                    <div className="pb-7 pt-6">
                        <button
                            type="button"
                            onClick={() => router.visit("/authentification")}
                            className="flex h-12 w-full items-center justify-center rounded-full bg-jse-principal px-6 font-sans text-sm font-semibold text-white shadow-lg shadow-jse-principal/15 transition hover:bg-jse-principal/90 active:scale-[0.99]"
                        >
                            Commencer
                        </button>

                        <p className="mt-5 text-center font-sans text-xs text-jse-texte/50">
                            Déjà un compte ?{" "}
                            <button
                                type="button"
                                onClick={() =>
                                    router.visit("/authentification")
                                }
                                className="font-semibold text-jse-principal underline underline-offset-2"
                            >
                                Se connecter
                            </button>
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}

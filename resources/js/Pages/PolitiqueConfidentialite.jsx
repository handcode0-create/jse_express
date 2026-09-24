import { ArrowLeft } from "lucide-react";
import { router } from "@inertiajs/react";

export default function PolitiqueConfidentialite() {
    return (
        <main className="min-h-screen bg-jse-fond text-jse-texte">
            <div className="mx-auto w-full max-w-4xl px-5 py-8 sm:px-8 lg:px-10">
                {/* En-tête */}
                <div className="mb-10">
                    <button
                        type="button"
                        onClick={() => router.visit("/authentification")}
                        className="mb-8 flex items-center gap-2 text-sm font-medium text-jse-texte/55 transition hover:text-jse-principal"
                    >
                        <ArrowLeft size={18} />
                        Retour à l'authentification
                    </button>

                    <div className="mb-6">
                        <img
                            src="/assets/jse_logo.png"
                            alt="JSE Express"
                            className="h-16 w-auto object-contain"
                        />
                    </div>

                    <p className="mb-2 text-sm font-semibold text-jse-secondaire">
                        JSE Express
                    </p>

                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        Politique de confidentialité
                    </h1>

                    <p className="mt-3 text-sm leading-6 text-jse-texte/55">
                        Informations relatives à la confidentialité et au
                        traitement des données personnelles sur JSE Express.
                    </p>
                </div>

                {/* Contenu temporaire */}
                <div className="rounded-3xl border border-jse-texte/10 bg-white p-6 shadow-sm sm:p-8">
                    <div className="space-y-8">
                        <section>
                            <h2 className="mb-3 text-lg font-bold">
                                1. Introduction
                            </h2>

                            <p className="text-sm leading-7 text-jse-texte/65">
                                Cette page est destinée à présenter la politique
                                de confidentialité applicable à JSE Express.
                            </p>
                        </section>

                        <section>
                            <h2 className="mb-3 text-lg font-bold">
                                2. Données personnelles
                            </h2>

                            <p className="text-sm leading-7 text-jse-texte/65">
                                Le contenu définitif relatif aux données
                                collectées, à leur utilisation, à leur
                                conservation et aux droits des utilisateurs sera
                                ajouté dans cette section.
                            </p>
                        </section>

                        <section>
                            <h2 className="mb-3 text-lg font-bold">
                                3. Consentement
                            </h2>

                            <p className="text-sm leading-7 text-jse-texte/65">
                                Le consentement de l'utilisateur est demandé
                                lors de l'utilisation des formulaires
                                d'authentification de JSE Express.
                            </p>
                        </section>

                        <section>
                            <h2 className="mb-3 text-lg font-bold">
                                4. Contact
                            </h2>

                            <p className="text-sm leading-7 text-jse-texte/65">
                                Les informations de contact relatives aux
                                demandes concernant la confidentialité seront
                                ajoutées avec la version définitive de cette
                                politique.
                            </p>
                        </section>
                    </div>
                </div>

                <div className="mt-8">
                    <button
                        type="button"
                        onClick={() => router.visit("/authentification")}
                        className="rounded-2xl bg-jse-principal px-6 py-3 text-sm font-semibold text-white transition hover:bg-jse-principal/90"
                    >
                        Retour à l'authentification
                    </button>
                </div>
            </div>
        </main>
    );
}

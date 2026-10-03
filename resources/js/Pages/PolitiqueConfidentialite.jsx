import { router } from "@inertiajs/react";
import { ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";

const sections = [
    {
        title: "Données collectées",
        text: "JSE Express collecte les informations que vous renseignez lors de la création et de l'utilisation de votre compte : nom, prénom, numéro de téléphone, adresse e-mail lorsqu'elle est fournie, informations propres au restaurant ou au profil livreur, ainsi que les informations nécessaires aux commandes et à la livraison.",
    },
    {
        title: "Utilisation des données",
        text: "Ces informations servent à créer et sécuriser votre compte, identifier votre profil (client, restaurant ou livreur), traiter les commandes, organiser la livraison, assurer le suivi des opérations et vous transmettre les notifications liées à votre activité sur JSE Express.",
    },
    {
        title: "Adresses et commandes",
        text: "Les adresses de livraison, informations de commande et éléments nécessaires au traitement d'une livraison sont associés à votre compte afin de permettre l'exécution du service.",
    },
    {
        title: "Paiement et services externes",
        text: "Lorsque les fonctionnalités de paiement mobile ou d'envoi de SMS sont activées, les données strictement nécessaires à leur fonctionnement peuvent être transmises au prestataire concerné. Les intégrations externes sont activées et configurées séparément par JSE Express.",
    },
    {
        title: "Sécurité",
        text: "Les mots de passe sont enregistrés sous forme hachée. L'accès aux espaces Client, Restaurant, Livreur et Administrateur est contrôlé selon le rôle du compte. Des mécanismes de protection contre les soumissions automatisées peuvent également être utilisés lors de l'inscription.",
    },
    {
        title: "Vos droits",
        text: "Vous pouvez demander l'accès, la rectification ou la mise à jour des informations associées à votre compte. Pour toute demande concernant vos données, utilisez les moyens de contact officiels de JSE Express.",
    },
];

export default function PolitiqueConfidentialite() {
    return (
        <main className="min-h-screen bg-[#07110F] px-4 py-6 font-sans text-white sm:px-6 lg:px-10">
            <div className="mx-auto max-w-5xl">
                <header className="flex items-center justify-between gap-4">
                    <button
                        type="button"
                        onClick={() => router.visit("/authentification")}
                        className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm text-white/70 transition hover:bg-white/[0.09] hover:text-white"
                    >
                        <ArrowLeft size={16} />
                        Retour
                    </button>
                    <img src="/assets/jse_logo.png" alt="JSE Express" className="h-10 w-auto object-contain" />
                </header>

                <section className="mt-10 overflow-hidden rounded-[30px] border border-white/10 bg-[#0B1513]/95 shadow-[0_30px_100px_rgba(0,0,0,.4)]">
                    <div className="border-b border-white/10 bg-gradient-to-br from-[var(--color-jse-principal)] to-[#0B1513] p-7 sm:p-10">
                        <div className="flex size-12 items-center justify-center rounded-2xl bg-jse-secondaire/15 text-jse-secondaire">
                            <ShieldCheck size={24} />
                        </div>
                        <p className="mt-6 text-[11px] font-bold uppercase tracking-[.24em] text-jse-secondaire">JSE EXPRESS</p>
                        <h1 className="mt-3 font-against text-4xl leading-tight text-[var(--color-jse-fond)] sm:text-5xl">Politique de confidentialité</h1>
                        <p className="mt-5 max-w-3xl text-sm leading-7 text-white/60">
                            Cette page présente les données utilisées par JSE Express dans le cadre du service de commande et de livraison.
                        </p>
                    </div>

                    <div className="grid gap-4 p-5 sm:p-8 lg:grid-cols-2">
                        {sections.map((section) => (
                            <article key={section.title} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-jse-secondaire" />
                                    <div>
                                        <h2 className="font-semibold text-[var(--color-jse-fond)]">{section.title}</h2>
                                        <p className="mt-2 text-sm leading-6 text-white/55">{section.text}</p>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>

                    <div className="border-t border-white/10 px-5 py-6 text-xs leading-6 text-white/40 sm:px-8">
                        Les modalités précises relatives aux prestataires externes seront précisées lorsque les intégrations concernées seront activées.
                    </div>
                </section>
            </div>
        </main>
    );
}

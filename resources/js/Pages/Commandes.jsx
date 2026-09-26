import React from "react";
import SidebarJSE from "../Composants/Navigation/SidebarJSE";
import { router, usePage } from "@inertiajs/react";
import NavigationFlottante from "../Composants/Navigation/NavigationFlottante";
import {
    ArrowLeft,
    Check,
    ChevronRight,
    ClipboardList,
    Heart,
    Home,
    Package,
    RefreshCcw,
    UserRound,
    X,
} from "lucide-react";

const imagesFallback = [
    "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=700&q=80",
];

const onglets = [
    { value: "toutes", label: "Toutes" },
    { value: "en_cours", label: "En cours" },
    { value: "terminees", label: "Terminées" },
    { value: "annulees", label: "Annulées" },
];

const etapes = [
    { code: "EN_ATTENTE", label: "Reçue" },
    { code: "CONFIRMEE", label: "Confirmée" },
    { code: "EN_PREPARATION", label: "Préparation" },
    { code: "EN_LIVRAISON", label: "En livraison" },
    { code: "LIVREE", label: "Livrée" },
];

function formatMontant(montant) {
    return new Intl.NumberFormat("fr-FR").format(Number(montant || 0)) + " FCFA";
}

function statutConfig(statut) {
    const code = statut?.code;

    if (code === "LIVREE") {
        return {
            label: "Livrée",
            classes: "bg-jse-secondaire/10 text-jse-secondaire",
            icon: Check,
        };
    }

    if (code === "ANNULEE") {
        return {
            label: "Annulée",
            classes: "bg-red-50 text-red-600",
            icon: X,
        };
    }

    return {
        label: statut?.libelle || "En cours",
        classes: "bg-jse-accent/10 text-jse-accent",
        icon: Package,
    };
}

function etapeActive(statut) {
    const code = statut?.code;

    if (code === "LIVREE") return 4;
    if (code === "EN_LIVRAISON") return 3;
    if (code === "PRETE") return 2;
    if (code === "EN_PREPARATION") return 2;
    if (code === "CONFIRMEE") return 1;
    if (code === "EN_ATTENTE") return 0;

    return -1;
}

function NavigationItem({ label, icon: Icon, active = false, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                "flex min-w-[66px] flex-col items-center justify-center gap-1 rounded-[20px] px-2.5 py-2 transition-all",
                active
                    ? "bg-jse-secondaire text-white shadow-sm"
                    : "text-jse-texte/80 hover:bg-jse-fond",
            ].join(" ")}
        >
            <Icon size={21} strokeWidth={active ? 2.2 : 1.8} />
            <span className="font-sans text-[10px] font-semibold">{label}</span>
        </button>
    );
}

function ProgressionCommande({ statut }) {
    const active = etapeActive(statut);

    if (active < 0) return null;

    return (
        <div className="mt-6 px-1 sm:px-2">
            <div className="relative">
                <div className="absolute left-[10%] right-[10%] top-[10px] h-[3px] rounded-full bg-jse-texte/10" />
                <div
                    className="absolute left-[10%] top-[10px] h-[3px] rounded-full bg-jse-secondaire transition-[width] duration-500"
                    style={{
                        width: active === 0 ? "0%" : (active / 4) * 80 + "%",
                    }}
                />

                <div className="relative grid grid-cols-5">
                    {etapes.map((etape, index) => {
                        const atteint = index < active;
                        const actuel = index === active;
                        const futur = index > active;

                        return (
                            <div
                                key={etape.code}
                                className="flex min-w-0 flex-col items-center"
                            >
                                <div className="relative flex h-[22px] items-center justify-center">
                                    {actuel && (
                                        <span className="absolute size-[25px] rounded-full border-2 border-jse-secondaire/25" />
                                    )}

                                    <span
                                        className={[
                                            "relative z-10 flex size-[20px] items-center justify-center rounded-full border-[3px] bg-white transition-all duration-300",
                                            atteint || actuel
                                                ? "border-jse-secondaire"
                                                : "border-jse-texte/20",
                                            actuel
                                                ? "size-[22px] shadow-[0_0_0_3px_rgba(69,185,119,0.10)]"
                                                : "",
                                        ].join(" ")}
                                    >
                                        <span
                                            className={[
                                                "rounded-full transition-all",
                                                atteint
                                                    ? "size-[8px] bg-jse-secondaire"
                                                    : actuel
                                                      ? "size-[8px] bg-jse-secondaire"
                                                      : futur
                                                        ? "size-[7px] bg-jse-texte/20"
                                                        : "",
                                            ].join(" ")}
                                        />
                                    </span>
                                </div>

                                <span
                                    className={[
                                        "mt-3 max-w-[70px] text-center font-sans text-[9px] leading-[1.15] sm:max-w-none sm:text-[10px]",
                                        atteint || actuel
                                            ? "font-medium text-jse-secondaire"
                                            : "text-jse-texte/45",
                                    ].join(" ")}
                                >
                                    {etape.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function CommandeCard({ commande, index }) {
    const statut = statutConfig(commande.statut);
    const IconStatut = statut.icon;
    const estTerminee = commande.statut?.code === "LIVREE";
    const estAnnulee = commande.statut?.code === "ANNULEE";

    const voirDetails = () => {
        router.visit("/commandes/" + commande.id);
    };

    const recommander = () => {
        router.post("/commandes/" + commande.id + "/recommander", {}, {
            preserveScroll: true,
        });
    };

    return (
        <article className="overflow-hidden rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-jse-texte/5 sm:p-5">
            <div className="flex gap-4">
                <div className="size-[94px] shrink-0 overflow-hidden rounded-[20px] bg-jse-fond sm:size-[112px]">
                    <img
                        src={commande.image || imagesFallback[index % imagesFallback.length]}
                        alt={commande.restaurant?.nom || "Commande JSE Express"}
                        onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src =
                                imagesFallback[index % imagesFallback.length];
                        }}
                        className="h-full w-full object-cover"
                    />
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                        <h2 className="line-clamp-2 font-against text-[1.25rem] leading-[1.05] text-jse-principal sm:text-[1.45rem]">
                            {commande.restaurant?.nom || "Restaurant JSE Express"}
                        </h2>

                        <span
                            className={[
                                "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 font-sans text-[10px] font-semibold sm:text-[11px]",
                                statut.classes,
                            ].join(" ")}
                        >
                            <IconStatut size={14} strokeWidth={2.2} />
                            {statut.label}
                        </span>
                    </div>

                    <p className="mt-1 font-sans text-[10px] text-jse-texte/50 sm:text-xs">
                        {commande.date_commande || "Date indisponible"}
                        <span className="mx-1.5">•</span>
                        #{commande.reference}
                    </p>

                    <div className="mt-3 flex items-center gap-2 font-sans text-xs text-jse-texte/60">
                        <ClipboardList size={15} strokeWidth={1.8} />
                        <span>
                            {commande.nombre_articles}{" "}
                            {commande.nombre_articles > 1 ? "articles" : "article"}
                        </span>
                    </div>

                    <p className="mt-1 font-against text-[1.35rem] leading-none text-jse-principal sm:text-[1.5rem]">
                        {formatMontant(commande.montant_total)}
                    </p>
                </div>
            </div>

            {!estTerminee && !estAnnulee && (
                <ProgressionCommande statut={commande.statut} />
            )}

            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
                <button
                    type="button"
                    onClick={voirDetails}
                    className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-jse-secondaire/10 font-sans text-xs font-semibold text-jse-secondaire transition-colors hover:bg-jse-secondaire/15"
                >
                    <ClipboardList size={18} strokeWidth={1.8} />
                    Voir les détails
                    <ChevronRight size={15} />
                </button>

                {estTerminee && commande.peut_recommander && (
                    <button
                        type="button"
                        onClick={recommander}
                        className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-jse-secondaire/10 font-sans text-xs font-semibold text-jse-secondaire transition-colors hover:bg-jse-secondaire/15"
                    >
                        <RefreshCcw size={17} strokeWidth={1.9} />
                        Commander à nouveau
                    </button>
                )}
            </div>
        </article>
    );
}

export default function Commandes() {
    const { commandes = [], filtreActif = "toutes" } = usePage().props;

    const changerFiltre = (filtre) => {
        router.get(
            "/commandes",
            { filtre },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    return (
        <main className="min-h-screen bg-jse-fond pb-28 text-jse-texte">
            <div className="mx-auto min-h-screen w-full max-w-none px-4 sm:px-6 lg:px-8">
                <div className="lg:grid lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-10">
                    <SidebarJSE active="commandes" />

                    <div className="mx-auto w-full max-w-none lg:mx-0">
                        <header className="pt-5 sm:pt-7 lg:pt-10">
                            <div className="flex items-center justify-between lg:hidden">
                                <button
                                    type="button"
                                    onClick={() => router.visit("/accueil")}
                                    className="flex size-11 items-center justify-center rounded-full bg-white text-jse-principal shadow-sm ring-1 ring-jse-texte/5"
                                    aria-label="Retour à l'accueil"
                                >
                                    <ArrowLeft size={21} />
                                </button>

                                <img
                                    src="/assets/jse_logo.png"
                                    alt="JSE Express"
                                    className="h-14 w-auto object-contain"
                                />

                                <div className="flex size-11 items-center justify-center rounded-full bg-white text-jse-principal shadow-sm ring-1 ring-jse-texte/5">
                                    <span className="size-2 rounded-full bg-jse-secondaire" />
                                </div>
                            </div>

                            <div className="mt-7 lg:mt-0">
                                <h1 className="font-against text-[2.65rem] leading-[0.95] text-jse-principal sm:text-[3.3rem]">
                                    Mes commandes
                                </h1>
                                <p className="mt-2 font-sans text-sm leading-5 text-jse-texte/60 sm:text-base">
                                    Retrouvez l’historique de toutes vos commandes.
                                </p>
                            </div>

                            <div className="mt-6 overflow-x-auto rounded-full bg-white p-1.5 shadow-sm ring-1 ring-jse-texte/5 scrollbar-none">
                                <div className="flex min-w-max gap-1">
                                    {onglets.map((onglet) => (
                                        <button
                                            key={onglet.value}
                                            type="button"
                                            onClick={() => changerFiltre(onglet.value)}
                                            className={[
                                                "rounded-full px-5 py-3 font-sans text-xs font-semibold transition-all sm:px-7 sm:text-sm",
                                                filtreActif === onglet.value
                                                    ? "bg-jse-secondaire text-white shadow-sm"
                                                    : "text-jse-texte/70 hover:bg-jse-fond",
                                            ].join(" ")}
                                        >
                                            {onglet.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </header>

                        <section className="space-y-4 pt-5 sm:pt-6">
                            {commandes.length > 0 ? (
                                commandes.map((commande, index) => (
                                    <CommandeCard
                                        key={commande.id}
                                        commande={commande}
                                        index={index}
                                    />
                                ))
                            ) : (
                                <div className="rounded-[28px] bg-white px-6 py-14 text-center shadow-sm ring-1 ring-jse-texte/5">
                                    <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-jse-secondaire/10 text-jse-secondaire">
                                        <ClipboardList size={28} strokeWidth={1.7} />
                                    </div>
                                    <h2 className="mt-5 font-against text-2xl text-jse-principal">
                                        Aucune commande
                                    </h2>
                                    <p className="mx-auto mt-2 max-w-sm font-sans text-sm leading-5 text-jse-texte/50">
                                        {filtreActif === "toutes"
                                            ? "Vos commandes apparaîtront ici dès votre première commande."
                                            : "Aucune commande ne correspond à ce filtre."}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => router.visit("/accueil")}
                                        className="mt-6 rounded-full bg-jse-accent px-6 py-3 font-sans text-xs font-semibold text-white shadow-sm"
                                    >
                                        Découvrir les restaurants
                                    </button>
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </div>

            <NavigationFlottante type="client" actif="commandes" />
        </main>
    );
}

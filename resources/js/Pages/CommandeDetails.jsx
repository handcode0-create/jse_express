import React from "react";
import { router, usePage } from "@inertiajs/react";
import {
    ArrowLeft,
    Check,
    ChevronRight,
    ClipboardList,
    MapPin,
    Package,
    RefreshCcw,
    Truck,
} from "lucide-react";

const imageFallback =
    "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80";

function formatMontant(montant) {
    return new Intl.NumberFormat("fr-FR").format(Number(montant || 0)) + " FCFA";
}

function etapeActive(statut) {
    const code = statut?.code;

    if (code === "LIVREE") return 4;
    if (code === "EN_LIVRAISON") return 3;
    if (code === "PRETE" || code === "EN_PREPARATION") return 2;
    if (code === "CONFIRMEE") return 1;
    if (code === "EN_ATTENTE") return 0;

    return -1;
}

const etapes = [
    "Reçue",
    "Confirmée",
    "Préparation",
    "En livraison",
    "Livrée",
];

export default function CommandeDetails() {
    const { commande } = usePage().props;
    const active = etapeActive(commande?.statut);

    const recommander = () => {
        router.post(
            "/commandes/" + commande.id + "/recommander",
            {},
            { preserveScroll: true },
        );
    };

    return (
        <main className="min-h-screen bg-jse-fond pb-10 text-jse-texte">
            <div className="mx-auto w-full max-w-2xl px-4 sm:px-6">
                <header className="flex items-center justify-between pt-5 sm:pt-7">
                    <button
                        type="button"
                        onClick={() => router.visit("/commandes")}
                        className="flex size-11 items-center justify-center rounded-full bg-white text-jse-principal shadow-sm ring-1 ring-jse-texte/5"
                        aria-label="Retour aux commandes"
                    >
                        <ArrowLeft size={21} />
                    </button>

                    <img
                        src="/assets/jse_logo.png"
                        alt="JSE Express"
                        className="h-14 w-auto object-contain"
                    />

                    <div className="flex size-11 items-center justify-center rounded-full bg-white text-jse-principal shadow-sm ring-1 ring-jse-texte/5">
                        <ClipboardList size={19} />
                    </div>
                </header>

                <section className="pt-8">
                    <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.15em] text-jse-texte/35">
                        Commande #{commande.reference}
                    </p>
                    <h1 className="mt-2 font-against text-[2.7rem] leading-[0.95] text-jse-principal sm:text-[3.2rem]">
                        Détails de la commande
                    </h1>
                    <p className="mt-2 font-sans text-xs text-jse-texte/55">
                        {commande.date_commande}
                    </p>
                </section>

                <section className="mt-6 overflow-hidden rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-jse-texte/5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="font-sans text-[10px] uppercase tracking-[0.12em] text-jse-texte/35">
                                Restaurant
                            </p>
                            <h2 className="mt-1 font-against text-2xl leading-none text-jse-principal">
                                {commande.restaurant?.nom || "Restaurant JSE Express"}
                            </h2>
                            {commande.restaurant?.adresse && (
                                <p className="mt-2 flex items-center gap-1.5 font-sans text-xs text-jse-texte/50">
                                    <MapPin size={13} />
                                    {commande.restaurant.adresse}
                                </p>
                            )}
                        </div>

                        <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-jse-secondaire/10 px-3 py-2 font-sans text-[10px] font-semibold text-jse-secondaire">
                            <Check size={14} />
                            {commande.statut?.libelle || "Commande"}
                        </span>
                    </div>

                    {active >= 0 && (
                        <div className="mt-7">
                            <div className="relative flex items-start justify-between">
                                <div className="absolute left-[7%] right-[7%] top-3 h-[2px] bg-jse-texte/10" />
                                <div
                                    className="absolute left-[7%] top-3 h-[2px] bg-jse-secondaire"
                                    style={{
                                        width:
                                            active === 0
                                                ? "0%"
                                                : (active / 4) * 86 + "%",
                                    }}
                                />

                                {etapes.map((etape, index) => (
                                    <div
                                        key={etape}
                                        className="relative z-10 flex w-[20%] flex-col items-center text-center"
                                    >
                                        <span
                                            className={[
                                                "flex size-6 items-center justify-center rounded-full border-2 bg-white",
                                                index <= active
                                                    ? "border-jse-secondaire"
                                                    : "border-jse-texte/15",
                                            ].join(" ")}
                                        >
                                            <span
                                                className={[
                                                    "size-2.5 rounded-full",
                                                    index <= active
                                                        ? "bg-jse-secondaire"
                                                        : "bg-jse-texte/15",
                                                ].join(" ")}
                                            />
                                        </span>
                                        <span
                                            className={[
                                                "mt-2 font-sans text-[9px] leading-3",
                                                index <= active
                                                    ? "text-jse-secondaire"
                                                    : "text-jse-texte/45",
                                            ].join(" ")}
                                        >
                                            {etape}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </section>

                <section className="mt-4 rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-jse-texte/5">
                    <div className="flex items-center gap-2">
                        <Package size={19} className="text-jse-secondaire" />
                        <h2 className="font-against text-2xl text-jse-principal">
                            Articles
                        </h2>
                    </div>

                    <div className="mt-4 space-y-3">
                        {commande.lignes?.map((ligne) => (
                            <div
                                key={ligne.id}
                                className="flex items-center gap-3 rounded-[20px] bg-jse-fond/70 p-2.5"
                            >
                                <div className="size-16 shrink-0 overflow-hidden rounded-[16px] bg-white">
                                    <img
                                        src={ligne.image || imageFallback}
                                        alt={ligne.nom}
                                        onError={(event) => {
                                            event.currentTarget.onerror = null;
                                            event.currentTarget.src =
                                                imageFallback;
                                        }}
                                        className="h-full w-full object-cover"
                                    />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="line-clamp-2 font-sans text-xs font-semibold text-jse-texte">
                                        {ligne.nom}
                                    </p>
                                    <p className="mt-1 font-sans text-[10px] text-jse-texte/45">
                                        {ligne.quantite} ×{" "}
                                        {formatMontant(ligne.prix_unitaire)}
                                    </p>
                                </div>

                                <p className="shrink-0 font-sans text-xs font-bold text-jse-principal">
                                    {formatMontant(ligne.total)}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mt-4 rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-jse-texte/5">
                    <div className="flex items-center gap-2">
                        <Truck size={19} className="text-jse-secondaire" />
                        <h2 className="font-against text-2xl text-jse-principal">
                            Livraison
                        </h2>
                    </div>

                    <div className="mt-4 rounded-[20px] bg-jse-fond/70 p-4">
                        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-jse-texte/35">
                            Adresse
                        </p>
                        <p className="mt-1 font-sans text-sm font-medium text-jse-texte">
                            {commande.adresse_livraison}
                        </p>
                        <p className="mt-2 font-sans text-xs text-jse-texte/50">
                            {commande.zone?.nom || "Zone non précisée"} ·{" "}
                            {commande.telephone_livraison}
                        </p>
                    </div>
                </section>

                <section className="mt-4 rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-jse-texte/5">
                    <div className="space-y-3 font-sans text-sm">
                        <div className="flex justify-between text-jse-texte/60">
                            <span>Sous-total</span>
                            <span>{formatMontant(commande.sous_total)}</span>
                        </div>
                        <div className="flex justify-between text-jse-texte/60">
                            <span>Livraison</span>
                            <span>{formatMontant(commande.frais_livraison)}</span>
                        </div>
                        <div className="my-3 border-t border-jse-texte/10" />
                        <div className="flex items-center justify-between">
                            <span className="font-semibold text-jse-principal">
                                Total
                            </span>
                            <span className="font-against text-2xl text-jse-principal">
                                {formatMontant(commande.montant_total)}
                            </span>
                        </div>
                    </div>
                </section>

                {commande.statut?.code === "LIVREE" && (
                    <button
                        type="button"
                        onClick={recommander}
                        className="mt-5 flex h-13 w-full items-center justify-center gap-2 rounded-full bg-jse-accent px-5 py-3.5 font-sans text-sm font-semibold text-white shadow-sm"
                    >
                        <RefreshCcw size={18} />
                        Commander à nouveau
                        <ChevronRight size={16} />
                    </button>
                )}
            </div>
        </main>
    );
}

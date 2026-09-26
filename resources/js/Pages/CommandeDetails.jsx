import React from "react";
import SidebarJSE from "../Composants/Navigation/SidebarJSE";
import { router, usePage } from "@inertiajs/react";
import {
    ArrowLeft,
    Bike,
    Check,
    ChevronRight,
    ClipboardList,
    Clock3,
    CreditCard,
    KeyRound,
    MapPin,
    Package,
    RefreshCcw,
    Store,
} from "lucide-react";

const imageFallback =
    "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80";

const etapes = [
    { code: "EN_ATTENTE", label: "Commande reçue" },
    { code: "CONFIRMEE", label: "Confirmée" },
    { code: "EN_PREPARATION", label: "Préparation" },
    { code: "PRETE", label: "Prête" },
    { code: "EN_LIVRAISON", label: "En livraison" },
    { code: "LIVREE", label: "Livrée" },
];

function formatMontant(montant) {
    return (
        new Intl.NumberFormat("fr-FR").format(Number(montant || 0)) +
        " FCFA"
    );
}

function statutIndex(code) {
    return etapes.findIndex((etape) => etape.code === code);
}

function formatHistorique(commande, code) {
    const element = (commande.historique || []).find(
        (item) => item.code === code,
    );

    if (element?.heure) {
        return element.heure;
    }

    if (code === commande.statut?.code && commande.heure_commande) {
        return commande.heure_commande;
    }

    return "—";
}

function libellePaiement(statut) {
    if (!statut) return "Paiement non enregistré";

    const valeur = String(statut).toLowerCase();

    if (["paye", "payé", "reussi", "réussi", "success", "confirme", "confirmé"].includes(valeur)) {
        return "Paiement réussi";
    }

    return statut;
}

function Card({ title, icon: Icon, children }) {
    return (
        <section className="mt-4 rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-jse-texte/5 sm:p-6">
            <div className="flex items-center gap-2">
                <Icon size={20} className="text-jse-secondaire" strokeWidth={2} />
                <h2 className="font-against text-[1.55rem] leading-none text-jse-principal sm:text-[1.7rem]">
                    {title}
                </h2>
            </div>
            {children}
        </section>
    );
}

export default function CommandeDetails() {
    const { commande } = usePage().props;
    const active = statutIndex(commande?.statut?.code);
    const paiement = commande?.paiement;

    const recommander = () => {
        router.post(
            "/commandes/" + commande.id + "/recommander",
            {},
            { preserveScroll: true },
        );
    };

    return (
        <main className="min-h-screen bg-jse-fond pb-10 text-jse-texte">
            <div className="mx-auto flex min-h-screen w-full max-w-none">
                <SidebarJSE active="commandes" />
                <div className="min-w-0 flex-1">
                    <div className="mx-auto w-full max-w-none px-4 sm:px-6">
                <header className="flex items-center justify-between pt-5 sm:pt-7">
                    <button
                        type="button"
                        onClick={() => router.visit("/commandes")}
                        className="flex size-11 items-center justify-center rounded-full bg-white text-jse-principal shadow-sm ring-1 ring-jse-texte/5"
                        aria-label="Retour aux commandes"
                    >
                        <ArrowLeft size={21} />
                    </button>

                    <div className="text-center">
                        <p className="font-sans text-[9px] font-semibold uppercase tracking-[0.14em] text-jse-texte/35">
                            Commande
                        </p>
                        <h1 className="font-sans text-base font-bold text-jse-principal sm:text-lg">
                            #{commande.reference}
                        </h1>
                    </div>

                    <div className="flex size-11 items-center justify-center rounded-full bg-white text-jse-principal shadow-sm ring-1 ring-jse-texte/5">
                        <ClipboardList size={19} />
                    </div>
                </header>

                <section className="mt-5 overflow-hidden rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-jse-texte/5 sm:p-5">
                    <div className="flex gap-4">
                        <div className="size-[116px] shrink-0 overflow-hidden rounded-[20px] bg-jse-fond sm:size-[140px]">
                            <img
                                src={commande.restaurant?.image || imageFallback}
                                alt={commande.restaurant?.nom || "Restaurant"}
                                className="h-full w-full object-cover"
                                onError={(event) => {
                                    event.currentTarget.onerror = null;
                                    event.currentTarget.src = imageFallback;
                                }}
                            />
                        </div>

                        <div className="min-w-0 flex-1">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-jse-secondaire/10 px-3 py-2 font-sans text-[10px] font-semibold text-jse-secondaire">
                                <Check size={14} />
                                {commande.statut?.libelle || "Commande reçue"}
                            </span>

                            <h2 className="mt-2 font-against text-[1.65rem] leading-[0.95] text-jse-principal sm:text-2xl">
                                {commande.restaurant?.nom ||
                                    "Restaurant JSE Express"}
                            </h2>

                            <p className="mt-1 font-sans text-xs text-jse-texte/60">
                                Restaurant local
                            </p>

                            <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 font-sans text-[10px] text-jse-texte/50">
                                <span className="flex items-center gap-1">
                                    <ClipboardList size={13} />
                                    {commande.date_commande}
                                </span>
                                {commande.heure_commande && (
                                    <>
                                        <span>•</span>
                                        <span>{commande.heure_commande}</span>
                                    </>
                                )}
                            </div>

                            {commande.restaurant?.id && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        router.visit(
                                            "/restaurants/" +
                                                commande.restaurant.id,
                                        )
                                    }
                                    className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-jse-fond px-4 py-2.5 font-sans text-[10px] font-semibold text-jse-principal"
                                >
                                    Voir le restaurant
                                    <ChevronRight size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                <Card title="Articles commandés" icon={Package}>
                    <div className="mt-4 divide-y divide-jse-texte/8">
                        {(commande.lignes || []).map((ligne) => (
                            <div
                                key={ligne.id}
                                className="flex gap-3 py-3 first:pt-0 last:pb-0"
                            >
                                <div className="size-[72px] shrink-0 overflow-hidden rounded-[16px] bg-jse-fond">
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
                                    <h3 className="font-sans text-sm font-bold text-jse-principal">
                                        {ligne.nom}
                                    </h3>
                                    <p className="mt-1 line-clamp-2 font-sans text-xs leading-4 text-jse-texte/55">
                                        {ligne.description ||
                                            "Article commandé"}
                                    </p>
                                    {ligne.options?.length > 0 && (
                                        <p className="mt-2 line-clamp-2 font-sans text-[10px] leading-4 text-jse-secondaire">
                                            {ligne.options.map((option) => option.groupe ? `${option.groupe} : ${option.nom}` : option.nom).join(" · ")}
                                        </p>
                                    )}
                                </div>

                                <div className="flex min-w-[78px] flex-col items-end justify-center">
                                    <span className="font-sans text-xs font-bold text-jse-principal">
                                        x{ligne.quantite}
                                    </span>
                                    <span className="mt-1 font-sans text-sm font-bold text-jse-principal">
                                        {formatMontant(ligne.total)}
                                    </span>
                                    <span className="mt-0.5 font-sans text-[10px] text-jse-texte/45">
                                        {formatMontant(ligne.prix_unitaire)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card title="Livraison" icon={Bike}>
                    <div className="mt-4 rounded-[22px] bg-jse-fond/70 p-4">
                        <div className="flex items-start gap-3">
                            <span className="flex size-12 shrink-0 items-center justify-center rounded-[16px] bg-jse-secondaire/10 text-jse-principal">
                                <MapPin size={23} />
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="font-sans text-xs font-bold text-jse-principal">
                                    {commande.adresse_livraison}
                                </p>
                                <p className="mt-1 font-sans text-xs leading-5 text-jse-texte/55">
                                    {commande.zone?.nom || "Zone non précisée"}
                                </p>
                                <p className="mt-1 font-sans text-xs text-jse-texte/55">
                                    {commande.telephone_livraison}
                                </p>
                            </div>
                            <div className="border-l border-jse-texte/10 pl-4 text-right">
                                <p className="font-sans text-sm font-bold text-jse-principal">
                                    {formatMontant(commande.frais_livraison)}
                                </p>
                                <p className="mt-1 font-sans text-[10px] text-jse-texte/45">
                                    Frais de livraison
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>

                {commande.pin_livraison && !["LIVREE", "ANNULEE"].includes(commande.statut?.code) && (
                    <section className="mt-4 overflow-hidden rounded-[28px] bg-jse-principal p-5 text-white shadow-sm sm:p-6">
                        <div className="flex items-start gap-4">
                            <div className="flex size-12 shrink-0 items-center justify-center rounded-[16px] bg-jse-accent text-jse-principal">
                                <KeyRound size={23} strokeWidth={2.1} />
                            </div>
                            <div className="min-w-0">
                                <p className="font-sans text-[9px] font-semibold uppercase tracking-[0.16em] text-white/45">
                                    Code de livraison
                                </p>
                                <h2 className="mt-1 font-against text-[1.65rem] leading-none text-white">
                                    Votre PIN
                                </h2>
                                <p className="mt-2 max-w-xl font-sans text-[10px] leading-5 text-white/55">
                                    Communiquez ce code uniquement au livreur lorsque votre commande vous est remise.
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 flex items-center justify-center rounded-[22px] border border-white/10 bg-white/[0.06] py-5">
                            <p className="font-sans text-3xl font-bold tracking-[0.38em] text-jse-accent">
                                {commande.pin_livraison}
                            </p>
                        </div>
                    </section>
                )}

                <Card title="Paiement" icon={CreditCard}>
                    {paiement ? (
                        <div className="mt-4 rounded-[22px] bg-jse-fond/70 p-4">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-jse-secondaire/10 px-3 py-2 font-sans text-[10px] font-semibold text-jse-secondaire">
                                        <Check size={13} />
                                        {libellePaiement(paiement.statut)}
                                    </span>
                                    <p className="mt-3 font-sans text-sm font-bold text-jse-principal">
                                        {paiement.moyen || "Paiement mobile"}
                                    </p>
                                    {paiement.reference_transaction && (
                                        <p className="mt-1 font-sans text-[10px] text-jse-texte/45">
                                            Réf. {paiement.reference_transaction}
                                        </p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="font-sans text-lg font-bold text-jse-principal">
                                        {formatMontant(paiement.montant)}
                                    </p>
                                    {paiement.date && (
                                        <p className="mt-1 font-sans text-[10px] text-jse-texte/45">
                                            Payé le {paiement.date}
                                            {paiement.heure
                                                ? " · " + paiement.heure
                                                : ""}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-4 rounded-[22px] bg-jse-fond/70 p-4">
                            <p className="font-sans text-sm font-semibold text-jse-principal">
                                Aucun paiement enregistré
                            </p>
                            <p className="mt-1 font-sans text-xs leading-5 text-jse-texte/50">
                                Le paiement de cette commande n’est pas encore
                                enregistré dans JSE Express.
                            </p>
                        </div>
                    )}
                </Card>

                <Card title="Résumé" icon={ClipboardList}>
                    <div className="mt-4 space-y-3 font-sans text-sm">
                        <div className="flex justify-between text-jse-texte/60">
                            <span>Sous-total</span>
                            <span>{formatMontant(commande.sous_total)}</span>
                        </div>
                        <div className="flex justify-between text-jse-texte/60">
                            <span>Frais de livraison</span>
                            <span>
                                {formatMontant(commande.frais_livraison)}
                            </span>
                        </div>
                        <div className="my-3 border-t border-jse-texte/10" />
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-jse-principal">
                                Total
                            </span>
                            <span className="font-against text-2xl text-jse-secondaire">
                                {formatMontant(commande.montant_total)}
                            </span>
                        </div>
                    </div>
                </Card>

                <Card title="Suivi de la commande" icon={Clock3}>
                    <div className="mt-6 overflow-x-auto pb-1 scrollbar-none">
                        <div className="min-w-[650px] px-1">
                            <div className="relative">
                                <div className="absolute left-[5%] right-[5%] top-3 h-[3px] rounded-full bg-jse-texte/10" />
                                {active > 0 && (
                                    <div
                                        className="absolute left-[5%] top-3 h-[3px] rounded-full bg-jse-secondaire"
                                        style={{
                                            width:
                                                (active / (etapes.length - 1)) *
                                                    90 +
                                                "%",
                                        }}
                                    />
                                )}

                                <div className="relative grid grid-cols-6">
                                    {etapes.map((etape, index) => {
                                        const atteint = index < active;
                                        const actuel = index === active;

                                        return (
                                            <div
                                                key={etape.code}
                                                className="flex min-w-0 flex-col items-center text-center"
                                            >
                                                <div className="relative flex h-7 items-center justify-center">
                                                    {actuel && (
                                                        <span className="absolute size-7 rounded-full border-2 border-jse-secondaire/25" />
                                                    )}
                                                    <span
                                                        className={[
                                                            "relative z-10 flex size-6 items-center justify-center rounded-full border-[2px] bg-white",
                                                            atteint || actuel
                                                                ? "border-jse-secondaire bg-jse-secondaire"
                                                                : "border-jse-texte/20",
                                                        ].join(" ")}
                                                    >
                                                        {atteint || actuel ? (
                                                            <Check
                                                                size={12}
                                                                strokeWidth={3}
                                                                className="text-white"
                                                            />
                                                        ) : (
                                                            <span className="size-2 rounded-full bg-jse-texte/20" />
                                                        )}
                                                    </span>
                                                </div>
                                                <p
                                                    className={[
                                                        "mt-2 max-w-[88px] font-sans text-[10px] font-semibold leading-3",
                                                        atteint || actuel
                                                            ? "text-jse-secondaire"
                                                            : "text-jse-texte/45",
                                                    ].join(" ")}
                                                >
                                                    {etape.label}
                                                </p>
                                                <p className="mt-1 font-sans text-[9px] text-jse-texte/45">
                                                    {formatHistorique(
                                                        commande,
                                                        etape.code,
                                                    )}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {commande.statut?.code === "LIVREE" && (
                    <button
                        type="button"
                        onClick={recommander}
                        className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-jse-accent px-5 font-sans text-sm font-semibold text-white shadow-lg shadow-jse-accent/20"
                    >
                        <RefreshCcw size={19} />
                        Commander à nouveau
                        <ChevronRight size={16} />
                    </button>
                )}
                    </div>
                </div>
            </div>
        </main>
    );
}

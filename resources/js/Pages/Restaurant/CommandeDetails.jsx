import { router, usePage } from "@inertiajs/react";
import { ArrowLeft, Bike, Check, ChevronRight, ClipboardList, CreditCard, MapPin, Package } from "lucide-react";

const transitions = {
    EN_ATTENTE: { code: "CONFIRMEE", label: "Confirmer la commande" },
    CONFIRMEE: { code: "EN_PREPARATION", label: "Démarrer la préparation" },
    EN_PREPARATION: { code: "PRETE", label: "Marquer la commande prête" },
};

const formatMontant = (value) =>
    new Intl.NumberFormat("fr-FR").format(Number(value || 0)) + " FCFA";

function Section({ title, icon: Icon, children }) {
    return (
        <section className="mt-4 rounded-[28px] bg-[#101215] p-5 shadow-sm ring-1 ring-white/10 sm:p-6">
            <div className="flex items-center gap-2">
                <Icon size={19} className="text-jse-secondaire" />
                <h2 className="font-against text-[1.45rem] leading-none text-white">{title}</h2>
            </div>
            {children}
        </section>
    );
}

export default function CommandeDetailsRestaurant() {
    const { restaurant, commande, flash = {} } = usePage().props;
    const action = transitions[commande?.statut?.code];

    const changerStatut = () => {
        if (!action) return;
        router.patch(`/restaurant/commandes/${commande.id}/statut`, { statut: action.code }, { preserveScroll: true });
    };

    return (
        <main className="min-h-screen bg-[#0b0d0f] pb-28 text-white">
            <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
                <header className="flex items-center justify-between py-5">
                    <button type="button" onClick={() => router.visit("/restaurant/tableau-de-bord")} className="flex size-11 items-center justify-center rounded-full bg-[#101215] text-white shadow-sm ring-1 ring-white/10" aria-label="Retour">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="text-center">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/35">{restaurant?.nom || "Restaurant"}</p>
                        <h1 className="mt-1 text-base font-bold text-white">#{commande?.reference}</h1>
                    </div>
                    <div className="flex size-11 items-center justify-center rounded-full bg-[#101215] text-white shadow-sm ring-1 ring-white/10"><ClipboardList size={19} /></div>
                </header>

                {flash?.success && <div className="rounded-2xl bg-jse-secondaire/10 px-4 py-3 text-xs font-semibold text-white">{flash.success}</div>}

                <section className="mt-2 rounded-[28px] bg-jse-principal p-5 text-white shadow-sm sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.16em] text-white/45">Commande reçue</p>
                            <h2 className="mt-2 font-against text-3xl leading-none">{commande?.client?.nom || "Client"}</h2>
                            <p className="mt-2 text-xs text-white/60">{commande?.date_commande} · {commande?.heure_commande}</p>
                        </div>
                        <span className="rounded-full bg-white/10 px-3 py-2 text-[10px] font-semibold">{commande?.statut?.libelle || "Inconnu"}</span>
                    </div>
                    {action && <button type="button" onClick={changerStatut} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-jse-secondaire text-xs font-semibold text-white transition hover:brightness-105"><Check size={17} />{action.label}</button>}
                </section>

                <Section title="Client" icon={ClipboardList}>
                    <div className="mt-4 rounded-[20px] bg-white/5 p-4">
                        <p className="text-sm font-bold text-white">{commande?.client?.nom || "Client"}</p>
                        <p className="mt-1 text-xs text-white/55">{commande?.client?.telephone}</p>
                        {commande?.client?.email && <p className="mt-1 text-xs text-white/55">{commande.client.email}</p>}
                    </div>
                </Section>

                <Section title="Articles" icon={Package}>
                    <div className="mt-4 divide-y divide-jse-texte/8">
                        {(commande?.lignes || []).map((ligne) => (
                            <div key={ligne.id} className="flex items-center gap-3 py-4 first:pt-0 last:pb-0">
                                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#0b0d0f] text-white"><Package size={18} /></div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold">{ligne.nom}</p>
                                    <p className="mt-1 text-[10px] text-white/45">{ligne.quantite} × {formatMontant(ligne.prix_unitaire)}</p>
                                    {ligne.options?.length > 0 && (
                                        <p className="mt-2 line-clamp-2 text-[10px] leading-4 text-jse-secondaire">
                                            {ligne.options.map((option) => option.nom).join(" · ")}
                                        </p>
                                    )}
                                </div>
                                <p className="text-sm font-bold text-white">{formatMontant(ligne.total)}</p>
                            </div>
                        ))}
                    </div>
                </Section>

                <Section title="Livraison" icon={Bike}>
                    <div className="mt-4 rounded-[20px] bg-[#0b0d0f] p-4">
                        <div className="flex gap-3">
                            <MapPin size={19} className="mt-0.5 shrink-0 text-jse-secondaire" />
                            <div>
                                <p className="text-sm font-semibold">{commande?.adresse_livraison}</p>
                                <p className="mt-1 text-xs text-white/50">{commande?.zone?.nom || "Zone non précisée"}</p>
                                <p className="mt-1 text-xs text-white/50">{commande?.telephone_livraison}</p>
                            </div>
                        </div>
                        {commande?.livraison?.livreur && (
                            <div className="mt-4 border-t border-jse-texte/8 pt-4">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">Livreur attribué</p>
                                <p className="mt-1 text-sm font-semibold">{commande.livraison.livreur.nom}</p>
                                <p className="mt-1 text-xs text-white/50">{commande.livraison.livreur.telephone}</p>
                            </div>
                        )}
                    </div>
                </Section>

                <Section title="Paiement" icon={CreditCard}>
                    <div className="mt-4 flex items-center justify-between rounded-[20px] bg-[#0b0d0f] p-4">
                        <div>
                            <p className="text-sm font-semibold">{commande?.paiement?.moyen || "Non enregistré"}</p>
                            <p className="mt-1 text-[10px] text-white/45">{commande?.paiement?.statut || "Aucun paiement"}</p>
                        </div>
                        <p className="text-lg font-bold text-white">{formatMontant(commande?.paiement?.montant ?? commande?.montant_total)}</p>
                    </div>
                </Section>

                <Section title="Total" icon={ClipboardList}>
                    <div className="mt-4 space-y-3 text-sm">
                        <div className="flex justify-between text-white/55"><span>Sous-total</span><span>{formatMontant(commande?.sous_total)}</span></div>
                        <div className="flex justify-between text-white/55"><span>Livraison</span><span>{formatMontant(commande?.frais_livraison)}</span></div>
                        <div className="border-t border-jse-texte/10 pt-3"><div className="flex items-center justify-between"><span className="font-bold">Total</span><span className="font-against text-2xl text-jse-secondaire">{formatMontant(commande?.montant_total)}</span></div></div>
                    </div>
                </Section>

                <Section title="Historique" icon={ClipboardList}>
                    <div className="mt-4 space-y-3">
                        {(commande?.historique || []).map((item, index) => (
                            <div key={index} className="flex gap-3">
                                <span className="mt-1 size-2 shrink-0 rounded-full bg-jse-secondaire" />
                                <div>
                                    <p className="text-xs font-semibold">{item.libelle}</p>
                                    <p className="mt-1 text-[10px] text-white/45">{item.date} · {item.heure}{item.commentaire ? ` · ${item.commentaire}` : ""}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Section>

                <button type="button" onClick={() => router.visit("/restaurant/tableau-de-bord")} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#101215] text-xs font-semibold text-white shadow-sm ring-1 ring-white/10">
                    Retour aux commandes <ChevronRight size={16} />
                </button>
            </div>
        </main>
    );
}

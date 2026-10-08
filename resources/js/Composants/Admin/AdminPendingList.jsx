import { Ban, ClipboardList } from "lucide-react";
import AdminBadge from "./AdminBadge";
import AdminButton from "./AdminButton";
import AdminCard from "./AdminCard";
import { champAdmin } from "./AdminField";

const formaterMontant = (montant) => new Intl.NumberFormat("fr-FR").format(Number(montant || 0)) + " FCFA";

/**
 * Commandes encore en traitement par les restaurants, avec annulation motivée.
 */
export default function AdminPendingList({ commandes = [], motifs = {}, traitement = null, onMotifChange, onAnnuler }) {
    return (
        <AdminCard id="commandes" className="p-5 sm:p-6" aria-labelledby="titre-commandes-surveiller">
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-jse-accent/15 text-jse-theme-heading">
                        <ClipboardList size={18} aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                        <h2 id="titre-commandes-surveiller" className="text-base font-semibold text-jse-theme-heading">
                            Commandes à surveiller
                        </h2>
                        <p className="text-sm text-jse-theme-muted">En attente ou en cours de traitement par le restaurant.</p>
                    </div>
                </div>
                <span className="shrink-0 rounded-full bg-jse-accent/15 px-3 py-1 text-sm font-semibold tabular-nums text-jse-theme-heading">
                    {commandes.length}
                </span>
            </div>

            {commandes.length === 0 ? (
                <div className="mt-6 flex min-h-48 items-center justify-center rounded-2xl border border-dashed border-jse-theme-border px-5 text-center text-sm text-jse-theme-muted">
                    Aucune commande en attente de traitement.
                </div>
            ) : (
                <ul className="mt-5 space-y-3">
                    {commandes.map((commande) => {
                        const motif = (motifs[commande.id] || "").trim();
                        const identifiant = "annulation-" + commande.id;
                        const reference = commande.reference || "Commande #" + commande.id;

                        return (
                            <li key={commande.id} className="rounded-2xl border border-jse-theme-border bg-jse-theme-surface-soft p-4">
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="break-words text-sm font-semibold text-jse-theme-text">{reference}</p>
                                        <p className="mt-0.5 break-words text-sm text-jse-theme-muted">
                                            {commande.restaurant || "Restaurant"} · {commande.client || "Client"}
                                        </p>
                                    </div>
                                    <AdminBadge
                                        statut={commande.statut?.code}
                                        libelle={commande.statut?.libelle}
                                    />
                                </div>

                                <p className="mt-2 text-sm text-jse-theme-muted">
                                    {commande.zone || "Zone non définie"} ·{" "}
                                    <span className="font-semibold tabular-nums text-jse-theme-text">{formaterMontant(commande.montant_total)}</span>
                                </p>

                                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                                    <input
                                        value={motifs[commande.id] || ""}
                                        onChange={(evenement) => onMotifChange(commande.id, evenement.target.value)}
                                        aria-label={"Motif d'annulation de " + reference}
                                        placeholder="Motif d'annulation"
                                        className={champAdmin + " flex-1"}
                                    />
                                    <AdminButton
                                        variante="dangerDoux"
                                        disabled={!motif}
                                        chargement={traitement === identifiant}
                                        onClick={() => onAnnuler(commande)}
                                    >
                                        <Ban size={15} aria-hidden="true" />
                                        Annuler
                                    </AdminButton>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </AdminCard>
    );
}

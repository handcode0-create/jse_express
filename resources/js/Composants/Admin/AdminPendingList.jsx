import React from "react";
import { AlertTriangle, Clock3 } from "lucide-react";

export default function AdminPendingList({ commandes, motifs, traitement, onMotifChange, onAnnuler }) {
    return (
        <article id="commandes" className="rounded-jse-xl border border-jse-theme-border bg-jse-theme-surface p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-base font-semibold text-jse-theme-text">Commandes à surveiller</h2>
                    <p className="mt-2 text-xs text-jse-theme-muted">Commandes encore en traitement par les restaurants.</p>
                </div>
                <span className="rounded-full bg-jse-accent/10 px-3 py-1.5 text-xs font-semibold text-jse-accent">{commandes.length}</span>
            </div>
            <div className="mt-5 space-y-3">
                {commandes.length === 0 ? (
                    <div className="flex min-h-48 items-center justify-center rounded-jse-moyen border border-dashed border-jse-theme-border px-5 text-center text-xs text-jse-theme-muted">
                        Aucune commande en attente de traitement.
                    </div>
                ) : commandes.map((commande) => {
                    const motif = (motifs[commande.id] || "").trim();
                    const identifiant = "annulation-" + commande.id;
                    return (
                        <div key={commande.id} className="rounded-jse-moyen border border-jse-theme-border bg-jse-theme-surface-soft p-4">
                            <div className="flex items-start gap-3">
                                <span className="flex size-9 shrink-0 items-center justify-center rounded-jse-moyen bg-jse-accent/10 text-jse-accent"><Clock3 size={15} aria-hidden="true" /></span>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="min-w-0">
                                            <p className="truncate text-xs font-semibold text-jse-theme-text">{commande.reference || "Commande #" + commande.id}</p>
                                            <p className="mt-1 truncate text-xs text-jse-theme-muted">{commande.restaurant || "Restaurant"} · {commande.client || "Client"}</p>
                                        </div>
                                        <span className="w-fit rounded-full bg-jse-accent/10 px-3 py-1 text-xs font-medium text-jse-accent">{commande.statut?.libelle || commande.statut?.code || "En traitement"}</span>
                                    </div>
                                    <p className="mt-2 text-xs text-jse-theme-muted">{commande.zone || "Zone non définie"} · {new Intl.NumberFormat("fr-FR").format(Number(commande.montant_total || 0))} FCFA</p>
                                    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                                        <input value={motifs[commande.id] || ""} onChange={(event) => onMotifChange(commande.id, event.target.value)} placeholder="Motif d'annulation" className="min-h-11 min-w-0 flex-1 rounded-full border border-jse-theme-border bg-jse-theme-surface px-4 text-xs text-jse-theme-text outline-none placeholder:text-jse-theme-muted focus:border-jse-secondaire" />
                                        <button type="button" disabled={!motif || traitement === identifiant} onClick={() => onAnnuler(commande)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-jse-danger px-4 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40">
                                            <AlertTriangle size={13} aria-hidden="true" />
                                            {traitement === identifiant ? "..." : "Annuler"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </article>
    );
}

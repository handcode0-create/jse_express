import React from "react";
import { AlertTriangle, Clock3, PackageCheck, RefreshCw, Truck } from "lucide-react";

export default function AdminDeliveryTable({ livraisons, livreurs, selection, motifs, traitement, onSelectionChange, onMotifChange, onReattribuer }) {
    const statut = (code) => {
        if (code === "en_cours") return { label: "En cours", icon: PackageCheck, classe: "bg-jse-secondaire/10 text-jse-secondaire" };
        if (code === "attribuee") return { label: "Attribuée", icon: Truck, classe: "bg-jse-accent/10 text-jse-accent" };
        return { label: "En attente", icon: Clock3, classe: "bg-jse-texte/6 text-jse-theme-muted" };
    };

    const renderControls = (livraison) => {
        const candidats = livreurs.filter((livreur) => livreur.zone_id === livraison.zone_id);
        return (
            <div className="flex flex-col gap-2 sm:flex-row">
                <select aria-label={"Livreur pour " + (livraison.reference || livraison.id)} value={selection[livraison.id] || ""} onChange={(event) => onSelectionChange(livraison.id, event.target.value)} className="min-h-11 min-w-0 flex-1 rounded-full border border-jse-theme-border bg-jse-theme-surface-soft px-4 text-xs text-jse-theme-text outline-none focus:border-jse-secondaire">
                    <option value="">Choisir un livreur</option>
                    {candidats.map((livreur) => <option key={livreur.id} value={livreur.id}>{livreur.nom} — {livreur.disponibilite || "indisponible"}</option>)}
                </select>
                <input aria-label={"Motif pour " + (livraison.reference || livraison.id)} value={motifs[livraison.id] || ""} onChange={(event) => onMotifChange(livraison.id, event.target.value)} placeholder="Motif de réattribution" className="min-h-11 min-w-0 flex-1 rounded-full border border-jse-theme-border bg-jse-theme-surface-soft px-4 text-xs text-jse-theme-text outline-none placeholder:text-jse-theme-muted focus:border-jse-secondaire" />
                <button type="button" disabled={!selection[livraison.id] || !motifs[livraison.id]?.trim() || traitement === livraison.id} onClick={() => onReattribuer(livraison.id)} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-jse-secondaire px-4 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40">
                    <RefreshCw size={13} className={traitement === livraison.id ? "animate-spin" : ""} aria-hidden="true" />Réattribuer
                </button>
            </div>
        );
    };

    return (
        <article id="livraisons" className="rounded-jse-xl border border-jse-theme-border bg-jse-theme-surface p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="flex size-9 items-center justify-center rounded-jse-moyen bg-jse-secondaire/10 text-jse-secondaire"><Truck size={17} aria-hidden="true" /></span>
                        <h2 className="text-base font-semibold text-jse-theme-text">Livraisons actives</h2>
                    </div>
                    <p className="mt-2 text-xs text-jse-theme-muted">Suivi opérationnel et réattribution manuelle par zone.</p>
                </div>
                <span className="text-xs text-jse-theme-muted">{livraisons.length} livraison(s)</span>
            </div>
            {livraisons.length === 0 ? (
                <div className="mt-5 rounded-jse-moyen border border-dashed border-jse-theme-border p-10 text-center text-xs text-jse-theme-muted">Aucune livraison active.</div>
            ) : (
                <>
                    <div className="mt-5 hidden lg:block">
                        <div className="grid grid-cols-5 gap-4 border-b border-jse-theme-border px-3 pb-3 text-xs font-semibold uppercase tracking-[0.14em] text-jse-theme-muted">
                            <span>Commande</span><span>Statut</span><span>Livreur actuel</span><span className="col-span-2">Réattribution</span>
                        </div>
                        <div className="divide-y divide-jse-theme-border">
                            {livraisons.map((livraison) => {
                                const state = statut(livraison.statut);
                                const Icon = state.icon;
                                return (
                                    <div key={livraison.id} className="grid grid-cols-5 items-center gap-4 px-3 py-4">
                                        <div className="min-w-0">
                                            <p className="truncate text-xs font-semibold text-jse-theme-text">{livraison.reference || "Livraison #" + livraison.id}</p>
                                            <p className="mt-1 truncate text-xs text-jse-theme-muted">Zone : {livraison.zone || "Non définie"}</p>
                                        </div>
                                        <span className={"inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium " + state.classe}><Icon size={13} aria-hidden="true" />{state.label}</span>
                                        <div className="min-w-0">
                                            <p className="truncate text-xs font-medium text-jse-theme-text">{livraison.livreur || "Non attribué"}</p>
                                            <p className="mt-1 text-xs text-jse-theme-muted">Zone opérationnelle</p>
                                        </div>
                                        <div className="col-span-2">{renderControls(livraison)}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="mt-5 space-y-3 lg:hidden">
                        {livraisons.map((livraison) => {
                            const state = statut(livraison.statut);
                            const Icon = state.icon;
                            const candidats = livreurs.filter((livreur) => livreur.zone_id === livraison.zone_id);
                            return (
                                <div key={livraison.id} className="rounded-jse-moyen border border-jse-theme-border bg-jse-theme-surface-soft p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="truncate text-xs font-semibold text-jse-theme-text">{livraison.reference || "Livraison #" + livraison.id}</p>
                                            <p className="mt-1 text-xs text-jse-theme-muted">Zone : {livraison.zone || "Non définie"}</p>
                                        </div>
                                        <span className={"inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium " + state.classe}><Icon size={13} aria-hidden="true" />{state.label}</span>
                                    </div>
                                    <div className="mt-4 rounded-jse-moyen border border-jse-theme-border bg-jse-theme-surface p-3">
                                        <p className="text-xs uppercase tracking-[0.14em] text-jse-theme-muted">Livreur actuel</p>
                                        <p className="mt-1 text-xs font-medium text-jse-theme-text">{livraison.livreur || "Non attribué"}</p>
                                    </div>
                                    <div className="mt-3">{renderControls(livraison)}</div>
                                    {candidats.length === 0 && (
                                        <div className="mt-3 flex items-center gap-2 rounded-jse-moyen bg-jse-accent/10 px-3 py-2 text-xs text-jse-accent">
                                            <AlertTriangle size={13} aria-hidden="true" />Aucun livreur actif disponible dans cette zone.
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </article>
    );
}

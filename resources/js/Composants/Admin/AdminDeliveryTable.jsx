import { AlertTriangle, RefreshCw, Truck } from "lucide-react";
import AdminBadge from "./AdminBadge";
import AdminButton from "./AdminButton";
import AdminCard from "./AdminCard";
import { champAdmin } from "./AdminField";

/**
 * Livraisons actives et réattribution manuelle d'un livreur de la même zone.
 */
export default function AdminDeliveryTable({
    livraisons = [],
    livreurs = [],
    selection = {},
    motifs = {},
    traitement = null,
    onSelectionChange,
    onMotifChange,
    onReattribuer,
}) {
    const nomLivraison = (livraison) => livraison.reference || "Livraison #" + livraison.id;
    const candidatsDe = (livraison) => livreurs.filter((livreur) => livreur.zone_id === livraison.zone_id);

    const controles = (livraison) => (
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap">
            <select
                aria-label={"Livreur pour " + nomLivraison(livraison)}
                value={selection[livraison.id] || ""}
                onChange={(evenement) => onSelectionChange(livraison.id, evenement.target.value)}
                className={champAdmin + " flex-1"}
            >
                <option value="">Choisir un livreur</option>
                {candidatsDe(livraison).map((livreur) => (
                    <option key={livreur.id} value={livreur.id}>
                        {livreur.nom} — {livreur.disponibilite || "indisponible"}
                    </option>
                ))}
            </select>
            <input
                aria-label={"Motif pour " + nomLivraison(livraison)}
                value={motifs[livraison.id] || ""}
                onChange={(evenement) => onMotifChange(livraison.id, evenement.target.value)}
                placeholder="Motif de réattribution"
                className={champAdmin + " flex-1"}
            />
            <AdminButton
                disabled={!selection[livraison.id] || !motifs[livraison.id]?.trim()}
                chargement={traitement === livraison.id}
                onClick={() => onReattribuer(livraison.id)}
            >
                <RefreshCw size={15} aria-hidden="true" />
                Réattribuer
            </AdminButton>
        </div>
    );

    return (
        <AdminCard id="livraisons" className="p-5 sm:p-6" aria-labelledby="titre-livraisons-actives">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-jse-secondaire/15 text-jse-theme-heading">
                        <Truck size={18} aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                        <h2 id="titre-livraisons-actives" className="text-base font-semibold text-jse-theme-heading">
                            Livraisons actives
                        </h2>
                        <p className="text-sm text-jse-theme-muted">Suivi opérationnel et réattribution manuelle par zone.</p>
                    </div>
                </div>
                <span className="text-sm text-jse-theme-muted">
                    <span className="font-semibold tabular-nums text-jse-theme-text">{livraisons.length}</span> livraison(s)
                </span>
            </div>

            {livraisons.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-jse-theme-border p-10 text-center text-sm text-jse-theme-muted">
                    Aucune livraison active.
                </div>
            ) : (
                <ul className="mt-5 divide-y divide-jse-theme-border">
                    {livraisons.map((livraison) => (
                        <li key={livraison.id} className="py-4 first:pt-0 last:pb-0">
                            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,2.2fr)] lg:items-center">
                                <div className="flex min-w-0 items-start justify-between gap-3 lg:block">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-jse-theme-text">{nomLivraison(livraison)}</p>
                                        <p className="mt-0.5 truncate text-sm text-jse-theme-muted">Zone : {livraison.zone || "Non définie"}</p>
                                    </div>
                                    <AdminBadge statut={livraison.statut} className="lg:mt-2" />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-jse-theme-muted">Livreur actuel</p>
                                    <p className="mt-1 truncate text-sm font-medium text-jse-theme-text">{livraison.livreur || "Non attribué"}</p>
                                </div>

                                <div className="min-w-0">
                                    {controles(livraison)}
                                    {candidatsDe(livraison).length === 0 && (
                                        <p className="mt-2 flex items-center gap-2 rounded-xl bg-jse-accent/10 px-3 py-2 text-sm text-jse-theme-heading">
                                            <AlertTriangle size={15} className="shrink-0 text-jse-accent" aria-hidden="true" />
                                            Aucun livreur actif disponible dans cette zone.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </AdminCard>
    );
}

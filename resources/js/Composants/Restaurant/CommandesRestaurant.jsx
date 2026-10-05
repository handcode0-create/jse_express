import { useMemo, useState } from "react";
import { Link } from "@inertiajs/react";
import { ChevronRight, ClipboardList } from "lucide-react";
import AdminBadge from "../Admin/AdminBadge";
import AdminButton from "../Admin/AdminButton";
import AdminCard from "../Admin/AdminCard";
import { filtresCommandes, initiales, montant, statutSuivant } from "../../lib/restaurant";

function CommandeLigne({ commande, enCours, onAvancer }) {
    const action = statutSuivant[commande.statut?.code];
    const client = commande.client?.nom || "Client";

    return (
        <li className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4">
            <Link
                href={`/restaurant/commandes/${commande.id}`}
                className="group flex min-w-0 flex-1 items-center gap-3 rounded-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-jse-secondaire/30"
            >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-jse-principal/10 text-sm font-bold text-jse-theme-heading">
                    {initiales(client)}
                </span>
                <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-jse-theme-text">
                        {commande.reference} · {client}
                    </span>
                    <span className="mt-0.5 block truncate text-sm text-jse-theme-muted">
                        {commande.nombre_articles} article{commande.nombre_articles > 1 ? "s" : ""} · {commande.date} à {commande.heure}
                    </span>
                </span>
                <ChevronRight size={18} className="shrink-0 text-jse-theme-muted transition group-hover:translate-x-0.5 sm:hidden" aria-hidden="true" />
            </Link>

            <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
                <AdminBadge statut={commande.statut?.code} libelle={commande.statut?.libelle} />
                <span className="text-sm font-semibold tabular-nums text-jse-theme-text">{montant(commande.montant_total)}</span>
                {action && (
                    <AdminButton taille="petit" chargement={enCours} onClick={() => onAvancer(commande, action.code)}>
                        {action.label}
                    </AdminButton>
                )}
            </div>
        </li>
    );
}

/**
 * Liste des commandes du restaurant, filtrable selon qui doit agir (restaurant, livreur, terminées).
 *
 * @param {{ commandes: Array, traitement?: number|null, onAvancer: (commande: object, statut: string) => void, filtreInitial?: string, limite?: number|null, filtres?: boolean }} props
 */
export default function CommandesRestaurant({ commandes = [], traitement = null, onAvancer, filtreInitial = "toutes", limite = null, filtres = true }) {
    const [filtre, setFiltre] = useState(filtreInitial);

    const compteurs = useMemo(
        () =>
            Object.fromEntries(
                filtresCommandes.map(({ id, codes }) => [id, codes ? commandes.filter((commande) => codes.includes(commande.statut?.code)).length : commandes.length]),
            ),
        [commandes],
    );

    const visibles = useMemo(() => {
        const codes = filtresCommandes.find((item) => item.id === filtre)?.codes;
        const liste = codes ? commandes.filter((commande) => codes.includes(commande.statut?.code)) : commandes;

        return limite ? liste.slice(0, limite) : liste;
    }, [commandes, filtre, limite]);

    return (
        <div>
            {filtres && (
                <div className="mb-4 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filtrer les commandes">
                    {filtresCommandes.map(({ id, label }) => {
                        const actif = filtre === id;

                        return (
                            <button
                                key={id}
                                type="button"
                                onClick={() => setFiltre(id)}
                                aria-pressed={actif}
                                className={[
                                    "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium transition",
                                    actif
                                        ? "border-jse-principal bg-jse-principal text-white"
                                        : "border-jse-theme-border bg-jse-theme-surface text-jse-theme-text hover:bg-jse-theme-surface-soft",
                                ].join(" ")}
                            >
                                {label}
                                <span className={["text-xs font-semibold tabular-nums", actif ? "text-white/80" : "text-jse-theme-muted"].join(" ")}>{compteurs[id]}</span>
                            </button>
                        );
                    })}
                </div>
            )}

            <AdminCard className="overflow-hidden">
                {visibles.length === 0 ? (
                    <div className="flex min-h-44 flex-col items-center justify-center gap-3 p-8 text-center">
                        <span className="flex size-12 items-center justify-center rounded-2xl bg-jse-theme-surface-soft text-jse-theme-muted">
                            <ClipboardList size={22} aria-hidden="true" />
                        </span>
                        <p className="text-sm font-semibold text-jse-theme-text">Aucune commande ici</p>
                        <p className="max-w-xs text-sm text-jse-theme-muted">
                            {commandes.length === 0 ? "Les nouvelles commandes apparaîtront ici dès qu'un client en passera une." : "Aucune commande ne correspond à ce filtre."}
                        </p>
                    </div>
                ) : (
                    <ul className="divide-y divide-jse-theme-border">
                        {visibles.map((commande) => (
                            <CommandeLigne key={commande.id} commande={commande} enCours={traitement === commande.id} onAvancer={onAvancer} />
                        ))}
                    </ul>
                )}
            </AdminCard>
        </div>
    );
}

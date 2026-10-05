import { Link } from "@inertiajs/react";
import { ArrowRight, Bike } from "lucide-react";
import AdminBadge from "./AdminBadge";
import AdminCard from "./AdminCard";
import { initiales } from "../../lib/format";

/** Disponibilité des livreurs actifs, avec leur zone : vue d'ensemble pour la réattribution. */
export default function PanneauLivreurs({ livreurs = [] }) {
    const enLigne = livreurs.filter((livreur) => livreur.disponibilite === "disponible").length;
    const tries = [...livreurs].sort((a, b) => Number(b.disponibilite === "disponible") - Number(a.disponibilite === "disponible"));

    return (
        <AdminCard className="p-5 sm:p-6" aria-labelledby="titre-livreurs">
            <div className="flex items-end justify-between gap-3">
                <div className="min-w-0">
                    <h2 id="titre-livreurs" className="font-against text-3xl leading-none text-jse-theme-heading">
                        Vos livreurs
                    </h2>
                    <p className="mt-2 text-sm text-jse-theme-muted">
                        <span className="font-semibold tabular-nums text-jse-theme-text">{enLigne}</span> en ligne sur <span className="font-semibold tabular-nums text-jse-theme-text">{livreurs.length}</span>
                    </p>
                </div>
                <Link href="/administration/livreurs" className="inline-flex min-h-10 shrink-0 items-center gap-1 whitespace-nowrap text-sm font-semibold text-jse-theme-heading hover:underline">
                    Gérer
                    <ArrowRight size={15} aria-hidden="true" />
                </Link>
            </div>

            {livreurs.length === 0 ? (
                <div className="mt-6 flex min-h-40 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-jse-theme-border p-6 text-center">
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-jse-theme-surface-soft text-jse-theme-muted">
                        <Bike size={22} aria-hidden="true" />
                    </span>
                    <p className="text-sm text-jse-theme-muted">Aucun livreur actif.</p>
                </div>
            ) : (
                <ul className="mt-5 divide-y divide-jse-theme-border">
                    {tries.slice(0, 6).map((livreur) => (
                        <li key={livreur.id} className="flex items-center gap-3 py-3">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-jse-principal/10 text-sm font-bold text-jse-theme-heading">{initiales(livreur.nom)}</span>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-jse-theme-text">{livreur.nom}</p>
                                <p className="truncate text-sm text-jse-theme-muted">{livreur.zone ? `Zone ${livreur.zone}` : "Sans zone"}</p>
                            </div>
                            <AdminBadge statut={livreur.disponibilite} />
                        </li>
                    ))}
                </ul>
            )}
        </AdminCard>
    );
}

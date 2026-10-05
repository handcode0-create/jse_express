import { BarChart3 } from "lucide-react";
import AdminCard from "./AdminCard";

/**
 * Activité des sept derniers jours : commandes reçues et livrées.
 *
 * @param {{ serie?: Array<{ date: string, label: string, recues?: number, livrees?: number }> }} props
 */
export default function AdminStatistics({ serie = [] }) {
    const maximum = Math.max(...serie.map((point) => Math.max(point.recues || 0, point.livrees || 0)), 1);
    const totalRecues = serie.reduce((somme, point) => somme + (point.recues || 0), 0);
    const totalLivrees = serie.reduce((somme, point) => somme + (point.livrees || 0), 0);

    const hauteur = (valeur) => Math.max((valeur / maximum) * 100, valeur ? 8 : 2) + "%";

    return (
        <AdminCard className="p-5 sm:p-6" aria-labelledby="titre-activite">
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-jse-secondaire/15 text-jse-theme-heading">
                        <BarChart3 size={18} aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                        <h2 id="titre-activite" className="text-base font-semibold text-jse-theme-heading">
                            Activité des commandes
                        </h2>
                        <p className="text-sm text-jse-theme-muted">7 derniers jours</p>
                    </div>
                </div>
            </div>

            {serie.length === 0 ? (
                <div className="mt-6 flex min-h-48 items-center justify-center rounded-2xl border border-dashed border-jse-theme-border px-4 text-center text-sm text-jse-theme-muted">
                    Aucune donnée disponible pour cette période.
                </div>
            ) : (
                <div className="jse-admin-chart mt-6 flex items-end gap-2 sm:gap-3" role="img" aria-label={`Commandes reçues : ${totalRecues}. Commandes livrées : ${totalLivrees}.`}>
                    {serie.map((point) => (
                        <div key={point.date} className="min-w-0 flex-1" title={`${point.label} : ${point.recues || 0} reçues, ${point.livrees || 0} livrées`}>
                            <div className="flex h-36 items-end justify-center gap-1 sm:h-44">
                                <div className="w-full max-w-4 rounded-t-lg bg-jse-theme-heading" style={{ height: hauteur(point.recues || 0) }} />
                                <div className="w-full max-w-4 rounded-t-lg bg-jse-secondaire" style={{ height: hauteur(point.livrees || 0) }} />
                            </div>
                            <p className="mt-2 truncate text-center text-xs text-jse-theme-muted">{point.label}</p>
                        </div>
                    ))}
                </div>
            )}

            <dl className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-jse-theme-surface-soft p-4">
                    <dt className="flex items-center gap-2 text-sm text-jse-theme-muted">
                        <span className="size-2.5 rounded-full bg-jse-theme-heading" aria-hidden="true" />
                        Reçues
                    </dt>
                    <dd className="mt-1 text-2xl font-semibold tabular-nums text-jse-theme-heading">{totalRecues}</dd>
                </div>
                <div className="rounded-2xl bg-jse-theme-surface-soft p-4">
                    <dt className="flex items-center gap-2 text-sm text-jse-theme-muted">
                        <span className="size-2.5 rounded-full bg-jse-secondaire" aria-hidden="true" />
                        Livrées
                    </dt>
                    <dd className="mt-1 text-2xl font-semibold tabular-nums text-jse-theme-heading">{totalLivrees}</dd>
                </div>
            </dl>
        </AdminCard>
    );
}

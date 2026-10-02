import React from "react";
import { BarChart3, CheckCircle2, ShoppingBag } from "lucide-react";

export default function AdminStatistics({ statistiques, serie = [] }) {
    const maximum = Math.max(...serie.map((point) => Math.max(point.recues || 0, point.livrees || 0)), 1);

    return (
        <article className="rounded-jse-xl border border-jse-theme-border bg-jse-theme-surface p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="flex size-9 items-center justify-center rounded-jse-moyen bg-jse-secondaire/10 text-jse-secondaire">
                            <BarChart3 size={17} aria-hidden="true" />
                        </span>
                        <h2 className="text-base font-semibold text-jse-theme-text">Activité des commandes</h2>
                    </div>
                    <p className="mt-2 text-xs text-jse-theme-muted">Commandes reçues et livrées sur les sept derniers jours.</p>
                </div>
                <span className="rounded-full border border-jse-theme-border px-3 py-1.5 text-xs font-medium text-jse-theme-muted">7 jours</span>
            </div>
            {serie.length === 0 ? (
                <div className="mt-6 flex min-h-48 items-center justify-center rounded-jse-moyen border border-dashed border-jse-theme-border text-xs text-jse-theme-muted">
                    Aucune donnée disponible pour cette période.
                </div>
            ) : (
                <div className="mt-6 flex items-end gap-3 overflow-hidden">
                    {serie.map((point) => (
                        <div key={point.date} className="min-w-0 flex-1">
                            <div className="flex h-40 items-end justify-center gap-1.5">
                                <div className="w-full max-w-3 rounded-t-jse-petit bg-jse-principal" style={{ height: Math.max((point.recues / maximum) * 100, point.recues ? 8 : 2) + "%" }} />
                                <div className="w-full max-w-3 rounded-t-jse-petit bg-jse-secondaire" style={{ height: Math.max((point.livrees / maximum) * 100, point.livrees ? 8 : 2) + "%" }} />
                            </div>
                            <p className="mt-2 truncate text-center text-xs text-jse-theme-muted">{point.label}</p>
                        </div>
                    ))}
                </div>
            )}
            <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-jse-theme-muted">
                <span className="inline-flex items-center gap-2"><span className="size-2 rounded-full bg-jse-principal" /><ShoppingBag size={12} aria-hidden="true" />Reçues</span>
                <span className="inline-flex items-center gap-2"><span className="size-2 rounded-full bg-jse-secondaire" /><CheckCircle2 size={12} aria-hidden="true" />Livrées</span>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-jse-moyen border border-jse-theme-border bg-jse-theme-surface-soft p-3">
                    <p className="text-xs text-jse-theme-muted">Actives</p>
                    <p className="mt-1 text-lg font-semibold text-jse-theme-text">{statistiques.commandes_actives ?? 0}</p>
                </div>
                <div className="rounded-jse-moyen border border-jse-theme-border bg-jse-theme-surface-soft p-3">
                    <p className="text-xs text-jse-theme-muted">Livrées</p>
                    <p className="mt-1 text-lg font-semibold text-jse-theme-text">{statistiques.commandes_livrees ?? 0}</p>
                </div>
            </div>
        </article>
    );
}

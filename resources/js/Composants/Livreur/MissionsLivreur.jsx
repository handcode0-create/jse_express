import { Bike, Check, ChevronRight, MapPin, Power, Store } from "lucide-react";
import AdminBadge from "../Admin/AdminBadge";
import AdminCard from "../Admin/AdminCard";
import { montant } from "../../lib/format";

/**
 * Interrupteur « en ligne / hors ligne ». Hors ligne, l'attribution automatique ne propose plus de mission.
 */
export function DisponibiliteLivreur({ livreur, enCours, onBasculer }) {
    const disponible = livreur?.disponibilite === "disponible";

    return (
        <AdminCard className="flex items-center justify-between gap-4 p-4 sm:p-5">
            <div className="min-w-0">
                <p className="text-sm font-semibold text-jse-theme-text">{disponible ? "Vous êtes en ligne" : "Vous êtes hors ligne"}</p>
                <p className="mt-0.5 text-sm text-jse-theme-muted">
                    {disponible ? "De nouvelles missions peuvent vous être attribuées." : "Passez en ligne pour recevoir des missions."}
                </p>
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={disponible}
                aria-label="Disponibilité pour les livraisons"
                disabled={enCours}
                onClick={onBasculer}
                className="group flex shrink-0 items-center gap-2 rounded-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-jse-secondaire/30 disabled:opacity-60"
            >
                <span className={["relative h-8 w-14 rounded-full transition", disponible ? "bg-jse-secondaire" : "bg-jse-theme-muted/40"].join(" ")}>
                    <span className={["absolute top-1 flex size-6 items-center justify-center rounded-full bg-white text-jse-principal shadow transition-all", disponible ? "left-7" : "left-1"].join(" ")}>
                        <Power size={13} aria-hidden="true" />
                    </span>
                </span>
            </button>
        </AdminCard>
    );
}

const libellesLivraison = { en_attente: "Nouvelle mission", attribuee: "Nouvelle mission", en_cours: "En livraison" };

/** Carte d'une mission active : restaurant, zone, montant, statut et accès au détail. */
export function MissionCarte({ mission, onOuvrir }) {
    const statut = mission.statut_livraison;

    return (
        <li>
            <button
                type="button"
                onClick={() => onOuvrir(mission)}
                className="jse-admin-card group flex w-full items-center gap-3 rounded-3xl border border-jse-theme-border bg-jse-theme-surface p-3 text-left shadow-jse-carte transition hover:-translate-y-0.5 hover:border-jse-secondaire/40 hover:shadow-jse-elevated focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-jse-secondaire/30 sm:p-4"
            >
                <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-jse-principal/10 text-jse-theme-heading">
                    {mission.articles?.[0]?.image ? <img src={mission.articles[0].image} alt="" loading="lazy" className="size-full object-cover" /> : <Store size={24} aria-hidden="true" />}
                </span>

                <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                        <span className="min-w-0">
                            <span className="block text-xs font-medium uppercase tracking-[0.1em] text-jse-theme-muted">#{mission.reference}</span>
                            <span className="mt-0.5 block truncate text-base font-semibold text-jse-theme-text">{mission.restaurant?.nom || "Restaurant"}</span>
                        </span>
                        <AdminBadge ton={statut === "en_cours" ? "principal" : "attention"} libelle={libellesLivraison[statut] || "Mission"} />
                    </span>
                    <span className="mt-1.5 flex items-center gap-1.5 text-sm text-jse-theme-muted">
                        <MapPin size={14} className="shrink-0 text-jse-accent" aria-hidden="true" />
                        <span className="truncate">{mission.adresse_livraison || mission.zone || "Zone non définie"}</span>
                    </span>
                    <span className="mt-1 flex items-center justify-between gap-2 text-sm">
                        <span className="font-semibold tabular-nums text-jse-theme-heading">{montant(mission.montant_total)}</span>
                        <span className="flex items-center gap-1 font-semibold text-jse-theme-heading">
                            Ouvrir
                            <ChevronRight size={15} className="transition group-hover:translate-x-0.5" aria-hidden="true" />
                        </span>
                    </span>
                </span>
            </button>
        </li>
    );
}

/** Liste de missions, ou message d'attente adapté à l'état du livreur. */
export function ListeMissions({ missions, disponible, onOuvrir }) {
    if (missions.length === 0) {
        return (
            <AdminCard className="flex min-h-48 flex-col items-center justify-center gap-3 p-8 text-center">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-jse-theme-surface-soft text-jse-theme-muted">
                    <Bike size={22} aria-hidden="true" />
                </span>
                <p className="text-sm font-semibold text-jse-theme-text">Aucune mission en cours</p>
                <p className="max-w-xs text-sm text-jse-theme-muted">
                    {disponible ? "Les missions qui vous sont attribuées apparaîtront ici." : "Vous êtes hors ligne : passez en ligne pour recevoir des missions."}
                </p>
            </AdminCard>
        );
    }

    return (
        <ul className="grid gap-3 lg:grid-cols-2">
            {missions.map((mission) => (
                <MissionCarte key={mission.attribution_id} mission={mission} onOuvrir={onOuvrir} />
            ))}
        </ul>
    );
}

/** Dernières livraisons terminées. */
export function HistoriqueLivraisons({ historique }) {
    if (historique.length === 0) {
        return <AdminCard className="p-8 text-center text-sm text-jse-theme-muted">Aucune livraison terminée pour le moment.</AdminCard>;
    }

    return (
        <AdminCard className="overflow-hidden">
            <ul className="divide-y divide-jse-theme-border">
                {historique.map((element) => (
                    <li key={element.id} className="flex items-center gap-3 p-4">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-jse-secondaire/15 text-jse-theme-heading">
                            <Check size={17} aria-hidden="true" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-jse-theme-text">#{element.reference}</p>
                            <p className="truncate text-sm text-jse-theme-muted">
                                {element.restaurant || "Restaurant"} · {element.date || "—"}
                            </p>
                        </div>
                        <span className="shrink-0 text-sm font-semibold tabular-nums text-jse-theme-heading">{montant(element.montant_total)}</span>
                    </li>
                ))}
            </ul>
        </AdminCard>
    );
}

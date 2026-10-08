import { Link } from "@inertiajs/react";
import { ArrowUpRight } from "lucide-react";

const tons = {
    principal: "bg-jse-principal/10 text-jse-theme-heading",
    secondaire: "bg-jse-secondaire/15 text-jse-theme-heading",
    accent: "bg-jse-accent/15 text-jse-theme-heading",
    neutre: "bg-jse-theme-text/5 text-jse-theme-heading",
};

/**
 * Carte indicateur. Si `href` (lien) ou `onClick` (action) est fourni, toute la carte est cliquable.
 */
export default function AdminStatCard({ label, value, icon: Icone, tone = "principal", href = null, onClick = null }) {
    const contenu = (
        <>
            <div className="flex items-start justify-between gap-3">
                <span className={["flex size-11 shrink-0 items-center justify-center rounded-2xl", tons[tone] ?? tons.principal].join(" ")}>
                    <Icone size={20} strokeWidth={2} aria-hidden="true" />
                </span>
                {(href || onClick) && (
                    <ArrowUpRight
                        size={18}
                        className="text-jse-theme-muted transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-jse-theme-heading"
                        aria-hidden="true"
                    />
                )}
            </div>
            <p className="mt-4 break-words text-2xl font-semibold tabular-nums tracking-tight text-jse-theme-heading sm:text-3xl">{value}</p>
            <p className="mt-1 text-sm text-jse-theme-muted">{label}</p>
        </>
    );

    const classes = "jse-admin-card group block min-w-0 rounded-3xl border border-jse-theme-border bg-jse-theme-surface p-4 shadow-jse-carte sm:p-5";

    if (href) {
        return (
            <Link
                href={href}
                className={classes + " transition hover:-translate-y-0.5 hover:border-jse-secondaire/40 hover:shadow-jse-elevated focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-jse-secondaire/30"}
            >
                {contenu}
            </Link>
        );
    }

    if (onClick) {
        return (
            <button
                type="button"
                onClick={onClick}
                className={classes + " w-full text-left transition hover:-translate-y-0.5 hover:border-jse-secondaire/40 hover:shadow-jse-elevated focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-jse-secondaire/30"}
            >
                {contenu}
            </button>
        );
    }

    return <article className={classes}>{contenu}</article>;
}

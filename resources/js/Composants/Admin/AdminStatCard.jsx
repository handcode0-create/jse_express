import { Link } from "@inertiajs/react";
import { ArrowUpRight } from "lucide-react";

const tons = {
    principal: "bg-jse-principal/10 text-jse-theme-heading",
    secondaire: "bg-jse-secondaire/15 text-jse-theme-heading",
    accent: "bg-jse-accent/15 text-jse-theme-heading",
    neutre: "bg-jse-theme-text/5 text-jse-theme-heading",
};

/**
 * Carte indicateur. Si `href` est fourni, toute la carte est un lien vers la section détaillée.
 */
export default function AdminStatCard({ label, value, icon: Icone, tone = "principal", href = null }) {
    const contenu = (
        <>
            <div className="flex items-start justify-between gap-3">
                <span className={["flex size-11 shrink-0 items-center justify-center rounded-2xl", tons[tone] ?? tons.principal].join(" ")}>
                    <Icone size={20} strokeWidth={2} aria-hidden="true" />
                </span>
                {href && (
                    <ArrowUpRight
                        size={18}
                        className="text-jse-theme-muted transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-jse-theme-heading"
                        aria-hidden="true"
                    />
                )}
            </div>
            <p className="mt-4 text-3xl font-semibold tabular-nums tracking-tight text-jse-theme-heading">{value}</p>
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

    return <article className={classes}>{contenu}</article>;
}

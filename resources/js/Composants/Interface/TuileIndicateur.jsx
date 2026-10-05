import { Link } from "@inertiajs/react";
import { ArrowUpRight } from "lucide-react";

/**
 * Tuile d'indicateur : icône, grand chiffre et libellé. `sombre` la passe sur fond vert de marque
 * (à réserver à l'indicateur dominant de l'écran). Avec `href`, toute la tuile est un lien.
 */
export default function TuileIndicateur({ icone: Icone, label, sombre = false, href = null, children }) {
    const classes = [
        "group relative block h-full overflow-hidden rounded-3xl p-4 sm:p-6",
        sombre ? "jse-dark-surface bg-jse-principal text-jse-fond shadow-jse-elevated" : "jse-admin-card border border-jse-theme-border bg-jse-theme-surface text-jse-theme-text shadow-jse-carte",
        href ? "transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-jse-secondaire/40" : "",
    ].join(" ");

    const contenu = (
        <>
            <div className="flex items-start justify-between gap-3">
                <span className={["flex size-11 items-center justify-center rounded-2xl", sombre ? "bg-white/12 text-jse-accent" : "bg-jse-secondaire/15 text-jse-theme-heading"].join(" ")}>
                    <Icone size={20} aria-hidden="true" />
                </span>
                {href && <ArrowUpRight size={18} className={["transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5", sombre ? "text-jse-fond/60" : "text-jse-theme-muted"].join(" ")} aria-hidden="true" />}
            </div>
            <p className={["mt-4 text-3xl font-semibold tabular-nums tracking-tight sm:mt-5 sm:text-5xl", sombre ? "text-jse-fond" : "text-jse-theme-heading"].join(" ")}>{children}</p>
            <p className={["mt-1 text-sm", sombre ? "text-jse-fond/70" : "text-jse-theme-muted"].join(" ")}>{label}</p>
        </>
    );

    if (href) {
        return (
            <Link href={href} className={classes}>
                {contenu}
            </Link>
        );
    }

    return <article className={classes}>{contenu}</article>;
}

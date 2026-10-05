/**
 * Tuile d'indicateur : icône, grand chiffre et libellé. `sombre` la passe sur fond vert de marque
 * (à réserver à l'indicateur dominant de l'écran).
 */
export default function TuileIndicateur({ icone: Icone, label, sombre = false, children }) {
    return (
        <article
            className={[
                "relative h-full overflow-hidden rounded-3xl p-4 sm:p-6",
                sombre ? "jse-dark-surface bg-jse-principal text-jse-fond shadow-jse-elevated" : "jse-admin-card border border-jse-theme-border bg-jse-theme-surface text-jse-theme-text shadow-jse-carte",
            ].join(" ")}
        >
            <span className={["flex size-11 items-center justify-center rounded-2xl", sombre ? "bg-white/12 text-jse-accent" : "bg-jse-secondaire/15 text-jse-theme-heading"].join(" ")}>
                <Icone size={20} aria-hidden="true" />
            </span>
            <p className={["mt-4 text-3xl font-semibold tabular-nums tracking-tight sm:mt-5 sm:text-5xl", sombre ? "text-jse-fond" : "text-jse-theme-heading"].join(" ")}>{children}</p>
            <p className={["mt-1 text-sm", sombre ? "text-jse-fond/70" : "text-jse-theme-muted"].join(" ")}>{label}</p>
        </article>
    );
}

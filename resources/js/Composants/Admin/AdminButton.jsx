import { Link } from "@inertiajs/react";

const variantes = {
    principal: "jse-admin-primary bg-jse-principal text-white hover:bg-jse-principal/90",
    secondaire: "bg-jse-secondaire text-jse-principal hover:brightness-105",
    contour: "border border-jse-theme-border bg-jse-theme-surface text-jse-theme-text hover:bg-jse-theme-surface-soft",
    danger: "bg-jse-danger text-white hover:bg-jse-danger/90",
    dangerDoux: "bg-jse-danger/10 text-jse-danger hover:bg-jse-danger/15",
    discret: "text-jse-theme-text hover:bg-jse-theme-surface-soft",
};

const tailles = {
    moyen: "min-h-11 px-5 text-sm",
    petit: "min-h-10 px-4 text-xs",
};

/**
 * Bouton admin. Rendu en <Link> si `href` est fourni, en <button> sinon.
 *
 * @param {{ variante?: keyof typeof variantes, taille?: keyof typeof tailles, chargement?: boolean, pleineLargeur?: boolean, href?: string }} props
 */
export default function AdminButton({
    children,
    variante = "principal",
    taille = "moyen",
    chargement = false,
    pleineLargeur = false,
    href = null,
    className = "",
    type = "button",
    disabled = false,
    ...props
}) {
    const classes = [
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-semibold transition",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-jse-secondaire/30",
        "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
        variantes[variante] ?? variantes.principal,
        tailles[taille] ?? tailles.moyen,
        pleineLargeur ? "w-full" : "w-full sm:w-auto",
        className,
    ].join(" ");

    if (href) {
        return (
            <Link href={href} className={classes} {...props}>
                {children}
            </Link>
        );
    }

    return (
        <button type={type} disabled={disabled || chargement} className={classes} {...props}>
            {chargement && (
                <span
                    className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                    aria-hidden="true"
                />
            )}
            {children}
        </button>
    );
}

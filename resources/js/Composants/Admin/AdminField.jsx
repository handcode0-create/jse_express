/** Classe commune des champs de saisie de l'administration. */
export const champAdmin =
    "jse-admin-input min-h-11 w-full min-w-0 rounded-2xl border border-jse-theme-border bg-jse-theme-surface px-4 text-sm text-jse-theme-text outline-none transition placeholder:text-jse-theme-muted focus:border-jse-secondaire focus:ring-4 focus:ring-jse-secondaire/15 disabled:opacity-60";

/**
 * Champ de formulaire : libellé visible, aide et erreur reliés au contrôle.
 *
 * @param {{ label: string, required?: boolean, erreur?: string|null, aide?: string|null, className?: string }} props
 */
export function AdminField({ label, required = false, erreur = null, aide = null, className = "", children }) {
    return (
        <label className={["block min-w-0", className].join(" ")}>
            <span className="mb-1.5 block text-sm font-semibold text-jse-theme-text">
                {label}
                {required && (
                    <span aria-hidden="true" className="text-jse-danger">
                        {" "}
                        *
                    </span>
                )}
            </span>
            {children}
            {aide && <span className="mt-1.5 block text-xs text-jse-theme-muted">{aide}</span>}
            {erreur && (
                <span role="alert" className="mt-1.5 block text-xs font-medium text-jse-danger">
                    {erreur}
                </span>
            )}
        </label>
    );
}

import { Link } from "@inertiajs/react";
import { ChevronLeft } from "lucide-react";

/**
 * En-tête de page admin : lien de retour, surtitre, titre, description et actions.
 *
 * @param {{ eyebrow?: string, title: string, description?: string, retour?: { href: string, label: string }, actions?: import("react").ReactNode }} props
 */
export default function AdminPageHeader({ eyebrow = "Administration", title, description = null, retour = null, actions = null }) {
    return (
        <header className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
                {retour && (
                    <Link
                        href={retour.href}
                        className="mb-3 inline-flex min-h-8 items-center gap-1 text-sm font-medium text-jse-theme-muted transition hover:text-jse-theme-text"
                    >
                        <ChevronLeft size={16} aria-hidden="true" />
                        {retour.label}
                    </Link>
                )}

                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-jse-theme-muted">
                    <span className="h-0.5 w-6 rounded-full bg-jse-secondaire" aria-hidden="true" />
                    {eyebrow}
                </p>
                <h1 className="mt-2 break-words text-2xl font-semibold leading-tight tracking-tight text-jse-theme-heading sm:text-3xl">
                    {title}
                </h1>
                {description && (
                    <p className="mt-2 max-w-2xl break-words text-sm leading-6 text-jse-theme-muted">{description}</p>
                )}
            </div>

            {actions && <div className="flex shrink-0 flex-col gap-2 sm:flex-row">{actions}</div>}
        </header>
    );
}

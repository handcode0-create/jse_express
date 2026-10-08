import { router } from "@inertiajs/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Pagination d'un paginator Laravel (`links`) : première et dernière entrées = précédent et suivant.
 *
 * @param {{ pagination?: { links?: Array<{ url: string|null, label: string, active: boolean }> } | null }} props
 */
export default function AdminPagination({ pagination = null }) {
    const liens = pagination?.links ?? [];

    if (liens.length <= 3) {
        return null;
    }

    const aller = (url) => router.get(url, {}, { preserveState: true, preserveScroll: true });

    return (
        <nav className="mt-5 flex flex-wrap items-center justify-center gap-1.5" aria-label="Pagination">
            {liens.map((lien, index) => {
                const precedent = index === 0;
                const suivant = index === liens.length - 1;
                const classes = [
                    "inline-flex min-h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-semibold transition",
                    lien.active
                        ? "bg-jse-principal text-white"
                        : "border border-jse-theme-border bg-jse-theme-surface text-jse-theme-text hover:bg-jse-theme-surface-soft",
                    !lien.url && !lien.active ? "pointer-events-none opacity-40" : "",
                ].join(" ");

                return (
                    <button
                        key={index}
                        type="button"
                        disabled={!lien.url || lien.active}
                        aria-current={lien.active ? "page" : undefined}
                        aria-label={precedent ? "Page précédente" : suivant ? "Page suivante" : `Page ${lien.label}`}
                        onClick={() => lien.url && aller(lien.url)}
                        className={classes}
                    >
                        {precedent ? (
                            <ChevronLeft size={16} aria-hidden="true" />
                        ) : suivant ? (
                            <ChevronRight size={16} aria-hidden="true" />
                        ) : (
                            lien.label
                        )}
                    </button>
                );
            })}
        </nav>
    );
}

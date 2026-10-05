import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import { ChevronRight, Inbox, Search, X } from "lucide-react";
import AdminButton from "./AdminButton";
import AdminCard from "./AdminCard";
import { champAdmin } from "./AdminField";
import AdminLayout from "./AdminLayout";
import AdminPageHeader from "./AdminPageHeader";
import AdminPagination from "./AdminPagination";

/**
 * Page de liste admin : en-tête, recherche, filtres, tableau (desktop) et cartes (mobile).
 *
 * Options par colonne :
 * - `render(row)` : rendu personnalisé de la cellule ;
 * - `mobile: false` : colonne masquée dans les cartes mobiles ;
 * - `wide: true` : valeur affichée sur toute la largeur de la carte mobile.
 * La première colonne sert de titre à la carte mobile ; la colonne `actions` est placée en bas.
 */
export default function AdminDataPage({
    utilisateur,
    title,
    description,
    search = "",
    searchPlaceholder = "Rechercher",
    afficherRecherche = true,
    columns = [],
    rows = [],
    emptyMessage = "Aucun élément trouvé.",
    filters = null,
    actionLabel = null,
    actionHref = null,
    pagination = null,
    children = null,
}) {
    const [rechercheEnCours, setRechercheEnCours] = useState(false);

    const rechercher = (valeur) => {
        setRechercheEnCours(true);
        router.get(
            window.location.pathname,
            valeur ? { recherche: valeur } : {},
            { preserveState: true, replace: true, onFinish: () => setRechercheEnCours(false) },
        );
    };

    const soumettre = (evenement) => {
        evenement.preventDefault();
        rechercher(String(new FormData(evenement.currentTarget).get("recherche") || "").trim());
    };

    const colonnesCarte = columns.filter((colonne, index) => index > 0 && colonne.key !== "actions" && colonne.mobile !== false);
    const colonneTitre = columns[0];
    const colonneActions = columns.find((colonne) => colonne.key === "actions");
    const valeur = (colonne, ligne) => (colonne.render ? colonne.render(ligne) : (ligne[colonne.key] ?? "—"));
    const total = pagination?.total ?? null;

    return (
        <>
            <Head title={`${title} — JSE Express`} />
            <AdminLayout utilisateur={utilisateur}>
                <AdminPageHeader
                    title={title}
                    description={description}
                    actions={
                        actionLabel &&
                        actionHref && (
                            <AdminButton href={actionHref}>
                                {actionLabel}
                                <ChevronRight size={16} aria-hidden="true" />
                            </AdminButton>
                        )
                    }
                />

                {afficherRecherche && (
                    <AdminCard className="mt-6 p-3 sm:p-4">
                        <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center">
                            <form onSubmit={soumettre} role="search" className="relative min-w-0 flex-1">
                                <label htmlFor="recherche-admin" className="sr-only">
                                    {searchPlaceholder}
                                </label>
                                <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-jse-theme-muted" size={18} aria-hidden="true" />
                                <input
                                    id="recherche-admin"
                                    name="recherche"
                                    type="search"
                                    defaultValue={search}
                                    key={search}
                                    placeholder={searchPlaceholder}
                                    disabled={rechercheEnCours}
                                    className={champAdmin + " pl-11 pr-24"}
                                />
                                <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
                                    {search && (
                                        <button
                                            type="button"
                                            onClick={() => rechercher("")}
                                            aria-label="Effacer la recherche"
                                            className="flex size-8 items-center justify-center rounded-full text-jse-theme-muted transition hover:bg-jse-theme-surface-soft hover:text-jse-theme-text"
                                        >
                                            <X size={16} aria-hidden="true" />
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        className="flex h-8 items-center rounded-full bg-jse-principal px-3 text-xs font-semibold text-white transition hover:bg-jse-principal/90"
                                    >
                                        {rechercheEnCours ? "…" : "OK"}
                                    </button>
                                </div>
                            </form>
                            {filters && <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap lg:shrink-0">{filters}</div>}
                        </div>
                    </AdminCard>
                )}

                {children}

                {columns.length > 0 && (
                    <>
                        {total !== null && (
                            <p className="mt-5 px-1 text-sm text-jse-theme-muted" aria-live="polite">
                                <span className="font-semibold tabular-nums text-jse-theme-text">{total}</span> résultat{total > 1 ? "s" : ""}
                            </p>
                        )}

                        <AdminCard className={["overflow-hidden", total !== null ? "mt-2" : "mt-5"].join(" ")}>
                            <div className="hidden overflow-x-auto md:block">
                                <table className="w-full min-w-[720px] text-left text-sm">
                                    <thead className="jse-admin-table border-b border-jse-theme-border bg-jse-theme-surface-soft">
                                        <tr>
                                            {columns.map((colonne) => (
                                                <th key={colonne.key} scope="col" className="px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.1em] text-jse-theme-muted">
                                                    {colonne.label}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-jse-theme-border">
                                        {rows.map((ligne, index) => (
                                            <tr key={ligne.id ?? index} className="align-top transition hover:bg-jse-theme-surface-soft/60">
                                                {columns.map((colonne) => (
                                                    <td key={colonne.key} className="min-w-0 px-5 py-4 text-jse-theme-text">
                                                        <div className="min-w-0 break-words">{valeur(colonne, ligne)}</div>
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <ul className="divide-y divide-jse-theme-border md:hidden">
                                {rows.map((ligne, index) => (
                                    <li key={ligne.id ?? index} className="min-w-0 p-4">
                                        {colonneTitre && (
                                            <div className="min-w-0 break-words text-base font-semibold text-jse-theme-heading">{valeur(colonneTitre, ligne)}</div>
                                        )}

                                        {colonnesCarte.length > 0 && (
                                            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
                                                {colonnesCarte.map((colonne) => (
                                                    <div key={colonne.key} className={["min-w-0", colonne.wide ? "col-span-2" : ""].join(" ")}>
                                                        <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-jse-theme-muted">{colonne.label}</dt>
                                                        <dd className="mt-1 min-w-0 break-words text-sm text-jse-theme-text">{valeur(colonne, ligne)}</dd>
                                                    </div>
                                                ))}
                                            </dl>
                                        )}

                                        {colonneActions && <div className="mt-4 border-t border-jse-theme-border pt-4">{valeur(colonneActions, ligne)}</div>}
                                    </li>
                                ))}
                            </ul>

                            {rows.length === 0 && (
                                <div className="jse-admin-empty flex min-h-48 flex-col items-center justify-center gap-3 p-6 text-center">
                                    <span className="flex size-12 items-center justify-center rounded-2xl bg-jse-theme-surface-soft text-jse-theme-muted">
                                        <Inbox size={22} aria-hidden="true" />
                                    </span>
                                    <p className="break-words text-sm text-jse-theme-muted">{emptyMessage}</p>
                                </div>
                            )}
                        </AdminCard>

                        <AdminPagination pagination={pagination} />
                    </>
                )}
            </AdminLayout>
        </>
    );
}

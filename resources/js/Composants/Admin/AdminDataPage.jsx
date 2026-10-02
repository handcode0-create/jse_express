import React from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { Search, ChevronRight, Inbox } from "lucide-react";
import AdminSidebar from "./AdminSidebar";

export default function AdminDataPage({
    utilisateur,
    title,
    description,
    search = "",
    searchPlaceholder = "Rechercher",
    columns = [],
    rows = [],
    emptyMessage = "Aucun élément trouvé.",
    filters = null,
    actionLabel = null,
    actionHref = null,
}) {
    const { flash = {} } = usePage().props;

    const submit = (event) => {
        event.preventDefault();
        const value = new FormData(event.currentTarget).get("recherche") || "";
        router.get(window.location.pathname, { recherche: value }, { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title={`${title} — JSE Express`} />
            <main className="min-h-screen bg-jse-theme-bg pb-24 text-jse-theme-text lg:pb-0">
                <div className="flex min-h-screen flex-col lg:flex-row">
                    <AdminSidebar utilisateur={utilisateur} />
                    <section className="min-w-0 flex-1">
                        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                            <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-jse-secondaire">Administration</p>
                                    <h1 className="mt-2 text-3xl font-semibold tracking-tight text-jse-theme-text">{title}</h1>
                                    <p className="mt-2 text-sm text-jse-theme-muted">{description}</p>
                                </div>
                                {actionLabel && actionHref && (
                                    <Link href={actionHref} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-jse-principal px-5 text-sm font-semibold text-white">
                                        {actionLabel}<ChevronRight size={16} />
                                    </Link>
                                )}
                            </header>

                            {(flash.success || flash.error) && (
                                <div className="mt-5 rounded-jse-moyen border border-jse-theme-border bg-jse-theme-surface p-4 text-sm shadow-jse-carte" role="status">
                                    <p className={flash.error ? "text-jse-danger" : "text-jse-secondaire"}>
                                        {flash.error || flash.success}
                                    </p>
                                </div>
                            )}

                            <div className="mt-6 rounded-jse-xl border border-jse-theme-border bg-jse-theme-surface p-4 shadow-jse-carte">
                                <div className="flex flex-col gap-3 lg:flex-row">
                                    <form onSubmit={submit} className="relative min-w-0 flex-1">
                                        <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-jse-theme-muted" size={17} />
                                        <input name="recherche" defaultValue={search} placeholder={searchPlaceholder} className="min-h-11 w-full rounded-full border border-jse-theme-border bg-jse-theme-surface-soft pl-11 pr-4 text-sm text-jse-theme-text outline-none focus:border-jse-secondaire" />
                                    </form>
                                    {filters}
                                </div>
                            </div>

                            <div className="mt-5 overflow-hidden rounded-jse-xl border border-jse-theme-border bg-jse-theme-surface shadow-jse-carte">
                                <div className="hidden overflow-x-auto md:block">
                                    <table className="w-full text-left text-sm">
                                        <thead className="border-b border-jse-theme-border bg-jse-theme-surface-soft text-xs uppercase tracking-[0.12em] text-jse-theme-muted">
                                            <tr>{columns.map((column) => <th key={column.key} className="px-5 py-4 font-semibold">{column.label}</th>)}</tr>
                                        </thead>
                                        <tbody className="divide-y divide-jse-theme-border">
                                            {rows.map((row, index) => (
                                                <tr key={row.id ?? index} className="align-top">
                                                    {columns.map((column) => <td key={column.key} className="px-5 py-4 text-jse-theme-text">{column.render ? column.render(row) : row[column.key]}</td>)}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="grid gap-3 p-3 md:hidden">
                                    {rows.map((row, index) => (
                                        <article key={row.id ?? index} className="rounded-jse-moyen border border-jse-theme-border bg-jse-theme-surface-soft p-4">
                                            {columns.map((column, columnIndex) => (
                                                <div key={column.key} className={columnIndex === 0 ? "" : "mt-3"}>
                                                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-jse-theme-muted">{column.label}</p>
                                                    <div className="mt-1 text-sm text-jse-theme-text">{column.render ? column.render(row) : row[column.key]}</div>
                                                </div>
                                            ))}
                                        </article>
                                    ))}
                                </div>

                                {rows.length === 0 && (
                                    <div className="flex min-h-48 flex-col items-center justify-center gap-3 p-6 text-center">
                                        <Inbox className="text-jse-theme-muted" size={24} />
                                        <p className="text-sm text-jse-theme-muted">{emptyMessage}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}

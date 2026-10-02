import React, { useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { Search, ChevronRight, Inbox } from "lucide-react";
import AdminSidebar from "./AdminSidebar";

export default function AdminDataPage({ utilisateur,title,description,search="",searchPlaceholder="Rechercher",columns=[],rows=[],emptyMessage="Aucun élément trouvé.",filters=null,actionLabel=null,actionHref=null }) {
    const { flash = {} } = usePage().props;
    const [rechercheEnCours, setRechercheEnCours] = useState(false);
    const submit = (event) => {
        event.preventDefault();
        const value = new FormData(event.currentTarget).get("recherche") || "";
        setRechercheEnCours(true);
        router.get(window.location.pathname,{ recherche:value },{ preserveState:true,replace:true,onFinish:()=>setRechercheEnCours(false) });
    };
    return <>
        <Head title={`${title} — JSE Express`} />
        <main className="min-h-screen overflow-x-hidden bg-jse-theme-bg pb-[calc(88px+env(safe-area-inset-bottom))] text-jse-theme-text lg:pb-0">
            <div className="flex min-h-screen flex-col lg:flex-row">
                <AdminSidebar utilisateur={utilisateur} />
                <section className="min-w-0 flex-1 lg:ml-[238px]">
                    <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
                        <header className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div className="min-w-0">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-jse-secondaire sm:text-xs">Administration</p>
                                <h1 className="mt-1.5 break-words text-2xl font-semibold leading-tight tracking-tight text-jse-theme-text sm:text-3xl">{title}</h1>
                                <p className="mt-2 max-w-2xl break-words text-xs leading-5 text-jse-theme-muted sm:text-sm">{description}</p>
                            </div>
                            {actionLabel && actionHref && <Link href={actionHref} className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-2xl bg-jse-principal px-5 text-sm font-semibold text-white sm:w-auto sm:rounded-full">{actionLabel}<ChevronRight size={16}/></Link>}
                        </header>
                        {(flash.success || flash.error) && <div className="mt-5 rounded-jse-moyen border border-jse-theme-border bg-jse-theme-surface p-4 text-sm shadow-jse-carte" role="status"><p className={flash.error ? "break-words text-jse-danger" : "break-words text-jse-secondaire"}>{flash.error || flash.success}</p></div>}
                        <div className="mt-5 rounded-jse-xl border border-jse-theme-border bg-jse-theme-surface p-3 shadow-jse-carte sm:mt-6 sm:p-4">
                            <div className="flex min-w-0 flex-col gap-3 lg:flex-row">
                                <form onSubmit={submit} className="relative min-w-0 flex-1">
                                    <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-jse-theme-muted sm:left-4" size={17}/>
                                    <input name="recherche" defaultValue={search} placeholder={searchPlaceholder} disabled={rechercheEnCours} className="min-h-11 w-full min-w-0 rounded-2xl border border-jse-theme-border bg-jse-theme-surface-soft pl-10 pr-20 text-sm text-jse-theme-text outline-none placeholder:text-jse-theme-muted focus:border-jse-secondaire disabled:opacity-60 sm:pl-11 sm:pr-24"/>
                                    {rechercheEnCours && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium text-jse-theme-muted sm:right-4 sm:text-xs">Recherche…</span>}
                                </form>
                                {filters && <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap lg:shrink-0">{filters}</div>}
                            </div>
                        </div>
                        <div className="mt-5 overflow-hidden rounded-jse-xl border border-jse-theme-border bg-jse-theme-surface shadow-jse-carte">
                            <div className="hidden overflow-x-auto md:block">
                                <table className="w-full min-w-[720px] text-left text-sm">
                                    <thead className="border-b border-jse-theme-border bg-jse-theme-surface-soft text-xs uppercase tracking-[0.12em] text-jse-theme-muted"><tr>{columns.map(column=><th key={column.key} className="px-5 py-4 font-semibold">{column.label}</th>)}</tr></thead>
                                    <tbody className="divide-y divide-jse-theme-border">{rows.map((row,index)=><tr key={row.id ?? index} className="align-top">{columns.map(column=><td key={column.key} className="min-w-0 px-5 py-4 text-jse-theme-text"><div className="min-w-0 break-words">{column.render ? column.render(row) : row[column.key]}</div></td>)}</tr>)}</tbody>
                                </table>
                            </div>
                            <div className="space-y-3 p-3 md:hidden">
                                {rows.map((row,index)=><article key={row.id ?? index} className="min-w-0 rounded-jse-moyen border border-jse-theme-border bg-jse-theme-surface-soft p-4">
                                    {columns.map((column,columnIndex)=>{
                                        const estAction=column.key==="actions"; const estPrincipal=columnIndex===0;
                                        return <div key={column.key} className={["min-w-0",columnIndex>0?"mt-3":"",estAction?"border-t border-jse-theme-border pt-3":""].join(" ")}>
                                            {!estPrincipal && <p className="text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-jse-theme-muted">{column.label}</p>}
                                            <div className={["mt-1 min-w-0 break-words text-sm text-jse-theme-text",estPrincipal?"text-base font-semibold":"","estAction?"w-full":""].join(" ")}>{column.render ? column.render(row) : row[column.key]}</div>
                                        </div>;
                                    })}
                                </article>)}
                            </div>
                            {rows.length===0 && <div className="flex min-h-48 flex-col items-center justify-center gap-3 p-6 text-center"><Inbox className="text-jse-theme-muted" size={24}/><p className="break-words text-sm text-jse-theme-muted">{emptyMessage}</p></div>}
                        </div>
                    </div>
                </section>
            </div>
        </main>
    </>;
}

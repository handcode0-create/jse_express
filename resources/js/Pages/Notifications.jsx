import React from "react";
import { router, usePage } from "@inertiajs/react";
import { ArrowLeft, Bell, Heart, Home, Package, UserRound } from "lucide-react";

function NavigationItem({ label, icon: Icon, active = false, onClick }) {
    return <button type="button" onClick={onClick} className={["flex min-w-[66px] flex-col items-center justify-center gap-1 rounded-[20px] px-2.5 py-2 transition-all", active ? "bg-jse-secondaire text-white shadow-sm" : "text-jse-texte/80 hover:bg-jse-fond"].join(" ")}>
        <Icon size={21} strokeWidth={active ? 2.2 : 1.8} /><span className="font-sans text-[10px] font-semibold">{label}</span>
    </button>;
}

export default function Notifications() {
    const { notifications = [] } = usePage().props;

    return <main className="min-h-screen bg-jse-fond pb-28 text-jse-texte">
        <div className="mx-auto min-h-screen w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-10">
                <aside className="hidden lg:block">
                    <div className="sticky top-6 pt-6">
                        <button type="button" onClick={() => router.visit("/profil")} className="flex size-12 items-center justify-center rounded-full bg-white text-jse-principal shadow-sm ring-1 ring-jse-texte/5"><ArrowLeft size={21} /></button>
                        <div className="mt-8"><img src="/assets/jse_logo.png" alt="JSE Express" className="h-14 w-auto object-contain" /></div>
                        <nav className="mt-10 space-y-2">
                            <NavigationItem label="Accueil" icon={Home} onClick={() => router.visit("/accueil")} />
                            <NavigationItem label="Commandes" icon={Package} onClick={() => router.visit("/commandes")} />
                            <NavigationItem label="Favoris" icon={Heart} onClick={() => router.visit("/favoris")} />
                            <NavigationItem label="Profil" icon={UserRound} onClick={() => router.visit("/profil")} />
                        </nav>
                    </div>
                </aside>

                <div className="mx-auto w-full max-w-3xl lg:mx-0">
                    <header className="pt-5 sm:pt-7 lg:pt-10">
                        <button type="button" onClick={() => router.visit("/profil")} className="flex size-11 items-center justify-center rounded-full bg-white text-jse-principal shadow-sm ring-1 ring-jse-texte/5 lg:hidden"><ArrowLeft size={21} /></button>
                        <div className="mt-6 lg:mt-0">
                            <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-jse-secondaire">Compte</p>
                            <h1 className="mt-1 font-against text-[2.65rem] leading-[0.95] text-jse-principal sm:text-[3.3rem]">Notifications</h1>
                            <p className="mt-2 font-sans text-sm leading-5 text-jse-texte/60">Retrouvez les notifications enregistrées sur votre compte.</p>
                        </div>
                    </header>

                    <section className="pt-6">
                        {notifications.length > 0 ? <div className="space-y-3">{notifications.map((notification) => <article key={notification.id} className="rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-jse-texte/5">
                            <div className="flex gap-3">
                                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-jse-secondaire/10 text-jse-secondaire"><Bell size={18} /></span>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-3"><h2 className="font-sans text-xs font-semibold text-jse-texte">{notification.type || "Notification JSE Express"}</h2>{notification.date && <span className="shrink-0 font-sans text-[9px] text-jse-texte/35">{notification.date}</span>}</div>
                                    <p className="mt-1 font-sans text-xs leading-5 text-jse-texte/55">{notification.contenu || "Notification enregistrée."}</p>
                                    {notification.statut && <p className="mt-2 font-sans text-[9px] uppercase tracking-[0.12em] text-jse-texte/35">{notification.canal || "Canal"} · {notification.statut}</p>}
                                </div>
                            </div>
                        </article>)}</div> : <div className="rounded-[28px] bg-white px-6 py-16 text-center shadow-sm ring-1 ring-jse-texte/5">
                            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-jse-secondaire/10 text-jse-secondaire"><Bell size={29} strokeWidth={1.7} /></div>
                            <h2 className="mt-5 font-against text-2xl text-jse-principal">Aucune notification</h2>
                            <p className="mx-auto mt-2 max-w-sm font-sans text-sm leading-5 text-jse-texte/50">Les notifications liées à votre activité apparaîtront ici.</p>
                        </div>}
                    </section>
                </div>
            </div>
        </div>

        <nav className="fixed inset-x-0 bottom-0 z-40 px-4 pb-4 lg:hidden"><div className="mx-auto flex h-[66px] w-full max-w-md items-center justify-around rounded-[24px] border border-white/80 bg-white/95 px-1 shadow-xl shadow-jse-principal/10 backdrop-blur-xl">
            <NavigationItem label="Accueil" icon={Home} onClick={() => router.visit("/accueil")} />
            <NavigationItem label="Commandes" icon={Package} onClick={() => router.visit("/commandes")} />
            <NavigationItem label="Favoris" icon={Heart} onClick={() => router.visit("/favoris")} />
            <NavigationItem label="Profil" icon={UserRound} active onClick={() => router.visit("/profil")} />
        </div></nav>
    </main>;
}
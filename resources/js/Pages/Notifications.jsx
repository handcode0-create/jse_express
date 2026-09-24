import { router, usePage } from "@inertiajs/react";
import {
    ArrowLeft,
    Bell,
    CheckCircle2,
    ChevronRight,
    Clock3,
    Heart,
    Home,
    Info,
    Package,
    UserRound,
    XCircle,
} from "lucide-react";
import SidebarJSE from "../Composants/Navigation/SidebarJSE";

function NavigationItem({ label, icon: Icon, active = false, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-current={active ? "page" : undefined}
            className={[
                "flex min-w-[66px] flex-col items-center justify-center gap-1 rounded-[20px] px-2.5 py-2 transition-all",
                active
                    ? "bg-jse-secondaire text-white shadow-sm"
                    : "text-jse-texte/80 hover:bg-jse-fond",
            ].join(" ")}
        >
            <Icon size={21} strokeWidth={active ? 2.2 : 1.8} />
            <span className="font-sans text-[10px] font-semibold">
                {label}
            </span>
        </button>
    );
}

function formaterDate(date) {
    if (!date) return null;

    const valeur = new Date(date);

    if (Number.isNaN(valeur.getTime())) {
        return date;
    }

    return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(valeur);
}

function presentationNotification(notification) {
    const type = String(
        notification?.type_evenement || notification?.type || "",
    ).toLowerCase();

    if (
        type.includes("livr") ||
        type.includes("attribution") ||
        type.includes("livraison")
    ) {
        return {
            titre: "Livraison",
            Icon: Package,
            classe: "bg-jse-accent/10 text-jse-accent",
        };
    }

    if (
        type.includes("commande") ||
        type.includes("statut") ||
        type.includes("preparation") ||
        type.includes("confirm")
    ) {
        return {
            titre: "Commande",
            Icon: CheckCircle2,
            classe: "bg-jse-secondaire/10 text-jse-secondaire",
        };
    }

    if (type.includes("erreur") || type.includes("echec")) {
        return {
            titre: "Information",
            Icon: XCircle,
            classe: "bg-jse-danger/10 text-jse-danger",
        };
    }

    return {
        titre: "Notification",
        Icon: Bell,
        classe: "bg-jse-principal/8 text-jse-principal",
    };
}

export default function Notifications() {
    const { notifications = [] } = usePage().props;

    return (
        <main className="min-h-screen bg-jse-fond pb-28 text-jse-texte">
            <div className="mx-auto flex min-h-screen w-full max-w-[1440px] lg:px-8">
                <SidebarJSE active="profil" />

                <div className="min-w-0 flex-1">
                    <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
                        <header className="pt-5 sm:pt-7 lg:pt-10">
                            <button
                                type="button"
                                onClick={() => router.visit("/profil")}
                                aria-label="Retour au profil"
                                className="flex size-11 items-center justify-center rounded-full bg-white text-jse-principal shadow-sm ring-1 ring-jse-texte/5 lg:hidden"
                            >
                                <ArrowLeft size={21} />
                            </button>

                            <div className="mt-6 lg:mt-0">
                                <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-jse-secondaire">
                                    Compte
                                </p>
                                <div className="mt-1 flex items-end justify-between gap-4">
                                    <div>
                                        <h1 className="font-against text-[2.65rem] leading-[0.95] text-jse-principal sm:text-[3.3rem]">
                                            Notifications
                                        </h1>
                                        <p className="mt-2 font-sans text-sm leading-5 text-jse-texte/60">
                                            Retrouvez les notifications enregistrées sur votre compte.
                                        </p>
                                    </div>

                                    <span className="hidden shrink-0 rounded-full bg-white px-3 py-2 font-sans text-[11px] font-semibold text-jse-principal ring-1 ring-jse-texte/5 sm:inline-flex">
                                        {notifications.length} notification
                                        {notifications.length > 1 ? "s" : ""}
                                    </span>
                                </div>
                            </div>
                        </header>

                        <section className="pb-10 pt-6">
                            {notifications.length > 0 ? (
                                <div className="space-y-3">
                                    {notifications.map((notification) => {
                                        const presentation =
                                            presentationNotification(
                                                notification,
                                            );
                                        const Icon = presentation.Icon;
                                        const date =
                                            notification.date_envoi ||
                                            notification.date ||
                                            notification.created_at;

                                        return (
                                            <article
                                                key={notification.id}
                                                className="group rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-jse-texte/5 transition hover:-translate-y-0.5 hover:shadow-md"
                                            >
                                                <div className="flex items-start gap-3.5">
                                                    <span
                                                        className={[
                                                            "flex size-11 shrink-0 items-center justify-center rounded-full",
                                                            presentation.classe,
                                                        ].join(" ")}
                                                    >
                                                        <Icon size={19} strokeWidth={2} />
                                                    </span>

                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="min-w-0">
                                                                <h2 className="font-sans text-sm font-bold text-jse-texte">
                                                                    {presentation.titre}
                                                                </h2>

                                                                {notification.commande_id && (
                                                                    <p className="mt-0.5 font-sans text-[10px] font-medium text-jse-principal/65">
                                                                        Commande #{notification.commande_id}
                                                                    </p>
                                                                )}
                                                            </div>

                                                            {date && (
                                                                <time
                                                                    dateTime={date}
                                                                    className="shrink-0 font-sans text-[9px] leading-4 text-jse-texte/35"
                                                                >
                                                                    {formaterDate(date)}
                                                                </time>
                                                            )}
                                                        </div>

                                                        <p className="mt-2 font-sans text-xs leading-5 text-jse-texte/60">
                                                            {notification.contenu ||
                                                                "Notification enregistrée sur votre compte."}
                                                        </p>

                                                        <div className="mt-3 flex flex-wrap items-center gap-2">
                                                            {notification.canal && (
                                                                <span className="rounded-full bg-jse-fond px-2.5 py-1 font-sans text-[9px] font-semibold uppercase tracking-[0.08em] text-jse-texte/45">
                                                                    {notification.canal}
                                                                </span>
                                                            )}

                                                            {notification.statut_envoi && (
                                                                <span className="rounded-full bg-jse-fond px-2.5 py-1 font-sans text-[9px] font-semibold uppercase tracking-[0.08em] text-jse-texte/45">
                                                                    {notification.statut_envoi}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="rounded-[28px] bg-white px-6 py-16 text-center shadow-sm ring-1 ring-jse-texte/5">
                                    <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-jse-secondaire/10 text-jse-secondaire">
                                        <Bell size={29} strokeWidth={1.7} />
                                    </div>
                                    <h2 className="mt-5 font-against text-2xl text-jse-principal">
                                        Aucune notification
                                    </h2>
                                    <p className="mx-auto mt-2 max-w-sm font-sans text-sm leading-5 text-jse-texte/50">
                                        Les notifications liées à votre activité apparaîtront ici.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => router.visit("/accueil")}
                                        className="mt-6 inline-flex items-center gap-2 rounded-full bg-jse-principal px-5 py-3 font-sans text-xs font-bold text-white shadow-lg shadow-jse-principal/15 transition hover:bg-jse-principal/90"
                                    >
                                        Retour à l’accueil
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </div>

            <nav className="fixed inset-x-0 bottom-0 z-40 px-4 pb-4 lg:hidden">
                <div className="mx-auto flex h-[66px] w-full max-w-md items-center justify-around rounded-[24px] border border-white/80 bg-white/95 px-1 shadow-xl shadow-jse-principal/10 backdrop-blur-xl">
                    <NavigationItem
                        label="Accueil"
                        icon={Home}
                        onClick={() => router.visit("/accueil")}
                    />
                    <NavigationItem
                        label="Commandes"
                        icon={Package}
                        onClick={() => router.visit("/commandes")}
                    />
                    <NavigationItem
                        label="Favoris"
                        icon={Heart}
                        onClick={() => router.visit("/favoris")}
                    />
                    <NavigationItem
                        label="Profil"
                        icon={UserRound}
                        active
                        onClick={() => router.visit("/profil")}
                    />
                </div>
            </nav>
        </main>
    );
}

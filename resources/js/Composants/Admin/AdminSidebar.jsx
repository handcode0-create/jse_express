import React, { useState } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import {
    LayoutDashboard,
    ShoppingBag,
    Truck,
    Users,
    Store,
    Bike,
    MapPinned,
    Bell,
    MoreHorizontal,
    X,
    LogOut,
} from "lucide-react";
import PhotoProfil from "../Profil/PhotoProfil";
import ThemeToggle from "../Interface/ThemeToggle";

export default function AdminSidebar({ utilisateur }) {
    const [menuOuvert, setMenuOuvert] = useState(false);
    const { url = "" } = usePage();

    const profilNom =
        [utilisateur?.prenom, utilisateur?.nom].filter(Boolean).join(" ") ||
        "Administrateur";

    const sections = [
        {
            label: "Vue d'ensemble",
            items: [
                {
                    href: "/administration/tableau-de-bord",
                    label: "Tableau de bord",
                    icon: LayoutDashboard,
                },
            ],
        },
        {
            label: "Opérations",
            items: [
                {
                    href: "/administration/commandes",
                    label: "Commandes",
                    icon: ShoppingBag,
                },
                {
                    href: "/administration/livraisons",
                    label: "Livraisons",
                    icon: Truck,
                },
            ],
        },
        {
            label: "Utilisateurs",
            items: [
                { href: "/administration/clients", label: "Clients", icon: Users },
                {
                    href: "/administration/restaurants",
                    label: "Restaurants",
                    icon: Store,
                },
                { href: "/administration/livreurs", label: "Livreurs", icon: Bike },
            ],
        },
        {
            label: "Configuration opérationnelle",
            items: [
                {
                    href: "/administration/zones",
                    label: "Zones & attribution",
                    icon: MapPinned,
                },
                {
                    href: "/administration/notifications",
                    label: "Notifications",
                    icon: Bell,
                },
            ],
        },
    ];

    const raccourcisMobiles = [
        {
            href: "/administration/tableau-de-bord",
            label: "Accueil",
            icon: LayoutDashboard,
        },
        {
            href: "/administration/commandes",
            label: "Commandes",
            icon: ShoppingBag,
        },
        {
            href: "/administration/livraisons",
            label: "Livraisons",
            icon: Truck,
        },
        {
            href: "#",
            label: "Plus",
            icon: MoreHorizontal,
        },
    ];

    const estActif = (href) =>
        href !== "#" && (url === href || url.startsWith(href + "/"));

    const pageCourante =
        sections
            .flatMap((section) => section.items)
            .find((item) => estActif(item.href))?.label || "Administration";

    const fermerMenu = () => setMenuOuvert(false);

    const deconnexion = () => {
        router.post("/deconnexion");
    };

    return (
        <>
            {/* Navigation desktop */}
            <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:flex lg:h-screen lg:w-[238px] lg:shrink-0 lg:overflow-y-auto border-r border-jse-theme-border bg-jse-theme-surface/90 backdrop-blur-xl">
                <div className="flex min-h-full w-full flex-col px-4 py-7">
                    <div className="flex items-center justify-between gap-3">
                        <img
                            src="/assets/jse_logo.png?v=20261002"
                            alt="JSE Express"
                            className="h-11 w-auto object-contain"
                        />
                    </div>

                    <nav
                        className="mt-10 space-y-6"
                        aria-label="Navigation administration"
                    >
                        {sections.map((section) => (
                            <div key={section.label}>
                                <p className="px-4 font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-jse-theme-muted">
                                    {section.label}
                                </p>
                                <div className="mt-3 space-y-1.5">
                                    {section.items.map(
                                        ({ href, label, icon: Icon }) => (
                                            <Link
                                                key={href}
                                                href={href}
                                                className={[
                                                    "group flex min-h-11 w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition-all",
                                                    estActif(href)
                                                        ? "bg-jse-secondaire/10 text-jse-secondaire"
                                                        : "text-jse-theme-muted hover:bg-jse-theme-bg hover:text-jse-principal dark:hover:text-jse-secondaire",
                                                ].join(" ")}
                                            >
                                                <Icon
                                                    size={17}
                                                    strokeWidth={2}
                                                    aria-hidden="true"
                                                />
                                                <span className="truncate">
                                                    {label}
                                                </span>
                                            </Link>
                                        ),
                                    )}
                                </div>
                            </div>
                        ))}
                    </nav>

                    <div className="mt-auto px-3">
                        <div className="mb-3 flex items-center justify-between rounded-2xl px-3 py-2">
                            <span className="font-sans text-xs font-medium text-jse-theme-muted">
                                Thème
                            </span>
                            <ThemeToggle compact />
                        </div>

                        <div className="rounded-2xl bg-jse-theme-bg p-3.5">
                            <div className="flex items-center gap-3">
                                <PhotoProfil
                                    user={utilisateur}
                                    size="size-10"
                                    dark
                                />
                                <div className="min-w-0">
                                    <p className="truncate font-sans text-xs font-semibold text-jse-theme-text">
                                        {profilNom}
                                    </p>
                                    <p className="mt-0.5 truncate font-sans text-[10px] text-jse-theme-muted">
                                        Administrateur
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={deconnexion}
                                className="mt-3 flex min-h-10 w-full items-center gap-3 rounded-2xl px-3 py-2.5 font-sans text-xs font-medium text-jse-theme-muted transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
                            >
                                <LogOut size={15} aria-hidden="true" />
                                Se déconnecter
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Barre supérieure mobile */}
            <header className="sticky top-0 z-40 border-b border-jse-theme-border bg-jse-theme-surface/95 backdrop-blur-xl lg:hidden">
                <div className="flex h-[68px] items-center justify-between px-4">
                    <Link
                        href="/administration/tableau-de-bord"
                        aria-label="Retour au tableau de bord"
                        className="flex min-w-0 items-center gap-3"
                    >
                        <img
                            src="/assets/jse_logo.png?v=20261002"
                            alt="JSE Express"
                            className="h-9 w-auto shrink-0 object-contain"
                        />
                        <span className="min-w-0 truncate text-sm font-semibold text-jse-theme-text">
                            {pageCourante}
                        </span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <ThemeToggle compact />
                        <button
                            type="button"
                            onClick={() => setMenuOuvert(true)}
                            className="flex size-10 items-center justify-center rounded-full border border-jse-theme-border bg-jse-theme-surface-soft text-jse-theme-text"
                            aria-label="Ouvrir le menu administration"
                        >
                            <MoreHorizontal size={19} aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Menu secondaire mobile */}
            {menuOuvert && (
                <div
                    className="fixed inset-0 z-[60] lg:hidden"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Menu administration"
                >
                    <button
                        type="button"
                        className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
                        onClick={fermerMenu}
                        aria-label="Fermer le menu"
                    />

                    <div className="absolute inset-x-0 bottom-0 max-h-[82vh] overflow-y-auto rounded-t-[28px] border-t border-jse-theme-border bg-jse-theme-surface px-4 pb-[calc(env(safe-area-inset-bottom)+24px)] pt-4 shadow-2xl">
                        <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-jse-theme-border" />

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-jse-secondaire">
                                    Administration
                                </p>
                                <p className="mt-1 text-base font-semibold text-jse-theme-text">
                                    Navigation
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={fermerMenu}
                                className="flex size-10 items-center justify-center rounded-full border border-jse-theme-border bg-jse-theme-surface-soft text-jse-theme-text"
                                aria-label="Fermer"
                            >
                                <X size={18} aria-hidden="true" />
                            </button>
                        </div>

                        <nav className="mt-5 grid grid-cols-2 gap-3">
                            {sections
                                .flatMap((section) => section.items)
                                .filter(
                                    (item) =>
                                        item.href !==
                                        "/administration/tableau-de-bord",
                                )
                                .map(({ href, label, icon: Icon }) => (
                                    <Link
                                        key={href}
                                        href={href}
                                        onClick={fermerMenu}
                                        className={[
                                            "flex min-h-14 items-center gap-3 rounded-2xl border px-3.5 text-left text-sm font-medium",
                                            estActif(href)
                                                ? "border-jse-secondaire/30 bg-jse-secondaire/10 text-jse-principal dark:text-jse-secondaire"
                                                : "border-jse-theme-border bg-jse-theme-surface-soft text-jse-theme-text",
                                        ].join(" ")}
                                    >
                                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-jse-theme-surface text-jse-theme-muted">
                                            <Icon size={17} aria-hidden="true" />
                                        </span>
                                        <span className="truncate">{label}</span>
                                    </Link>
                                ))}
                        </nav>

                        <div className="mt-5 rounded-jse-moyen border border-jse-theme-border bg-jse-theme-surface-soft p-3">
                            <div className="flex items-center gap-3">
                                <PhotoProfil
                                    user={utilisateur}
                                    size="size-10"
                                    dark
                                />
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-jse-theme-text">
                                        {profilNom}
                                    </p>
                                    <p className="truncate text-xs text-jse-theme-muted">
                                        Administrateur
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={deconnexion}
                                className="mt-3 flex min-h-10 w-full items-center justify-center gap-2 rounded-full border border-jse-theme-border bg-jse-theme-surface text-xs font-semibold text-jse-theme-text transition hover:border-jse-secondaire hover:text-jse-secondaire"
                            >
                                <LogOut size={15} aria-hidden="true" />
                                Se déconnecter
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation basse façon application */}
            <nav
                className="fixed inset-x-0 bottom-0 z-50 border-t border-jse-theme-border bg-jse-theme-surface/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-10px_30px_rgba(18,60,50,0.08)] backdrop-blur-xl lg:hidden"
                aria-label="Navigation mobile administration"
            >
                <div className="mx-auto grid max-w-lg grid-cols-4 gap-1">
                    {raccourcisMobiles.map(({ href, label, icon: Icon }) => {
                        const actif = href !== "#" && estActif(href);

                        if (href === "#") {
                            return (
                                <button
                                    key={label}
                                    type="button"
                                    onClick={() => setMenuOuvert(true)}
                                    className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-medium text-jse-theme-muted"
                                >
                                    <span className="flex size-8 items-center justify-center rounded-xl bg-jse-theme-surface-soft">
                                        <Icon size={18} aria-hidden="true" />
                                    </span>
                                    {label}
                                </button>
                            );
                        }

                        return (
                            <Link
                                key={href}
                                href={href}
                                className={[
                                    "flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-medium transition-colors",
                                    actif
                                        ? "bg-jse-secondaire/10 text-jse-principal dark:text-jse-secondaire"
                                        : "text-jse-theme-muted",
                                ].join(" ")}
                            >
                                <span
                                    className={[
                                        "flex size-8 items-center justify-center rounded-xl",
                                        actif
                                            ? "bg-jse-secondaire/15"
                                            : "bg-jse-theme-surface-soft",
                                    ].join(" ")}
                                >
                                    <Icon size={18} aria-hidden="true" />
                                </span>
                                {label}
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </>
    );
}

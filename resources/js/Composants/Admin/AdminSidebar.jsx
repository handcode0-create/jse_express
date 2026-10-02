import React from "react";
import { LayoutDashboard, ShoppingBag, Truck, Users, Store, Bike, MapPinned, Bell } from "lucide-react";
import PhotoProfil from "../Profil/PhotoProfil";
import ThemeToggle from "../Interface/ThemeToggle";

export default function AdminSidebar({ utilisateur }) {
    const profilNom = [utilisateur?.prenom, utilisateur?.nom].filter(Boolean).join(" ") || "Administrateur";
    const sections = [
        {
            label: "Vue d'ensemble",
            items: [{ href: "/administration/tableau-de-bord", label: "Tableau de bord", icon: LayoutDashboard }],
        },
        {
            label: "Opérations",
            items: [
                { href: "/administration/commandes", label: "Commandes", icon: ShoppingBag },
                { href: "/administration/livraisons", label: "Livraisons", icon: Truck },
            ],
        },
        {
            label: "Utilisateurs",
            items: [
                { href: "/administration/clients", label: "Clients", icon: Users },
                { href: "/administration/restaurants", label: "Restaurants", icon: Store },
                { href: "/administration/livreurs", label: "Livreurs", icon: Bike },
            ],
        },
        {
            label: "Configuration opérationnelle",
            items: [
                { href: "/administration/zones", label: "Zones & attribution", icon: MapPinned },
                { href: "/administration/notifications", label: "Notifications", icon: Bell },
            ],
        },
    ];

    return (
        <aside className="border-b border-jse-theme-border bg-jse-theme-surface lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
            <div className="flex h-full flex-col p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                    <img src="/assets/jse_logo.png?v=20261002" alt="JSE Express" className="h-10 w-auto object-contain" />
                    <div className="lg:hidden"><ThemeToggle compact /></div>
                </div>
                <nav className="mt-8 space-y-6" aria-label="Navigation administration">
                    {sections.map((section) => (
                        <div key={section.label}>
                            <p className="px-3 text-xs font-semibold uppercase tracking-[0.16em] text-jse-theme-muted">{section.label}</p>
                            <div className="mt-2 space-y-1">
                                {section.items.map(({ href, label, icon: Icon }) => (
                                    <a key={href} href={href} className="flex min-h-11 items-center gap-3 rounded-full px-4 text-sm font-medium text-jse-theme-muted transition-colors hover:bg-jse-secondaire/10 hover:text-jse-principal dark:hover:text-jse-secondaire">
                                        <Icon size={17} strokeWidth={2} aria-hidden="true" />
                                        <span className="truncate">{label}</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>
                <div className="mt-auto hidden lg:block">
                    <div className="mb-4 flex justify-end"><ThemeToggle /></div>
                    <div className="rounded-jse-moyen border border-jse-theme-border bg-jse-theme-surface-soft p-3">
                        <div className="flex items-center gap-3">
                            <PhotoProfil user={utilisateur} size="size-10" dark />
                            <div className="min-w-0">
                                <p className="truncate text-xs font-semibold text-jse-theme-text">{profilNom}</p>
                                <p className="mt-0.5 truncate text-xs text-jse-theme-muted">Administrateur</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}

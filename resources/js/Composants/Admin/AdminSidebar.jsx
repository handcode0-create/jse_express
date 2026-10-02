import React from "react";
import { LayoutDashboard, ShoppingBag, Truck } from "lucide-react";
import PhotoProfil from "../Profil/PhotoProfil";
import ThemeToggle from "../Interface/ThemeToggle";

export default function AdminSidebar({ utilisateur }) {
    const profilNom = [utilisateur?.prenom, utilisateur?.nom].filter(Boolean).join(" ") || "Administrateur";
    const navigation = [
        { href: "#vue-ensemble", label: "Tableau de bord", icon: LayoutDashboard },
        { href: "#commandes", label: "Commandes", icon: ShoppingBag },
        { href: "#livraisons", label: "Livraisons", icon: Truck },
    ];

    return (
        <aside className="border-b border-jse-theme-border bg-jse-theme-surface lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
            <div className="flex h-full flex-col p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                    <img src="/assets/jse_logo.png" alt="JSE Express" className="h-10 w-auto object-contain" />
                    <div className="lg:hidden"><ThemeToggle compact /></div>
                </div>

                <nav className="mt-8" aria-label="Navigation administration">
                    <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-jse-theme-muted">Navigation</p>
                    <div className="mt-3 space-y-1">
                        {navigation.map(({ href, label, icon: Icon }, index) => (
                            <a
                                key={href}
                                href={href}
                                className={[
                                    "flex min-h-11 items-center gap-3 rounded-full px-4 text-sm font-medium transition-colors",
                                    index === 0
                                        ? "bg-jse-principal text-white"
                                        : "text-jse-theme-muted hover:bg-jse-secondaire/10 hover:text-jse-principal dark:hover:text-jse-secondaire",
                                ].join(" ")}
                            >
                                <Icon size={17} strokeWidth={2} aria-hidden="true" />
                                {label}
                            </a>
                        ))}
                    </div>
                </nav>

                <div className="mt-auto hidden lg:block">
                    <div className="mb-4 flex justify-end"><ThemeToggle /></div>
                    <div className="rounded-jse-moyen border border-jse-theme-border bg-jse-theme-surface-soft p-3">
                        <div className="flex items-center gap-3">
                            <PhotoProfil user={utilisateur} size="size-10" dark />
                            <div className="min-w-0">
                                <p className="truncate text-xs font-semibold text-jse-theme-text">{profilNom}</p>
                                <p className="mt-0.5 truncate text-[10px] text-jse-theme-muted">Administrateur</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}

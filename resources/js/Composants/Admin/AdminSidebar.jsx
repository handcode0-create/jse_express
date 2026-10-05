import { Link, router, usePage } from "@inertiajs/react";
import {
    Bell,
    Bike,
    Calculator,
    LayoutDashboard,
    LogOut,
    MapPinned,
    Settings,
    ShoppingBag,
    Store,
    Truck,
    UserCog,
    UserRound,
} from "lucide-react";
import PhotoProfil from "../Profil/PhotoProfil";
import ThemeToggle from "../Interface/ThemeToggle";
import NavigationFlottante from "../Navigation/NavigationFlottante";

const sections = [
    {
        label: "Vue d’ensemble",
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
            { href: "/administration/utilisateurs", label: "Utilisateurs & rôles", icon: UserCog },
            { href: "/administration/clients", label: "Clients", icon: UserRound },
            { href: "/administration/restaurants", label: "Restaurants", icon: Store },
            { href: "/administration/livreurs", label: "Livreurs", icon: Bike },
        ],
    },
    {
        label: "Configuration",
        items: [
            { href: "/administration/zones", label: "Zones & attribution", icon: MapPinned },
            { href: "/administration/tarification", label: "Tarification", icon: Calculator },
            { href: "/administration/notifications", label: "Notifications", icon: Bell },
            { href: "/administration/compte", label: "Mon compte", icon: Settings },
        ],
    },
];

function LienNavigation({ item, actif }) {
    const Icone = item.icon;

    return (
        <Link
            href={item.href}
            aria-current={actif ? "page" : undefined}
            className={[
                "jse-admin-nav-item relative flex min-h-11 w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-sm transition",
                "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-jse-secondaire/30",
                actif
                    ? "bg-jse-secondaire/15 font-semibold text-jse-theme-heading before:absolute before:inset-y-2.5 before:left-0 before:w-1 before:rounded-full before:bg-jse-secondaire"
                    : "font-medium text-jse-theme-muted hover:bg-jse-theme-surface-soft hover:text-jse-theme-text",
            ].join(" ")}
        >
            <Icone size={19} strokeWidth={actif ? 2.2 : 1.8} aria-hidden="true" />
            <span className="min-w-0 truncate">{item.label}</span>
        </Link>
    );
}

export default function AdminSidebar({ utilisateur = null }) {
    const { url = "" } = usePage();
    const chemin = url.split("?")[0];
    const nomComplet = [utilisateur?.prenom, utilisateur?.nom].filter(Boolean).join(" ") || "JSE Admin";

    const estActif = (href) => chemin === href || chemin.startsWith(href + "/");

    return (
        <>
            <aside className="jse-admin-sidebar fixed inset-y-0 left-0 z-50 hidden w-[264px] flex-col overflow-y-auto border-r border-jse-theme-border bg-jse-theme-surface/90 px-4 py-6 backdrop-blur-xl lg:flex">
                <Link href="/administration/tableau-de-bord" className="block w-fit px-3" aria-label="JSE Express — tableau de bord">
                    <img src="/assets/jse_logo.png" alt="" className="h-11 w-auto object-contain" />
                </Link>

                <nav className="mt-8 space-y-6" aria-label="Navigation administration">
                    {sections.map((section) => (
                        <div key={section.label}>
                            <p className="jse-admin-label px-4 pb-2 text-xs font-semibold uppercase tracking-[0.14em] text-jse-theme-muted">
                                {section.label}
                            </p>
                            <div className="space-y-1">
                                {section.items.map((item) => (
                                    <LienNavigation key={item.href} item={item} actif={estActif(item.href)} />
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>

                <div className="mt-auto space-y-2 pt-8">
                    <div className="jse-admin-profile flex items-center gap-3 rounded-2xl bg-jse-theme-surface-soft p-3">
                        <PhotoProfil user={utilisateur} size="size-10" dark />
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-jse-theme-text">{nomComplet}</p>
                            <p className="truncate text-xs text-jse-theme-muted">Administrateur</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl px-3 py-2">
                        <span className="text-sm font-medium text-jse-theme-muted">Thème</span>
                        <ThemeToggle compact />
                    </div>

                    <button
                        type="button"
                        onClick={() => router.post("/deconnexion")}
                        className="flex min-h-11 w-full items-center gap-3 rounded-2xl px-3 text-sm font-medium text-jse-theme-muted transition hover:bg-jse-danger/10 hover:text-jse-danger focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-jse-secondaire/30"
                    >
                        <LogOut size={18} strokeWidth={1.8} aria-hidden="true" />
                        Déconnexion
                    </button>
                </div>
            </aside>

            <NavigationFlottante type="admin" />
        </>
    );
}

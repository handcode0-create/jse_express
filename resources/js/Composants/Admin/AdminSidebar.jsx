import { router, usePage } from "@inertiajs/react";
import {
    LayoutDashboard,
    ShoppingBag,
    Truck,
    Users,
    Store,
    Bike,
    MapPinned,
    Bell,
    LogOut,
} from "lucide-react";
import PhotoProfil from "../Profil/PhotoProfil";
import ThemeToggle from "../Interface/ThemeToggle";
import NavigationFlottante from "../Navigation/NavigationFlottante";

const sections = [
    {
        label: "Vue d’ensemble",
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
            {
                href: "/administration/utilisateurs",
                label: "Utilisateurs & rôles",
                icon: Users,
            },
            {
                href: "/administration/clients",
                label: "Clients",
                icon: Users,
            },
            {
                href: "/administration/restaurants",
                label: "Restaurants",
                icon: Store,
            },
            {
                href: "/administration/livreurs",
                label: "Livreurs",
                icon: Bike,
            },
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

function NavigationItem({ item, active }) {
    const Icon = item.icon;

    return (
        <button
            type="button"
            aria-current={active ? "page" : undefined}
            onClick={() => router.visit(item.href)}
            className={[
                "group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all",
                active
                    ? "bg-jse-secondaire/10 text-jse-secondaire"
                    : "text-jse-texte/45 hover:bg-jse-fond hover:text-jse-principal dark:text-white/45 dark:hover:bg-white/5 dark:hover:text-jse-secondaire",
            ].join(" ")}
        >
            <Icon size={19} strokeWidth={active ? 2.2 : 1.8} aria-hidden="true" />
            <span className="min-w-0 truncate font-sans text-sm font-medium">
                {item.label}
            </span>
        </button>
    );
}

export default function AdminSidebar({ utilisateur }) {
    const { url = "" } = usePage();

    const utilisateurActuel = utilisateur ?? null;
    const profilNom =
        [utilisateurActuel?.prenom, utilisateurActuel?.nom]
            .filter(Boolean)
            .join(" ") || "JSE Admin";

    const estActif = (href) =>
        url === href || url.startsWith(href + "/");

    return (
        <>
            <aside className="jse-admin-sidebar fixed inset-y-0 left-0 z-50 hidden h-screen w-[238px] shrink-0 flex-col overflow-y-auto border-r border-jse-texte/5 bg-white/75 px-4 py-7 backdrop-blur-xl dark:border-white/8 dark:bg-[#101719]/90 lg:flex">
                <div className="px-4">
                    <img
                        src="/assets/jse_logo.png"
                        alt="JSE Express"
                        className="h-11 w-auto object-contain"
                    />
                </div>

                <div className="mt-10">
                    <p className="jse-admin-label px-4 font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-jse-texte/30 dark:text-white/30">
                        Administration
                    </p>

                    <nav
                        className="mt-3 space-y-5"
                        aria-label="Navigation administration"
                    >
                        {sections.map((section) => (
                            <div key={section.label}>
                                <p className="px-4 pb-1.5 font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-jse-texte/30 dark:text-white/30">
                                    {section.label}
                                </p>

                                <div className="space-y-1.5">
                                    {section.items.map((item) => (
                                        <NavigationItem
                                            key={item.href}
                                            item={item}
                                            active={estActif(item.href)}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto px-3 pt-6">
                    <div className="jse-admin-profile mb-3 rounded-2xl bg-jse-fond p-3.5 dark:bg-white/[0.035]">
                        <div className="flex items-center gap-3">
                            <PhotoProfil
                                user={utilisateurActuel}
                                size="size-9"
                                dark
                            />

                            <div className="min-w-0">
                                <p className="truncate font-sans text-xs font-semibold text-jse-texte dark:text-white">
                                    {profilNom}
                                </p>
                                <p className="truncate font-sans text-[10px] text-jse-texte/40 dark:text-white/40">
                                    Administrateur
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-2 flex items-center justify-between rounded-2xl px-3 py-2">
                        <span className="font-sans text-xs font-medium text-jse-texte/55 dark:text-white/55">
                            Thème
                        </span>
                        <ThemeToggle compact />
                    </div>

                    <button
                        type="button"
                        onClick={() => router.post("/deconnexion")}
                        className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 font-sans text-xs font-medium text-jse-texte/45 transition hover:bg-red-50 hover:text-red-600 dark:text-white/45 dark:hover:bg-red-950/20 dark:hover:text-red-300"
                    >
                        <LogOut size={17} strokeWidth={1.8} aria-hidden="true" />
                        Déconnexion
                    </button>
                </div>
            </aside>

            <NavigationFlottante type="admin" />
        </>
    );
}

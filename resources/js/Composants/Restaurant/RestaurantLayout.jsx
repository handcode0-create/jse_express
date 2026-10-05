import { Link, router, usePage } from "@inertiajs/react";
import { BarChart3, Clock3, LayoutDashboard, LogOut, MapPin, ShoppingBag, Store, UserRound, UtensilsCrossed } from "lucide-react";
import MessageFlash from "../Interface/MessageFlash";
import ThemeToggle from "../Interface/ThemeToggle";
import NavigationFlottante from "../Navigation/NavigationFlottante";
import PhotoProfil from "../Profil/PhotoProfil";

export const rubriques = [
    { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { id: "commandes", label: "Commandes", icon: ShoppingBag, badge: true },
    { id: "menu", label: "Menu et produits", icon: UtensilsCrossed },
    { id: "statistiques", label: "Statistiques", icon: BarChart3 },
    { id: "horaires", label: "Horaires", icon: Clock3 },
    { id: "profil", label: "Profil du restaurant", icon: Store },
    { id: "parametres", label: "Mon compte", icon: UserRound },
];

/**
 * Structure commune de l'espace restaurant : navigation latérale (desktop),
 * barre flottante (mobile), en-tête, messages et marges.
 *
 * @param {{ restaurant: { nom: string, adresse?: string }|null, onglet: string, onNavigate: (id: string) => void, aTraiter?: number }} props
 */
export default function RestaurantLayout({ restaurant, onglet, onNavigate, aTraiter = 0, children }) {
    const { auth } = usePage().props;
    const utilisateur = auth?.user ?? null;
    const nomComplet = [utilisateur?.prenom, utilisateur?.nom].filter(Boolean).join(" ") || "Responsable";

    return (
        <main className="jse-admin-page min-h-screen overflow-x-hidden bg-jse-theme-bg text-jse-theme-text">
            <a
                href="#contenu-restaurant"
                className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[110] focus:rounded-full focus:bg-jse-principal focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
            >
                Aller au contenu
            </a>

            <aside className="jse-admin-sidebar fixed inset-y-0 left-0 z-50 hidden w-[264px] flex-col overflow-y-auto border-r border-jse-theme-border bg-jse-theme-surface/90 px-4 py-6 backdrop-blur-xl lg:flex">
                <Link href="/restaurant/tableau-de-bord" className="block w-fit px-3" aria-label="JSE Express — espace restaurant">
                    <img src="/assets/jse_logo.png" alt="" className="h-11 w-auto object-contain" />
                </Link>

                <div className="mx-3 mt-6 rounded-2xl bg-jse-theme-surface-soft p-3">
                    <p className="truncate text-sm font-semibold text-jse-theme-heading">{restaurant?.nom || "Mon restaurant"}</p>
                    {restaurant?.adresse && (
                        <p className="mt-1 flex items-start gap-1.5 text-xs text-jse-theme-muted">
                            <MapPin size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
                            <span className="line-clamp-2">{restaurant.adresse}</span>
                        </p>
                    )}
                </div>

                <nav className="mt-6 space-y-1" aria-label="Navigation du restaurant">
                    {rubriques.map(({ id, label, icon: Icone, badge }) => {
                        const actif = onglet === id;

                        return (
                            <button
                                key={id}
                                type="button"
                                onClick={() => onNavigate(id)}
                                aria-current={actif ? "page" : undefined}
                                className={[
                                    "jse-admin-nav-item relative flex min-h-11 w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-left text-sm transition",
                                    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-jse-secondaire/30",
                                    actif
                                        ? "bg-jse-secondaire/15 font-semibold text-jse-theme-heading before:absolute before:inset-y-2.5 before:left-0 before:w-1 before:rounded-full before:bg-jse-secondaire"
                                        : "font-medium text-jse-theme-muted hover:bg-jse-theme-surface-soft hover:text-jse-theme-text",
                                ].join(" ")}
                            >
                                <Icone size={19} strokeWidth={actif ? 2.2 : 1.8} aria-hidden="true" />
                                <span className="min-w-0 flex-1 truncate">{label}</span>
                                {badge && aTraiter > 0 && (
                                    <span className="min-w-6 rounded-full bg-jse-accent px-2 py-0.5 text-center text-xs font-bold tabular-nums text-white" aria-label={`${aTraiter} à traiter`}>
                                        {aTraiter}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>

                <div className="mt-auto space-y-2 pt-8">
                    <div className="jse-admin-profile flex items-center gap-3 rounded-2xl bg-jse-theme-surface-soft p-3">
                        <PhotoProfil user={utilisateur} size="size-10" dark />
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-jse-theme-text">{nomComplet}</p>
                            <p className="truncate text-xs text-jse-theme-muted">Responsable du restaurant</p>
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

            <div className="lg:pl-[264px]">
                <header className="flex items-center gap-3 px-4 pt-5 sm:px-6 lg:hidden">
                    <img src="/assets/jse_logo.png" alt="JSE Express" className="h-10 w-auto shrink-0 object-contain" />
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-jse-theme-heading">{restaurant?.nom || "Mon restaurant"}</p>
                        {restaurant?.adresse && <p className="truncate text-xs text-jse-theme-muted">{restaurant.adresse}</p>}
                    </div>
                </header>

                <div
                    id="contenu-restaurant"
                    tabIndex={-1}
                    className="mx-auto w-full max-w-6xl px-4 pb-[calc(112px+env(safe-area-inset-bottom))] pt-4 focus:outline-none sm:px-6 sm:pt-6 lg:px-8 lg:pb-10 lg:pt-9"
                >
                    <MessageFlash />
                    {children}
                </div>
            </div>

            <NavigationFlottante type="restaurant" actif={onglet} onChange={onNavigate} />
        </main>
    );
}

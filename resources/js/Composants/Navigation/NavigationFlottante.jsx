import { router } from "@inertiajs/react";
import { Heart, Home, LayoutDashboard, MapPin, Receipt, ShoppingBag, UserRound, UtensilsCrossed, WalletCards } from "lucide-react";

const ensembles = {
    client: [
        { id: "accueil", label: "Accueil", icon: Home, route: "/accueil" },
        { id: "commandes", label: "Commandes", icon: ShoppingBag, route: "/commandes" },
        { id: "favoris", label: "Favoris", icon: Heart, route: "/favoris" },
        { id: "profil", label: "Profil", icon: UserRound, route: "/profil" },
    ],
    restaurant: [
        { id: "dashboard", label: "Accueil", icon: LayoutDashboard },
        { id: "commandes", label: "Commandes", icon: ShoppingBag },
        { id: "menu", label: "Menu", icon: UtensilsCrossed },
        { id: "profil", label: "Profil", icon: UserRound },
    ],
    livreur: [
        { id: "accueil", label: "Accueil", icon: Home },
        { id: "missions", label: "Missions", icon: Receipt },
        { id: "carte", label: "Carte", icon: MapPin },
        { id: "gains", label: "Gains", icon: WalletCards },
        { id: "profil", label: "Profil", icon: UserRound },
    ],
};

export default function NavigationFlottante({
    type = "client",
    actif,
    onChange,
}) {
    const items = ensembles[type] || ensembles.client;

    return (
        <nav
            aria-label="Navigation principale"
            className="fixed inset-x-0 bottom-0 z-[70] px-3 pb-[max(12px,env(safe-area-inset-bottom))] lg:hidden"
        >
            <div className="mx-auto flex h-[68px] w-full max-w-[456px] items-center justify-around rounded-[34px] border border-white/10 bg-[#101719]/95 p-1.5 shadow-[0_20px_60px_rgba(0,0,0,.55)] backdrop-blur-2xl">
                {items.map(({ id, label, icon: Icon, route }) => {
                    const selected = actif === id;

                    return (
                        <button
                            key={id}
                            type="button"
                            aria-current={selected ? "page" : undefined}
                            onClick={() => {
                                if (onChange) {
                                    onChange(id);
                                } else if (route) {
                                    router.visit(route);
                                }
                            }}
                            className={[
                                "flex h-[54px] min-w-[54px] flex-1 items-center justify-center rounded-[28px] px-2 transition-all duration-200 active:scale-95",
                                selected
                                    ? "gap-1.5 bg-jse-accent text-jse-principal shadow-[0_8px_24px_rgba(242,140,40,.24)]"
                                    : "gap-0 text-white/40 hover:text-white/75",
                            ].join(" ")}
                        >
                            <Icon size={18} strokeWidth={selected ? 2.35 : 1.8} />
                            {selected && (
                                <span className="whitespace-nowrap text-[9px] font-bold">
                                    {label}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}

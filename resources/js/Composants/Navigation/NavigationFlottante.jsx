import { router } from "@inertiajs/react";
import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import {
    Heart,
    Home,
    LayoutDashboard,
    MapPin,
    Receipt,
    ShoppingBag,
    UserRound,
    UtensilsCrossed,
    Bell,
    Truck,
    Users,
    MoreHorizontal,
    Store,
    Bike,
    MapPinned,
    LogOut,
    X,
} from "lucide-react";

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
    admin: [
        { id: "dashboard", label: "Accueil", icon: LayoutDashboard, route: "/administration/tableau-de-bord" },
        { id: "commandes", label: "Commandes", icon: ShoppingBag, route: "/administration/commandes" },
        { id: "livraisons", label: "Livraisons", icon: Truck, route: "/administration/livraisons" },
        { id: "utilisateurs", label: "Utilisateurs", icon: Users, route: "/administration/utilisateurs" },
        { id: "plus", label: "Plus", icon: MoreHorizontal },
    ],
    livreur: [
        { id: "accueil", label: "Accueil", icon: Home },
        { id: "missions", label: "Missions", icon: Receipt },
        { id: "carte", label: "Carte", icon: MapPin },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "profil", label: "Profil", icon: UserRound },
    ],
};

const adminSecondaire = [
    { label: "Clients", icon: Users, route: "/administration/clients" },
    { label: "Restaurants", icon: Store, route: "/administration/restaurants" },
    { label: "Livreurs", icon: Bike, route: "/administration/livreurs" },
    { label: "Zones & attribution", icon: MapPinned, route: "/administration/zones" },
    { label: "Notifications", icon: Bell, route: "/administration/notifications" },
];

export default function NavigationFlottante({
    type = "client",
    actif,
    onChange,
}) {
    const navigationRef = useRef(null);
    const [adminMenuOuvert, setAdminMenuOuvert] = useState(false);
    const items = ensembles[type] || ensembles.client;
    const chemin =
        typeof window !== "undefined" ? window.location.pathname : "";

    const adminSecondaireActif =
        type === "admin" &&
        adminSecondaire.some(
            (item) =>
                chemin === item.route || chemin.startsWith(item.route + "/"),
        );

    const actifDepuisUrl =
        items.find(
            (item) =>
                item.route &&
                (chemin === item.route || chemin.startsWith(item.route + "/")),
        )?.id;

    const actifEffectif =
        actif && items.some((item) => item.id === actif)
            ? actif
            : adminSecondaireActif
              ? "plus"
              : actifDepuisUrl || items[0]?.id;

    useLayoutEffect(() => {
        if (
            !navigationRef.current ||
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ) {
            return;
        }

        const activeButton =
            navigationRef.current.querySelector('[aria-current="page"]');

        if (!activeButton) return;

        const context = gsap.context(() => {
            gsap.fromTo(
                activeButton,
                { y: 8, opacity: 0.78 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.42,
                    ease: "power3.out",
                    clearProps: "transform,opacity",
                },
            );
        }, navigationRef);

        return () => context.revert();
    }, [actifEffectif, type, adminMenuOuvert]);

    return (
        <nav
            ref={navigationRef}
            aria-label="Navigation principale"
            className="fixed inset-x-0 bottom-0 z-[70] px-3 pb-[max(12px,env(safe-area-inset-bottom))] lg:hidden"
        >
            {type === "admin" && adminMenuOuvert && (
                <div className="mx-auto mb-3 w-full max-w-[456px] rounded-[28px] border border-white/10 bg-[#101719]/95 p-3 shadow-[0_20px_60px_rgba(0,0,0,.55)] backdrop-blur-2xl">
                    <div className="mb-2 flex items-center justify-between px-2">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
                            Administration
                        </p>
                        <button
                            type="button"
                            onClick={() => setAdminMenuOuvert(false)}
                            className="flex size-8 items-center justify-center rounded-full text-white/50 transition hover:bg-white/5 hover:text-white"
                            aria-label="Fermer le menu administration"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        {adminSecondaire.map(
                            ({ label, icon: Icon, route }) => {
                                const selected =
                                    chemin === route ||
                                    chemin.startsWith(route + "/");

                                return (
                                    <button
                                        key={route}
                                        type="button"
                                        aria-current={
                                            selected ? "page" : undefined
                                        }
                                        onClick={() => {
                                            setAdminMenuOuvert(false);
                                            router.visit(route);
                                        }}
                                        className={[
                                            "flex min-h-11 items-center gap-2 rounded-2xl px-3 text-left text-xs font-semibold transition",
                                            selected
                                                ? "bg-jse-accent text-jse-principal"
                                                : "bg-white/5 text-white/65 hover:bg-white/10 hover:text-white",
                                        ].join(" ")}
                                    >
                                        <Icon size={17} aria-hidden="true" />
                                        <span className="min-w-0 truncate">
                                            {label}
                                        </span>
                                    </button>
                                );
                            },
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={() => router.post("/deconnexion")}
                        className="mt-2 flex min-h-11 w-full items-center gap-2 rounded-2xl bg-red-500/10 px-3 text-xs font-semibold text-red-300 transition hover:bg-red-500/15"
                    >
                        <LogOut size={17} aria-hidden="true" />
                        Se déconnecter
                    </button>
                </div>
            )}

            <div className="mx-auto flex h-[68px] w-full max-w-[456px] items-center justify-around rounded-[34px] border border-white/10 bg-[#101719]/95 p-1.5 shadow-[0_20px_60px_rgba(0,0,0,.55)] backdrop-blur-2xl">
                {items.map(({ id, label, icon: Icon, route }) => {
                    const selected = actifEffectif === id;

                    return (
                        <button
                            key={id}
                            type="button"
                            aria-current={selected ? "page" : undefined}
                            aria-label={id === "plus" ? "Plus" : label}
                            onClick={() => {
                                if (id === "plus") {
                                    setAdminMenuOuvert((value) => !value);
                                    return;
                                }

                                setAdminMenuOuvert(false);

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
                            <Icon
                                size={18}
                                strokeWidth={selected ? 2.35 : 1.8}
                                aria-hidden="true"
                            />
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

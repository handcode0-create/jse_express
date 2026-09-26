import { router, usePage } from "@inertiajs/react";
import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { Heart, Home, LogOut, ShoppingBag, UserRound } from "lucide-react";

const navigation = [
    { label: "Accueil", icon: Home, route: "/accueil", key: "accueil" },
    { label: "Commandes", icon: ShoppingBag, route: "/commandes", key: "commandes" },
    { label: "Favoris", icon: Heart, route: "/favoris", key: "favoris" },
    { label: "Profil", icon: UserRound, route: "/profil", key: "profil" },
];

function NavigationItem({ item, active = false }) {
    const Icon = item.icon;
    const itemRef = useRef(null);

    useLayoutEffect(() => {
        if (!active || !itemRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const context = gsap.context(() => {
            gsap.fromTo(itemRef.current, { y: 7, opacity: 0.75 }, { y: 0, opacity: 1, duration: 0.42, ease: "power3.out", clearProps: "transform,opacity" });
        }, itemRef);
        return () => context.revert();
    }, [active]);

    return (
        <button
            ref={itemRef}
            type="button"
            onClick={() => router.visit(item.route)}
            className={[
                "group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all",
                active
                    ? "bg-jse-secondaire/10 text-jse-secondaire"
                    : "text-jse-texte/45 hover:bg-jse-fond hover:text-jse-principal",
            ].join(" ")}
        >
            <Icon size={19} strokeWidth={active ? 2.2 : 1.8} />
            <span className="font-sans text-sm font-medium">{item.label}</span>
        </button>
    );
}

export default function SidebarJSE({ active }) {
    const { auth, utilisateur } = usePage().props;
    const utilisateurActuel = auth?.user ?? utilisateur ?? null;

    return (
        <aside className="jse-client-sidebar sticky top-0 hidden h-screen w-[238px] shrink-0 flex-col border-r border-jse-texte/5 bg-white/75 px-4 py-7 backdrop-blur-xl lg:flex">
            <div className="px-4">
                <img
                    src="/assets/jse_logo.png"
                    alt="JSE Express"
                    className="h-11 w-auto object-contain"
                />
            </div>

            <div className="mt-10">
                <p className="px-4 font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-jse-texte/30">
                    Menu
                </p>
                <nav className="mt-3 space-y-1.5">
                    {navigation.map((item) => (
                        <NavigationItem
                            key={item.key}
                            item={item}
                            active={active === item.key}
                        />
                    ))}
                </nav>
            </div>

            <div className="mt-auto px-3">
                <div className="mb-3 rounded-2xl bg-jse-fond p-3.5">
                    <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-jse-principal font-against text-lg text-white">
                            {(utilisateurActuel?.prenom?.[0] ||
                                utilisateurActuel?.nom?.[0] ||
                                "J").toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="truncate font-sans text-xs font-semibold">
                                {utilisateurActuel?.prenom ||
                                    utilisateurActuel?.nom ||
                                    "Client"}
                            </p>
                            <p className="truncate font-sans text-[10px] text-jse-texte/40">
                                Espace client
                            </p>
                        </div>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => router.post("/deconnexion")}
                    className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 font-sans text-xs font-medium text-jse-texte/45 hover:bg-red-50 hover:text-red-600"
                >
                    <LogOut size={17} strokeWidth={1.8} />
                    Déconnexion
                </button>
            </div>
        </aside>
    );
}

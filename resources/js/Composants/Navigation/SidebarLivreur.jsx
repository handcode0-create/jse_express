import { router } from "@inertiajs/react";
import {
    Bell,
    Bike,
    Home,
    LogOut,
    MapPin,
    Receipt,
    UserRound,
} from "lucide-react";
import PhotoProfil from "../Profil/PhotoProfil";
import ThemeToggle from "../Interface/ThemeToggle";

const navigation = [
    { id: "accueil", label: "Tableau de bord", icon: Home },
    { id: "missions", label: "Mes missions", icon: Receipt },
    { id: "carte", label: "Ma carte", icon: MapPin },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "profil", label: "Mon profil", icon: UserRound },
];

export default function SidebarLivreur({ actif, livreur, onChange }) {
    const disponible = livreur?.disponibilite === "disponible";
    const nom = [livreur?.prenom, livreur?.nom].filter(Boolean).join(" ") || "JSE Livreur";

    return (
        <aside className="jse-dark-surface sticky top-0 hidden h-screen w-[260px] shrink-0 flex-col border-r border-white/8 bg-[#0B1011] px-4 py-6 lg:flex">
            <div className="flex items-center gap-3 px-2">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-jse-accent text-jse-principal shadow-lg shadow-jse-accent/10">
                    <Bike size={22} strokeWidth={2.2} />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-[8px] font-semibold uppercase tracking-[0.24em] text-white/35">JSE Express</p>
                    <p className="mt-1 text-sm font-bold text-white">Espace livreur</p>
                </div>
                <ThemeToggle compact />
            </div>

            <div className="mt-10">
                <p className="px-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/25">Navigation</p>
                <nav className="mt-3 space-y-1.5">
                    {navigation.map(({ id, label, icon: Icon }) => {
                        const selected = actif === id;

                        return (
                            <button
                                key={id}
                                type="button"
                                onClick={() => onChange(id)}
                                className={[
                                    "flex w-full items-center gap-3 rounded-2xl px-3.5 py-3.5 text-left transition-all",
                                    selected
                                        ? "bg-jse-accent text-jse-principal shadow-lg shadow-jse-accent/10"
                                        : "text-white/45 hover:bg-white/5 hover:text-white",
                                ].join(" ")}
                            >
                                <Icon size={18} strokeWidth={selected ? 2.25 : 1.8} />
                                <span className="flex-1 text-xs font-semibold">{label}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-auto">
                <div className="mb-3 rounded-2xl border border-white/8 bg-white/[0.035] p-3.5">
                    <div className="flex items-center gap-3">
                        <PhotoProfil user={livreur} size="size-11" dark />
                        <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-white">{nom}</p>
                            <p className="mt-1 flex items-center gap-1.5 text-[9px] text-white/40">
                                <span className={"size-1.5 rounded-full " + (disponible ? "bg-jse-secondaire" : "bg-white/25")} />
                                {disponible ? "Disponible" : "Hors ligne"}
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => router.post("/deconnexion")}
                    className="flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-xs font-semibold text-white/40 transition hover:bg-red-500/10 hover:text-red-300"
                >
                    <LogOut size={17} />
                    Se déconnecter
                </button>
            </div>
        </aside>
    );
}

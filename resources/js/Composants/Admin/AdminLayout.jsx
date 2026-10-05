import { useState } from "react";
import { usePage } from "@inertiajs/react";
import { CheckCircle2, CircleAlert, X } from "lucide-react";
import AdminSidebar from "./AdminSidebar";

function MessageFlash() {
    const { flash = {} } = usePage().props;
    const [ferme, setFerme] = useState(null);
    const message = flash.error || flash.success;

    if (!message || ferme === message) {
        return null;
    }

    const erreur = Boolean(flash.error);
    const Icone = erreur ? CircleAlert : CheckCircle2;

    return (
        <div
            role={erreur ? "alert" : "status"}
            className={[
                "jse-admin-card mt-5 flex items-start gap-3 rounded-2xl border bg-jse-theme-surface p-4 text-sm shadow-jse-carte",
                erreur ? "border-jse-danger/30" : "border-jse-secondaire/40",
            ].join(" ")}
        >
            <Icone size={20} className={erreur ? "mt-0.5 shrink-0 text-jse-danger" : "mt-0.5 shrink-0 text-jse-secondaire"} aria-hidden="true" />
            <p className="min-w-0 flex-1 break-words leading-6 text-jse-theme-text">{message}</p>
            <button
                type="button"
                onClick={() => setFerme(message)}
                aria-label="Fermer le message"
                className="flex size-8 shrink-0 items-center justify-center rounded-full text-jse-theme-muted transition hover:bg-jse-theme-surface-soft hover:text-jse-theme-text"
            >
                <X size={16} aria-hidden="true" />
            </button>
        </div>
    );
}

/**
 * Structure commune de toutes les pages d'administration :
 * sidebar desktop, barre flottante mobile, marges, safe-area et messages flash.
 */
export default function AdminLayout({ utilisateur = null, children }) {
    const { auth } = usePage().props;

    return (
        <main className="jse-admin-page min-h-screen overflow-x-hidden bg-jse-theme-bg text-jse-theme-text">
            <a
                href="#contenu-admin"
                className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[110] focus:rounded-full focus:bg-jse-principal focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
            >
                Aller au contenu
            </a>

            <AdminSidebar utilisateur={utilisateur ?? auth?.user} />

            <div className="lg:pl-[264px]">
                <div
                    id="contenu-admin"
                    tabIndex={-1}
                    className="mx-auto w-full max-w-7xl px-4 pb-[calc(112px+env(safe-area-inset-bottom))] pt-5 focus:outline-none sm:px-6 sm:pt-7 lg:px-8 lg:pb-10 lg:pt-9"
                >
                    <MessageFlash />
                    {children}
                </div>
            </div>
        </main>
    );
}

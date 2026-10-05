import { usePage } from "@inertiajs/react";
import MessageFlash from "../Interface/MessageFlash";
import AdminSidebar from "./AdminSidebar";

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

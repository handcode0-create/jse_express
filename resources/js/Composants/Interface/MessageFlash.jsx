import { useState } from "react";
import { usePage } from "@inertiajs/react";
import { CheckCircle2, CircleAlert, X } from "lucide-react";

/**
 * Message de retour du serveur (succès, erreur ou première erreur de validation),
 * fermable et annoncé aux lecteurs d'écran.
 */
export default function MessageFlash() {
    const { flash = {}, errors = {} } = usePage().props;
    const [ferme, setFerme] = useState(null);
    const erreurValidation = Object.values(errors || {}).find(Boolean);
    const message = flash.error || erreurValidation || flash.success;

    if (!message || ferme === message) {
        return null;
    }

    const erreur = Boolean(flash.error || erreurValidation);
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

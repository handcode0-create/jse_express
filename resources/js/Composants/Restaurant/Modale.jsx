import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

/**
 * Fenêtre modale accessible : focus déplacé à l'ouverture et restitué à la fermeture,
 * fermeture par Échap ou clic sur le fond, défilement de la page verrouillé.
 *
 * @param {{ ouverte: boolean, titre: string, surtitre?: string, large?: boolean, onFermer: () => void }} props
 */
export default function Modale({ ouverte, titre, surtitre = "JSE Express", large = false, onFermer, children }) {
    const idTitre = useId();
    const conteneurRef = useRef(null);
    const precedentRef = useRef(null);
    const onFermerRef = useRef(onFermer);
    onFermerRef.current = onFermer;

    useEffect(() => {
        if (!ouverte) {
            return undefined;
        }

        precedentRef.current = document.activeElement;
        const defilementPrecedent = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        conteneurRef.current?.querySelector("input, select, textarea")?.focus();

        const surClavier = (evenement) => {
            if (evenement.key === "Escape") {
                onFermerRef.current();
            }
        };
        document.addEventListener("keydown", surClavier);

        return () => {
            document.removeEventListener("keydown", surClavier);
            document.body.style.overflow = defilementPrecedent;
            precedentRef.current?.focus?.();
        };
    }, [ouverte]);

    if (!ouverte) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/45 backdrop-blur-sm sm:items-center sm:p-5"
            onMouseDown={(evenement) => {
                if (evenement.target === evenement.currentTarget) {
                    onFermer();
                }
            }}
        >
            <div
                ref={conteneurRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={idTitre}
                className={[
                    "max-h-[calc(100dvh-env(safe-area-inset-top)-8px)] w-full overflow-y-auto rounded-t-[28px] bg-jse-theme-surface p-5 pb-[calc(20px+env(safe-area-inset-bottom))] shadow-2xl sm:max-h-[92vh] sm:rounded-[28px] sm:p-7",
                    large ? "sm:max-w-3xl" : "sm:max-w-lg",
                ].join(" ")}
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-jse-theme-muted">{surtitre}</p>
                        <h2 id={idTitre} className="mt-1 text-xl font-semibold text-jse-theme-heading">
                            {titre}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onFermer}
                        aria-label="Fermer"
                        className="flex size-11 shrink-0 items-center justify-center rounded-full border border-jse-theme-border text-jse-theme-text transition hover:bg-jse-theme-surface-soft"
                    >
                        <X size={18} aria-hidden="true" />
                    </button>
                </div>
                <div className="mt-5">{children}</div>
            </div>
        </div>
    );
}

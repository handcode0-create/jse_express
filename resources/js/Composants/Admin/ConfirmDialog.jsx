import { useEffect, useId, useRef, useState } from "react";
import { AlertTriangle, Info } from "lucide-react";
import AdminButton from "./AdminButton";
import { AdminField, champAdmin } from "./AdminField";

/**
 * Boîte de confirmation accessible, en remplacement de window.confirm / prompt / alert.
 *
 * - `ton="danger"` : action destructive (bouton rouge).
 * - `ton="info"` : simple message, un seul bouton.
 * - `motifRequis` : affiche un champ de motif obligatoire, transmis à `onConfirmer(motif)`.
 *
 * @param {{
 *   ouvert: boolean,
 *   titre: string,
 *   description?: string,
 *   ton?: "danger"|"principal"|"info",
 *   confirmerLabel?: string,
 *   annulerLabel?: string,
 *   motifRequis?: boolean,
 *   motifLabel?: string,
 *   chargement?: boolean,
 *   onConfirmer?: (motif: string) => void,
 *   onFermer: () => void,
 * }} props
 */
export default function ConfirmDialog({
    ouvert,
    titre,
    description = "",
    ton = "danger",
    confirmerLabel = "Confirmer",
    annulerLabel = "Annuler",
    motifRequis = false,
    motifLabel = "Motif",
    chargement = false,
    onConfirmer = () => {},
    onFermer,
}) {
    const idTitre = useId();
    const idDescription = useId();
    const [motif, setMotif] = useState("");
    const champRef = useRef(null);
    const annulerRef = useRef(null);
    const elementPrecedentRef = useRef(null);
    const chargementRef = useRef(chargement);
    chargementRef.current = chargement;

    useEffect(() => {
        if (!ouvert) {
            return undefined;
        }

        setMotif("");
        elementPrecedentRef.current = document.activeElement;
        const defilementPrecedent = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        (champRef.current ?? annulerRef.current)?.focus();

        const surClavier = (evenement) => {
            if (evenement.key === "Escape" && !chargementRef.current) {
                onFermer();
            }
        };
        document.addEventListener("keydown", surClavier);

        return () => {
            document.removeEventListener("keydown", surClavier);
            document.body.style.overflow = defilementPrecedent;
            elementPrecedentRef.current?.focus?.();
        };
    }, [ouvert]);

    if (!ouvert) {
        return null;
    }

    const info = ton === "info";
    const motifValide = !motifRequis || motif.trim().length > 0;

    const soumettre = (evenement) => {
        evenement.preventDefault();

        if (!motifValide || chargement) {
            return;
        }

        onConfirmer(motif.trim());
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/45 backdrop-blur-sm sm:items-center sm:p-5"
            onMouseDown={(evenement) => {
                if (evenement.target === evenement.currentTarget && !chargement) {
                    onFermer();
                }
            }}
        >
            <form
                role="dialog"
                aria-modal="true"
                aria-labelledby={idTitre}
                aria-describedby={description ? idDescription : undefined}
                onSubmit={soumettre}
                className="w-full max-w-md rounded-t-[28px] bg-jse-theme-surface p-5 pb-[calc(20px+env(safe-area-inset-bottom))] shadow-2xl sm:rounded-[28px] sm:p-6"
            >
                <span
                    className={[
                        "flex size-12 items-center justify-center rounded-2xl",
                        info ? "bg-jse-information/10 text-jse-information" : ton === "danger" ? "bg-jse-danger/10 text-jse-danger" : "bg-jse-secondaire/15 text-jse-theme-heading",
                    ].join(" ")}
                >
                    {info ? <Info size={22} aria-hidden="true" /> : <AlertTriangle size={22} aria-hidden="true" />}
                </span>

                <h2 id={idTitre} className="mt-4 text-lg font-semibold text-jse-theme-heading">
                    {titre}
                </h2>
                {description && (
                    <p id={idDescription} className="mt-2 text-sm leading-6 text-jse-theme-muted">
                        {description}
                    </p>
                )}

                {motifRequis && (
                    <AdminField label={motifLabel} required className="mt-5">
                        <textarea
                            ref={champRef}
                            rows={3}
                            required
                            maxLength={500}
                            value={motif}
                            onChange={(evenement) => setMotif(evenement.target.value)}
                            className={champAdmin + " resize-none py-3"}
                        />
                    </AdminField>
                )}

                <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    {!info && (
                        <button
                            ref={annulerRef}
                            type="button"
                            onClick={onFermer}
                            disabled={chargement}
                            className="inline-flex min-h-11 items-center justify-center rounded-full border border-jse-theme-border px-5 text-sm font-semibold text-jse-theme-text transition hover:bg-jse-theme-surface-soft focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-jse-secondaire/30 disabled:opacity-50"
                        >
                            {annulerLabel}
                        </button>
                    )}
                    {info ? (
                        <button
                            ref={annulerRef}
                            type="button"
                            onClick={onFermer}
                            className="inline-flex min-h-11 items-center justify-center rounded-full bg-jse-principal px-5 text-sm font-semibold text-white transition hover:bg-jse-principal/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-jse-secondaire/30"
                        >
                            Compris
                        </button>
                    ) : (
                        <AdminButton
                            type="submit"
                            variante={ton === "danger" ? "danger" : "principal"}
                            chargement={chargement}
                            disabled={!motifValide}
                        >
                            {confirmerLabel}
                        </AdminButton>
                    )}
                </div>
            </form>
        </div>
    );
}

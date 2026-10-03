import { X } from "lucide-react";

export default function ModalConfirmationCommande({
    ouverte,
    reference,
    enCours = false,
    fermer,
    confirmer,
}) {
    if (!ouverte) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-jse-principal/20 p-4 backdrop-blur-sm sm:items-center"
            role="presentation"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !enCours) {
                    fermer();
                }
            }}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="annulation-commande-title"
                className="w-full max-w-md rounded-[28px] bg-white p-5 shadow-2xl ring-1 ring-jse-texte/10"
            >
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-jse-danger">
                            Confirmation
                        </p>
                        <h2
                            id="annulation-commande-title"
                            className="mt-1 font-against text-2xl leading-none text-jse-principal"
                        >
                            Annuler la commande ?
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={fermer}
                        disabled={enCours}
                        aria-label="Fermer"
                        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-jse-fond text-jse-principal disabled:opacity-50"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="mt-4 rounded-2xl bg-jse-fond p-4">
                    <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.1em] text-jse-texte/45">
                        Commande
                    </p>
                    <p className="mt-1 font-sans text-sm font-bold text-jse-principal">
                        #{reference}
                    </p>
                </div>

                <p className="mt-4 font-sans text-sm leading-5 text-jse-texte/60">
                    Cette action est définitive pour le statut de la commande.
                    Vérifiez la référence avant de confirmer.
                </p>

                <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={fermer}
                        disabled={enCours}
                        className="rounded-full bg-jse-fond px-5 py-3 font-sans text-xs font-semibold text-jse-principal"
                    >
                        Conserver
                    </button>
                    <button
                        type="button"
                        onClick={confirmer}
                        disabled={enCours}
                        className="rounded-full bg-jse-danger px-5 py-3 font-sans text-xs font-semibold text-white disabled:opacity-50"
                    >
                        {enCours ? "Annulation…" : "Confirmer l’annulation"}
                    </button>
                </div>
            </section>
        </div>
    );
}

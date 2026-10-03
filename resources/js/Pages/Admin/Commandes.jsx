import React, { useState } from "react";
import { router, useState } from "@inertiajs/react";
import { Ban } from "lucide-react";
import AdminDataPage from "../../Composants/Admin/AdminDataPage";

export default function Commandes({ utilisateur, commandes = { data: [] }, recherche = "" }) {
    const [traitement, setTraitement] = useState(null);
    const rows = Array.isArray(commandes) ? commandes : (commandes.data || []);

    const annuler = (commande) => {
        const motif = window.prompt("Motif d'annulation de la commande " + (commande.reference || "") + " :");
        if (!motif?.trim()) return;

        setTraitement(commande.id);
        router.post("/administration/commandes/" + commande.id + "/annuler", { motif: motif.trim() }, {
            preserveScroll: true,
            onFinish: () => setTraitement(null),
        });
    };

    return (
        <AdminDataPage
            utilisateur={utilisateur}
            title="Commandes"
            description="Supervision de toutes les commandes et de leur progression."
            search={recherche}
            searchPlaceholder="Référence, client ou restaurant"
            rows={rows}
            pagination={Array.isArray(commandes) ? null : commandes}
            columns={[
                { key: "reference", label: "Commande", render: row => <span className="font-semibold">{row.reference || "—"}</span> },
                { key: "client", label: "Client", render: row => <div><p className="font-semibold">{row.client || "—"}</p><p className="text-xs text-jse-theme-muted">{row.telephone || "—"}</p></div> },
                { key: "restaurant", label: "Restaurant" },
                { key: "zone", label: "Zone" },
                { key: "statut", label: "Statut", render: row => <span className="inline-flex rounded-full bg-jse-secondaire/10 px-3 py-1 text-xs font-semibold text-jse-secondaire">{row.statut?.libelle || row.statut?.code || "—"}</span> },
                { key: "montant_total", label: "Montant", render: row => `${Number(row.montant_total || 0).toLocaleString("fr-FR")} FCFA` },
                { key: "date_commande", label: "Date" },
                {
                    key: "actions",
                    label: "Action",
                    render: row => ["EN_ATTENTE", "CONFIRMEE", "EN_PREPARATION"].includes(row.statut?.code) ? (
                        <button type="button" onClick={() => annuler(row)} disabled={traitement === row.id} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-jse-danger/10 sm:w-auto sm:rounded-full px-4 text-xs font-semibold text-jse-danger disabled:opacity-50">
                            <Ban size={15} aria-hidden="true" />
                            {traitement === row.id ? "Traitement..." : "Annuler"}
                        </button>
                    ) : <span className="text-xs text-jse-theme-muted">Aucune action</span>,
                },
            ]}
            emptyMessage="Aucune commande ne correspond aux critères."
        />
    );
}
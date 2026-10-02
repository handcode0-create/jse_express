import React from "react";
import AdminDataPage from "../../Composants/Admin/AdminDataPage";

export default function Commandes({ utilisateur, commandes = [], recherche = "" }) {
    return <AdminDataPage utilisateur={utilisateur} title="Commandes" description="Supervision de toutes les commandes et de leur progression." search={recherche} searchPlaceholder="Référence, client ou restaurant" rows={commandes} columns={[
        { key: "reference", label: "Commande" },
        { key: "client", label: "Client", render: row => <div><p className="font-semibold">{row.client || "—"}</p><p className="text-xs text-jse-theme-muted">{row.telephone || "—"}</p></div> },
        { key: "restaurant", label: "Restaurant" },
        { key: "zone", label: "Zone" },
        { key: "statut", label: "Statut", render: row => <span className="inline-flex rounded-full bg-jse-secondaire/10 px-3 py-1 text-xs font-semibold text-jse-secondaire">{row.statut?.libelle || row.statut?.code || "—"}</span> },
        { key: "montant_total", label: "Montant", render: row => `${Number(row.montant_total || 0).toLocaleString("fr-FR")} FCFA` },
        { key: "date_commande", label: "Date" },
    ]} emptyMessage="Aucune commande ne correspond aux critères." />;
}

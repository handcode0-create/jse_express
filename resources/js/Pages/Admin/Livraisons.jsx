import React from "react";
import AdminDataPage from "../../Composants/Admin/AdminDataPage";

export default function Livraisons({ utilisateur, livraisons = [], recherche = "" }) {
    return <AdminDataPage utilisateur={utilisateur} title="Livraisons" description="Suivi opérationnel, attribution automatique et réattribution manuelle." search={recherche} searchPlaceholder="Commande, zone ou livreur" rows={livraisons} columns={[
        { key: "reference", label: "Commande", render: row => <span className="font-semibold">{row.reference || "—"}</span> },
        { key: "zone", label: "Zone" },
        { key: "statut", label: "Statut", render: row => <span className="inline-flex rounded-full bg-jse-accent/10 px-3 py-1 text-xs font-semibold text-jse-accent">{row.statut || "—"}</span> },
        { key: "livreur", label: "Livreur" },
        { key: "matricule", label: "Matricule" },
        { key: "mode_attribution", label: "Attribution" },
        { key: "date_attribution", label: "Date" },
    ]} emptyMessage="Aucune livraison active ou historique ne correspond aux critères." />;
}

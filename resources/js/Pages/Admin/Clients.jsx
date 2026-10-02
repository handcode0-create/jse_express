import React from "react";
import AdminDataPage from "../../Composants/Admin/AdminDataPage";

export default function Clients({ utilisateur, clients = [], recherche = "" }) {
    return <AdminDataPage utilisateur={utilisateur} title="Clients" description="Comptes clients, coordonnées et activité de commande." search={recherche} searchPlaceholder="Nom, téléphone ou email" rows={clients} columns={[
        { key: "nom", label: "Client", render: row => <div><p className="font-semibold">{row.nom}</p><p className="text-xs text-jse-theme-muted">{row.email || "Sans email"}</p></div> },
        { key: "telephone", label: "Téléphone" },
        { key: "statut", label: "Statut" },
        { key: "commandes_count", label: "Commandes" },
        { key: "derniere_commande", label: "Dernière commande" },
    ]} emptyMessage="Aucun client trouvé." />;
}

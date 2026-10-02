import React from "react";
import AdminDataPage from "../../Composants/Admin/AdminDataPage";

export default function Restaurants({ utilisateur, restaurants = [], recherche = "" }) {
    return <AdminDataPage utilisateur={utilisateur} title="Restaurants" description="Restaurants actifs et inactifs, responsables, zones et activité." search={recherche} searchPlaceholder="Nom, responsable ou téléphone" rows={restaurants} columns={[
        { key: "nom", label: "Restaurant", render: row => <div><p className="font-semibold">{row.nom}</p><p className="text-xs text-jse-theme-muted">{row.responsable || "—"}</p></div> },
        { key: "telephone", label: "Téléphone" },
        { key: "zone", label: "Zone" },
        { key: "statut", label: "Statut" },
        { key: "produits_count", label: "Produits" },
        { key: "commandes_count", label: "Commandes" },
    ]} emptyMessage="Aucun restaurant trouvé." />;
}

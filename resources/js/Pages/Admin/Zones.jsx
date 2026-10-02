import React from "react";
import AdminDataPage from "../../Composants/Admin/AdminDataPage";

export default function Zones({ utilisateur, zones = [], recherche = "" }) {
    return <AdminDataPage utilisateur={utilisateur} title="Zones & attribution" description="Zones opérationnelles et capacité de livraison par secteur." search={recherche} searchPlaceholder="Nom de zone" rows={zones} columns={[
        { key: "nom", label: "Zone", render: row => <div><p className="font-semibold">{row.nom}</p><p className="text-xs text-jse-theme-muted">{row.parent || "Zone principale"}</p></div> },
        { key: "statut", label: "Statut" },
        { key: "restaurants_count", label: "Restaurants" },
        { key: "livreurs_count", label: "Livreurs" },
        { key: "livreurs_disponibles", label: "Disponibles" },
        { key: "livraisons_actives", label: "Livraisons actives" },
    ]} emptyMessage="Aucune zone trouvée." />;
}

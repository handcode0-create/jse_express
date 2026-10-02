import React from "react";
import AdminDataPage from "../../Composants/Admin/AdminDataPage";

export default function Livreurs({ utilisateur, livreurs = [], recherche = "" }) {
    return <AdminDataPage utilisateur={utilisateur} title="Livreurs" description="Matricules, zones, disponibilité et activité des livreurs." search={recherche} searchPlaceholder="Nom, matricule ou téléphone" rows={livreurs} columns={[
        { key: "nom", label: "Livreur" },
        { key: "matricule", label: "Matricule", render: row => <span className="font-semibold text-jse-secondaire">{row.matricule || "—"}</span> },
        { key: "telephone", label: "Téléphone" },
        { key: "zone", label: "Zone" },
        { key: "disponibilite", label: "Disponibilité" },
        { key: "livraisons_count", label: "Livraisons" },
    ]} emptyMessage="Aucun livreur trouvé." />;
}

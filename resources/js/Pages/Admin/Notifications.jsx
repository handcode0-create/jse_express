import React from "react";
import AdminDataPage from "../../Composants/Admin/AdminDataPage";

export default function Notifications({ utilisateur, notifications = [], recherche = "" }) {
    return <AdminDataPage utilisateur={utilisateur} title="Notifications" description="Historique des notifications système et de leurs statuts d'envoi." search={recherche} searchPlaceholder="Type, destinataire ou commande" rows={notifications} columns={[
        { key: "date_envoi", label: "Date" },
        { key: "destinataire", label: "Destinataire" },
        { key: "type_evenement", label: "Événement" },
        { key: "canal", label: "Canal" },
        { key: "statut_envoi", label: "Statut" },
        { key: "reference", label: "Commande" },
    ]} emptyMessage="Aucune notification enregistrée." />;
}

import AdminBadge from "../../Composants/Admin/AdminBadge";
import AdminDataPage from "../../Composants/Admin/AdminDataPage";

export default function Notifications({ utilisateur, notifications = [], recherche = "" }) {
    return (
        <AdminDataPage
            utilisateur={utilisateur}
            title="Notifications" visuel="motos-gauche"
            description="Historique des notifications système et de leurs statuts d'envoi."
            search={recherche}
            searchPlaceholder="Type, destinataire ou commande"
            rows={notifications.data || []}
            pagination={notifications}
            columns={[
                { key: "type_evenement", label: "Événement", render: (row) => <span className="font-semibold">{row.type_evenement}</span> },
                { key: "destinataire", label: "Destinataire" },
                { key: "canal", label: "Canal" },
                { key: "statut_envoi", label: "Statut", render: (row) => <AdminBadge statut={row.statut_envoi} /> },
                { key: "reference", label: "Commande", render: (row) => row.reference || "—" },
                { key: "date_envoi", label: "Date", render: (row) => row.date_envoi || "—" },
            ]}
            emptyMessage="Aucune notification enregistrée."
        />
    );
}

import { useState } from "react";
import { router } from "@inertiajs/react";
import { Power } from "lucide-react";
import AdminBadge from "../../Composants/Admin/AdminBadge";
import AdminButton from "../../Composants/Admin/AdminButton";
import AdminDataPage from "../../Composants/Admin/AdminDataPage";

export default function Clients({ utilisateur, clients = [], recherche = "" }) {
    const [traitement, setTraitement] = useState(null);

    const basculer = (client) => {
        setTraitement(client.id);
        router.post("/administration/clients/" + client.id + "/statut", {}, { preserveScroll: true, onFinish: () => setTraitement(null) });
    };

    return (
        <AdminDataPage
            utilisateur={utilisateur}
            title="Clients"
            description="Comptes clients, coordonnées et activité de commande."
            search={recherche}
            searchPlaceholder="Nom, téléphone ou email"
            rows={clients.data || []}
            pagination={clients}
            columns={[
                {
                    key: "nom",
                    label: "Client",
                    render: (row) => (
                        <div>
                            <p className="font-semibold">{row.nom}</p>
                            <p className="text-xs text-jse-theme-muted">{row.email || "Sans email"}</p>
                        </div>
                    ),
                },
                { key: "telephone", label: "Téléphone" },
                { key: "statut", label: "Statut", render: (row) => <AdminBadge statut={row.statut} /> },
                { key: "commandes_count", label: "Commandes", render: (row) => <span className="tabular-nums">{row.commandes_count}</span> },
                { key: "derniere_commande", label: "Dernière commande" },
                {
                    key: "actions",
                    label: "Action",
                    render: (row) => (
                        <AdminButton variante={row.statut === "actif" ? "contour" : "principal"} taille="petit" chargement={traitement === row.id} onClick={() => basculer(row)}>
                            <Power size={15} aria-hidden="true" />
                            {row.statut === "actif" ? "Désactiver" : "Activer"}
                        </AdminButton>
                    ),
                },
            ]}
            emptyMessage="Aucun client trouvé."
        />
    );
}

import React, { useState } from "react";
import { router } from "@inertiajs/react";
import { Power } from "lucide-react";
import AdminDataPage from "../../Composants/Admin/AdminDataPage";

export default function Clients({ utilisateur, clients = [], recherche = "" }) {
    const [traitement, setTraitement] = useState(null);
    const basculer = (client) => {
        setTraitement(client.id);
        router.post("/administration/clients/" + client.id + "/statut", {}, { preserveScroll: true, onFinish: () => setTraitement(null) });
    };
    return <AdminDataPage utilisateur={utilisateur} title="Clients" description="Comptes clients, coordonnées et activité de commande." search={recherche} searchPlaceholder="Nom, téléphone ou email" rows={clients} columns={[
        { key: "nom", label: "Client", render: row => <div><p className="font-semibold">{row.nom}</p><p className="text-xs text-jse-theme-muted">{row.email || "Sans email"}</p></div> },
        { key: "telephone", label: "Téléphone" },
        { key: "statut", label: "Statut", render: row => <span className={row.statut === "actif" ? "text-jse-secondaire" : "text-jse-theme-muted"}>{row.statut || "—"}</span> },
        { key: "commandes_count", label: "Commandes" },
        { key: "derniere_commande", label: "Dernière commande" },
        { key: "actions", label: "Action", render: row => <button type="button" onClick={() => basculer(row)} disabled={traitement === row.id} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-jse-principal px-4 text-xs font-semibold text-white disabled:opacity-50"><Power size={15} />{traitement === row.id ? "..." : row.statut === "actif" ? "Désactiver" : "Activer"}</button> },
    ]} emptyMessage="Aucun client trouvé." />;
}
import React, { useState } from "react";
import { router } from "@inertiajs/react";
import { Power } from "lucide-react";
import AdminDataPage from "../../Composants/Admin/AdminDataPage";

export default function Restaurants({ utilisateur, restaurants = [], recherche = "" }) {
    const [traitement, setTraitement] = useState(null);
    const basculer = (restaurant) => {
        setTraitement(restaurant.id);
        router.post("/administration/restaurants/" + restaurant.id + "/statut", {}, { preserveScroll: true, onFinish: () => setTraitement(null) });
    };
    return <AdminDataPage utilisateur={utilisateur} title="Restaurants" description="Restaurants actifs et inactifs, responsables, zones et activité." search={recherche} searchPlaceholder="Nom, responsable ou téléphone" rows={restaurants} columns={[
        { key: "nom", label: "Restaurant", render: row => <div><p className="font-semibold">{row.nom}</p><p className="text-xs text-jse-theme-muted">{row.responsable || "—"}</p></div> },
        { key: "telephone", label: "Téléphone" },
        { key: "zone", label: "Zone" },
        { key: "statut", label: "Statut", render: row => <span className={row.statut === "actif" ? "text-jse-secondaire" : "text-jse-theme-muted"}>{row.statut || "—"}</span> },
        { key: "produits_count", label: "Produits" },
        { key: "commandes_count", label: "Commandes" },
        { key: "actions", label: "Action", render: row => <button type="button" onClick={() => basculer(row)} disabled={traitement === row.id} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-jse-principal px-4 text-xs font-semibold text-white disabled:opacity-50"><Power size={15} />{traitement === row.id ? "..." : row.statut === "actif" ? "Désactiver" : "Activer"}</button> },
    ]} emptyMessage="Aucun restaurant trouvé." />;
}
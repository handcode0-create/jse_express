import React, { useState } from "react";
import { router } from "@inertiajs/react";
import { Power } from "lucide-react";
import AdminDataPage from "../../Composants/Admin/AdminDataPage";

export default function Zones({ utilisateur, zones = [], recherche = "" }) {
    const [traitement, setTraitement] = useState(null);
    const basculer = (zone) => {
        setTraitement(zone.id);
        router.post("/administration/zones/" + zone.id + "/statut", {}, { preserveScroll: true, onFinish: () => setTraitement(null) });
    };
    return <AdminDataPage utilisateur={utilisateur} title="Zones & attribution" description="Zones opérationnelles et capacité de livraison par secteur." search={recherche} searchPlaceholder="Nom de zone" rows={zones} columns={[
        { key: "nom", label: "Zone", render: row => <div><p className="font-semibold">{row.nom}</p><p className="text-xs text-jse-theme-muted">{row.parent || "Zone principale"}</p></div> },
        { key: "statut", label: "Statut", render: row => <span className={row.statut === "actif" ? "text-jse-secondaire" : "text-jse-theme-muted"}>{row.statut || "—"}</span> },
        { key: "restaurants_count", label: "Restaurants" },
        { key: "livreurs_count", label: "Livreurs" },
        { key: "livreurs_disponibles", label: "Disponibles" },
        { key: "livraisons_actives", label: "Livraisons actives" },
        { key: "actions", label: "Action", render: row => <button type="button" onClick={() => basculer(row)} disabled={traitement === row.id || (row.statut === "actif" && row.livraisons_actives > 0)} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-jse-principal px-4 text-xs font-semibold text-white disabled:opacity-50"><Power size={15} />{traitement === row.id ? "..." : row.statut === "actif" ? "Désactiver" : "Activer"}</button> },
    ]} emptyMessage="Aucune zone trouvée." />;
}
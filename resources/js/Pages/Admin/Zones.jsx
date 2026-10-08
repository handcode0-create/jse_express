import { useState } from "react";
import { router } from "@inertiajs/react";
import { Power } from "lucide-react";
import AdminBadge from "../../Composants/Admin/AdminBadge";
import AdminButton from "../../Composants/Admin/AdminButton";
import AdminDataPage from "../../Composants/Admin/AdminDataPage";

const nombre = (valeur) => <span className="tabular-nums">{valeur}</span>;

export default function Zones({ utilisateur, zones = [], recherche = "" }) {
    const [traitement, setTraitement] = useState(null);

    const basculer = (zone) => {
        setTraitement(zone.id);
        router.post("/administration/zones/" + zone.id + "/statut", {}, { preserveScroll: true, onFinish: () => setTraitement(null) });
    };

    return (
        <AdminDataPage
            utilisateur={utilisateur}
            title="Zones & attribution" visuel="motos"
            description="Zones opérationnelles et capacité de livraison par secteur."
            search={recherche}
            searchPlaceholder="Nom de zone"
            rows={zones}
            columns={[
                {
                    key: "nom",
                    label: "Zone",
                    render: (row) => (
                        <div>
                            <p className="font-semibold">{row.nom}</p>
                            <p className="text-xs text-jse-theme-muted">{row.parent || "Zone principale"}</p>
                        </div>
                    ),
                },
                { key: "statut", label: "Statut", render: (row) => <AdminBadge statut={row.statut} /> },
                { key: "restaurants_count", label: "Restaurants", render: (row) => nombre(row.restaurants_count) },
                { key: "livreurs_count", label: "Livreurs", render: (row) => nombre(row.livreurs_count) },
                { key: "livreurs_disponibles", label: "Disponibles", render: (row) => nombre(row.livreurs_disponibles) },
                { key: "livraisons_actives", label: "Livraisons actives", render: (row) => nombre(row.livraisons_actives) },
                {
                    key: "actions",
                    label: "Action",
                    render: (row) => {
                        const bloquee = row.statut === "actif" && row.livraisons_actives > 0;

                        return (
                            <div>
                                <AdminButton
                                    variante={row.statut === "actif" ? "contour" : "principal"}
                                    taille="petit"
                                    chargement={traitement === row.id}
                                    disabled={bloquee}
                                    onClick={() => basculer(row)}
                                >
                                    <Power size={15} aria-hidden="true" />
                                    {row.statut === "actif" ? "Désactiver" : "Activer"}
                                </AdminButton>
                                {bloquee && <p className="mt-2 text-xs text-jse-theme-muted">Des livraisons sont en cours dans cette zone.</p>}
                            </div>
                        );
                    },
                },
            ]}
            emptyMessage="Aucune zone trouvée."
        />
    );
}

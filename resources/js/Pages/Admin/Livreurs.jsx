import { useState } from "react";
import { router } from "@inertiajs/react";
import { Power } from "lucide-react";
import AdminBadge from "../../Composants/Admin/AdminBadge";
import AdminButton from "../../Composants/Admin/AdminButton";
import AdminDataPage from "../../Composants/Admin/AdminDataPage";

export default function Livreurs({ utilisateur, livreurs = [], recherche = "" }) {
    const [traitement, setTraitement] = useState(null);

    const basculer = (livreur) => {
        setTraitement(livreur.id);
        router.post("/administration/livreurs/" + livreur.id + "/disponibilite", {}, { preserveScroll: true, onFinish: () => setTraitement(null) });
    };

    return (
        <AdminDataPage
            utilisateur={utilisateur}
            title="Livreurs" visuel="motos-gauche"
            description="Matricules, zones, disponibilité et activité des livreurs."
            actionLabel="Nouveau livreur"
            actionHref="/administration/utilisateurs?nouveau=livreur"
            search={recherche}
            searchPlaceholder="Nom, matricule ou téléphone"
            rows={livreurs.data || []}
            pagination={livreurs}
            columns={[
                { key: "nom", label: "Livreur", render: (row) => <span className="font-semibold">{row.nom}</span> },
                { key: "matricule", label: "Matricule", render: (row) => <span className="font-semibold tabular-nums text-jse-theme-heading">{row.matricule || "—"}</span> },
                { key: "telephone", label: "Téléphone" },
                { key: "zone", label: "Zone" },
                { key: "disponibilite", label: "Disponibilité", render: (row) => <AdminBadge statut={row.disponibilite} /> },
                { key: "livraisons_count", label: "Livraisons actives", render: (row) => <span className="tabular-nums">{row.livraisons_count}</span> },
                {
                    key: "actions",
                    label: "Action",
                    render: (row) => (
                        <AdminButton variante={row.disponibilite === "disponible" ? "contour" : "principal"} taille="petit" chargement={traitement === row.id} onClick={() => basculer(row)}>
                            <Power size={15} aria-hidden="true" />
                            {row.disponibilite === "disponible" ? "Rendre indisponible" : "Rendre disponible"}
                        </AdminButton>
                    ),
                },
            ]}
            emptyMessage="Aucun livreur trouvé."
        />
    );
}

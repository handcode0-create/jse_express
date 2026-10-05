import { useState } from "react";
import { router } from "@inertiajs/react";
import { RefreshCw } from "lucide-react";
import AdminBadge from "../../Composants/Admin/AdminBadge";
import AdminButton from "../../Composants/Admin/AdminButton";
import AdminDataPage from "../../Composants/Admin/AdminDataPage";
import { champAdmin } from "../../Composants/Admin/AdminField";

export default function Livraisons({ utilisateur, livraisons = [], recherche = "" }) {
    const [selection, setSelection] = useState({});
    const [motifs, setMotifs] = useState({});
    const [traitement, setTraitement] = useState(null);

    const reattribuer = (livraison) => {
        const livreurId = selection[livraison.id];
        const motif = (motifs[livraison.id] || "").trim();

        if (!livreurId || !motif) return;

        setTraitement(livraison.id);
        router.post(
            "/administration/livraisons/" + livraison.id + "/reattribuer",
            { livreur_id: livreurId, motif },
            { preserveScroll: true, onFinish: () => setTraitement(null) },
        );
    };

    return (
        <AdminDataPage
            utilisateur={utilisateur}
            title="Livraisons"
            description="Suivi opérationnel, attribution automatique et réattribution manuelle."
            search={recherche}
            searchPlaceholder="Commande, zone ou livreur"
            rows={livraisons.data || []}
            pagination={livraisons}
            columns={[
                { key: "reference", label: "Commande", render: (row) => <span className="font-semibold">{row.reference || "—"}</span> },
                { key: "zone", label: "Zone" },
                { key: "statut", label: "Statut", render: (row) => <AdminBadge statut={row.statut} /> },
                {
                    key: "livreur",
                    label: "Livreur",
                    render: (row) => (
                        <div>
                            <p className="font-semibold">{row.livreur || "Non attribué"}</p>
                            <p className="text-xs text-jse-theme-muted">{row.matricule || "—"}</p>
                        </div>
                    ),
                },
                { key: "mode_attribution", label: "Attribution", mobile: false },
                { key: "date_attribution", label: "Date" },
                {
                    key: "actions",
                    label: "Réattribution",
                    render: (row) =>
                        row.candidats?.length ? (
                            <div className="space-y-2 md:min-w-64">
                                <select
                                    aria-label={"Livreur pour " + (row.reference || row.id)}
                                    value={selection[row.id] || ""}
                                    onChange={(evenement) => setSelection((etat) => ({ ...etat, [row.id]: evenement.target.value }))}
                                    className={champAdmin}
                                >
                                    <option value="">Choisir un livreur</option>
                                    {row.candidats.map((candidat) => (
                                        <option key={candidat.id} value={candidat.id}>
                                            {candidat.nom}
                                            {candidat.matricule ? " · " + candidat.matricule : ""}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    aria-label={"Motif pour " + (row.reference || row.id)}
                                    value={motifs[row.id] || ""}
                                    onChange={(evenement) => setMotifs((etat) => ({ ...etat, [row.id]: evenement.target.value }))}
                                    placeholder="Motif de réattribution"
                                    className={champAdmin}
                                />
                                <AdminButton
                                    taille="petit"
                                    onClick={() => reattribuer(row)}
                                    chargement={traitement === row.id}
                                    disabled={!selection[row.id] || !motifs[row.id]?.trim()}
                                >
                                    <RefreshCw size={15} aria-hidden="true" />
                                    Réattribuer
                                </AdminButton>
                            </div>
                        ) : (
                            <span className="text-sm text-jse-theme-muted">Aucun livreur disponible dans cette zone</span>
                        ),
                },
            ]}
            emptyMessage="Aucune livraison ne correspond aux critères."
        />
    );
}

import React, { useState } from "react";
import { router } from "@inertiajs/react";
import { RefreshCw } from "lucide-react";
import AdminDataPage from "../../Composants/Admin/AdminDataPage";

export default function Livraisons({ utilisateur, livraisons = [], recherche = "" }) {
    const [selection, setSelection] = useState({});
    const [motifs, setMotifs] = useState({});
    const [traitement, setTraitement] = useState(null);

    const reattribuer = (livraison) => {
        const livreurId = selection[livraison.id];
        const motif = (motifs[livraison.id] || "").trim();
        if (!livreurId || !motif) return;

        setTraitement(livraison.id);
        router.post("/administration/livraisons/" + livraison.id + "/reattribuer", {
            livreur_id: livreurId,
            motif,
        }, {
            preserveScroll: true,
            onFinish: () => setTraitement(null),
        });
    };

    return (
        <AdminDataPage
            utilisateur={utilisateur}
            title="Livraisons"
            description="Suivi opérationnel, attribution automatique et réattribution manuelle."
            search={recherche}
            searchPlaceholder="Commande, zone ou livreur"
            rows={livraisons}
            columns={[
                { key: "reference", label: "Commande", render: row => <span className="font-semibold">{row.reference || "—"}</span> },
                { key: "zone", label: "Zone" },
                { key: "statut", label: "Statut", render: row => <span className="inline-flex rounded-full bg-jse-accent/10 px-3 py-1 text-xs font-semibold text-jse-accent">{row.statut || "—"}</span> },
                { key: "livreur", label: "Livreur", render: row => <div><p className="font-semibold">{row.livreur || "Non attribué"}</p><p className="text-xs text-jse-theme-muted">{row.matricule || "—"}</p></div> },
                { key: "mode_attribution", label: "Attribution" },
                { key: "date_attribution", label: "Date" },
                {
                    key: "actions",
                    label: "Réattribution",
                    render: row => row.candidats?.length ? (
                        <div className="min-w-64 space-y-2">
                            <select value={selection[row.id] || ""} onChange={event => setSelection(state => ({ ...state, [row.id]: event.target.value }))} className="min-h-10 w-full rounded-full border border-jse-theme-border bg-jse-theme-surface-soft px-3 text-xs text-jse-theme-text">
                                <option value="">Choisir un livreur</option>
                                {row.candidats.map(candidat => <option key={candidat.id} value={candidat.id}>{candidat.nom}{candidat.matricule ? " · " + candidat.matricule : ""}</option>)}
                            </select>
                            <input value={motifs[row.id] || ""} onChange={event => setMotifs(state => ({ ...state, [row.id]: event.target.value }))} placeholder="Motif de réattribution" className="min-h-10 w-full rounded-full border border-jse-theme-border bg-jse-theme-surface-soft px-3 text-xs text-jse-theme-text" />
                            <button type="button" onClick={() => reattribuer(row)} disabled={traitement === row.id || !selection[row.id] || !motifs[row.id]?.trim()} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-jse-principal px-4 text-xs font-semibold text-white disabled:opacity-50">
                                <RefreshCw size={15} aria-hidden="true" />
                                {traitement === row.id ? "Traitement..." : "Réattribuer"}
                            </button>
                        </div>
                    ) : <span className="text-xs text-jse-theme-muted">Aucun livreur disponible dans cette zone</span>,
                },
            ]}
            emptyMessage="Aucune livraison ne correspond aux critères."
        />
    );
}
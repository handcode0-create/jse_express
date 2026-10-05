import { useState } from "react";
import { router } from "@inertiajs/react";
import { Ban } from "lucide-react";
import AdminBadge from "../../Composants/Admin/AdminBadge";
import AdminButton from "../../Composants/Admin/AdminButton";
import AdminDataPage from "../../Composants/Admin/AdminDataPage";
import ConfirmDialog from "../../Composants/Admin/ConfirmDialog";

const formaterMontant = (montant) => `${Number(montant || 0).toLocaleString("fr-FR")} FCFA`;

export default function Commandes({ utilisateur, commandes = { data: [] }, recherche = "" }) {
    const [traitement, setTraitement] = useState(null);
    const [commandeAAnnuler, setCommandeAAnnuler] = useState(null);
    const rows = commandes.data || [];

    const annuler = (motif) => {
        const commande = commandeAAnnuler;

        setTraitement(commande.id);
        router.post(
            "/administration/commandes/" + commande.id + "/annuler",
            { motif },
            {
                preserveScroll: true,
                onFinish: () => {
                    setTraitement(null);
                    setCommandeAAnnuler(null);
                },
            },
        );
    };

    return (
        <>
            <AdminDataPage
                utilisateur={utilisateur}
                title="Commandes" visuel="poulet"
                description="Supervision de toutes les commandes et de leur progression."
                search={recherche}
                searchPlaceholder="Référence, client ou restaurant"
                rows={rows}
                pagination={commandes}
                columns={[
                    { key: "reference", label: "Commande", render: (row) => <span className="font-semibold">{row.reference || "—"}</span> },
                    {
                        key: "client",
                        label: "Client",
                        render: (row) => (
                            <div>
                                <p className="font-semibold">{row.client || "—"}</p>
                                <p className="text-xs text-jse-theme-muted">{row.telephone || "—"}</p>
                            </div>
                        ),
                    },
                    { key: "restaurant", label: "Restaurant" },
                    { key: "zone", label: "Zone", mobile: false },
                    {
                        key: "statut",
                        label: "Statut",
                        render: (row) => <AdminBadge statut={row.statut?.code} libelle={row.statut?.libelle} />,
                    },
                    {
                        key: "montant_total",
                        label: "Montant",
                        render: (row) => <span className="font-semibold tabular-nums">{formaterMontant(row.montant_total)}</span>,
                    },
                    { key: "distance_km", label: "Distance", mobile: false, render: (row) => (row.distance_km == null ? "—" : `${row.distance_km} km`) },
                    { key: "frais_livraison", label: "Livraison", mobile: false, render: (row) => formaterMontant(row.frais_livraison) },
                    { key: "date_commande", label: "Date" },
                    {
                        key: "actions",
                        label: "Action",
                        render: (row) =>
                            ["EN_ATTENTE", "CONFIRMEE"].includes(row.statut?.code) ? (
                                <AdminButton variante="dangerDoux" taille="petit" chargement={traitement === row.id} onClick={() => setCommandeAAnnuler(row)}>
                                    <Ban size={15} aria-hidden="true" />
                                    Annuler
                                </AdminButton>
                            ) : (
                                <span className="text-sm text-jse-theme-muted">Aucune action</span>
                            ),
                    },
                ]}
                emptyMessage="Aucune commande ne correspond aux critères."
            />

            <ConfirmDialog
                ouvert={Boolean(commandeAAnnuler)}
                titre={"Annuler la commande " + (commandeAAnnuler?.reference || "") + " ?"}
                description="Indiquez le motif de l'annulation pour garder une trace de la décision."
                motifRequis
                motifLabel="Motif d'annulation"
                confirmerLabel="Annuler la commande"
                annulerLabel="Retour"
                chargement={Boolean(commandeAAnnuler) && traitement === commandeAAnnuler.id}
                onConfirmer={annuler}
                onFermer={() => setCommandeAAnnuler(null)}
            />
        </>
    );
}

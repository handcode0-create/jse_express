import { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import AdminDeliveryTable from "../../Composants/Admin/AdminDeliveryTable";
import AccueilAdmin from "../../Composants/Admin/AccueilAdmin";
import AdminLayout from "../../Composants/Admin/AdminLayout";
import AdminPendingList from "../../Composants/Admin/AdminPendingList";
import PanneauLivreurs from "../../Composants/Admin/PanneauLivreurs";
import ConfirmDialog from "../../Composants/Admin/ConfirmDialog";

export default function TableauDeBord({
    statistiques = {},
    serie_activite = [],
    livraisons = [],
    livreurs = [],
    commandes = [],
}) {
    const [selection, setSelection] = useState({});
    const [motifs, setMotifs] = useState({});
    const [motifsAnnulation, setMotifsAnnulation] = useState({});
    const [traitement, setTraitement] = useState(null);
    const [commandeAAnnuler, setCommandeAAnnuler] = useState(null);
    const { auth } = usePage().props;
    const utilisateur = auth?.user;

    const reattribuer = (livraisonId) => {
        const livreurId = selection[livraisonId];
        const motif = (motifs[livraisonId] || "").trim();

        if (!livreurId || !motif) return;

        setTraitement(livraisonId);
        router.post(
            "/administration/livraisons/" + livraisonId + "/reattribuer",
            { livreur_id: livreurId, motif },
            { preserveScroll: true, onFinish: () => setTraitement(null) },
        );
    };

    const confirmerAnnulation = () => {
        const commande = commandeAAnnuler;
        const motif = (motifsAnnulation[commande.id] || "").trim();

        if (!motif) return;

        setTraitement("annulation-" + commande.id);
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

    const referenceAAnnuler = commandeAAnnuler ? commandeAAnnuler.reference || "#" + commandeAAnnuler.id : "";

    return (
        <>
            <Head title="Administration — JSE Express" />

            <AdminLayout utilisateur={utilisateur}>
                <AccueilAdmin prenom={utilisateur?.prenom} statistiques={statistiques} serie={serie_activite} commandes={commandes} livraisons={livraisons} />

                <div className="mt-6 grid gap-5 sm:mt-8 xl:grid-cols-[minmax(0,1.3fr)_minmax(20rem,0.9fr)]">
                    <AdminPendingList
                        commandes={commandes}
                        motifs={motifsAnnulation}
                        traitement={traitement}
                        onMotifChange={(id, valeur) => setMotifsAnnulation((etat) => ({ ...etat, [id]: valeur }))}
                        onAnnuler={setCommandeAAnnuler}
                    />
                    <PanneauLivreurs livreurs={livreurs} />
                </div>

                <div className="mt-5">
                    <AdminDeliveryTable
                        livraisons={livraisons}
                        livreurs={livreurs}
                        selection={selection}
                        motifs={motifs}
                        traitement={traitement}
                        onSelectionChange={(id, valeur) => setSelection((etat) => ({ ...etat, [id]: valeur }))}
                        onMotifChange={(id, valeur) => setMotifs((etat) => ({ ...etat, [id]: valeur }))}
                        onReattribuer={reattribuer}
                    />
                </div>
            </AdminLayout>

            <ConfirmDialog
                ouvert={Boolean(commandeAAnnuler)}
                titre={"Annuler la commande " + referenceAAnnuler + " ?"}
                description={commandeAAnnuler ? "Motif transmis : « " + (motifsAnnulation[commandeAAnnuler.id] || "").trim() + " »" : ""}
                confirmerLabel="Annuler la commande"
                annulerLabel="Retour"
                chargement={Boolean(commandeAAnnuler) && traitement === "annulation-" + commandeAAnnuler.id}
                onConfirmer={confirmerAnnulation}
                onFermer={() => setCommandeAAnnuler(null)}
            />
        </>
    );
}

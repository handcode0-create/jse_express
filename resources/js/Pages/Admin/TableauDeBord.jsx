import { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import { CheckCircle2, ShoppingBag, Store, Truck, Users, UserRound } from "lucide-react";
import AdminDeliveryTable from "../../Composants/Admin/AdminDeliveryTable";
import AdminLayout from "../../Composants/Admin/AdminLayout";
import AdminPendingList from "../../Composants/Admin/AdminPendingList";
import AdminStatCard from "../../Composants/Admin/AdminStatCard";
import AdminStatistics from "../../Composants/Admin/AdminStatistics";
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
    const { auth, errors = {} } = usePage().props;
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

    const cartes = [
        { label: "Commandes actives", value: statistiques.commandes_actives ?? 0, icon: ShoppingBag, tone: "accent", href: "/administration/commandes" },
        { label: "Livraisons actives", value: statistiques.livraisons_actives ?? 0, icon: Truck, tone: "accent", href: "/administration/livraisons" },
        { label: "Livreurs disponibles", value: statistiques.livreurs_disponibles ?? 0, icon: Users, tone: "secondaire", href: "/administration/livreurs" },
        { label: "Commandes livrées", value: statistiques.commandes_livrees ?? 0, icon: CheckCircle2, tone: "secondaire", href: "/administration/commandes" },
        { label: "Restaurants actifs", value: statistiques.restaurants_actifs ?? 0, icon: Store, tone: "principal", href: "/administration/restaurants" },
        { label: "Clients actifs", value: statistiques.clients_actifs ?? 0, icon: UserRound, tone: "principal", href: "/administration/clients" },
    ];

    const erreurs = Object.values(errors || {}).filter(Boolean);
    const referenceAAnnuler = commandeAAnnuler ? commandeAAnnuler.reference || "#" + commandeAAnnuler.id : "";

    return (
        <>
            <Head title="Administration — JSE Express" />

            <AdminLayout utilisateur={utilisateur}>
                <header id="vue-ensemble" className="min-w-0">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-jse-theme-muted">
                        <span className="h-0.5 w-6 rounded-full bg-jse-secondaire" aria-hidden="true" />
                        JSE Express · Administration
                    </p>
                    <h1 className="mt-2 break-words font-against text-4xl leading-[0.95] text-jse-theme-heading sm:text-5xl">
                        Bonjour {utilisateur?.prenom || "Administrateur"}
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-jse-theme-muted sm:text-base">
                        Voici l’activité à surveiller aujourd’hui.
                    </p>
                </header>

                {erreurs.length > 0 && (
                    <div className="mt-5 rounded-2xl border border-jse-danger/30 bg-jse-danger/10 p-4 text-sm leading-6 text-jse-danger" role="alert">
                        {erreurs[0]}
                    </div>
                )}

                <section className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3" aria-label="Indicateurs clés">
                    {cartes.map((carte) => (
                        <AdminStatCard key={carte.label} {...carte} />
                    ))}
                </section>

                <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(20rem,0.9fr)]">
                    <div className="xl:col-start-1 xl:row-start-1">
                        <AdminPendingList
                            commandes={commandes}
                            motifs={motifsAnnulation}
                            traitement={traitement}
                            onMotifChange={(id, valeur) => setMotifsAnnulation((etat) => ({ ...etat, [id]: valeur }))}
                            onAnnuler={setCommandeAAnnuler}
                        />
                    </div>

                    <div className="xl:col-span-2 xl:row-start-2">
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

                    <div className="xl:col-start-2 xl:row-start-1">
                        <AdminStatistics serie={serie_activite} />
                    </div>
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

import React, { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import {
    CheckCircle2,
    ShoppingBag,
    Store,
    Truck,
    Users,
    UserRound,
} from "lucide-react";
import AdminSidebar from "../../Composants/Admin/AdminSidebar";
import AdminStatCard from "../../Composants/Admin/AdminStatCard";
import AdminStatistics from "../../Composants/Admin/AdminStatistics";
import AdminPendingList from "../../Composants/Admin/AdminPendingList";
import AdminDeliveryTable from "../../Composants/Admin/AdminDeliveryTable";

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
            {
                preserveScroll: true,
                onFinish: () => setTraitement(null),
            },
        );
    };

    const annuler = (commande) => {
        const motif = (motifsAnnulation[commande.id] || "").trim();

        if (!motif) return;
        if (!window.confirm("Annuler la commande " + (commande.reference || "#" + commande.id) + " ?")) return;

        const identifiant = "annulation-" + commande.id;
        setTraitement(identifiant);

        router.post(
            "/administration/commandes/" + commande.id + "/annuler",
            { motif },
            {
                preserveScroll: true,
                onFinish: () => setTraitement(null),
            },
        );
    };

    const profilNom =
        [utilisateur?.prenom, utilisateur?.nom].filter(Boolean).join(" ") ||
        "Administrateur";

    const cartes = [
        {
            label: "Commandes actives",
            value: statistiques.commandes_actives ?? 0,
            icon: ShoppingBag,
            tone: "principal",
        },
        {
            label: "Commandes livrées",
            value: statistiques.commandes_livrees ?? 0,
            icon: CheckCircle2,
            tone: "secondaire",
        },
        {
            label: "Livraisons actives",
            value: statistiques.livraisons_actives ?? 0,
            icon: Truck,
            tone: "accent",
        },
        {
            label: "Livreurs disponibles",
            value: statistiques.livreurs_disponibles ?? 0,
            icon: Users,
            tone: "accent",
        },
        {
            label: "Restaurants actifs",
            value: statistiques.restaurants_actifs ?? 0,
            icon: Store,
            tone: "principal",
        },
        {
            label: "Clients actifs",
            value: statistiques.clients_actifs ?? 0,
            icon: UserRound,
            tone: "secondaire",
        },
    ];

    const erreurs = Object.values(errors || {}).filter(Boolean);

    return (
        <>
            <Head title="Administration — JSE Express" />

            <main className="min-h-screen bg-jse-theme-bg text-jse-theme-text">
                <div className="flex min-h-screen flex-col lg:flex-row">
                    <AdminSidebar utilisateur={utilisateur} />

                    <section className="min-w-0 flex-1">
                        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                            <header id="vue-ensemble" className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-jse-secondaire">JSE Express</p>
                                    <h1 className="mt-2 text-3xl font-semibold tracking-tight text-jse-theme-text sm:text-4xl">Administration</h1>
                                    <p className="mt-2 max-w-2xl text-sm text-jse-theme-muted">
                                        Vue opérationnelle des commandes et des livraisons.
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="rounded-full border border-jse-theme-border bg-jse-theme-surface px-4 py-3 text-right shadow-jse-carte">
                                        <p className="text-xs uppercase tracking-[0.12em] text-jse-theme-muted">Profil</p>
                                        <p className="mt-1 text-xs font-semibold text-jse-theme-text">{profilNom}</p>
                                    </div>
                                </div>
                            </header>

                            {erreurs.length > 0 && (
                                <div className="mt-5 rounded-jse-moyen border border-jse-danger/20 bg-jse-danger/10 p-4 text-sm text-jse-danger" role="alert">
                                    {erreurs[0]}
                                </div>
                            )}

                            <section className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                {cartes.map((carte) => (
                                    <AdminStatCard
                                        key={carte.label}
                                        label={carte.label}
                                        value={carte.value}
                                        icon={carte.icon}
                                        tone={carte.tone}
                                    />
                                ))}
                            </section>

                            <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.85fr)]">
                                <AdminStatistics
                                    statistiques={statistiques}
                                    serie={serie_activite}
                                />
                                <AdminPendingList
                                    commandes={commandes}
                                    motifs={motifsAnnulation}
                                    traitement={traitement}
                                    onMotifChange={(id, value) =>
                                        setMotifsAnnulation((etat) => ({ ...etat, [id]: value }))
                                    }
                                    onAnnuler={annuler}
                                />
                            </section>

                            <section className="mt-5">
                                <AdminDeliveryTable
                                    livraisons={livraisons}
                                    livreurs={livreurs}
                                    selection={selection}
                                    motifs={motifs}
                                    traitement={traitement}
                                    onSelectionChange={(id, value) =>
                                        setSelection((etat) => ({ ...etat, [id]: value }))
                                    }
                                    onMotifChange={(id, value) =>
                                        setMotifs((etat) => ({ ...etat, [id]: value }))
                                    }
                                    onReattribuer={reattribuer}
                                />
                            </section>

                            <footer className="mt-5 flex flex-col gap-2 pb-3 text-xs text-jse-theme-muted sm:flex-row sm:items-center sm:justify-between">
                                <span>JSE Express · Administration opérationnelle</span>
                                <span>Design system JSE · Poppins · Rounded Geometric</span>
                            </footer>
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}

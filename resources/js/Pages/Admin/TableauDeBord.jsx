import React, { useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
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
        if (
            !window.confirm(
                "Annuler la commande " +
                    (commande.reference || "#" + commande.id) +
                    " ?",
            )
        )
            return;

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
            mobile: true,
        },
        {
            label: "Commandes livrées",
            value: statistiques.commandes_livrees ?? 0,
            icon: CheckCircle2,
            tone: "secondaire",
            mobile: false,
        },
        {
            label: "Livraisons actives",
            value: statistiques.livraisons_actives ?? 0,
            icon: Truck,
            tone: "accent",
            mobile: true,
        },
        {
            label: "Livreurs disponibles",
            value: statistiques.livreurs_disponibles ?? 0,
            icon: Users,
            tone: "accent",
            mobile: true,
        },
        {
            label: "Restaurants actifs",
            value: statistiques.restaurants_actifs ?? 0,
            icon: Store,
            tone: "principal",
            mobile: true,
        },
        {
            label: "Clients actifs",
            value: statistiques.clients_actifs ?? 0,
            icon: UserRound,
            tone: "secondaire",
            mobile: false,
        },
    ];

    const erreurs = Object.values(errors || {}).filter(Boolean);

    return (
        <>
            <Head title="Administration — JSE Express" />

            <main className="min-h-screen overflow-x-hidden bg-jse-theme-bg pb-24 text-jse-theme-text lg:pb-0">
                <div className="flex min-h-screen flex-col lg:flex-row">
                    <AdminSidebar utilisateur={utilisateur} />

                    <section className="min-w-0 flex-1">
                        <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
                            <header
                                id="vue-ensemble"
                                className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
                            >
                                <div className="min-w-0">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-jse-secondaire sm:text-xs">
                                        JSE Express
                                    </p>
                                    <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-jse-theme-text sm:mt-2 sm:text-4xl">
                                        Bonjour {utilisateur?.prenom || "Administrateur"}
                                    </h1>
                                    <p className="mt-1.5 max-w-2xl text-xs leading-5 text-jse-theme-muted sm:mt-2 sm:text-sm">
                                        Voici l’activité à surveiller aujourd’hui.
                                    </p>
                                </div>

                                <div className="hidden items-center gap-3 sm:flex">
                                    <div className="rounded-full border border-jse-theme-border bg-jse-theme-surface px-4 py-3 text-right shadow-jse-carte">
                                        <p className="text-xs uppercase tracking-[0.12em] text-jse-theme-muted">
                                            Profil
                                        </p>
                                        <p className="mt-1 text-xs font-semibold text-jse-theme-text">
                                            {profilNom}
                                        </p>
                                    </div>
                                </div>
                            </header>

                            {erreurs.length > 0 && (
                                <div
                                    className="mt-4 rounded-2xl border border-jse-danger/20 bg-jse-danger/10 p-3.5 text-xs leading-5 text-jse-danger sm:mt-5 sm:p-4 sm:text-sm"
                                    role="alert"
                                >
                                    {erreurs[0]}
                                </div>
                            )}

                            <section className="mt-5 grid grid-cols-2 gap-2.5 sm:mt-7 sm:grid-cols-2 sm:gap-3 xl:grid-cols-3">
                                {cartes.map((carte) => (
                                    <div
                                        key={carte.label}
                                        className={!carte.mobile ? "hidden sm:block" : ""}
                                    >
                                        <AdminStatCard
                                            label={carte.label}
                                            value={carte.value}
                                            icon={carte.icon}
                                            tone={carte.tone}
                                        />
                                    </div>
                                ))}
                            </section>

                            <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.85fr)]">
                                <div className="order-2 xl:order-1">
                                    <AdminStatistics
                                        statistiques={statistiques}
                                        serie={serie_activite}
                                    />
                                </div>

                                <div className="order-1 xl:order-2">
                                    <AdminPendingList
                                        commandes={commandes}
                                        motifs={motifsAnnulation}
                                        traitement={traitement}
                                        onMotifChange={(id, value) =>
                                            setMotifsAnnulation((etat) => ({
                                                ...etat,
                                                [id]: value,
                                            }))
                                        }
                                        onAnnuler={annuler}
                                    />
                                </div>
                            </section>

                            <section className="mt-5">
                                <AdminDeliveryTable
                                    livraisons={livraisons}
                                    livreurs={livreurs}
                                    selection={selection}
                                    motifs={motifs}
                                    traitement={traitement}
                                    onSelectionChange={(id, value) =>
                                        setSelection((etat) => ({
                                            ...etat,
                                            [id]: value,
                                        }))
                                    }
                                    onMotifChange={(id, value) =>
                                        setMotifs((etat) => ({
                                            ...etat,
                                            [id]: value,
                                        }))
                                    }
                                    onReattribuer={reattribuer}
                                />
                            </section>

                            <footer className="mt-5 hidden pb-3 text-xs text-jse-theme-muted sm:flex sm:items-center sm:justify-between">
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

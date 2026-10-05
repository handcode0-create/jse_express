import { useMemo, useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import { Bell, CheckCircle2, Receipt, Truck } from "lucide-react";
import AdminCard from "../../Composants/Admin/AdminCard";
import AdminStatCard from "../../Composants/Admin/AdminStatCard";
import CarteLivreur, { usePositionLivreur } from "../../Composants/Livreur/CarteLivreur";
import { DetailMission, LivraisonMission, NavigationMission, RetraitMission, SuccesMission } from "../../Composants/Livreur/EcransMission";
import LivreurLayout from "../../Composants/Livreur/LivreurLayout";
import { DisponibiliteLivreur, HistoriqueLivraisons, ListeMissions } from "../../Composants/Livreur/MissionsLivreur";
import ProfilLivreur from "../../Composants/Livreur/ProfilLivreur";

const cleFlux = (attributionId) => `jse-livreur-flux-${attributionId}`;
const ETAPES_REPRISE = ["navigation", "pickup", "delivery"];

function TitreRubrique({ surtitre, titre, children }) {
    return (
        <div className="flex flex-col gap-1">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-jse-theme-muted">
                <span className="h-0.5 w-6 rounded-full bg-jse-secondaire" aria-hidden="true" />
                {surtitre}
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-jse-theme-heading sm:text-3xl">{titre}</h1>
            {children}
        </div>
    );
}

function ListeNotifications({ notifications }) {
    if (notifications.length === 0) {
        return (
            <AdminCard className="flex min-h-48 flex-col items-center justify-center gap-3 p-8 text-center">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-jse-theme-surface-soft text-jse-theme-muted">
                    <Bell size={22} aria-hidden="true" />
                </span>
                <p className="text-sm font-semibold text-jse-theme-text">Aucune notification</p>
                <p className="max-w-xs text-sm text-jse-theme-muted">Les informations importantes concernant vos missions apparaîtront ici.</p>
            </AdminCard>
        );
    }

    return (
        <AdminCard className="overflow-hidden">
            <ul className="divide-y divide-jse-theme-border">
                {notifications.map((notification) => (
                    <li key={notification.id} className="flex items-start gap-3 p-4">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-jse-accent/15 text-jse-theme-heading">
                            <Bell size={17} aria-hidden="true" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-jse-theme-text">{notification.type || "JSE Express"}</p>
                            <p className="mt-0.5 text-sm text-jse-theme-muted">{notification.contenu || "Nouvelle notification"}</p>
                            <p className="mt-1 text-xs text-jse-theme-muted">{notification.date || "À l’instant"}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </AdminCard>
    );
}

function OngletCarte() {
    const { position, precision, erreur } = usePositionLivreur(true);

    return (
        <section aria-labelledby="titre-carte">
            <TitreRubrique surtitre="Géolocalisation" titre="Ma carte">
                <p id="titre-carte" className="sr-only">
                    Carte de votre position
                </p>
                <p className="mt-1 text-sm text-jse-theme-muted">Votre position n’est visible que sur votre appareil : elle n’est pas transmise au client.</p>
            </TitreRubrique>
            <div className="mt-5 h-[60vh] min-h-[360px]">
                <CarteLivreur position={position} precision={precision} erreur={erreur} />
            </div>
        </section>
    );
}

export default function TableauDeBord() {
    const { livreur, livraisons = [], historique = [], statistiques = {}, notifications = [], zones = [] } = usePage().props;

    const [onglet, setOnglet] = useState("accueil");
    const [missionId, setMissionId] = useState(null);
    const [instantane, setInstantane] = useState(null);
    const [ecran, setEcran] = useState(null);
    const [enCours, setEnCours] = useState(false);
    const [erreurAction, setErreurAction] = useState("");

    const disponible = livreur?.disponibilite === "disponible";
    const mission = useMemo(() => livraisons.find((element) => element.attribution_id === missionId) ?? instantane, [livraisons, missionId, instantane]);

    const naviguer = (id) => {
        setOnglet(id);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const changerEcran = (nouvelEcran) => {
        setEcran(nouvelEcran);
        setErreurAction("");

        if (!missionId) return;

        try {
            if (nouvelEcran === "success") {
                window.localStorage.removeItem(cleFlux(missionId));
            } else {
                window.localStorage.setItem(cleFlux(missionId), JSON.stringify({ ecran: nouvelEcran, updated_at: Date.now() }));
            }
        } catch {
            // Le parcours reste fonctionnel même si le stockage local est indisponible.
        }
    };

    const ouvrirMission = (selectionnee) => {
        setErreurAction("");
        setMissionId(selectionnee.attribution_id);
        setInstantane(selectionnee);

        let ecranInitial = selectionnee.statut_livraison === "en_cours" ? "navigation" : "detail";

        try {
            const sauvegarde = JSON.parse(window.localStorage.getItem(cleFlux(selectionnee.attribution_id)) || "null");

            if (selectionnee.statut_livraison === "en_cours" && ETAPES_REPRISE.includes(sauvegarde?.ecran)) {
                ecranInitial = sauvegarde.ecran;
            }
        } catch {
            // On retombe sur l'étape déduite du statut serveur.
        }

        setEcran(ecranInitial);
    };

    const quitterParcours = () => {
        setEcran(null);
        setMissionId(null);
        setInstantane(null);
        setErreurAction("");
    };

    const premiereErreur = (erreurs) => Object.values(erreurs || {}).find(Boolean);

    const basculerDisponibilite = () => {
        setEnCours(true);
        router.patch("/livreur/disponibilite", { disponibilite: disponible ? "indisponible" : "disponible" }, { preserveScroll: true, onFinish: () => setEnCours(false) });
    };

    const accepterMission = () => {
        setEnCours(true);
        setErreurAction("");
        router.patch(
            `/livreur/livraisons/${missionId}/prise-en-charge`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => changerEcran("navigation"),
                onError: (erreurs) => setErreurAction(premiereErreur(erreurs) || "Impossible de prendre cette mission en charge."),
                onFinish: () => setEnCours(false),
            },
        );
    };

    const validerPin = (pin) => {
        setEnCours(true);
        setErreurAction("");
        router.post(
            `/livreur/livraisons/${missionId}/valider-pin`,
            { pin },
            {
                preserveScroll: true,
                onSuccess: () => changerEcran("success"),
                onError: (erreurs) => setErreurAction(premiereErreur(erreurs) || "Le PIN de livraison est incorrect."),
                onFinish: () => setEnCours(false),
            },
        );
    };

    const ecranMission = mission && (
        <>
            {ecran === "detail" && (
                <DetailMission mission={mission} onRetour={quitterParcours} onAccepter={accepterMission} onNavigation={() => changerEcran("navigation")} enCours={enCours} erreur={erreurAction} />
            )}
            {ecran === "navigation" && <NavigationMission mission={mission} onRetour={quitterParcours} onArrive={() => changerEcran("pickup")} />}
            {ecran === "pickup" && <RetraitMission mission={mission} onRetour={() => changerEcran("navigation")} onDemarrer={() => changerEcran("delivery")} />}
            {ecran === "delivery" && <LivraisonMission mission={mission} onRetour={() => changerEcran("pickup")} onValider={validerPin} enCours={enCours} erreur={erreurAction} />}
            {ecran === "success" && <SuccesMission mission={mission} onRetour={quitterParcours} />}
        </>
    );

    return (
        <>
            <Head title="Espace livreur — JSE Express" />

            <LivreurLayout livreur={livreur} onglet={onglet} onNavigate={naviguer}>
                {onglet === "accueil" && (
                    <>
                        <TitreRubrique surtitre="Aujourd’hui" titre={`Bonjour ${livreur?.prenom || livreur?.nom || ""}`.trim()}>
                            <p className="mt-1 text-sm text-jse-theme-muted">
                                {[livreur?.zone?.nom && `Zone ${livreur.zone.nom}`, livreur?.matricule && `Matricule ${livreur.matricule}`].filter(Boolean).join(" · ")}
                            </p>
                        </TitreRubrique>

                        <div className="mt-6">
                            <DisponibiliteLivreur livreur={livreur} enCours={enCours} onBasculer={basculerDisponibilite} />
                        </div>

                        <section className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4" aria-label="Indicateurs">
                            <AdminStatCard label="Livraisons du jour" value={statistiques.missions_du_jour || 0} icon={Truck} tone="accent" />
                            <AdminStatCard label="Missions actives" value={statistiques.missions_actives || 0} icon={Receipt} tone="principal" onClick={() => naviguer("missions")} />
                            <AdminStatCard label="Livraisons terminées" value={statistiques.livraisons_terminees || 0} icon={CheckCircle2} tone="secondaire" />
                        </section>

                        <section className="mt-8" aria-labelledby="titre-en-cours">
                            <h2 id="titre-en-cours" className="mb-4 text-lg font-semibold text-jse-theme-heading">
                                Missions en cours
                            </h2>
                            <ListeMissions missions={livraisons} disponible={disponible} onOuvrir={ouvrirMission} />
                        </section>
                    </>
                )}

                {onglet === "missions" && (
                    <>
                        <TitreRubrique surtitre="Suivi" titre="Mes missions" />
                        <section className="mt-6" aria-labelledby="titre-missions-actives">
                            <h2 id="titre-missions-actives" className="mb-4 text-lg font-semibold text-jse-theme-heading">
                                En cours
                            </h2>
                            <ListeMissions missions={livraisons} disponible={disponible} onOuvrir={ouvrirMission} />
                        </section>
                        <section className="mt-8" aria-labelledby="titre-historique">
                            <h2 id="titre-historique" className="mb-4 text-lg font-semibold text-jse-theme-heading">
                                Historique récent
                            </h2>
                            <HistoriqueLivraisons historique={historique} />
                        </section>
                    </>
                )}

                {onglet === "carte" && <OngletCarte />}

                {onglet === "notifications" && (
                    <>
                        <TitreRubrique surtitre="Centre d’alertes" titre="Notifications" />
                        <div className="mt-6">
                            <ListeNotifications notifications={notifications} />
                        </div>
                    </>
                )}

                {onglet === "profil" && <ProfilLivreur livreur={livreur} zones={zones} statistiques={statistiques} />}
            </LivreurLayout>

            {ecranMission}
        </>
    );
}

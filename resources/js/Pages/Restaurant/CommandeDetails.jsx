import { useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { Bike, Check, ChevronLeft, ClipboardList, CreditCard, MapPin, Package, Phone, UserRound, XCircle } from "lucide-react";
import AdminBadge from "../../Composants/Admin/AdminBadge";
import AdminButton from "../../Composants/Admin/AdminButton";
import AdminCard from "../../Composants/Admin/AdminCard";
import ConfirmDialog from "../../Composants/Admin/ConfirmDialog";
import RestaurantLayout from "../../Composants/Restaurant/RestaurantLayout";
import { URL_ESPACE, montant, statutSuivant, statutsAnnulables } from "../../lib/restaurant";

function Bloc({ titre, icone: Icone, children, className = "" }) {
    return (
        <AdminCard className={["p-5 sm:p-6", className].join(" ")}>
            <h2 className="flex items-center gap-2 text-base font-semibold text-jse-theme-heading">
                <Icone size={18} aria-hidden="true" />
                {titre}
            </h2>
            <div className="mt-4">{children}</div>
        </AdminCard>
    );
}

export default function CommandeDetailsRestaurant() {
    const { restaurant, commande } = usePage().props;
    const code = commande?.statut?.code;
    const action = statutSuivant[code];
    const annulable = statutsAnnulables.includes(code);
    const [chargement, setChargement] = useState(false);
    const [confirmationAnnulation, setConfirmationAnnulation] = useState(false);

    const naviguer = (id) => router.visit(id === "dashboard" ? URL_ESPACE : `${URL_ESPACE}?onglet=${id}`);

    const avancer = () => {
        if (!action || chargement) return;
        setChargement(true);
        router.patch(`/restaurant/commandes/${commande.id}/statut`, { statut: action.code }, { preserveScroll: true, onFinish: () => setChargement(false) });
    };

    const annuler = (motif) => {
        setChargement(true);
        router.post(
            `/restaurant/commandes/${commande.id}/annuler`,
            { motif },
            {
                preserveScroll: true,
                onFinish: () => {
                    setChargement(false);
                    setConfirmationAnnulation(false);
                },
            },
        );
    };

    return (
        <>
            <Head title={`Commande ${commande?.reference ?? ""} — ${restaurant?.nom ?? "Restaurant"}`} />

            <RestaurantLayout restaurant={restaurant} onglet="commandes" onNavigate={naviguer}>
                <Link href={`${URL_ESPACE}?onglet=commandes`} className="inline-flex min-h-8 items-center gap-1 text-sm font-medium text-jse-theme-muted transition hover:text-jse-theme-text">
                    <ChevronLeft size={16} aria-hidden="true" />
                    Toutes les commandes
                </Link>

                <header className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-jse-theme-muted">
                            <span className="h-0.5 w-6 rounded-full bg-jse-secondaire" aria-hidden="true" />
                            Commande reçue
                        </p>
                        <h1 className="mt-2 break-words text-2xl font-semibold tracking-tight text-jse-theme-heading sm:text-3xl">{commande?.reference}</h1>
                        <p className="mt-2 text-sm text-jse-theme-muted">
                            {commande?.client?.nom || "Client"} · {commande?.date_commande} à {commande?.heure_commande}
                        </p>
                    </div>
                    <AdminBadge statut={code} libelle={commande?.statut?.libelle} className="sm:mt-1" />
                </header>

                {(action || annulable) && (
                    <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                        {action && (
                            <AdminButton chargement={chargement} onClick={avancer}>
                                <Check size={16} aria-hidden="true" />
                                {action.label}
                            </AdminButton>
                        )}
                        {annulable && (
                            <AdminButton variante="dangerDoux" disabled={chargement} onClick={() => setConfirmationAnnulation(true)}>
                                <XCircle size={16} aria-hidden="true" />
                                Annuler la commande
                            </AdminButton>
                        )}
                    </div>
                )}

                <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
                    <div className="space-y-5">
                        <Bloc titre="Articles" icone={Package}>
                            <ul className="divide-y divide-jse-theme-border">
                                {(commande?.lignes || []).map((ligne) => (
                                    <li key={ligne.id} className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
                                        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-jse-theme-surface-soft text-sm font-semibold tabular-nums text-jse-theme-heading">
                                            {ligne.quantite}×
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-jse-theme-text">{ligne.nom}</p>
                                            <p className="mt-0.5 text-sm text-jse-theme-muted">{montant(ligne.prix_unitaire)} l’unité</p>
                                            {ligne.options?.length > 0 && (
                                                <p className="mt-1 text-sm text-jse-theme-heading">{ligne.options.map((option) => option.nom).join(" · ")}</p>
                                            )}
                                        </div>
                                        <p className="shrink-0 text-sm font-semibold tabular-nums text-jse-theme-text">{montant(ligne.total)}</p>
                                    </li>
                                ))}
                            </ul>
                            <dl className="mt-5 space-y-2 border-t border-jse-theme-border pt-4 text-sm">
                                <div className="flex justify-between text-jse-theme-muted">
                                    <dt>Sous-total</dt>
                                    <dd className="tabular-nums">{montant(commande?.sous_total)}</dd>
                                </div>
                                <div className="flex justify-between text-jse-theme-muted">
                                    <dt>Livraison</dt>
                                    <dd className="tabular-nums">{montant(commande?.frais_livraison)}</dd>
                                </div>
                                <div className="flex items-center justify-between pt-1">
                                    <dt className="font-semibold text-jse-theme-text">Total</dt>
                                    <dd className="text-lg font-semibold tabular-nums text-jse-theme-heading">{montant(commande?.montant_total)}</dd>
                                </div>
                            </dl>
                        </Bloc>

                        <Bloc titre="Historique" icone={ClipboardList}>
                            <ol className="space-y-4">
                                {(commande?.historique || []).map((item, index) => (
                                    <li key={index} className="flex gap-3">
                                        <span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-jse-secondaire" aria-hidden="true" />
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-jse-theme-text">{item.libelle}</p>
                                            <p className="mt-0.5 text-sm text-jse-theme-muted">
                                                {item.date} à {item.heure}
                                                {item.commentaire ? ` · ${item.commentaire}` : ""}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </Bloc>
                    </div>

                    <div className="space-y-5">
                        <Bloc titre="Client" icone={UserRound}>
                            <p className="text-sm font-semibold text-jse-theme-text">{commande?.client?.nom || "Client"}</p>
                            {commande?.client?.telephone && (
                                <a href={`tel:${commande.client.telephone}`} className="mt-2 inline-flex min-h-10 items-center gap-2 text-sm font-medium text-jse-theme-heading hover:underline">
                                    <Phone size={15} aria-hidden="true" />
                                    {commande.client.telephone}
                                </a>
                            )}
                            {commande?.client?.email && <p className="mt-1 break-all text-sm text-jse-theme-muted">{commande.client.email}</p>}
                        </Bloc>

                        <Bloc titre="Livraison" icone={Bike}>
                            <p className="flex items-start gap-2 text-sm font-semibold text-jse-theme-text">
                                <MapPin size={16} className="mt-0.5 shrink-0 text-jse-secondaire" aria-hidden="true" />
                                <span className="min-w-0 break-words">{commande?.adresse_livraison}</span>
                            </p>
                            <p className="mt-1 pl-6 text-sm text-jse-theme-muted">{commande?.zone?.nom || "Zone non précisée"}</p>
                            {commande?.telephone_livraison && <p className="mt-1 pl-6 text-sm text-jse-theme-muted">{commande.telephone_livraison}</p>}
                            {commande?.livraison?.livreur && (
                                <div className="mt-4 rounded-2xl bg-jse-theme-surface-soft p-3">
                                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-jse-theme-muted">Livreur attribué</p>
                                    <p className="mt-1 text-sm font-semibold text-jse-theme-text">{commande.livraison.livreur.nom}</p>
                                    <p className="text-sm text-jse-theme-muted">{commande.livraison.livreur.telephone}</p>
                                </div>
                            )}
                        </Bloc>

                        <Bloc titre="Paiement" icone={CreditCard}>
                            <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-jse-theme-text">{commande?.paiement?.moyen || "Non enregistré"}</p>
                                    <p className="text-sm text-jse-theme-muted">{commande?.paiement?.statut || "Aucun paiement"}</p>
                                </div>
                                <p className="shrink-0 text-base font-semibold tabular-nums text-jse-theme-heading">{montant(commande?.paiement?.montant ?? commande?.montant_total)}</p>
                            </div>
                        </Bloc>
                    </div>
                </div>
            </RestaurantLayout>

            <ConfirmDialog
                ouvert={confirmationAnnulation}
                titre={`Annuler la commande ${commande?.reference ?? ""} ?`}
                description="Le motif est conservé dans l'historique de la commande. L'annulation n'est plus possible une fois la préparation lancée."
                motifRequis
                motifLabel="Motif d'annulation"
                confirmerLabel="Annuler la commande"
                annulerLabel="Retour"
                chargement={chargement}
                onConfirmer={annuler}
                onFermer={() => setConfirmationAnnulation(false)}
            />
        </>
    );
}

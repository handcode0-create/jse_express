import { router, usePage } from "@inertiajs/react";
import { Bike, Check, MapPin, Phone, Power, Store, UserRound } from "lucide-react";
import { useState } from "react";

const formatMontant = (value) =>
    new Intl.NumberFormat("fr-FR").format(Number(value || 0)) + " FCFA";

export default function TableauDeBord() {
    const { livreur, livraisons = [], statistiques = {}, flash = {} } = usePage().props;
    const [chargement, setChargement] = useState(false);

    const changerDisponibilite = () => {
        setChargement(true);
        router.patch(
            "/livreur/disponibilite",
            { disponibilite: livreur.disponibilite === "disponible" ? "indisponible" : "disponible" },
            { preserveScroll: true, onFinish: () => setChargement(false) },
        );
    };

    return (
        <main className="min-h-screen bg-jse-fond pb-28 text-jse-texte">
            <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
                <header className="rounded-b-[32px] bg-jse-principal px-5 pb-7 pt-7 text-white sm:px-7 lg:mt-6 lg:rounded-[32px]">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-jse-secondaire">Espace livreur</p>
                            <h1 className="mt-2 font-against text-3xl leading-none sm:text-4xl">{livreur?.nom || "Livreur"}</h1>
                            <p className="mt-2 text-xs text-white/55">Matricule {livreur?.matricule || "—"} · Zone {livreur?.zone?.nom || "non définie"}</p>
                        </div>
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/10"><Bike size={22} /></div>
                    </div>

                    <button
                        type="button"
                        disabled={chargement}
                        onClick={changerDisponibilite}
                        className="mt-5 flex w-full items-center justify-between rounded-2xl bg-white/10 px-4 py-3 text-left disabled:opacity-50"
                    >
                        <span>
                            <span className="block text-[10px] uppercase tracking-[0.12em] text-white/45">Disponibilité</span>
                            <span className="mt-1 block text-xs font-semibold">
                                {livreur?.disponibilite === "disponible" ? "Disponible pour les livraisons" : "Indisponible"}
                            </span>
                        </span>
                        <span className={`flex size-10 items-center justify-center rounded-full ${livreur?.disponibilite === "disponible" ? "bg-jse-secondaire" : "bg-white/10"}`}>
                            <Power size={17} />
                        </span>
                    </button>
                </header>

                {flash?.success && (
                    <div className="mt-4 rounded-2xl bg-jse-secondaire/10 px-4 py-3 text-xs font-semibold text-jse-principal">{flash.success}</div>
                )}

                <section className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-[22px] bg-white p-4 shadow-sm ring-1 ring-jse-texte/5">
                        <Bike size={18} className="text-jse-secondaire" />
                        <p className="mt-4 text-2xl font-semibold">{statistiques.missions_actives || 0}</p>
                        <p className="mt-1 text-[10px] text-jse-texte/50">Missions actives</p>
                    </div>
                    <div className="rounded-[22px] bg-white p-4 shadow-sm ring-1 ring-jse-texte/5">
                        <Check size={18} className="text-jse-accent" />
                        <p className="mt-4 text-2xl font-semibold">{statistiques.missions_du_jour || 0}</p>
                        <p className="mt-1 text-[10px] text-jse-texte/50">Attributions aujourd’hui</p>
                    </div>
                </section>

                <section className="mt-6">
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-jse-texte/35">Missions</p>
                            <h2 className="mt-1 font-against text-2xl text-jse-principal">Livraisons assignées</h2>
                        </div>
                        <span className="rounded-full bg-white px-3 py-2 text-[10px] font-semibold text-jse-principal ring-1 ring-jse-texte/5">{livraisons.length}</span>
                    </div>

                    <div className="mt-4 space-y-3">
                        {livraisons.length === 0 ? (
                            <div className="rounded-[26px] bg-white p-8 text-center shadow-sm ring-1 ring-jse-texte/5">
                                <Bike className="mx-auto text-jse-texte/20" size={28} />
                                <p className="mt-3 text-sm font-semibold">Aucune livraison assignée</p>
                                <p className="mt-1 text-xs text-jse-texte/45">Les missions qui vous sont attribuées apparaîtront ici.</p>
                            </div>
                        ) : livraisons.map((mission) => (
                            <article key={mission.id} className="rounded-[26px] bg-white p-5 shadow-sm ring-1 ring-jse-texte/5">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-jse-texte/35">#{mission.reference}</p>
                                        <h3 className="mt-1 text-sm font-bold text-jse-principal">{mission.restaurant?.nom || "Restaurant"}</h3>
                                        <p className="mt-1 text-[10px] text-jse-texte/45">{mission.zone || "Zone non précisée"} · {mission.date_attribution || "Attribution récente"}</p>
                                    </div>
                                    <span className="rounded-full bg-jse-secondaire/10 px-3 py-1.5 text-[10px] font-semibold text-jse-secondaire">
                                        {mission.statut_livraison || "Assignée"}
                                    </span>
                                </div>

                                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-[18px] bg-jse-fond p-3">
                                        <div className="flex items-start gap-2">
                                            <Store size={16} className="mt-0.5 shrink-0 text-jse-principal" />
                                            <div>
                                                <p className="text-[9px] uppercase tracking-[0.1em] text-jse-texte/35">Retrait</p>
                                                <p className="mt-1 text-xs font-semibold">{mission.restaurant?.adresse || "Adresse restaurant non précisée"}</p>
                                                {mission.restaurant?.telephone && <a href={`tel:${mission.restaurant.telephone}`} className="mt-1 block text-[10px] text-jse-secondaire">{mission.restaurant.telephone}</a>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="rounded-[18px] bg-jse-fond p-3">
                                        <div className="flex items-start gap-2">
                                            <MapPin size={16} className="mt-0.5 shrink-0 text-jse-secondaire" />
                                            <div>
                                                <p className="text-[9px] uppercase tracking-[0.1em] text-jse-texte/35">Livraison</p>
                                                <p className="mt-1 text-xs font-semibold">{mission.adresse_livraison}</p>
                                                {mission.telephone_livraison && <a href={`tel:${mission.telephone_livraison}`} className="mt-1 block text-[10px] text-jse-secondaire">{mission.telephone_livraison}</a>}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center justify-between gap-3 border-t border-jse-texte/8 pt-4">
                                    <div>
                                        <p className="text-[10px] text-jse-texte/40">Client</p>
                                        <p className="mt-1 text-xs font-semibold">{mission.client?.nom || "Client"}</p>
                                    </div>
                                    <a href={mission.client?.telephone ? `tel:${mission.client.telephone}` : "#"} className="flex size-10 items-center justify-center rounded-full bg-jse-fond text-jse-principal">
                                        <Phone size={16} />
                                    </a>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}

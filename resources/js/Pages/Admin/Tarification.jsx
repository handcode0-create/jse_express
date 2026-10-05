import { useState } from "react";
import { router } from "@inertiajs/react";
import { Calculator, Plus } from "lucide-react";
import AdminBadge from "../../Composants/Admin/AdminBadge";
import AdminButton from "../../Composants/Admin/AdminButton";
import AdminCard from "../../Composants/Admin/AdminCard";
import AdminDataPage from "../../Composants/Admin/AdminDataPage";
import { AdminField, champAdmin } from "../../Composants/Admin/AdminField";

const nouvelleTranche = { distance_min_km: "", distance_max_km: "", frais: "" };

export default function Tarification({ utilisateur, tarifs = [], restaurants = [] }) {
    const [resultat, setResultat] = useState(null);
    const [simulation, setSimulation] = useState({ restaurant_id: restaurants[0]?.id || "", latitude: "", longitude: "", distance_km: "" });
    const [form, setForm] = useState(nouvelleTranche);

    const simuler = async (evenement) => {
        evenement.preventDefault();
        const reponse = await fetch("/administration/tarification/simuler", {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content || "" },
            body: JSON.stringify(simulation),
        });
        const donnees = await reponse.json();
        setResultat(reponse.ok ? donnees : { erreur: donnees.message || "Simulation impossible." });
    };

    const ajouter = (evenement) => {
        evenement.preventDefault();
        router.post("/administration/tarification", form, { preserveScroll: true, onSuccess: () => setForm(nouvelleTranche) });
    };

    const modifier = (evenement, tarif) => {
        evenement.preventDefault();
        router.patch(
            "/administration/tarification/" + tarif.id,
            {
                distance_min_km: evenement.currentTarget.distance_min_km.value,
                distance_max_km: evenement.currentTarget.distance_max_km.value,
                frais: evenement.currentTarget.frais.value,
            },
            { preserveScroll: true },
        );
    };

    return (
        <AdminDataPage utilisateur={utilisateur} title="Tarification" description="Tranches de livraison calculées par distance." afficherRecherche={false}>
            <section className="mt-6 grid gap-5 lg:grid-cols-2">
                <AdminCard as="form" onSubmit={ajouter} className="p-5 sm:p-6">
                    <h2 className="flex items-center gap-2 text-base font-semibold text-jse-theme-heading">
                        <Plus size={18} aria-hidden="true" />
                        Ajouter une tranche
                    </h2>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <AdminField label="Distance min (km)" required>
                            <input required type="number" min="0" step="0.01" value={form.distance_min_km} onChange={(e) => setForm({ ...form, distance_min_km: e.target.value })} className={champAdmin} />
                        </AdminField>
                        <AdminField label="Distance max (km)" required>
                            <input required type="number" min="0" step="0.01" value={form.distance_max_km} onChange={(e) => setForm({ ...form, distance_max_km: e.target.value })} className={champAdmin} />
                        </AdminField>
                        <AdminField label="Frais (FCFA)" required>
                            <input required type="number" min="0" step="0.01" value={form.frais} onChange={(e) => setForm({ ...form, frais: e.target.value })} className={champAdmin} />
                        </AdminField>
                    </div>
                    <AdminButton type="submit" className="mt-5">
                        Ajouter la tranche
                    </AdminButton>
                </AdminCard>

                <AdminCard as="form" onSubmit={simuler} className="p-5 sm:p-6">
                    <h2 className="flex items-center gap-2 text-base font-semibold text-jse-theme-heading">
                        <Calculator size={18} aria-hidden="true" />
                        Simulateur
                    </h2>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <AdminField label="Restaurant">
                            <select value={simulation.restaurant_id} onChange={(e) => setSimulation({ ...simulation, restaurant_id: e.target.value })} className={champAdmin}>
                                <option value="">Choisir un restaurant</option>
                                {restaurants.map((restaurant) => (
                                    <option key={restaurant.id} value={restaurant.id}>
                                        {restaurant.nom}
                                    </option>
                                ))}
                            </select>
                        </AdminField>
                        <AdminField label="Distance (km)" aide="Optionnel.">
                            <input type="number" min="0" step="0.01" value={simulation.distance_km} onChange={(e) => setSimulation({ ...simulation, distance_km: e.target.value })} className={champAdmin} />
                        </AdminField>
                        <AdminField label="Latitude client">
                            <input type="number" step="0.0000001" value={simulation.latitude} onChange={(e) => setSimulation({ ...simulation, latitude: e.target.value })} className={champAdmin} />
                        </AdminField>
                        <AdminField label="Longitude client">
                            <input type="number" step="0.0000001" value={simulation.longitude} onChange={(e) => setSimulation({ ...simulation, longitude: e.target.value })} className={champAdmin} />
                        </AdminField>
                    </div>
                    <AdminButton type="submit" variante="secondaire" className="mt-5">
                        Simuler
                    </AdminButton>
                    {resultat && (
                        <p className="mt-4 rounded-2xl bg-jse-theme-surface-soft p-4 text-sm font-semibold text-jse-theme-heading" role="status">
                            {resultat.erreur || resultat.distance_km + " km — " + resultat.frais + " FCFA"}
                        </p>
                    )}
                </AdminCard>
            </section>

            <section className="mt-6" aria-labelledby="titre-tranches">
                <h2 id="titre-tranches" className="text-base font-semibold text-jse-theme-heading">
                    Tranches en vigueur
                </h2>
                <div className="mt-3 grid gap-3">
                    {tarifs.length === 0 && (
                        <AdminCard className="p-8 text-center text-sm text-jse-theme-muted">Aucune tranche de livraison définie.</AdminCard>
                    )}
                    {tarifs.map((tarif) => (
                        <AdminCard as="article" key={tarif.id} className="p-4 sm:p-5">
                            <form onSubmit={(evenement) => modifier(evenement, tarif)} className="grid gap-3 sm:grid-cols-[repeat(3,minmax(0,1fr))_auto] sm:items-end">
                                <AdminField label="Distance min (km)">
                                    <input name="distance_min_km" defaultValue={tarif.distance_min_km} type="number" min="0" step="0.01" className={champAdmin} />
                                </AdminField>
                                <AdminField label="Distance max (km)">
                                    <input name="distance_max_km" defaultValue={tarif.distance_max_km} type="number" min="0" step="0.01" className={champAdmin} />
                                </AdminField>
                                <AdminField label="Frais (FCFA)">
                                    <input name="frais" defaultValue={tarif.frais} type="number" min="0" step="0.01" className={champAdmin} />
                                </AdminField>
                                <div className="flex flex-wrap items-center gap-2">
                                    <AdminBadge statut={tarif.statut} />
                                    <AdminButton type="submit">Enregistrer</AdminButton>
                                    <AdminButton variante="contour" onClick={() => router.post("/administration/tarification/" + tarif.id + "/statut", {}, { preserveScroll: true })}>
                                        {tarif.statut === "actif" ? "Désactiver" : "Activer"}
                                    </AdminButton>
                                </div>
                            </form>
                        </AdminCard>
                    ))}
                </div>
            </section>
        </AdminDataPage>
    );
}

import { useState } from "react";
import { router } from "@inertiajs/react";
import { MapPin, Power, UtensilsCrossed } from "lucide-react";
import AdminBadge from "../../Composants/Admin/AdminBadge";
import AdminButton from "../../Composants/Admin/AdminButton";
import AdminDataPage from "../../Composants/Admin/AdminDataPage";
import { champAdmin } from "../../Composants/Admin/AdminField";

function FormulaireCoordonnees({ restaurant }) {
    const manquantes = restaurant.latitude == null || restaurant.longitude == null;

    const enregistrer = (evenement) => {
        evenement.preventDefault();
        router.patch(
            "/administration/restaurants/" + restaurant.id + "/coordonnees",
            {
                latitude: evenement.currentTarget.latitude.value || null,
                longitude: evenement.currentTarget.longitude.value || null,
            },
            { preserveScroll: true },
        );
    };

    return (
        <div className="min-w-0">
            {manquantes && <AdminBadge ton="attention" libelle="Coordonnées manquantes" className="mb-2" />}
            <form onSubmit={enregistrer} className="grid gap-2 sm:grid-cols-2">
                <input
                    name="latitude"
                    aria-label={"Latitude de " + restaurant.nom}
                    defaultValue={restaurant.latitude ?? ""}
                    placeholder="Latitude"
                    type="number"
                    step="0.0000001"
                    className={champAdmin}
                />
                <input
                    name="longitude"
                    aria-label={"Longitude de " + restaurant.nom}
                    defaultValue={restaurant.longitude ?? ""}
                    placeholder="Longitude"
                    type="number"
                    step="0.0000001"
                    className={champAdmin}
                />
                <AdminButton type="submit" variante="contour" taille="petit" className="sm:col-span-2">
                    <MapPin size={14} aria-hidden="true" />
                    {manquantes ? "Ajouter les coordonnées" : "Modifier les coordonnées"}
                </AdminButton>
            </form>
        </div>
    );
}

export default function Restaurants({ utilisateur, restaurants = [], recherche = "" }) {
    const [traitement, setTraitement] = useState(null);

    const basculer = (restaurant) => {
        setTraitement(restaurant.id);
        router.post("/administration/restaurants/" + restaurant.id + "/statut", {}, { preserveScroll: true, onFinish: () => setTraitement(null) });
    };

    return (
        <AdminDataPage
            utilisateur={utilisateur}
            title="Restaurants" visuel="dessert"
            description="Restaurants actifs et inactifs, responsables, zones et activité."
            actionLabel="Nouveau restaurant"
            actionHref="/administration/utilisateurs?nouveau=restaurant"
            search={recherche}
            searchPlaceholder="Nom, responsable ou téléphone"
            rows={restaurants.data || []}
            pagination={restaurants}
            columns={[
                {
                    key: "nom",
                    label: "Restaurant",
                    render: (row) => (
                        <div>
                            <p className="font-semibold">{row.nom}</p>
                            <p className="text-xs text-jse-theme-muted">{row.responsable || "—"}</p>
                        </div>
                    ),
                },
                { key: "telephone", label: "Téléphone" },
                { key: "zone", label: "Zone" },
                { key: "statut", label: "Statut", render: (row) => <AdminBadge statut={row.statut} /> },
                { key: "produits_count", label: "Produits", render: (row) => <span className="tabular-nums">{row.produits_count}</span> },
                { key: "commandes_count", label: "Commandes", render: (row) => <span className="tabular-nums">{row.commandes_count}</span> },
                { key: "coordonnees", label: "Coordonnées", wide: true, render: (row) => <FormulaireCoordonnees restaurant={row} /> },
                {
                    key: "actions",
                    label: "Actions",
                    render: (row) => (
                        <div className="flex flex-col gap-2 sm:flex-row md:flex-col lg:flex-row">
                            <AdminButton href={"/administration/restaurants/" + row.id + "/menu"} variante="contour" taille="petit">
                                <UtensilsCrossed size={15} aria-hidden="true" />
                                Gérer le menu
                            </AdminButton>
                            <AdminButton variante={row.statut === "actif" ? "contour" : "principal"} taille="petit" chargement={traitement === row.id} onClick={() => basculer(row)}>
                                <Power size={15} aria-hidden="true" />
                                {row.statut === "actif" ? "Désactiver" : "Activer"}
                            </AdminButton>
                        </div>
                    ),
                },
            ]}
            emptyMessage="Aucun restaurant trouvé."
        />
    );
}

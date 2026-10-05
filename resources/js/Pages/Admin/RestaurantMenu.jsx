import { useState } from "react";
import { Head, router, useForm } from "@inertiajs/react";
import { Edit3, Plus, Power, UtensilsCrossed, X } from "lucide-react";
import AdminBadge from "../../Composants/Admin/AdminBadge";
import AdminButton from "../../Composants/Admin/AdminButton";
import AdminCard from "../../Composants/Admin/AdminCard";
import { AdminField, champAdmin } from "../../Composants/Admin/AdminField";
import AdminLayout from "../../Composants/Admin/AdminLayout";
import AdminPageHeader from "../../Composants/Admin/AdminPageHeader";

const produitVide = { nom: "", description: "", prix: "", categorie_id: "", image: "" };
const formaterMontant = (montant) => new Intl.NumberFormat("fr-FR").format(Number(montant || 0)) + " FCFA";

export default function RestaurantMenu({ utilisateur, restaurant, categories = [], produits = [] }) {
    const [produitEdite, setProduitEdite] = useState(null);
    const [traitement, setTraitement] = useState(null);
    const base = "/administration/restaurants/" + restaurant.id;

    const basculerDisponibilite = (produit) => {
        setTraitement(produit.id);
        router.patch(base + "/produits/" + produit.id + "/disponibilite", {}, { preserveScroll: true, onFinish: () => setTraitement(null) });
    };

    const groupes = [
        ...categories.map((categorie) => ({
            ...categorie,
            produits: produits.filter((produit) => produit.categorie_id === categorie.id),
        })),
        {
            id: "sans-categorie",
            nom: "Sans catégorie",
            produits: produits.filter((produit) => !categories.some((categorie) => categorie.id === produit.categorie_id)),
        },
    ].filter((groupe) => groupe.id !== "sans-categorie" || groupe.produits.length > 0);

    return (
        <>
            <Head title={`Menu — ${restaurant.nom} — JSE Express`} />

            <AdminLayout utilisateur={utilisateur}>
                <AdminPageHeader
                    eyebrow="Menu du restaurant"
                    title={restaurant.nom}
                    description={[restaurant.adresse, restaurant.zone].filter(Boolean).join(" · ")}
                    retour={{ href: "/administration/restaurants", label: "Restaurants" }}
                    actions={<AdminBadge statut={restaurant.statut} />}
                />

                <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
                    <FormulaireCategorie base={base} />
                    <FormulaireProduit key="creation" base={base} categories={categories} />
                </div>

                <div className="mt-6 space-y-4">
                    {produits.length === 0 && (
                        <AdminCard className="jse-admin-empty flex min-h-40 flex-col items-center justify-center gap-3 p-6 text-center">
                            <span className="flex size-12 items-center justify-center rounded-2xl bg-jse-theme-surface-soft text-jse-theme-muted">
                                <UtensilsCrossed size={22} aria-hidden="true" />
                            </span>
                            <p className="text-sm text-jse-theme-muted">Ce restaurant n’a encore aucun produit.</p>
                        </AdminCard>
                    )}

                    {groupes.map((groupe) => (
                        <AdminCard key={groupe.id} className="overflow-hidden" aria-label={groupe.nom}>
                            <div className="flex items-center justify-between gap-3 border-b border-jse-theme-border bg-jse-theme-surface-soft px-5 py-3.5">
                                <h2 className="text-base font-semibold text-jse-theme-heading">{groupe.nom}</h2>
                                <p className="text-sm text-jse-theme-muted">{groupe.produits.length} produit(s)</p>
                            </div>

                            {groupe.produits.length === 0 && <p className="px-5 py-4 text-sm text-jse-theme-muted">Aucun produit dans cette catégorie.</p>}

                            <ul className="divide-y divide-jse-theme-border">
                                {groupe.produits.map((produit) => (
                                    <li key={produit.id} className="px-5 py-4">
                                        {produitEdite === produit.id ? (
                                            <FormulaireProduit base={base} categories={categories} produit={produit} onFermer={() => setProduitEdite(null)} />
                                        ) : (
                                            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                <div className="min-w-0">
                                                    <p className="break-words text-base font-semibold text-jse-theme-text">{produit.nom}</p>
                                                    {produit.description && <p className="mt-0.5 break-words text-sm text-jse-theme-muted">{produit.description}</p>}
                                                    <div className="mt-2 flex flex-wrap items-center gap-2">
                                                        <span className="text-sm font-semibold tabular-nums text-jse-theme-heading">{formaterMontant(produit.prix)}</span>
                                                        <AdminBadge statut={produit.disponible ? "disponible" : "indisponible"} ton={produit.disponible ? "succes" : "danger"} />
                                                    </div>
                                                </div>

                                                <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                                                    <AdminButton variante="contour" taille="petit" onClick={() => setProduitEdite(produit.id)}>
                                                        <Edit3 size={14} aria-hidden="true" />
                                                        Modifier
                                                    </AdminButton>
                                                    <AdminButton variante="contour" taille="petit" chargement={traitement === produit.id} onClick={() => basculerDisponibilite(produit)}>
                                                        <Power size={14} aria-hidden="true" />
                                                        {produit.disponible ? "Rendre indisponible" : "Rendre disponible"}
                                                    </AdminButton>
                                                </div>
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </AdminCard>
                    ))}
                </div>
            </AdminLayout>
        </>
    );
}

function FormulaireCategorie({ base }) {
    const { data, setData, post, processing, errors, reset } = useForm({ nom: "", description: "" });

    const soumettre = (evenement) => {
        evenement.preventDefault();
        post(base + "/categories", { preserveScroll: true, onSuccess: () => reset() });
    };

    return (
        <AdminCard as="form" onSubmit={soumettre} className="p-5 sm:p-6">
            <h2 className="text-base font-semibold text-jse-theme-heading">Nouvelle catégorie</h2>
            <div className="mt-4 space-y-3">
                <AdminField label="Nom" required erreur={errors.nom}>
                    <input required maxLength={150} value={data.nom} onChange={(e) => setData("nom", e.target.value)} className={champAdmin} />
                </AdminField>
                <AdminField label="Description" erreur={errors.description}>
                    <input maxLength={1000} value={data.description} onChange={(e) => setData("description", e.target.value)} className={champAdmin} />
                </AdminField>
            </div>
            <AdminButton type="submit" chargement={processing} className="mt-5" pleineLargeur>
                <Plus size={16} aria-hidden="true" />
                Ajouter la catégorie
            </AdminButton>
        </AdminCard>
    );
}

function FormulaireProduit({ base, categories, produit = null, onFermer = null }) {
    const edition = Boolean(produit);
    const { data, setData, post, patch, processing, errors, reset } = useForm(
        edition
            ? {
                  nom: produit.nom || "",
                  description: produit.description || "",
                  prix: produit.prix ?? "",
                  categorie_id: produit.categorie_id || "",
                  image: produit.image || "",
              }
            : { ...produitVide },
    );

    const soumettre = (evenement) => {
        evenement.preventDefault();

        if (edition) {
            patch(base + "/produits/" + produit.id, { preserveScroll: true, onSuccess: () => onFermer?.() });
        } else {
            post(base + "/produits", { preserveScroll: true, onSuccess: () => reset() });
        }
    };

    const contenu = (
        <>
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-jse-theme-heading">{edition ? "Modifier le produit" : "Nouveau produit"}</h2>
                {edition && (
                    <button
                        type="button"
                        onClick={onFermer}
                        aria-label="Fermer"
                        className="flex size-11 items-center justify-center rounded-full border border-jse-theme-border text-jse-theme-text transition hover:bg-jse-theme-surface-soft"
                    >
                        <X size={16} aria-hidden="true" />
                    </button>
                )}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <AdminField label="Nom" required erreur={errors.nom}>
                    <input required maxLength={150} value={data.nom} onChange={(e) => setData("nom", e.target.value)} className={champAdmin} />
                </AdminField>
                <AdminField label="Prix (FCFA)" required erreur={errors.prix}>
                    <input required type="number" min="0" step="1" inputMode="numeric" value={data.prix} onChange={(e) => setData("prix", e.target.value)} className={champAdmin} />
                </AdminField>
                <AdminField label="Catégorie" erreur={errors.categorie_id}>
                    <select value={data.categorie_id} onChange={(e) => setData("categorie_id", e.target.value)} className={champAdmin}>
                        <option value="">Sans catégorie</option>
                        {categories.map((categorie) => (
                            <option key={categorie.id} value={categorie.id}>
                                {categorie.nom}
                            </option>
                        ))}
                    </select>
                </AdminField>
                <AdminField label="Image (URL)" erreur={errors.image}>
                    <input maxLength={500} value={data.image} onChange={(e) => setData("image", e.target.value)} placeholder="https://images.unsplash.com/..." className={champAdmin} />
                </AdminField>
                <AdminField label="Description" erreur={errors.description} className="sm:col-span-2">
                    <input maxLength={2000} value={data.description} onChange={(e) => setData("description", e.target.value)} className={champAdmin} />
                </AdminField>
            </div>
            <AdminButton type="submit" chargement={processing} className="mt-5">
                {!edition && <Plus size={16} aria-hidden="true" />}
                {edition ? "Enregistrer" : "Ajouter le produit"}
            </AdminButton>
        </>
    );

    return edition ? (
        <form onSubmit={soumettre}>{contenu}</form>
    ) : (
        <AdminCard as="form" onSubmit={soumettre} className="p-5 sm:p-6">
            {contenu}
        </AdminCard>
    );
}

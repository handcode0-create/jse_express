import React, { useState } from "react";
import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import { ChevronLeft, Edit3, Plus, Power, UtensilsCrossed, X } from "lucide-react";
import AdminSidebar from "../../Composants/Admin/AdminSidebar";

const champ = "jse-admin-input h-11 w-full min-w-0 rounded-2xl border border-jse-theme-border bg-jse-theme-bg px-3 text-sm outline-none focus:border-jse-secondaire";
const produitVide = { nom: "", description: "", prix: "", categorie_id: "", image: "" };
const formatMontant = (montant) => new Intl.NumberFormat("fr-FR").format(Number(montant || 0)) + " FCFA";

export default function RestaurantMenu({ utilisateur, restaurant, categories = [], produits = [] }) {
    const { flash = {} } = usePage().props;
    const [produitEdite, setProduitEdite] = useState(null);
    const [traitement, setTraitement] = useState(null);
    const base = "/administration/restaurants/" + restaurant.id;

    const basculerDisponibilite = (produit) => {
        setTraitement(produit.id);
        router.patch(base + "/produits/" + produit.id + "/disponibilite", {}, {
            preserveScroll: true,
            onFinish: () => setTraitement(null),
        });
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
            <main className="jse-admin-page min-h-screen overflow-x-hidden bg-jse-theme-bg pb-[calc(88px+env(safe-area-inset-bottom))] text-jse-theme-text lg:pb-0">
                <div className="flex min-h-screen flex-col lg:flex-row lg:pl-[238px]">
                    <AdminSidebar utilisateur={utilisateur} />
                    <section className="min-w-0 flex-1">
                        <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
                            <Link href="/administration/restaurants" className="inline-flex items-center gap-1 text-xs font-semibold text-jse-theme-muted">
                                <ChevronLeft size={15} />Restaurants
                            </Link>
                            <header className="mt-3 min-w-0">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-jse-secondaire sm:text-xs">Menu du restaurant</p>
                                <h1 className="mt-1.5 break-words text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">{restaurant.nom}</h1>
                                <p className="mt-2 break-words text-xs leading-5 text-jse-theme-muted sm:text-sm">
                                    {[restaurant.adresse, restaurant.zone, restaurant.statut === "actif" ? "Actif" : "Inactif"].filter(Boolean).join(" · ")}
                                </p>
                            </header>

                            {(flash.success || flash.error) && (
                                <div className="jse-admin-card mt-5 rounded-jse-moyen border border-jse-theme-border bg-jse-theme-surface p-4 text-sm shadow-jse-carte" role="status">
                                    <p className={flash.error ? "break-words text-jse-danger" : "break-words text-jse-secondaire"}>{flash.error || flash.success}</p>
                                </div>
                            )}

                            <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
                                <FormulaireCategorie base={base} />
                                <FormulaireProduit key="creation" base={base} categories={categories} />
                            </div>

                            <div className="mt-6 space-y-4">
                                {produits.length === 0 && (
                                    <div className="jse-admin-card jse-admin-empty flex min-h-40 flex-col items-center justify-center gap-3 rounded-jse-xl border border-jse-theme-border bg-jse-theme-surface p-6 text-center shadow-jse-carte">
                                        <UtensilsCrossed className="text-jse-theme-muted" size={24} />
                                        <p className="text-sm text-jse-theme-muted">Ce restaurant n’a encore aucun produit.</p>
                                    </div>
                                )}

                                {groupes.map((groupe) => (
                                    <section key={groupe.id} className="jse-admin-card overflow-hidden rounded-jse-xl border border-jse-theme-border bg-jse-theme-surface shadow-jse-carte">
                                        <div className="border-b border-jse-theme-border bg-jse-theme-surface-soft px-4 py-3 sm:px-5">
                                            <h2 className="text-sm font-semibold">{groupe.nom}</h2>
                                            <p className="mt-0.5 text-xs text-jse-theme-muted">{groupe.produits.length} produit(s)</p>
                                        </div>
                                        {groupe.produits.length === 0 && <p className="px-4 py-4 text-xs text-jse-theme-muted sm:px-5">Aucun produit dans cette catégorie.</p>}
                                        <ul className="divide-y divide-jse-theme-border">
                                            {groupe.produits.map((produit) => (
                                                <li key={produit.id} className="px-4 py-4 sm:px-5">
                                                    {produitEdite === produit.id ? (
                                                        <FormulaireProduit
                                                            base={base}
                                                            categories={categories}
                                                            produit={produit}
                                                            onFermer={() => setProduitEdite(null)}
                                                        />
                                                    ) : (
                                                        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                            <div className="min-w-0">
                                                                <p className="break-words text-sm font-semibold">{produit.nom}</p>
                                                                {produit.description && <p className="mt-0.5 break-words text-xs text-jse-theme-muted">{produit.description}</p>}
                                                                <p className="mt-1 text-xs">
                                                                    <span className="font-semibold text-jse-secondaire">{formatMontant(produit.prix)}</span>
                                                                    <span className={produit.disponible ? "ml-2 text-jse-theme-muted" : "ml-2 text-jse-danger"}>
                                                                        {produit.disponible ? "Disponible" : "Indisponible"}
                                                                    </span>
                                                                </p>
                                                            </div>
                                                            <div className="flex shrink-0 gap-2">
                                                                <button type="button" onClick={() => setProduitEdite(produit.id)} className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-jse-theme-border px-3 text-xs font-semibold sm:flex-none">
                                                                    <Edit3 size={14} />Modifier
                                                                </button>
                                                                <button type="button" onClick={() => basculerDisponibilite(produit)} disabled={traitement === produit.id} className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-jse-theme-bg px-3 text-xs font-semibold disabled:opacity-50 sm:flex-none">
                                                                    <Power size={14} />{produit.disponible ? "Rendre indisponible" : "Rendre disponible"}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </section>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}

function Champ({ label, required, erreur, children }) {
    return (
        <label className="block min-w-0">
            <span className="mb-1.5 block text-[11px] font-semibold text-jse-theme-muted">{label}{required ? " *" : ""}</span>
            {children}
            {erreur && <span className="mt-1 block text-xs text-jse-danger">{erreur}</span>}
        </label>
    );
}

function FormulaireCategorie({ base }) {
    const { data, setData, post, processing, errors, reset } = useForm({ nom: "", description: "" });

    const soumettre = (event) => {
        event.preventDefault();
        post(base + "/categories", { preserveScroll: true, onSuccess: () => reset() });
    };

    return (
        <form onSubmit={soumettre} className="jse-admin-card rounded-jse-xl border border-jse-theme-border bg-jse-theme-surface p-4 shadow-jse-carte sm:p-5">
            <h2 className="text-sm font-semibold">Nouvelle catégorie</h2>
            <div className="mt-4 space-y-3">
                <Champ label="Nom" required erreur={errors.nom}>
                    <input required maxLength={150} value={data.nom} onChange={(e) => setData("nom", e.target.value)} className={champ} />
                </Champ>
                <Champ label="Description" erreur={errors.description}>
                    <input maxLength={1000} value={data.description} onChange={(e) => setData("description", e.target.value)} className={champ} />
                </Champ>
            </div>
            <button type="submit" disabled={processing} className="jse-admin-primary mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-jse-principal px-4 text-sm font-semibold text-white disabled:opacity-60">
                <Plus size={16} />{processing ? "Enregistrement..." : "Ajouter la catégorie"}
            </button>
        </form>
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

    const soumettre = (event) => {
        event.preventDefault();

        if (edition) {
            patch(base + "/produits/" + produit.id, { preserveScroll: true, onSuccess: () => onFermer?.() });
        } else {
            post(base + "/produits", { preserveScroll: true, onSuccess: () => reset() });
        }
    };

    return (
        <form onSubmit={soumettre} className={edition ? "" : "jse-admin-card rounded-jse-xl border border-jse-theme-border bg-jse-theme-surface p-4 shadow-jse-carte sm:p-5"}>
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold">{edition ? "Modifier le produit" : "Nouveau produit"}</h2>
                {edition && (
                    <button type="button" onClick={onFermer} aria-label="Fermer" className="flex size-9 items-center justify-center rounded-full border border-jse-theme-border">
                        <X size={16} />
                    </button>
                )}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Champ label="Nom" required erreur={errors.nom}>
                    <input required maxLength={150} value={data.nom} onChange={(e) => setData("nom", e.target.value)} className={champ} />
                </Champ>
                <Champ label="Prix (FCFA)" required erreur={errors.prix}>
                    <input required type="number" min="0" step="1" value={data.prix} onChange={(e) => setData("prix", e.target.value)} className={champ} />
                </Champ>
                <Champ label="Catégorie" erreur={errors.categorie_id}>
                    <select value={data.categorie_id} onChange={(e) => setData("categorie_id", e.target.value)} className={champ}>
                        <option value="">Sans catégorie</option>
                        {categories.map((categorie) => <option key={categorie.id} value={categorie.id}>{categorie.nom}</option>)}
                    </select>
                </Champ>
                <Champ label="Image (URL)" erreur={errors.image}>
                    <input maxLength={500} value={data.image} onChange={(e) => setData("image", e.target.value)} placeholder="https://images.unsplash.com/..." className={champ} />
                </Champ>
                <div className="sm:col-span-2">
                    <Champ label="Description" erreur={errors.description}>
                        <input maxLength={2000} value={data.description} onChange={(e) => setData("description", e.target.value)} className={champ} />
                    </Champ>
                </div>
            </div>
            <button type="submit" disabled={processing} className="jse-admin-primary mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-jse-principal px-4 text-sm font-semibold text-white disabled:opacity-60 sm:w-auto">
                {!edition && <Plus size={16} />}{processing ? "Enregistrement..." : edition ? "Enregistrer" : "Ajouter le produit"}
            </button>
        </form>
    );
}

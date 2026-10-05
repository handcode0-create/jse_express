import { useMemo, useState } from "react";
import { Edit3, ListChecks, Plus, Search, UtensilsCrossed } from "lucide-react";
import AdminBadge from "../Admin/AdminBadge";
import AdminButton from "../Admin/AdminButton";
import AdminCard from "../Admin/AdminCard";
import { champAdmin } from "../Admin/AdminField";
import { montant } from "../../lib/restaurant";

function ImageProduit({ produit }) {
    const [erreur, setErreur] = useState(false);

    if (produit.image && !erreur) {
        return <img src={produit.image} alt="" loading="lazy" onError={() => setErreur(true)} className="size-full object-cover" />;
    }

    return (
        <div className="flex size-full flex-col items-center justify-center gap-2 bg-jse-principal/10 text-jse-theme-heading">
            <UtensilsCrossed size={28} aria-hidden="true" />
            <span className="px-3 text-center text-xs font-medium opacity-70">{produit.categorie?.nom || "Sans catégorie"}</span>
        </div>
    );
}

function InterrupteurDisponibilite({ produit, onBasculer, enCours }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={produit.disponible}
            aria-label={`${produit.nom} : ${produit.disponible ? "disponible" : "indisponible"}`}
            disabled={enCours}
            onClick={() => onBasculer(produit)}
            className="group flex min-h-11 items-center gap-3 rounded-full pr-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-jse-secondaire/30 disabled:opacity-60"
        >
            <span className={["relative h-7 w-12 shrink-0 rounded-full transition", produit.disponible ? "bg-jse-secondaire" : "bg-jse-theme-muted/40"].join(" ")}>
                <span className={["absolute top-1 size-5 rounded-full bg-white shadow transition-all", produit.disponible ? "left-6" : "left-1"].join(" ")} />
            </span>
            <span className="text-sm font-medium text-jse-theme-text">{produit.disponible ? "Disponible" : "Indisponible"}</span>
        </button>
    );
}

/**
 * Catalogue du restaurant : recherche, filtre par catégorie et cartes produit
 * avec disponibilité, modification et options accessibles directement.
 */
export default function MenuRestaurant({ produits = [], categories = [], traitement = null, onAjouterProduit, onAjouterCategorie, onModifier, onOptions, onBasculer }) {
    const [recherche, setRecherche] = useState("");
    const [categorie, setCategorie] = useState("Toutes");

    const visibles = useMemo(() => {
        const terme = recherche.trim().toLowerCase();

        return produits
            .filter((produit) => categorie === "Toutes" || produit.categorie?.nom === categorie)
            .filter((produit) => !terme || produit.nom?.toLowerCase().includes(terme) || produit.description?.toLowerCase().includes(terme));
    }, [produits, recherche, categorie]);

    const disponibles = produits.filter((produit) => produit.disponible).length;

    return (
        <section aria-labelledby="titre-menu">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-jse-theme-muted">
                        <span className="h-0.5 w-6 rounded-full bg-jse-secondaire" aria-hidden="true" />
                        Catalogue
                    </p>
                    <h1 id="titre-menu" className="mt-2 text-2xl font-semibold tracking-tight text-jse-theme-heading sm:text-3xl">
                        Menu et produits
                    </h1>
                    <p className="mt-2 text-sm text-jse-theme-muted">
                        <span className="font-semibold tabular-nums text-jse-theme-text">{disponibles}</span> disponible{disponibles > 1 ? "s" : ""} sur{" "}
                        <span className="font-semibold tabular-nums text-jse-theme-text">{produits.length}</span> produit{produits.length > 1 ? "s" : ""}
                    </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                    <AdminButton variante="contour" onClick={onAjouterCategorie}>
                        <Plus size={16} aria-hidden="true" />
                        Nouvelle catégorie
                    </AdminButton>
                    <AdminButton onClick={onAjouterProduit}>
                        <Plus size={16} aria-hidden="true" />
                        Ajouter un produit
                    </AdminButton>
                </div>
            </div>

            <AdminCard className="mt-6 p-3 sm:p-4">
                <label className="relative block">
                    <span className="sr-only">Rechercher un plat ou une boisson</span>
                    <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-jse-theme-muted" aria-hidden="true" />
                    <input type="search" value={recherche} onChange={(evenement) => setRecherche(evenement.target.value)} placeholder="Rechercher un plat, une boisson…" className={champAdmin + " pl-11"} />
                </label>

                <div className="mt-3 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filtrer par catégorie">
                    {["Toutes", ...categories.map((item) => item.nom)].map((nom) => {
                        const actif = categorie === nom;
                        const item = categories.find((entree) => entree.nom === nom);

                        return (
                            <button
                                key={nom}
                                type="button"
                                aria-pressed={actif}
                                onClick={() => setCategorie(nom)}
                                className={[
                                    "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium transition",
                                    actif
                                        ? "border-jse-principal bg-jse-principal text-white"
                                        : "border-jse-theme-border bg-jse-theme-surface text-jse-theme-text hover:bg-jse-theme-surface-soft",
                                ].join(" ")}
                            >
                                {nom}
                                {item && <span className={["text-xs font-semibold tabular-nums", actif ? "text-white/80" : "text-jse-theme-muted"].join(" ")}>{item.nombre_produits}</span>}
                            </button>
                        );
                    })}
                </div>
            </AdminCard>

            {visibles.length === 0 ? (
                <AdminCard className="mt-5 flex min-h-44 flex-col items-center justify-center gap-3 p-8 text-center">
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-jse-theme-surface-soft text-jse-theme-muted">
                        <UtensilsCrossed size={22} aria-hidden="true" />
                    </span>
                    <p className="text-sm font-semibold text-jse-theme-text">{produits.length === 0 ? "Votre menu est vide" : "Aucun produit trouvé"}</p>
                    <p className="max-w-xs text-sm text-jse-theme-muted">
                        {produits.length === 0 ? "Ajoutez votre premier produit pour qu'il apparaisse chez vos clients." : "Essayez une autre recherche ou une autre catégorie."}
                    </p>
                </AdminCard>
            ) : (
                <ul className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {visibles.map((produit) => (
                        <AdminCard as="li" key={produit.id} className={["flex flex-col overflow-hidden", produit.disponible ? "" : "opacity-80"].join(" ")}>
                            <div className="aspect-[16/10] overflow-hidden bg-jse-theme-surface-soft">
                                <ImageProduit produit={produit} />
                            </div>

                            <div className="flex flex-1 flex-col p-4">
                                <p className="text-xs font-medium uppercase tracking-[0.1em] text-jse-theme-muted">{produit.categorie?.nom || "Sans catégorie"}</p>
                                <div className="mt-1 flex items-start justify-between gap-3">
                                    <h3 className="text-base font-semibold text-jse-theme-text">{produit.nom}</h3>
                                    <p className="shrink-0 text-base font-semibold tabular-nums text-jse-theme-heading">{montant(produit.prix)}</p>
                                </div>
                                {produit.description && <p className="mt-2 line-clamp-2 text-sm text-jse-theme-muted">{produit.description}</p>}

                                {produit.options?.length > 0 && (
                                    <div className="mt-3">
                                        <AdminBadge ton="information" libelle={`${produit.options.length} groupe${produit.options.length > 1 ? "s" : ""} d'options`} />
                                    </div>
                                )}

                                <div className="mt-auto pt-4">
                                    <InterrupteurDisponibilite produit={produit} onBasculer={onBasculer} enCours={traitement === produit.id} />
                                    <div className="mt-3 grid grid-cols-2 gap-2">
                                        <AdminButton variante="contour" taille="petit" pleineLargeur onClick={() => onModifier(produit)}>
                                            <Edit3 size={14} aria-hidden="true" />
                                            Modifier
                                        </AdminButton>
                                        <AdminButton variante="contour" taille="petit" pleineLargeur onClick={() => onOptions(produit)}>
                                            <ListChecks size={14} aria-hidden="true" />
                                            Options
                                        </AdminButton>
                                    </div>
                                </div>
                            </div>
                        </AdminCard>
                    ))}
                </ul>
            )}
        </section>
    );
}

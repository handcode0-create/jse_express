import { useForm } from "@inertiajs/react";
import AdminButton from "../Admin/AdminButton";
import { AdminField, champAdmin } from "../Admin/AdminField";
import Modale from "./Modale";

/**
 * Création ou modification d'un produit. La saisie n'est effacée qu'après un succès,
 * et les erreurs du serveur s'affichent sous chaque champ.
 *
 * @param {{ ouvert: boolean, produit: object|null, categories: Array, onFermer: () => void }} props
 */
export function ModaleProduit({ ouvert, produit = null, categories = [], onFermer }) {
    const edition = Boolean(produit);

    return (
        <Modale ouverte={ouvert} titre={edition ? "Modifier le produit" : "Ajouter un produit"} surtitre="Menu" onFermer={onFermer}>
            {/* La clé recrée le formulaire (et sa saisie) à chaque produit ouvert. */}
            <FormulaireProduit key={produit?.id ?? "nouveau"} produit={produit} categories={categories} onFermer={onFermer} />
        </Modale>
    );
}

function FormulaireProduit({ produit, categories, onFermer }) {
    const edition = Boolean(produit);
    const { data, setData, post, patch, processing, errors, clearErrors } = useForm({
        nom: produit?.nom ?? "",
        description: produit?.description ?? "",
        prix: produit?.prix ?? "",
        categorie_id: produit?.categorie?.id ?? "",
        image: produit?.image ?? "",
    });

    const modifier = (champ, valeur) => {
        setData(champ, valeur);
        if (errors[champ]) clearErrors(champ);
    };

    const soumettre = (evenement) => {
        evenement.preventDefault();
        const options = { preserveScroll: true, onSuccess: onFermer };

        if (edition) {
            patch(`/restaurant/produits/${produit.id}`, options);
        } else {
            post("/restaurant/produits", options);
        }
    };

    return (
        <form onSubmit={soumettre} className="space-y-4">
            <AdminField label="Nom du produit" required erreur={errors.nom}>
                <input required maxLength={150} value={data.nom} onChange={(e) => modifier("nom", e.target.value)} className={champAdmin} />
            </AdminField>
            <div className="grid gap-4 sm:grid-cols-2">
                <AdminField label="Prix (FCFA)" required erreur={errors.prix}>
                    <input required type="number" min="0" step="50" inputMode="numeric" value={data.prix} onChange={(e) => modifier("prix", e.target.value)} className={champAdmin} />
                </AdminField>
                <AdminField label="Catégorie" erreur={errors.categorie_id}>
                    <select value={data.categorie_id} onChange={(e) => modifier("categorie_id", e.target.value)} className={champAdmin}>
                        <option value="">Sans catégorie</option>
                        {categories.map((categorie) => (
                            <option key={categorie.id} value={categorie.id}>
                                {categorie.nom}
                            </option>
                        ))}
                    </select>
                </AdminField>
            </div>
            <AdminField label="Description" aide="Facultatif : visible par vos clients." erreur={errors.description}>
                <textarea rows={3} maxLength={2000} value={data.description} onChange={(e) => modifier("description", e.target.value)} className={champAdmin + " resize-none py-3"} />
            </AdminField>
            <AdminField label="Image (URL)" aide="Facultatif. Sans image, une vignette neutre est affichée." erreur={errors.image}>
                <input maxLength={500} value={data.image} onChange={(e) => modifier("image", e.target.value)} placeholder="https://…" className={champAdmin} />
            </AdminField>
            <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
                <AdminButton variante="contour" onClick={onFermer}>
                    Annuler
                </AdminButton>
                <AdminButton type="submit" chargement={processing}>
                    {edition ? "Enregistrer les modifications" : "Ajouter au menu"}
                </AdminButton>
            </div>
        </form>
    );
}

/** Création d'une catégorie du menu. */
export function ModaleCategorie({ ouvert, onFermer }) {
    return (
        <Modale ouverte={ouvert} titre="Nouvelle catégorie" surtitre="Menu" onFermer={onFermer}>
            <FormulaireCategorie onFermer={onFermer} />
        </Modale>
    );
}

function FormulaireCategorie({ onFermer }) {
    const { data, setData, post, processing, errors, clearErrors } = useForm({ nom: "", description: "" });

    const modifier = (champ, valeur) => {
        setData(champ, valeur);
        if (errors[champ]) clearErrors(champ);
    };

    const soumettre = (evenement) => {
        evenement.preventDefault();
        post("/restaurant/categories", { preserveScroll: true, onSuccess: onFermer });
    };

    return (
        <form onSubmit={soumettre} className="space-y-4">
            <AdminField label="Nom de la catégorie" required erreur={errors.nom}>
                <input required maxLength={150} value={data.nom} onChange={(e) => modifier("nom", e.target.value)} placeholder="Ex. Desserts" className={champAdmin} />
            </AdminField>
            <AdminField label="Description" aide="Facultatif." erreur={errors.description}>
                <textarea rows={3} maxLength={1000} value={data.description} onChange={(e) => modifier("description", e.target.value)} className={champAdmin + " resize-none py-3"} />
            </AdminField>
            <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
                <AdminButton variante="contour" onClick={onFermer}>
                    Annuler
                </AdminButton>
                <AdminButton type="submit" chargement={processing}>
                    Créer la catégorie
                </AdminButton>
            </div>
        </form>
    );
}

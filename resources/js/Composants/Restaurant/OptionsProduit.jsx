import { useState } from "react";
import { router, usePage } from "@inertiajs/react";
import { Plus, Trash2, UtensilsCrossed } from "lucide-react";
import AdminButton from "../Admin/AdminButton";
import { AdminField, champAdmin } from "../Admin/AdminField";
import { montant } from "../../lib/restaurant";
import Modale from "./Modale";

const accompagnementsRapides = ["Attiéké", "Riz", "Foutou", "Alloco"];

const groupeVide = () => ({ name: "Accompagnement", obligatoire: true, multiple: false, min: 1, max: 1, items: [] });

/**
 * Éditeur des groupes d'options d'un produit (accompagnements, sauces, suppléments).
 * Le format envoyé au serveur est inchangé : [{ name, obligatoire, multiple, min, max, items: [{ name, prix, disponible }] }].
 */
export function ModaleOptions({ produit, onFermer }) {
    return (
        <Modale ouverte={Boolean(produit)} titre="Options du produit" surtitre={produit?.nom ?? "Menu"} large onFermer={onFermer}>
            {produit && <EditeurOptions key={produit.id} produit={produit} onFermer={onFermer} />}
        </Modale>
    );
}

function EditeurOptions({ produit, onFermer }) {
    const [groupes, setGroupes] = useState(Array.isArray(produit.options) ? produit.options : []);
    const [enCours, setEnCours] = useState(false);
    const { errors = {} } = usePage().props;
    const erreur = Object.values(errors || {}).find(Boolean);

    const majGroupe = (index, changements) => setGroupes((liste) => liste.map((groupe, i) => (i === index ? { ...groupe, ...changements } : groupe)));
    const majItems = (index, fonction) => setGroupes((liste) => liste.map((groupe, i) => (i === index ? { ...groupe, items: fonction(groupe.items || []) } : groupe)));

    const ajouterAccompagnements = () =>
        setGroupes((liste) => [...liste, { ...groupeVide(), items: accompagnementsRapides.map((name) => ({ name, prix: 0, disponible: true })) }]);

    const ajouterItemRapide = (index, nom) =>
        majItems(index, (items) => (items.some((item) => item.name?.trim().toLowerCase() === nom.toLowerCase()) ? items : [...items, { name: nom, prix: 0, disponible: true }]));

    const enregistrer = (evenement) => {
        evenement.preventDefault();
        setEnCours(true);
        router.patch(
            `/restaurant/produits/${produit.id}/options`,
            { options: groupes },
            { preserveScroll: true, onFinish: () => setEnCours(false), onSuccess: onFermer },
        );
    };

    return (
        <form onSubmit={enregistrer} className="space-y-4">
            <div className="flex items-start justify-between gap-3 rounded-2xl bg-jse-theme-surface-soft p-4">
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-jse-theme-text">{produit.nom}</p>
                    <p className="mt-0.5 text-sm text-jse-theme-muted">{produit.categorie?.nom || "Sans catégorie"}</p>
                </div>
                <p className="shrink-0 text-sm font-semibold tabular-nums text-jse-theme-heading">{montant(produit.prix)}</p>
            </div>

            <p className="text-sm text-jse-theme-muted">Créez les accompagnements, sauces, suppléments ou boissons proposés avec ce produit. Chaque option peut avoir un supplément de prix.</p>

            <div className="flex flex-col gap-2 sm:flex-row">
                <AdminButton variante="secondaire" onClick={ajouterAccompagnements}>
                    <Plus size={16} aria-hidden="true" />
                    Ajouter Attiéké, Riz, Foutou, Alloco
                </AdminButton>
                <AdminButton variante="contour" onClick={() => setGroupes((liste) => [...liste, { ...groupeVide(), name: "" }])}>
                    <Plus size={16} aria-hidden="true" />
                    Groupe personnalisé
                </AdminButton>
            </div>

            {groupes.length === 0 && (
                <div className="rounded-2xl border border-dashed border-jse-theme-border px-4 py-8 text-center">
                    <UtensilsCrossed size={24} className="mx-auto text-jse-theme-muted" aria-hidden="true" />
                    <p className="mt-2 text-sm font-semibold text-jse-theme-text">Aucun groupe d'options</p>
                    <p className="mt-1 text-sm text-jse-theme-muted">Ex. « Accompagnement » avec Attiéké et Alloco.</p>
                </div>
            )}

            {groupes.map((groupe, indexGroupe) => (
                <fieldset key={indexGroupe} className="rounded-2xl border border-jse-theme-border p-4">
                    <legend className="px-1 text-sm font-semibold text-jse-theme-heading">Groupe {indexGroupe + 1}</legend>

                    <div className="flex items-end gap-2">
                        <AdminField label="Nom du groupe" required className="flex-1">
                            <input required value={groupe.name} onChange={(e) => majGroupe(indexGroupe, { name: e.target.value })} placeholder="Ex. Accompagnement, Sauce" className={champAdmin} />
                        </AdminField>
                        <button
                            type="button"
                            onClick={() => setGroupes((liste) => liste.filter((_, i) => i !== indexGroupe))}
                            aria-label={`Supprimer le groupe ${groupe.name || indexGroupe + 1}`}
                            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-jse-danger/10 text-jse-danger transition hover:bg-jse-danger/15"
                        >
                            <Trash2 size={17} aria-hidden="true" />
                        </button>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Type de choix">
                        {[
                            { multiple: false, titre: "Un seul choix", exemple: "Ex. type de poisson", max: 1 },
                            { multiple: true, titre: "Plusieurs choix", exemple: "Ex. sauces, suppléments", max: 20 },
                        ].map((choix) => {
                            const actif = Boolean(groupe.multiple) === choix.multiple;

                            return (
                                <button
                                    key={choix.titre}
                                    type="button"
                                    role="radio"
                                    aria-checked={actif}
                                    onClick={() => majGroupe(indexGroupe, { multiple: choix.multiple, max: choix.max })}
                                    className={[
                                        "rounded-2xl border p-3 text-left transition",
                                        actif ? "border-jse-secondaire bg-jse-secondaire/10 ring-4 ring-jse-secondaire/15" : "border-jse-theme-border hover:bg-jse-theme-surface-soft",
                                    ].join(" ")}
                                >
                                    <span className="block text-sm font-semibold text-jse-theme-text">{choix.titre}</span>
                                    <span className="mt-0.5 block text-xs text-jse-theme-muted">{choix.exemple}</span>
                                </button>
                            );
                        })}
                    </div>

                    <label className="mt-3 flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-2xl bg-jse-theme-surface-soft px-4 py-3">
                        <span>
                            <span className="block text-sm font-semibold text-jse-theme-text">Choix obligatoire</span>
                            <span className="block text-xs text-jse-theme-muted">Le client doit sélectionner une option.</span>
                        </span>
                        <input
                            type="checkbox"
                            checked={Boolean(groupe.obligatoire)}
                            onChange={(e) => majGroupe(indexGroupe, { obligatoire: e.target.checked, min: e.target.checked ? 1 : 0 })}
                            className="size-5 accent-[var(--color-jse-principal)]"
                        />
                    </label>

                    {String(groupe.name || "").trim().toLowerCase() === "accompagnement" && (
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-jse-theme-muted">Ajout rapide</span>
                            {accompagnementsRapides.map((nom) => (
                                <button
                                    key={nom}
                                    type="button"
                                    onClick={() => ajouterItemRapide(indexGroupe, nom)}
                                    disabled={(groupe.items || []).some((item) => item.name?.trim().toLowerCase() === nom.toLowerCase())}
                                    className="min-h-9 rounded-full border border-jse-theme-border px-3 text-sm font-medium text-jse-theme-text transition hover:bg-jse-theme-surface-soft disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    + {nom}
                                </button>
                            ))}
                        </div>
                    )}

                    <ul className="mt-4 space-y-2">
                        {(groupe.items || []).map((item, indexItem) => (
                            <li key={indexItem} className="grid gap-2 rounded-2xl border border-jse-theme-border p-3 sm:grid-cols-[minmax(0,1fr)_9rem_auto_auto] sm:items-center">
                                <input
                                    aria-label="Nom de l'option"
                                    value={item.name}
                                    onChange={(e) => majItems(indexGroupe, (items) => items.map((entree, i) => (i === indexItem ? { ...entree, name: e.target.value } : entree)))}
                                    placeholder="Nom de l'option"
                                    className={champAdmin}
                                />
                                <div className="relative">
                                    <input
                                        aria-label={`Supplément de prix pour ${item.name || "l'option"}`}
                                        type="number"
                                        min="0"
                                        step="50"
                                        inputMode="numeric"
                                        value={item.prix}
                                        onChange={(e) => majItems(indexGroupe, (items) => items.map((entree, i) => (i === indexItem ? { ...entree, prix: Number(e.target.value) } : entree)))}
                                        className={champAdmin + " pr-14"}
                                    />
                                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-jse-theme-muted">FCFA</span>
                                </div>
                                <button
                                    type="button"
                                    aria-pressed={Boolean(item.disponible)}
                                    onClick={() => majItems(indexGroupe, (items) => items.map((entree, i) => (i === indexItem ? { ...entree, disponible: !entree.disponible } : entree)))}
                                    className={[
                                        "min-h-11 rounded-full px-4 text-sm font-semibold transition",
                                        item.disponible ? "bg-jse-secondaire/15 text-jse-theme-heading" : "bg-jse-theme-text/5 text-jse-theme-muted",
                                    ].join(" ")}
                                >
                                    {item.disponible ? "Disponible" : "Indisponible"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => majItems(indexGroupe, (items) => items.filter((_, i) => i !== indexItem))}
                                    aria-label={`Supprimer l'option ${item.name || indexItem + 1}`}
                                    className="flex size-11 items-center justify-center justify-self-end rounded-full text-jse-theme-muted transition hover:bg-jse-danger/10 hover:text-jse-danger"
                                >
                                    <Trash2 size={16} aria-hidden="true" />
                                </button>
                            </li>
                        ))}
                    </ul>

                    <AdminButton variante="contour" taille="petit" className="mt-3" pleineLargeur onClick={() => majItems(indexGroupe, (items) => [...items, { name: "", prix: 0, disponible: true }])}>
                        <Plus size={14} aria-hidden="true" />
                        Ajouter une option
                    </AdminButton>
                </fieldset>
            ))}

            {erreur && (
                <p role="alert" className="rounded-2xl bg-jse-danger/10 p-3 text-sm font-medium text-jse-danger">
                    {erreur}
                </p>
            )}

            <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
                <AdminButton variante="contour" onClick={onFermer}>
                    Annuler
                </AdminButton>
                <AdminButton type="submit" chargement={enCours}>
                    Enregistrer les options
                </AdminButton>
            </div>
        </form>
    );
}

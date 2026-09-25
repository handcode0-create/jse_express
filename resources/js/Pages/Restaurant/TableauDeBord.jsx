import { useState } from "react";
import { router, usePage } from "@inertiajs/react";
import {
    Check,
    ChevronDown,
    Clock3,
    Package,
    Plus,
    Power,
    RefreshCw,
    UtensilsCrossed,
} from "lucide-react";
import SidebarJSE from "../../Composants/Navigation/SidebarJSE";

const statutSuivant = {
    EN_ATTENTE: { code: "CONFIRMEE", label: "Confirmer" },
    CONFIRMEE: { code: "EN_PREPARATION", label: "Démarrer la préparation" },
    EN_PREPARATION: { code: "PRETE", label: "Marquer prête" },
};

function prix(valeur) {
    return new Intl.NumberFormat("fr-FR").format(Number(valeur || 0)) + " FCFA";
}

function BadgeStatut({ statut }) {
    return (
        <span className="rounded-full bg-jse-fond px-3 py-1.5 text-[10px] font-semibold text-jse-principal">
            {statut?.libelle || "Inconnu"}
        </span>
    );
}

export default function TableauDeBord() {
    const { restaurant, statistiques, commandes = [], categories = [], produits = [], flash = {} } =
        usePage().props;
    const [onglet, setOnglet] = useState("commandes");
    const [modal, setModal] = useState(null);
    const [produit, setProduit] = useState({
        nom: "", description: "", prix: "", categorie_id: "", image: "",
    });
    const [categorie, setCategorie] = useState({ nom: "", description: "" });
    const [chargement, setChargement] = useState(false);

    const executer = (method, url, data = {}) => {
        setChargement(true);
        router[method](url, data, {
            preserveScroll: true,
            onFinish: () => setChargement(false),
            onSuccess: () => setModal(null),
        });
    };

    const creerProduit = (event) => {
        event.preventDefault();
        executer("post", "/restaurant/produits", produit);
        setProduit({ nom: "", description: "", prix: "", categorie_id: "", image: "" });
    };

    const creerCategorie = (event) => {
        event.preventDefault();
        executer("post", "/restaurant/categories", categorie);
        setCategorie({ nom: "", description: "" });
    };

    return (
        <main className="min-h-screen bg-jse-fond pb-8 text-jse-texte">
            <div className="mx-auto min-h-screen w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="lg:grid lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-10">
                    <SidebarJSE />

                    <div className="w-full">
                        <header className="rounded-b-[32px] bg-jse-principal px-5 pb-7 pt-7 text-white lg:rounded-[32px]">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-jse-secondaire">
                                        Espace restaurant
                                    </p>
                                    <h1 className="mt-2 font-against text-3xl leading-none sm:text-4xl">
                                        {restaurant?.nom || "Mon restaurant"}
                                    </h1>
                                    <p className="mt-2 text-xs text-white/60">
                                        Gérez vos commandes et votre menu depuis JSE Express.
                                    </p>
                                </div>
                                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/10">
                                    <UtensilsCrossed size={21} />
                                </div>
                            </div>
                        </header>

                        {flash?.success && (
                            <div className="mt-5 rounded-2xl border border-jse-secondaire/20 bg-jse-secondaire/10 px-4 py-3 text-xs font-medium text-jse-principal">
                                {flash.success}
                            </div>
                        )}

                        <section className="mt-5 grid grid-cols-3 gap-3">
                            <div className="rounded-[22px] bg-white p-4 shadow-sm ring-1 ring-jse-texte/5">
                                <Clock3 size={18} className="text-jse-secondaire" />
                                <p className="mt-4 text-2xl font-semibold">{statistiques?.commandes_en_attente || 0}</p>
                                <p className="mt-1 text-[10px] text-jse-texte/50">À traiter</p>
                            </div>
                            <div className="rounded-[22px] bg-white p-4 shadow-sm ring-1 ring-jse-texte/5">
                                <Package size={18} className="text-jse-accent" />
                                <p className="mt-4 text-2xl font-semibold">{statistiques?.commandes_du_jour || 0}</p>
                                <p className="mt-1 text-[10px] text-jse-texte/50">Commandes aujourd’hui</p>
                            </div>
                            <div className="rounded-[22px] bg-white p-4 shadow-sm ring-1 ring-jse-texte/5">
                                <UtensilsCrossed size={18} className="text-jse-principal" />
                                <p className="mt-4 text-2xl font-semibold">{statistiques?.produits_disponibles || 0}</p>
                                <p className="mt-1 text-[10px] text-jse-texte/50">Produits actifs</p>
                            </div>
                        </section>

                        <div className="mt-6 flex rounded-2xl bg-white p-1 shadow-sm ring-1 ring-jse-texte/5">
                            {[
                                ["commandes", "Commandes"],
                                ["menu", "Menu"],
                            ].map(([id, label]) => (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => setOnglet(id)}
                                    className={`flex-1 rounded-xl px-4 py-3 text-xs font-semibold transition ${onglet === id ? "bg-jse-principal text-white shadow-sm" : "text-jse-texte/45 hover:text-jse-texte"}`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        {onglet === "commandes" && (
                            <section className="mt-4 space-y-3">
                                {commandes.length === 0 ? (
                                    <div className="rounded-[26px] bg-white p-8 text-center shadow-sm ring-1 ring-jse-texte/5">
                                        <Package className="mx-auto text-jse-texte/25" />
                                        <p className="mt-3 text-sm font-semibold">Aucune commande</p>
                                        <p className="mt-1 text-xs text-jse-texte/45">Les nouvelles commandes apparaîtront ici.</p>
                                    </div>
                                ) : commandes.map((commande) => {
                                    const suivant = statutSuivant[commande.statut?.code];
                                    return (
                                        <article key={commande.id} className="rounded-[26px] bg-white p-5 shadow-sm ring-1 ring-jse-texte/5">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-jse-texte/35">
                                                        {commande.reference}
                                                    </p>
                                                    <h2 className="mt-1 text-sm font-semibold">{commande.client?.nom || "Client"}</h2>
                                                    <p className="mt-1 text-[11px] text-jse-texte/45">
                                                        {commande.date} · {commande.heure} · {commande.nombre_articles} article{commande.nombre_articles > 1 ? "s" : ""}
                                                    </p>
                                                </div>
                                                <BadgeStatut statut={commande.statut} />
                                            </div>

                                            <div className="mt-4 rounded-[18px] bg-jse-fond p-3">
                                                <p className="text-xs font-medium">{commande.adresse}</p>
                                                {commande.zone && <p className="mt-1 text-[10px] text-jse-texte/45">Zone {commande.zone}</p>}
                                            </div>

                                            <div className="mt-4 flex items-center justify-between gap-3">
                                                <p className="font-semibold text-jse-principal">{prix(commande.montant_total)}</p>
                                                {suivant && (
                                                    <button
                                                        type="button"
                                                        disabled={chargement}
                                                        onClick={() => executer("patch", `/restaurant/commandes/${commande.id}/statut`, { statut: suivant.code })}
                                                        className="inline-flex items-center gap-2 rounded-full bg-jse-secondaire px-4 py-2.5 text-[11px] font-semibold text-white transition hover:brightness-105 disabled:opacity-50"
                                                    >
                                                        <Check size={15} />
                                                        {suivant.label}
                                                    </button>
                                                )}
                                            </div>
                                        </article>
                                    );
                                })}
                            </section>
                        )}

                        {onglet === "menu" && (
                            <section className="mt-4">
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <button type="button" onClick={() => setModal("produit")} className="flex items-center justify-center gap-2 rounded-[22px] bg-jse-principal px-4 py-4 text-xs font-semibold text-white shadow-sm">
                                        <Plus size={17} /> Ajouter un produit
                                    </button>
                                    <button type="button" onClick={() => setModal("categorie")} className="flex items-center justify-center gap-2 rounded-[22px] bg-white px-4 py-4 text-xs font-semibold text-jse-principal shadow-sm ring-1 ring-jse-texte/5">
                                        <Plus size={17} /> Ajouter une catégorie
                                    </button>
                                </div>

                                <div className="mt-4 space-y-3">
                                    {produits.map((item) => (
                                        <article key={item.id} className="flex items-center gap-3 rounded-[22px] bg-white p-4 shadow-sm ring-1 ring-jse-texte/5">
                                            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-jse-fond text-jse-principal">
                                                <UtensilsCrossed size={19} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-xs font-semibold">{item.nom}</p>
                                                <p className="mt-1 text-[10px] text-jse-texte/45">{item.categorie?.nom || "Sans catégorie"} · {prix(item.prix)}</p>
                                            </div>
                                            <button
                                                type="button"
                                                title={item.disponible ? "Marquer indisponible" : "Rendre disponible"}
                                                onClick={() => executer("patch", `/restaurant/produits/${item.id}/disponibilite`)}
                                                className={`flex size-10 items-center justify-center rounded-full ${item.disponible ? "bg-jse-secondaire/10 text-jse-secondaire" : "bg-jse-texte/5 text-jse-texte/35"}`}
                                            >
                                                <Power size={16} />
                                            </button>
                                        </article>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </div>

            {modal && (
                <div className="fixed inset-0 z-[90] flex items-end justify-center bg-jse-principal/25 p-0 backdrop-blur-sm sm:items-center sm:p-5" onClick={() => setModal(null)}>
                    <div className="w-full max-w-md rounded-t-[30px] bg-white p-5 shadow-2xl sm:rounded-[30px]" onClick={(event) => event.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-jse-texte/35">JSE Express</p>
                                <h2 className="mt-1 font-against text-2xl text-jse-principal">
                                    {modal === "produit" ? "Ajouter un produit" : "Ajouter une catégorie"}
                                </h2>
                            </div>
                            <button type="button" onClick={() => setModal(null)} className="flex size-10 items-center justify-center rounded-full bg-jse-fond text-jse-principal">
                                <ChevronDown size={18} className="rotate-180" />
                            </button>
                        </div>

                        {modal === "categorie" ? (
                            <form onSubmit={creerCategorie} className="mt-6 space-y-4">
                                <input required value={categorie.nom} onChange={(e) => setCategorie({ ...categorie, nom: e.target.value })} placeholder="Nom de la catégorie" className="h-12 w-full rounded-2xl border border-jse-texte/10 bg-jse-fond px-4 text-sm outline-none focus:border-jse-secondaire" />
                                <textarea value={categorie.description} onChange={(e) => setCategorie({ ...categorie, description: e.target.value })} placeholder="Description (facultatif)" className="min-h-24 w-full rounded-2xl border border-jse-texte/10 bg-jse-fond px-4 py-3 text-sm outline-none focus:border-jse-secondaire" />
                                <button disabled={chargement} className="h-12 w-full rounded-full bg-jse-secondaire text-xs font-semibold text-white disabled:opacity-50">Créer la catégorie</button>
                            </form>
                        ) : (
                            <form onSubmit={creerProduit} className="mt-6 space-y-4">
                                <input required value={produit.nom} onChange={(e) => setProduit({ ...produit, nom: e.target.value })} placeholder="Nom du produit" className="h-12 w-full rounded-2xl border border-jse-texte/10 bg-jse-fond px-4 text-sm outline-none focus:border-jse-secondaire" />
                                <div className="grid grid-cols-2 gap-3">
                                    <input required type="number" min="0" step="50" value={produit.prix} onChange={(e) => setProduit({ ...produit, prix: e.target.value })} placeholder="Prix (FCFA)" className="h-12 w-full rounded-2xl border border-jse-texte/10 bg-jse-fond px-4 text-sm outline-none focus:border-jse-secondaire" />
                                    <select value={produit.categorie_id} onChange={(e) => setProduit({ ...produit, categorie_id: e.target.value })} className="h-12 w-full rounded-2xl border border-jse-texte/10 bg-jse-fond px-4 text-sm outline-none focus:border-jse-secondaire">
                                        <option value="">Catégorie</option>
                                        {categories.map((item) => <option key={item.id} value={item.id}>{item.nom}</option>)}
                                    </select>
                                </div>
                                <textarea value={produit.description} onChange={(e) => setProduit({ ...produit, description: e.target.value })} placeholder="Description (facultatif)" className="min-h-24 w-full rounded-2xl border border-jse-texte/10 bg-jse-fond px-4 py-3 text-sm outline-none focus:border-jse-secondaire" />
                                <input value={produit.image} onChange={(e) => setProduit({ ...produit, image: e.target.value })} placeholder="URL de l'image (facultatif)" className="h-12 w-full rounded-2xl border border-jse-texte/10 bg-jse-fond px-4 text-sm outline-none focus:border-jse-secondaire" />
                                <button disabled={chargement} className="h-12 w-full rounded-full bg-jse-secondaire text-xs font-semibold text-white disabled:opacity-50">Ajouter au menu</button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
}

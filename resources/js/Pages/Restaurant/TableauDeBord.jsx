import { useMemo, useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import { BarChart3, ChevronRight, CircleDollarSign, Clock3, LogOut, Package, ShoppingBag, UtensilsCrossed } from "lucide-react";
import AdminButton from "../../Composants/Admin/AdminButton";
import AdminCard from "../../Composants/Admin/AdminCard";
import AdminStatCard from "../../Composants/Admin/AdminStatCard";
import ThemeToggle from "../../Composants/Interface/ThemeToggle";
import PhotoProfil from "../../Composants/Profil/PhotoProfil";
import CommandesRestaurant from "../../Composants/Restaurant/CommandesRestaurant";
import { FormulaireCompte, FormulaireHoraires, FormulaireProfil, TitreRubrique } from "../../Composants/Restaurant/FormulairesRestaurant";
import { ModaleCategorie, ModaleProduit } from "../../Composants/Restaurant/FormulairesProduit";
import MenuRestaurant from "../../Composants/Restaurant/MenuRestaurant";
import { ModaleOptions } from "../../Composants/Restaurant/OptionsProduit";
import RestaurantLayout, { rubriques } from "../../Composants/Restaurant/RestaurantLayout";
import { URL_ESPACE, filtresCommandes, montant } from "../../lib/restaurant";

const identifiantsRubriques = rubriques.map((rubrique) => rubrique.id);
const codesATraiter = filtresCommandes.find((filtre) => filtre.id === "a-traiter").codes;

function lireRubriqueInitiale() {
    if (typeof window === "undefined") return "dashboard";

    const demandee = new URLSearchParams(window.location.search).get("onglet");

    return identifiantsRubriques.includes(demandee) ? demandee : "dashboard";
}

export default function TableauDeBord() {
    const { restaurant, statistiques = {}, commandes = [], categories = [], produits = [], auth } = usePage().props;
    const utilisateur = auth?.user;
    const prenom = utilisateur?.prenom || "Chef";

    const [onglet, setOnglet] = useState(lireRubriqueInitiale);
    const [modale, setModale] = useState(null);
    const [commandeEnCours, setCommandeEnCours] = useState(null);
    const [produitEnCours, setProduitEnCours] = useState(null);

    const commandesATraiter = useMemo(() => commandes.filter((commande) => codesATraiter.includes(commande.statut?.code)), [commandes]);
    const produitsIndisponibles = produits.filter((produit) => !produit.disponible).length;

    const naviguer = (id) => {
        setOnglet(id);
        window.history.replaceState(window.history.state, "", id === "dashboard" ? URL_ESPACE : `${URL_ESPACE}?onglet=${id}`);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const avancerCommande = (commande, statut) => {
        setCommandeEnCours(commande.id);
        router.patch(`/restaurant/commandes/${commande.id}/statut`, { statut }, { preserveScroll: true, onFinish: () => setCommandeEnCours(null) });
    };

    const basculerDisponibilite = (produit) => {
        setProduitEnCours(produit.id);
        router.patch(`/restaurant/produits/${produit.id}/disponibilite`, {}, { preserveScroll: true, onFinish: () => setProduitEnCours(null) });
    };

    return (
        <>
            <Head title={`Espace restaurant — ${restaurant?.nom ?? "JSE Express"}`} />

            <RestaurantLayout restaurant={restaurant} onglet={onglet} onNavigate={naviguer} aTraiter={commandesATraiter.length}>
                {onglet === "dashboard" && (
                    <>
                        <header className="min-w-0">
                            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-jse-theme-muted">
                                <span className="h-0.5 w-6 rounded-full bg-jse-secondaire" aria-hidden="true" />
                                Espace restaurant
                            </p>
                            <h1 className="mt-2 break-words font-against text-4xl leading-[0.95] text-jse-theme-heading sm:text-5xl">Bonjour {prenom}</h1>
                            <p className="mt-3 max-w-2xl text-sm leading-6 text-jse-theme-muted sm:text-base">Voici l’activité de votre restaurant aujourd’hui.</p>
                        </header>

                        <section className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4" aria-label="Indicateurs du jour">
                            <AdminStatCard label="Commandes à traiter" value={commandesATraiter.length} icon={Clock3} tone="accent" onClick={() => naviguer("commandes")} />
                            <AdminStatCard label="Commandes aujourd'hui" value={statistiques.commandes_du_jour || 0} icon={ShoppingBag} tone="principal" onClick={() => naviguer("commandes")} />
                            <AdminStatCard label="Revenus du jour" value={montant(statistiques.revenus_du_jour)} icon={CircleDollarSign} tone="secondaire" onClick={() => naviguer("statistiques")} />
                            <AdminStatCard label="Produits disponibles" value={statistiques.produits_disponibles || 0} icon={UtensilsCrossed} tone="secondaire" onClick={() => naviguer("menu")} />
                        </section>

                        <section className="mt-8" aria-labelledby="titre-a-traiter">
                            <div className="mb-4 flex items-end justify-between gap-3">
                                <div>
                                    <h2 id="titre-a-traiter" className="text-lg font-semibold text-jse-theme-heading">
                                        Commandes à traiter
                                    </h2>
                                    <p className="text-sm text-jse-theme-muted">Confirmez, préparez, puis marquez prêtes pour la livraison.</p>
                                </div>
                                <button type="button" onClick={() => naviguer("commandes")} className="inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-jse-theme-heading hover:underline">
                                    Toutes les commandes
                                    <ChevronRight size={16} aria-hidden="true" />
                                </button>
                            </div>
                            <CommandesRestaurant commandes={commandesATraiter} filtres={false} limite={5} traitement={commandeEnCours} onAvancer={avancerCommande} />
                        </section>

                        {produitsIndisponibles > 0 && (
                            <AdminCard className="mt-6 flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-jse-theme-text">
                                    <span className="font-semibold tabular-nums">{produitsIndisponibles}</span> produit{produitsIndisponibles > 1 ? "s sont" : " est"} actuellement indisponible{produitsIndisponibles > 1 ? "s" : ""} pour vos clients.
                                </p>
                                <AdminButton variante="contour" taille="petit" onClick={() => naviguer("menu")}>
                                    Gérer le menu
                                </AdminButton>
                            </AdminCard>
                        )}
                    </>
                )}

                {onglet === "commandes" && (
                    <section aria-labelledby="titre-commandes">
                        <TitreRubrique surtitre="Gestion" titre="Commandes" description="Consultez et faites avancer les commandes de votre restaurant." />
                        <div className="mt-6">
                            <CommandesRestaurant commandes={commandes} traitement={commandeEnCours} onAvancer={avancerCommande} />
                        </div>
                    </section>
                )}

                {onglet === "menu" && (
                    <MenuRestaurant
                        produits={produits}
                        categories={categories}
                        traitement={produitEnCours}
                        onAjouterProduit={() => setModale({ type: "produit", produit: null })}
                        onAjouterCategorie={() => setModale({ type: "categorie" })}
                        onModifier={(produit) => setModale({ type: "produit", produit })}
                        onOptions={(produit) => setModale({ type: "options", produit })}
                        onBasculer={basculerDisponibilite}
                    />
                )}

                {onglet === "statistiques" && (
                    <section>
                        <TitreRubrique surtitre="Performance" titre="Statistiques" description="Indicateurs calculés à partir de vos commandes et des paiements réussis." />
                        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
                            <AdminStatCard label="Commandes au total" value={statistiques.commandes_total || 0} icon={ShoppingBag} tone="principal" />
                            <AdminStatCard label="Commandes livrées" value={statistiques.commandes_livrees || 0} icon={Package} tone="secondaire" />
                            <AdminStatCard label="Revenus cumulés" value={montant(statistiques.revenus_total)} icon={CircleDollarSign} tone="secondaire" />
                            <AdminStatCard label="Panier moyen" value={montant(statistiques.panier_moyen)} icon={BarChart3} tone="accent" />
                        </div>
                        <AdminCard className="mt-5 grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
                            <div className="rounded-2xl bg-jse-theme-surface-soft p-4">
                                <p className="text-sm text-jse-theme-muted">Commandes aujourd'hui</p>
                                <p className="mt-1 text-2xl font-semibold tabular-nums text-jse-theme-heading">{statistiques.commandes_du_jour || 0}</p>
                            </div>
                            <div className="rounded-2xl bg-jse-theme-surface-soft p-4">
                                <p className="text-sm text-jse-theme-muted">Commandes à confirmer</p>
                                <p className="mt-1 text-2xl font-semibold tabular-nums text-jse-theme-heading">{statistiques.commandes_en_attente || 0}</p>
                            </div>
                        </AdminCard>
                    </section>
                )}

                {onglet === "horaires" && (
                    <section>
                        <TitreRubrique surtitre="Restaurant" titre="Horaires" description="Modifiez les horaires affichés à vos clients." />
                        <FormulaireHoraires restaurant={restaurant} />
                    </section>
                )}

                {onglet === "profil" && (
                    <section>
                        <TitreRubrique surtitre="Restaurant" titre="Profil du restaurant" description="Gérez les informations publiques de votre restaurant." />

                        <AdminCard className="mt-6 flex max-w-3xl items-center gap-4 p-4 sm:p-5">
                            <PhotoProfil user={utilisateur} size="size-16" dark />
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-jse-theme-text">Photo de profil</p>
                                <p className="mt-1 text-sm text-jse-theme-muted">Touchez votre photo pour la remplacer. JPG, PNG ou WebP, 5 Mo maximum.</p>
                            </div>
                        </AdminCard>

                        <FormulaireProfil restaurant={restaurant} />

                        <AdminCard className="mt-6 max-w-3xl p-5 lg:hidden">
                            <h2 className="text-base font-semibold text-jse-theme-heading">Mon espace</h2>
                            <div className="mt-3 grid gap-2">
                                {[
                                    ["statistiques", "Statistiques"],
                                    ["horaires", "Horaires"],
                                    ["parametres", "Mon compte"],
                                ].map(([id, libelle]) => (
                                    <AdminButton key={id} variante="contour" onClick={() => naviguer(id)}>
                                        {libelle}
                                    </AdminButton>
                                ))}
                            </div>
                            <div className="mt-4 flex items-center justify-between rounded-2xl bg-jse-theme-surface-soft px-4 py-3">
                                <span className="text-sm font-medium text-jse-theme-text">Thème</span>
                                <ThemeToggle compact />
                            </div>
                            <AdminButton variante="dangerDoux" className="mt-3" onClick={() => router.post("/deconnexion")}>
                                <LogOut size={16} aria-hidden="true" />
                                Déconnexion
                            </AdminButton>
                        </AdminCard>
                    </section>
                )}

                {onglet === "parametres" && (
                    <section>
                        <TitreRubrique surtitre="Compte" titre="Mon compte" description="Modifiez les informations du responsable connecté." />
                        <FormulaireCompte utilisateur={utilisateur} />
                    </section>
                )}
            </RestaurantLayout>

            <ModaleProduit ouvert={modale?.type === "produit"} produit={modale?.produit ?? null} categories={categories} onFermer={() => setModale(null)} />
            <ModaleCategorie ouvert={modale?.type === "categorie"} onFermer={() => setModale(null)} />
            <ModaleOptions produit={modale?.type === "options" ? modale.produit : null} onFermer={() => setModale(null)} />
        </>
    );
}

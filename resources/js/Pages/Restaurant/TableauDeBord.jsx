import { useMemo, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import NavigationFlottante from "../../Composants/Navigation/NavigationFlottante";
import {
    Bell,
    ChevronDown,
    ChevronRight,
    Clock3,
    CreditCard,
    LayoutDashboard,
    LogOut,
    Menu,
    Package,
    Plus,
    Power,
    Settings,
    ShoppingBag,
    Star,
    Store,
    Tag,
    UserRound,
    UtensilsCrossed,
    X,
} from "lucide-react";

const statutSuivant = {
    EN_ATTENTE: { code: "CONFIRMEE", label: "Confirmer" },
    CONFIRMEE: { code: "EN_PREPARATION", label: "Démarrer la préparation" },
    EN_PREPARATION: { code: "PRETE", label: "Marquer prête" },
};

const navigation = [
    ["dashboard", "Tableau de bord", LayoutDashboard],
    ["commandes", "Commandes", ShoppingBag],
    ["menu", "Menu / Produits", Menu],
    ["categories", "Catégories", Tag],
    ["avis", "Avis clients", Star],
    ["statistiques", "Statistiques", CreditCard],
    ["horaires", "Mes horaires", Clock3],
    ["parametres", "Paramètres", Settings],
    ["profil", "Mon profil", UserRound],
];

const accompagnementsRapides = [
    "Attiéké",
    "Riz",
    "Foutou",
    "Alloco",
];

const imagesDemoProduits = {
    "Boisson": "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=80",
    "Menu complet": "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80",
    "Poulet braisé": "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=80",
    "Attiéké poisson": "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80",
    "Pizza": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80",
    "Burger": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80",
};

function imageDemoProduit(produit) {
    return produit?.image || imagesDemoProduits[produit?.nom] || imagesDemoProduits[produit?.categorie?.nom] || "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80";
}

function montant(value) {
    return new Intl.NumberFormat("fr-FR").format(Number(value || 0)) + " FCFA";
}

function initiales(value = "") {
    return value
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
}

function statutClasse(code) {
    return {
        EN_ATTENTE: "bg-jse-accent text-white",
        CONFIRMEE: "bg-jse-information text-white",
        EN_PREPARATION: "bg-jse-accent text-white",
        PRETE: "bg-jse-secondaire text-jse-texte",
        EN_LIVRAISON: "bg-jse-information text-white",
        LIVREE: "bg-jse-secondaire text-jse-texte",
    }[code] || "bg-white/10 text-white/70";
}

export default function TableauDeBord() {
    const {
        restaurant,
        statistiques = {},
        commandes = [],
        categories = [],
        produits = [],
        flash = {},
        auth,
    } = usePage().props;

    const utilisateur = auth?.user;
    const nomComplet = [utilisateur?.prenom, utilisateur?.nom].filter(Boolean).join(" ") || "Chef";

    const [onglet, setOnglet] = useState("dashboard");
    const [modal, setModal] = useState(null);
    const [rechercheMenu, setRechercheMenu] = useState("");
    const [categorieMenu, setCategorieMenu] = useState("Toutes");
    const [chargement, setChargement] = useState(false);
    const [produit, setProduit] = useState({ nom: "", description: "", prix: "", categorie_id: "", image: "" });
    const [produitSelectionne, setProduitSelectionne] = useState(null);
    const [optionsProduit, setOptionsProduit] = useState([]);
    const [categorie, setCategorie] = useState({ nom: "", description: "" });
    const [profil, setProfil] = useState({
        nom: restaurant?.nom || "",
        description: restaurant?.description || "",
        telephone: restaurant?.telephone || "",
        email: restaurant?.email || "",
        adresse: restaurant?.adresse || "",
    });
    const [horaires, setHoraires] = useState(restaurant?.horaires || "");
    const [compte, setCompte] = useState({
        prenom: utilisateur?.prenom || "",
        nom: utilisateur?.nom || "",
        telephone: utilisateur?.telephone || "",
        email: utilisateur?.email || "",
    });

    const commandesRecentes = useMemo(() => commandes.slice(0, 5), [commandes]);

    const executer = (method, url, data = {}) => {
        setChargement(true);
        router[method](url, data, {
            preserveScroll: true,
            onFinish: () => setChargement(false),
            onSuccess: () => setModal(null),
        });
    };

    const aller = (id) => {
        if (["dashboard", "commandes", "menu", "statistiques", "horaires", "parametres", "profil"].includes(id)) {
            setOnglet(id);
            window.scrollTo({ top: 0, behavior: "smooth" });
        } else if (id === "categories") {
            setOnglet("menu");
            setTimeout(() => document.getElementById("categories-section")?.scrollIntoView({ behavior: "smooth" }), 0);
        }
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

    const ouvrirOptionsProduit = (item) => {
        setProduitSelectionne(item);
        setOptionsProduit(Array.isArray(item.options) ? item.options : []);
        setModal("options");
    };

    const ajouterGroupeOption = (configuration = null) => {
        setOptionsProduit((groupes) => [
            ...groupes,
            configuration || {
                name: "Accompagnement",
                obligatoire: true,
                multiple: false,
                min: 1,
                max: 1,
                items: [],
            },
        ]);
    };

    const ajouterGroupeAccompagnement = () => {
        ajouterGroupeOption({
            name: "Accompagnement",
            obligatoire: true,
            multiple: false,
            min: 1,
            max: 1,
            items: accompagnementsRapides.map((name) => ({
                name,
                prix: 0,
                disponible: true,
            })),
        });
    };

    const ajouterAccompagnementRapide = (indexGroupe, nom) => {
        setOptionsProduit((groupes) =>
            groupes.map((groupe, index) => {
                if (index !== indexGroupe) return groupe;
                const items = groupe.items || [];
                if (items.some((item) => item.name?.trim().toLowerCase() === nom.toLowerCase())) {
                    return groupe;
                }
                return {
                    ...groupe,
                    items: [...items, { name: nom, prix: 0, disponible: true }],
                };
            }),
        );
    };

    const modifierGroupeOption = (index, champ, valeur) => {
        setOptionsProduit((groupes) =>
            groupes.map((groupe, indexGroupe) =>
                indexGroupe === index ? { ...groupe, [champ]: valeur } : groupe,
            ),
        );
    };

    const supprimerGroupeOption = (index) => {
        setOptionsProduit((groupes) => groupes.filter((_, indexGroupe) => indexGroupe !== index));
    };

    const ajouterItemOption = (indexGroupe) => {
        setOptionsProduit((groupes) =>
            groupes.map((groupe, index) =>
                index === indexGroupe
                    ? {
                          ...groupe,
                          items: [
                              ...(groupe.items || []),
                              { name: "Nouvelle option", prix: 0, disponible: true },
                          ],
                      }
                    : groupe,
            ),
        );
    };

    const modifierItemOption = (indexGroupe, indexItem, champ, valeur) => {
        setOptionsProduit((groupes) =>
            groupes.map((groupe, index) =>
                index === indexGroupe
                    ? {
                          ...groupe,
                          items: (groupe.items || []).map((item, itemIndex) =>
                              itemIndex === indexItem ? { ...item, [champ]: valeur } : item,
                          ),
                      }
                    : groupe,
            ),
        );
    };

    const supprimerItemOption = (indexGroupe, indexItem) => {
        setOptionsProduit((groupes) =>
            groupes.map((groupe, index) =>
                index === indexGroupe
                    ? {
                          ...groupe,
                          items: (groupe.items || []).filter((_, itemIndex) => itemIndex !== indexItem),
                      }
                    : groupe,
            ),
        );
    };

    const sauvegarderOptionsProduit = (event) => {
        event.preventDefault();
        if (!produitSelectionne) return;

        setChargement(true);
        router.patch(
            `/restaurant/produits/${produitSelectionne.id}/options`,
            { options: optionsProduit },
            {
                preserveScroll: true,
                onFinish: () => setChargement(false),
                onSuccess: () => setModal(null),
            },
        );
    };

    return (
        <main className="min-h-screen bg-[#0b0d0f] text-white">
            <div className="flex min-h-screen">
                <aside className="sticky top-0 hidden h-screen w-[245px] shrink-0 border-r border-white/10 bg-[#101215] px-4 py-5 lg:flex lg:flex-col">
                    <div className="flex items-center gap-3 px-2">
                        <img src="/assets/jse_logo.png" alt="JSE Express" className="h-11 w-11 rounded-xl object-contain" />
                        <div>
                            <p className="font-against text-xl leading-none text-white">JSE</p>
                            <p className="text-[10px] font-bold italic text-jse-accent">EXPRESS</p>
                        </div>
                    </div>

                    <nav className="mt-10 space-y-1.5">
                        {navigation.map(([id, label, Icon]) => {
                            const actif = onglet === id || (id === "categories" && onglet === "menu");
                            const disponible = ["dashboard", "commandes", "menu", "categories", "statistiques", "horaires", "parametres", "profil"].includes(id);
                            return (
                                <button
                                    key={id}
                                    type="button"
                                    disabled={!disponible}
                                    onClick={() => aller(id)}
                                    className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-[11px] font-medium transition ${
                                        actif
                                            ? "bg-jse-accent text-white shadow-lg shadow-jse-accent/15"
                                            : disponible
                                                ? "text-white/65 hover:bg-white/5 hover:text-white"
                                                : "cursor-default text-white/25"
                                    }`}
                                >
                                    <Icon size={17} strokeWidth={1.8} />
                                    <span className="flex-1">{label}</span>
                                    {id === "commandes" && statistiques.commandes_en_attente > 0 && (
                                        <span className={`min-w-5 rounded-full px-1.5 py-0.5 text-center text-[9px] font-bold ${
                                            actif ? "bg-white/20" : "bg-jse-accent text-white"
                                        }`}>
                                            {statistiques.commandes_en_attente}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>

                    <button
                        type="button"
                        onClick={() => router.post("/deconnexion")}
                        className="mt-auto flex w-full items-center gap-3 rounded-xl bg-jse-accent px-4 py-3 text-[11px] font-semibold text-white"
                    >
                        <LogOut size={17} />
                        Déconnexion
                    </button>
                </aside>

                <div className="min-w-0 flex-1">
                    <header className="border-b border-white/10 bg-[#0b0d0f] px-4 py-4 sm:px-6 lg:px-8">
                        <div className="mx-auto flex max-w-[1250px] items-center justify-between gap-5">
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-jse-principal text-white lg:hidden">
                                    <Store size={19} />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="truncate text-sm font-semibold">{restaurant?.nom || "Restaurant Le Délice"}</p>
                                        <span className="rounded-full bg-jse-secondaire px-2.5 py-1 text-[8px] font-bold text-jse-texte">Ouvert</span>
                                    </div>
                                    <p className="truncate text-[10px] text-white/45">
                                        Cuisine locale et internationale · {restaurant?.adresse || "Adzopé"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button type="button" className="relative flex size-10 items-center justify-center rounded-full text-white/80 hover:bg-white/5">
                                    <Bell size={19} />
                                    {statistiques.notifications > 0 && (
                                        <span className="absolute right-0 top-0 flex size-4 items-center justify-center rounded-full bg-jse-danger text-[8px] font-bold">
                                            {statistiques.notifications > 9 ? "9+" : statistiques.notifications}
                                        </span>
                                    )}
                                </button>
                                <div className="hidden items-center gap-2 sm:flex">
                                    <div className="flex size-10 items-center justify-center rounded-full bg-jse-principal text-[10px] font-bold">
                                        {initiales(nomComplet)}
                                    </div>
                                    <div className="hidden xl:block">
                                        <p className="text-[11px] font-semibold">{nomComplet}</p>
                                        <p className="text-[9px] text-jse-accent">Restaurant Pro</p>
                                    </div>
                                    <ChevronDown size={14} className="text-white/45" />
                                </div>
                            </div>
                        </div>
                    </header>

                    <div className="mx-auto max-w-[1250px] px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-10">
                        {flash?.success && (
                            <div className="mb-5 rounded-xl border border-jse-secondaire/30 bg-jse-secondaire/10 px-4 py-3 text-[11px] text-jse-secondaire">
                                {flash.success}
                            </div>
                        )}

                        {onglet === "dashboard" && (
                            <>
                                <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
                                    <div className="relative min-h-[215px] overflow-hidden rounded-2xl border border-jse-accent/50 bg-[#17191b]">
                                        <img src="/assets/plat-hero.png" alt="" className="absolute inset-0 h-full w-full object-cover opacity-55" />
                                        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
                                        <div className="relative z-10 max-w-[570px] p-7 sm:p-8">
                                            <h1 className="font-against text-4xl leading-none sm:text-[42px]">
                                                Bonjour, {nomComplet.split(" ")[0] || "Chef"} <span className="font-sans">👋</span>
                                            </h1>
                                            <p className="mt-3 max-w-[430px] text-xs leading-5 text-white/65">
                                                Gérez vos commandes, votre menu et développez votre restaurant avec JSE Express.
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => aller("commandes")}
                                                className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-jse-accent px-5 text-[10px] font-semibold"
                                            >
                                                Voir mes commandes <ChevronRight size={15} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <StatCard icon={ShoppingBag} label="Commandes aujourd'hui" value={statistiques.commandes_du_jour || 0} note={statistiques.commandes_en_attente ? `↑ ${statistiques.commandes_en_attente} à traiter` : "Aucune à traiter"} />
                                        <StatCard icon={CreditCard} label="Revenus du jour" value={montant(statistiques.revenus_du_jour)} note="Activité du jour" />
                                        <StatCard icon={Star} label="Produits actifs" value={statistiques.produits_disponibles || 0} note="Disponibles au menu" />
                                        <StatCard icon={Clock3} label="Temps de traitement" value={statistiques.commandes_en_attente || 0} note="commandes à traiter" />
                                    </div>
                                </section>

                                <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
                                    <div className="rounded-2xl border border-white/10 bg-[#101215] p-4 sm:p-5">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h2 className="text-base font-semibold">Dernières commandes</h2>
                                                <p className="mt-1 text-[10px] text-white/35">Les commandes reçues récemment</p>
                                            </div>
                                            <button type="button" onClick={() => aller("commandes")} className="inline-flex items-center gap-1 text-[10px] font-semibold text-jse-accent">
                                                Voir toutes <ChevronRight size={13} />
                                            </button>
                                        </div>

                                        <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
                                            {commandesRecentes.length === 0 ? (
                                                <EmptyState />
                                            ) : commandesRecentes.map((commande) => (
                                                <CommandeLigne
                                                    key={commande.id}
                                                    commande={commande}
                                                    onOpen={() => router.visit(`/restaurant/commandes/${commande.id}`)}
                                                    onAction={(event) => {
                                                        event.stopPropagation();
                                                        const suivant = statutSuivant[commande.statut?.code];
                                                        if (suivant) executer("patch", `/restaurant/commandes/${commande.id}/statut`, { statut: suivant.code });
                                                    }}
                                                    chargement={chargement}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="relative min-h-[250px] overflow-hidden rounded-2xl bg-[#151719]">
                                        <img src="/assets/plat-hero.png" alt="" className="absolute inset-0 size-full object-cover opacity-35" />
                                        <div className="absolute inset-0 bg-black/60" />
                                        <div className="relative z-10 flex h-full flex-col justify-end p-5">
                                            <div className="mb-auto flex size-10 items-center justify-center rounded-xl bg-jse-accent text-white">
                                                <UtensilsCrossed size={19} />
                                            </div>
                                            <h2 className="font-against text-3xl leading-none">Boostez<br />votre visibilité !</h2>
                                            <p className="mt-2 text-[10px] leading-4 text-white/60">Attirez plus de clients avec JSE Express.</p>
                                            <button type="button" onClick={() => aller("menu")} className="mt-4 inline-flex h-9 w-fit items-center gap-2 rounded-xl bg-jse-accent px-4 text-[10px] font-semibold">
                                                Gérer mon menu <ChevronRight size={13} />
                                            </button>
                                        </div>
                                    </div>
                                </section>
                            </>
                        )}

                        {onglet === "commandes" && (
                            <section>
                                <PageTitle eyebrow="Gestion" title="Commandes" description="Consultez et faites avancer les commandes de votre restaurant." />
                                <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#101215]">
                                    {commandes.length === 0 ? <EmptyState /> : commandes.map((commande) => (
                                        <CommandeLigne
                                            key={commande.id}
                                            commande={commande}
                                            onOpen={() => router.visit(`/restaurant/commandes/${commande.id}`)}
                                            onAction={(event) => {
                                                event.stopPropagation();
                                                const suivant = statutSuivant[commande.statut?.code];
                                                if (suivant) executer("patch", `/restaurant/commandes/${commande.id}/statut`, { statut: suivant.code });
                                            }}
                                            chargement={chargement}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}

                        {onglet === "statistiques" && (
                            <section>
                                <PageTitle eyebrow="Performance" title="Statistiques" description="Consultez les indicateurs disponibles pour votre restaurant." />
                                <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                    <StatCard icon={ShoppingBag} label="Commandes totales" value={statistiques.commandes_total || 0} note={`${statistiques.commandes_livrees || 0} livrées`} />
                                    <StatCard icon={CreditCard} label="Revenus cumulés" value={montant(statistiques.revenus_total)} note="Paiements réussis" />
                                    <StatCard icon={Package} label="Panier moyen" value={montant(statistiques.panier_moyen)} note="Sur paiements réussis" />
                                    <StatCard icon={Star} label="Produits disponibles" value={statistiques.produits_disponibles || 0} note="Actifs au menu" />
                                </div>
                                <div className="mt-5 rounded-2xl border border-white/10 bg-[#101215] p-5">
                                    <h2 className="font-against text-2xl">Vue d'ensemble</h2>
                                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                        <div className="rounded-xl bg-white/5 p-4">
                                            <p className="text-[10px] text-white/40">Commandes aujourd'hui</p>
                                            <p className="mt-2 text-2xl font-semibold">{statistiques.commandes_du_jour || 0}</p>
                                        </div>
                                        <div className="rounded-xl bg-white/5 p-4">
                                            <p className="text-[10px] text-white/40">Commandes à traiter</p>
                                            <p className="mt-2 text-2xl font-semibold">{statistiques.commandes_en_attente || 0}</p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                        {onglet === "horaires" && (
                            <section>
                                <PageTitle eyebrow="Restaurant" title="Mes horaires" description="Modifiez les horaires actuellement enregistrés pour votre restaurant." />
                                <form onSubmit={(event) => { event.preventDefault(); executer("patch", "/restaurant/horaires", { horaires }); }} className="mt-5 max-w-2xl rounded-2xl border border-white/10 bg-[#101215] p-5">
                                    <label className="text-[10px] font-semibold text-white/60">Horaires</label>
                                    <textarea value={horaires} onChange={(event) => setHoraires(event.target.value)} className="mt-2 min-h-32 w-full rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-jse-accent" placeholder="Ex. Lun - Dim : 08:00 - 22:00" />
                                    <button disabled={chargement} className="mt-4 h-11 rounded-xl bg-jse-accent px-5 text-[10px] font-semibold disabled:opacity-50">Enregistrer les horaires</button>
                                </form>
                            </section>
                        )}

                        {onglet === "profil" && (
                            <section>
                                <PageTitle eyebrow="Restaurant" title="Mon profil" description="Gérez les informations publiques de votre restaurant." />
                                <form onSubmit={(event) => { event.preventDefault(); executer("patch", "/restaurant/profil", profil); }} className="mt-5 max-w-3xl rounded-2xl border border-white/10 bg-[#101215] p-5">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <ChampDark value={profil.nom} onChange={(e) => setProfil({ ...profil, nom: e.target.value })} placeholder="Nom du restaurant" required />
                                        <ChampDark value={profil.telephone} onChange={(e) => setProfil({ ...profil, telephone: e.target.value })} placeholder="Téléphone" required />
                                        <ChampDark value={profil.email} onChange={(e) => setProfil({ ...profil, email: e.target.value })} placeholder="Email" type="email" />
                                        <ChampDark value={profil.adresse} onChange={(e) => setProfil({ ...profil, adresse: e.target.value })} placeholder="Adresse" required />
                                    </div>
                                    <textarea value={profil.description} onChange={(e) => setProfil({ ...profil, description: e.target.value })} placeholder="Description du restaurant" className="mt-4 min-h-28 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-jse-accent" />
                                    <button disabled={chargement} className="mt-4 h-11 rounded-xl bg-jse-accent px-5 text-[10px] font-semibold disabled:opacity-50">Enregistrer le profil</button>
                                </form>
                            </section>
                        )}

                        {onglet === "parametres" && (
                            <section>
                                <PageTitle eyebrow="Compte" title="Paramètres" description="Modifiez les informations du responsable connecté." />
                                <form onSubmit={(event) => { event.preventDefault(); executer("patch", "/restaurant/compte", compte); }} className="mt-5 max-w-3xl rounded-2xl border border-white/10 bg-[#101215] p-5">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <ChampDark value={compte.prenom} onChange={(e) => setCompte({ ...compte, prenom: e.target.value })} placeholder="Prénom" required />
                                        <ChampDark value={compte.nom} onChange={(e) => setCompte({ ...compte, nom: e.target.value })} placeholder="Nom" required />
                                        <ChampDark value={compte.telephone} onChange={(e) => setCompte({ ...compte, telephone: e.target.value })} placeholder="Téléphone" required />
                                        <ChampDark value={compte.email} onChange={(e) => setCompte({ ...compte, email: e.target.value })} placeholder="Email" type="email" />
                                    </div>
                                    <button disabled={chargement} className="mt-4 h-11 rounded-xl bg-jse-accent px-5 text-[10px] font-semibold disabled:opacity-50">Enregistrer mes informations</button>
                                </form>
                            </section>
                        )}

                        {onglet === "menu" && (
                            <section>
                                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                                    <div>
                                        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-jse-accent">Catalogue restaurant</p>
                                        <h1 className="mt-1 font-against text-4xl leading-none sm:text-5xl">Menu du restaurant</h1>
                                        <p className="mt-2 max-w-xl text-xs leading-5 text-white/45">
                                            Gérez vos plats, boissons et leur disponibilité depuis un seul espace.
                                        </p>
                                    </div>
                                    <button type="button" onClick={() => setModal("produit")} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-jse-accent px-5 text-[10px] font-semibold shadow-lg shadow-jse-accent/10">
                                        <Plus size={16} /> Ajouter un produit
                                    </button>
                                </div>

                                <div className="mt-6 rounded-2xl border border-white/10 bg-[#101215] p-3 sm:p-4">
                                    <div className="flex flex-col gap-3 lg:flex-row">
                                        <div className="relative min-w-0 flex-1">
                                            <input
                                                value={rechercheMenu}
                                                onChange={(event) => setRechercheMenu(event.target.value)}
                                                placeholder="Rechercher un plat, une boisson..."
                                                className="h-11 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 text-xs text-white outline-none placeholder:text-white/25 focus:border-jse-accent"
                                            />
                                            <Menu className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                                        </div>
                                        <div className="flex gap-2 overflow-x-auto pb-0.5">
                                            {["Toutes", ...categories.map((item) => item.nom)].map((nom) => {
                                                const actif = categorieMenu === nom;
                                                const item = categories.find((categorie) => categorie.nom === nom);
                                                return (
                                                    <button
                                                        key={nom}
                                                        type="button"
                                                        onClick={() => setCategorieMenu(nom)}
                                                        className={`shrink-0 rounded-full px-4 py-2.5 text-[10px] font-semibold transition ${actif ? "bg-jse-accent text-white" : "bg-white/5 text-white/45 hover:text-white"}`}
                                                    >
                                                        {nom}{item ? ` · ${item.nombre_produits}` : ""}
                                                    </button>
                                                );
                                            })}
                                            <button type="button" onClick={() => setModal("categorie")} className="flex shrink-0 items-center gap-1 rounded-full border border-dashed border-white/15 px-4 py-2.5 text-[10px] font-semibold text-white/45 hover:border-jse-accent hover:text-jse-accent">
                                                <Plus size={13} /> Catégorie
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div id="categories-section" className="mt-5 flex items-center justify-between">
                                    <div>
                                        <h2 className="font-against text-2xl">Produits</h2>
                                        <p className="mt-1 text-[10px] text-white/35">{produits.length} produit{produits.length > 1 ? "s" : ""} dans votre catalogue</p>
                                    </div>
                                    <div className="hidden rounded-full bg-white/5 px-3 py-2 text-[9px] text-white/40 sm:block">
                                        {produits.filter((item) => item.disponible).length} disponibles
                                    </div>
                                </div>

                                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                    {produits
                                        .filter((item) => categorieMenu === "Toutes" || item.categorie?.nom === categorieMenu)
                                        .filter((item) => {
                                            const terme = rechercheMenu.trim().toLowerCase();
                                            return !terme || item.nom?.toLowerCase().includes(terme) || item.description?.toLowerCase().includes(terme);
                                        })
                                        .map((item) => (
                                            <article
                                                key={item.id}
                                                onClick={() => ouvrirOptionsProduit(item)}
                                                className="group cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-[#101215] transition hover:-translate-y-0.5 hover:border-jse-accent/35"
                                            >
                                                <div className="relative h-40 overflow-hidden bg-[#17191b]">
                                                    {imageDemoProduit(item) ? (
                                                        <img src={imageDemoProduit(item)} alt={item.nom} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" loading="lazy" />
                                                    ) : (
                                                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-jse-principal/80 to-[#17191b]">
                                                            <UtensilsCrossed size={32} className="text-jse-accent/80" />
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-x-3 top-3 flex items-center justify-between">
                                                        <span className={`rounded-full px-2.5 py-1 text-[8px] font-semibold backdrop-blur-md ${item.disponible ? "bg-jse-secondaire text-jse-texte" : "bg-black/60 text-white/60"}`}>
                                                            {item.disponible ? "Disponible" : "Indisponible"}
                                                        </span>
                                                        <button type="button" onClick={(event) => { event.stopPropagation(); executer("patch", `/restaurant/produits/${item.id}/disponibilite`); }} className={`flex size-9 items-center justify-center rounded-full border border-white/10 backdrop-blur-md ${item.disponible ? "bg-black/35 text-white" : "bg-black/60 text-white/45"}`} aria-label="Changer la disponibilité">
                                                            <Power size={15} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="p-4">
                                                    <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-white/30">{item.categorie?.nom || "Sans catégorie"}</p>
                                                    <div className="mt-1 flex items-start justify-between gap-3">
                                                        <h3 className="text-sm font-semibold">{item.nom}</h3>
                                                        <p className="shrink-0 font-against text-xl text-jse-accent">{montant(item.prix)}</p>
                                                    </div>
                                                    {item.description && <p className="mt-2 line-clamp-2 text-[10px] leading-4 text-white/40">{item.description}</p>}
                                                </div>
                                            </article>
                                        ))}
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </div>

            <NavigationFlottante type="restaurant" actif="dashboard" onChange={aller} />

            {modal && (
                <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-5" onClick={() => setModal(null)}>
                    <div className={`w-full ${modal === "options" ? "max-w-2xl" : "max-w-md"} rounded-t-3xl border border-white/10 bg-[#101215] p-5 shadow-2xl sm:rounded-3xl`} onClick={(event) => event.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/30">JSE Express</p>
                                <h2 className="mt-1 font-against text-2xl">{modal === "options" ? "Options du produit" : modal === "produit" ? "Ajouter un produit" : "Ajouter une catégorie"}</h2>
                            </div>
                            <button type="button" onClick={() => setModal(null)} className="flex size-9 items-center justify-center rounded-full bg-white/7"><X size={16} /></button>
                        </div>

                        {modal === "options" ? (
                            <form onSubmit={sauvegarderOptionsProduit} className="mt-5 space-y-4">
                                <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
                                    <div className="flex flex-col sm:flex-row">
                                        <img
                                            src={imageDemoProduit(produitSelectionne)}
                                            alt={produitSelectionne?.nom || "Produit"}
                                            className="h-36 w-full object-cover sm:h-32 sm:w-40"
                                        />
                                        <div className="min-w-0 flex-1 p-4">
                                            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-jse-accent">Détail du produit</p>
                                            <div className="mt-1 flex items-start justify-between gap-3">
                                                <div>
                                                    <h3 className="text-base font-semibold">{produitSelectionne?.nom}</h3>
                                                    <p className="mt-1 text-[9px] text-white/35">{produitSelectionne?.categorie?.nom || "Sans catégorie"}</p>
                                                </div>
                                                <span className="shrink-0 font-against text-xl text-jse-accent">{montant(produitSelectionne?.prix)}</span>
                                            </div>
                                            <p className="mt-2 line-clamp-2 text-[10px] leading-4 text-white/45">
                                                {produitSelectionne?.description || "Aucune description renseignée."}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="border-t border-white/10 bg-jse-accent/5 px-4 py-3">
                                        <p className="text-[10px] text-white/55">
                                            Créez les accompagnements, sauces, suppléments ou boissons disponibles avec ce produit.
                                        </p>
                                    </div>
                                </div>

                                <div className="max-h-[58vh] space-y-4 overflow-y-auto pr-1">
                                    <div className="rounded-2xl border border-jse-accent/20 bg-jse-accent/5 p-4">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <p className="text-[10px] font-semibold text-white/85">Accompagnements du restaurant</p>
                                                <p className="mt-1 max-w-lg text-[9px] leading-4 text-white/40">
                                                    Ajoutez en un clic les accompagnements proposés avec ce plat. Vous pourrez ensuite modifier le prix et activer ou désactiver chaque accompagnement.
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={ajouterGroupeAccompagnement}
                                                className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-jse-accent px-4 text-[9px] font-semibold text-white shadow-lg shadow-jse-accent/10"
                                            >
                                                <Plus size={14} />
                                                Ajouter Attiéké, Riz, Foutou…
                                            </button>
                                        </div>
                                        <div className="mt-3 flex flex-wrap gap-1.5">
                                            {accompagnementsRapides.map((nom) => (
                                                <span key={nom} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[8px] text-white/45">
                                                    {nom}
                                                </span>
                                            ))}
                                            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[8px] text-white/30">
                                                + vos propres accompagnements
                                            </span>
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                        <p className="text-[10px] font-semibold text-white/80">Personnalisation du plat</p>
                                        <p className="mt-1 text-[10px] leading-4 text-white/35">
                                            Créez les groupes d’options comme dans l’expérience client : type de choix, accompagnements et suppléments.
                                        </p>
                                    </div>

                                    {optionsProduit.map((groupe, indexGroupe) => (
                                        <div key={indexGroupe} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                            <div className="flex items-start gap-3">
                                                <div className="min-w-0 flex-1">
                                                    <label className="mb-1.5 block text-[9px] font-semibold uppercase tracking-[0.14em] text-white/35">Nom du groupe</label>
                                                    <ChampDark
                                                        value={groupe.name}
                                                        onChange={(e) => modifierGroupeOption(indexGroupe, "name", e.target.value)}
                                                        placeholder="Ex. Type de poisson, Accompagnement, Sauce"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => supprimerGroupeOption(indexGroupe)}
                                                    className="mt-6 flex size-11 shrink-0 items-center justify-center rounded-xl bg-jse-danger/10 text-jse-danger"
                                                    aria-label="Supprimer le groupe"
                                                >
                                                    <X size={15} />
                                                </button>
                                            </div>

                                            <div className="mt-4">
                                                <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.14em] text-white/35">Type de choix</label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            modifierGroupeOption(indexGroupe, "multiple", false);
                                                            modifierGroupeOption(indexGroupe, "max", 1);
                                                        }}
                                                        className={`rounded-xl border px-3 py-3 text-left transition ${!groupe.multiple ? "border-jse-secondaire bg-jse-secondaire/10 text-white" : "border-white/10 bg-white/5 text-white/45"}`}
                                                    >
                                                        <span className="block text-[10px] font-semibold">Un seul choix</span>
                                                        <span className="mt-1 block text-[8px] text-white/35">Ex. type de poisson</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            modifierGroupeOption(indexGroupe, "multiple", true);
                                                            modifierGroupeOption(indexGroupe, "max", 20);
                                                        }}
                                                        className={`rounded-xl border px-3 py-3 text-left transition ${groupe.multiple ? "border-jse-secondaire bg-jse-secondaire/10 text-white" : "border-white/10 bg-white/5 text-white/45"}`}
                                                    >
                                                        <span className="block text-[10px] font-semibold">Plusieurs choix</span>
                                                        <span className="mt-1 block text-[8px] text-white/35">Ex. sauces et suppléments</span>
                                                    </button>
                                                </div>
                                            </div>

                                            <label className="mt-3 flex cursor-pointer items-center justify-between rounded-xl bg-white/5 px-3 py-3">
                                                <span>
                                                    <span className="block text-[10px] font-semibold text-white/75">Choix obligatoire</span>
                                                    <span className="mt-0.5 block text-[8px] text-white/30">Le client doit sélectionner une option.</span>
                                                </span>
                                                <input
                                                    type="checkbox"
                                                    checked={Boolean(groupe.obligatoire)}
                                                    onChange={(e) => {
                                                        const obligatoire = e.target.checked;
                                                        modifierGroupeOption(indexGroupe, "obligatoire", obligatoire);
                                                        modifierGroupeOption(indexGroupe, "min", obligatoire ? 1 : 0);
                                                    }}
                                                    className="size-4 accent-[#45B977]"
                                                />
                                            </label>

                                            <div className="mt-4 flex items-center justify-between">
                                                <div>
                                                    <p className="text-[10px] font-semibold text-white/75">Choix disponibles</p>
                                                    <p className="mt-0.5 text-[8px] text-white/30">Chaque option peut avoir un supplément.</p>
                                                </div>
                                                <span className="rounded-full bg-jse-accent/10 px-2.5 py-1 text-[8px] font-semibold text-jse-accent">{(groupe.items || []).length} option{(groupe.items || []).length > 1 ? "s" : ""}</span>
                                            </div>

                                            {String(groupe.name || "").trim().toLowerCase() === "accompagnement" && (
                                                <div className="mt-3 rounded-xl bg-jse-secondaire/5 p-3">
                                                    <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-jse-secondaire">Ajout rapide</p>
                                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                                        {accompagnementsRapides.map((nom) => (
                                                            <button
                                                                key={nom}
                                                                type="button"
                                                                onClick={() => ajouterAccompagnementRapide(indexGroupe, nom)}
                                                                disabled={(groupe.items || []).some((item) => item.name?.trim().toLowerCase() === nom.toLowerCase())}
                                                                className="rounded-full border border-jse-secondaire/20 bg-jse-secondaire/10 px-2.5 py-1.5 text-[8px] font-semibold text-jse-secondaire disabled:cursor-not-allowed disabled:opacity-30"
                                                            >
                                                                + {nom}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="mt-3 space-y-2">
                                                {(groupe.items || []).map((item, indexItem) => (
                                                    <div key={indexItem} className="rounded-xl border border-white/10 bg-[#0b0d0f] p-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/25">
                                                                {groupe.multiple ? <Check size={13} /> : <span className="size-2 rounded-full border border-current" />}
                                                            </span>
                                                            <input
                                                                value={item.name}
                                                                onChange={(e) => modifierItemOption(indexGroupe, indexItem, "name", e.target.value)}
                                                                placeholder="Nom de l’option"
                                                                className="h-9 min-w-0 flex-1 bg-transparent px-1 text-[11px] font-medium text-white outline-none placeholder:text-white/25"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => supprimerItemOption(indexGroupe, indexItem)}
                                                                className="flex size-8 shrink-0 items-center justify-center rounded-lg text-white/30 hover:bg-jse-danger/10 hover:text-jse-danger"
                                                                aria-label="Supprimer l’option"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                        <div className="mt-2 flex items-center gap-2 pl-9">
                                                            <div className="relative flex-1">
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    step="50"
                                                                    value={item.prix}
                                                                    onChange={(e) => modifierItemOption(indexGroupe, indexItem, "prix", Number(e.target.value))}
                                                                    className="h-9 w-full rounded-lg bg-white/5 px-3 pr-16 text-[10px] text-white outline-none focus:ring-1 focus:ring-jse-accent/60"
                                                                    aria-label="Prix du supplément"
                                                                />
                                                                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[8px] text-white/25">FCFA</span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => modifierItemOption(indexGroupe, indexItem, "disponible", !item.disponible)}
                                                                className={`h-9 rounded-lg px-3 text-[8px] font-semibold ${item.disponible ? "bg-jse-secondaire/15 text-jse-secondaire" : "bg-white/5 text-white/30"}`}
                                                            >
                                                                {item.disponible ? "Disponible" : "Indisponible"}
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => ajouterItemOption(indexGroupe)}
                                                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 py-3 text-[9px] font-semibold text-white/45 transition hover:border-jse-accent hover:text-jse-accent"
                                            >
                                                <Plus size={13} /> Ajouter une option
                                            </button>
                                        </div>
                                    ))}

                                    {optionsProduit.length === 0 && (
                                        <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center">
                                            <UtensilsCrossed size={24} className="mx-auto text-white/20" />
                                            <p className="mt-2 text-xs font-semibold">Aucun groupe d’options</p>
                                            <p className="mt-1 text-[10px] text-white/35">Ex. « Accompagnement » avec Attiéké et Alloco.</p>
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={ajouterGroupeOption}
                                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-jse-accent/35 bg-jse-accent/5 text-[10px] font-semibold text-jse-accent"
                                >
                                    <Plus size={15} /> Ajouter un groupe d'options
                                </button>

                                <button
                                    disabled={chargement}
                                    className="h-11 w-full rounded-xl bg-jse-accent text-[10px] font-semibold disabled:opacity-50"
                                >
                                    {chargement ? "Enregistrement..." : "Enregistrer les options"}
                                </button>
                            </form>
                        ) : modal === "categorie" ? (
                            <form onSubmit={creerCategorie} className="mt-6 space-y-4">
                                <ChampDark value={categorie.nom} onChange={(e) => setCategorie({ ...categorie, nom: e.target.value })} placeholder="Nom de la catégorie" required />
                                <textarea value={categorie.description} onChange={(e) => setCategorie({ ...categorie, description: e.target.value })} placeholder="Description (facultatif)" className="min-h-24 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-jse-accent" />
                                <button disabled={chargement} className="h-11 w-full rounded-xl bg-jse-accent text-[10px] font-semibold disabled:opacity-50">Créer la catégorie</button>
                            </form>
                        ) : (
                            <form onSubmit={creerProduit} className="mt-6 space-y-4">
                                <ChampDark value={produit.nom} onChange={(e) => setProduit({ ...produit, nom: e.target.value })} placeholder="Nom du produit" required />
                                <div className="grid grid-cols-2 gap-3">
                                    <ChampDark type="number" min="0" step="50" value={produit.prix} onChange={(e) => setProduit({ ...produit, prix: e.target.value })} placeholder="Prix (FCFA)" required />
                                    <select value={produit.categorie_id} onChange={(e) => setProduit({ ...produit, categorie_id: e.target.value })} className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white outline-none focus:border-jse-accent">
                                        <option className="bg-[#101215]" value="">Sans catégorie</option>
                                        {categories.map((item) => <option className="bg-[#101215]" key={item.id} value={item.id}>{item.nom}</option>)}
                                    </select>
                                </div>
                                <textarea value={produit.description} onChange={(e) => setProduit({ ...produit, description: e.target.value })} placeholder="Description (facultatif)" className="min-h-24 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-jse-accent" />
                                <ChampDark value={produit.image} onChange={(e) => setProduit({ ...produit, image: e.target.value })} placeholder="URL de l'image (facultatif)" />
                                <button disabled={chargement} className="h-11 w-full rounded-xl bg-jse-accent text-[10px] font-semibold disabled:opacity-50">Ajouter au menu</button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
}

function StatCard({ icon: Icon, label, value, note }) {
    return (
        <article className="rounded-2xl border border-white/10 bg-[#101215] p-4">
            <div className="flex items-center justify-between">
                <div className="flex size-11 items-center justify-center rounded-xl bg-jse-accent/15 text-jse-accent">
                    <Icon size={20} />
                </div>
                <span className="text-[8px] text-white/30">Aujourd'hui</span>
            </div>
            <p className="mt-4 text-[10px] text-white/50">{label}</p>
            <p className="mt-1 text-xl font-semibold">{value}</p>
            <p className="mt-1 text-[9px] font-semibold text-jse-secondaire">{note}</p>
        </article>
    );
}

function CommandeLigne({ commande, onOpen, onAction, chargement }) {
    const action = statutSuivant[commande.statut?.code];

    return (
        <article onClick={onOpen} className="group cursor-pointer border-b border-white/8 px-3 py-3 last:border-0 hover:bg-white/[0.025]">
            <div className="flex items-center gap-3">
                <p className="w-[82px] shrink-0 text-[10px] font-semibold text-white/75 sm:w-[100px]">{commande.reference}</p>
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-jse-principal text-[9px] font-bold">
                    {initiales(commande.client?.nom || "Client")}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-semibold">{commande.client?.nom || "Client"}</p>
                    <p className="truncate text-[9px] text-white/35">{commande.nombre_articles} article{commande.nombre_articles > 1 ? "s" : ""} · {commande.date} · {commande.heure}</p>
                </div>
                <span className={`hidden rounded-full px-3 py-1.5 text-[9px] font-semibold sm:inline-flex ${statutClasse(commande.statut?.code)}`}>
                    {commande.statut?.libelle || "Inconnu"}
                </span>
                <p className="hidden min-w-[90px] text-right text-[10px] font-semibold sm:block">{montant(commande.montant_total)}</p>
                {action && (
                    <button type="button" disabled={chargement} onClick={onAction} className="hidden rounded-lg bg-jse-accent px-3 py-2 text-[8px] font-semibold sm:inline-flex">
                        {action.label}
                    </button>
                )}
                <ChevronRight size={15} className="text-white/25" />
            </div>
        </article>
    );
}

function PageTitle({ eyebrow, title, description, action }) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-jse-accent">{eyebrow}</p>
                <h1 className="mt-1 font-against text-4xl leading-none">{title}</h1>
                <p className="mt-2 max-w-xl text-xs text-white/45">{description}</p>
            </div>
            {action}
        </div>
    );
}

function EmptyState() {
    return (
        <div className="p-10 text-center">
            <Package className="mx-auto text-white/20" size={28} />
            <p className="mt-3 text-sm font-semibold">Aucune commande</p>
            <p className="mt-1 text-xs text-white/35">Les nouvelles commandes apparaîtront ici.</p>
        </div>
    );
}

function ChampDark({ value, onChange, placeholder, ...props }) {
    return (
        <input
            {...props}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-xs text-white outline-none placeholder:text-white/25 focus:border-jse-accent"
        />
    );
}
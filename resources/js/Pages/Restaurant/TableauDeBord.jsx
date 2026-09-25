import { useMemo, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import {
    Bell,
    Bike,
    ChevronRight,
    Clock3,
    CreditCard,
    Grid2X2,
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
    { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { id: "commandes", label: "Commandes", icon: ShoppingBag },
    { id: "menu", label: "Menu / Produits", icon: UtensilsCrossed },
    { id: "categories", label: "Catégories", icon: Tag },
    { id: "avis", label: "Avis clients", icon: Star },
    { id: "statistiques", label: "Statistiques", icon: Grid2X2 },
    { id: "horaires", label: "Mes horaires", icon: Clock3 },
    { id: "parametres", label: "Paramètres", icon: Settings },
    { id: "profil", label: "Mon profil", icon: UserRound },
];

function montant(valeur) {
    return new Intl.NumberFormat("fr-FR").format(Number(valeur || 0)) + " FCFA";
}

function nomCourt(nom = "") {
    return nom
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((partie) => partie[0])
        .join("")
        .toUpperCase();
}

function BadgeStatut({ statut }) {
    const classes = {
        EN_ATTENTE: "bg-jse-accent/12 text-jse-accent",
        CONFIRMEE: "bg-jse-information/10 text-jse-information",
        EN_PREPARATION: "bg-jse-accent/12 text-jse-accent",
        PRETE: "bg-jse-secondaire/12 text-jse-principal",
        EN_LIVRAISON: "bg-jse-information/10 text-jse-information",
        LIVREE: "bg-jse-secondaire/12 text-jse-principal",
    };

    return (
        <span className={`inline-flex rounded-full px-3 py-1.5 text-[10px] font-semibold ${classes[statut?.code] || "bg-jse-texte/5 text-jse-texte/55"}`}>
            {statut?.libelle || "Inconnu"}
        </span>
    );
}

function StatCard({ icon: Icon, label, value, note, accent = false }) {
    return (
        <article className="rounded-jse-xl border border-jse-texte/8 bg-white p-4 shadow-jse-carte">
            <div className="flex items-start justify-between gap-3">
                <div className={`flex size-10 shrink-0 items-center justify-center rounded-2xl ${accent ? "bg-jse-accent/12 text-jse-accent" : "bg-jse-principal/8 text-jse-principal"}`}>
                    <Icon size={19} strokeWidth={2} />
                </div>
                <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-jse-texte/30">Aujourd'hui</span>
            </div>
            <p className="mt-4 text-[10px] font-medium text-jse-texte/50">{label}</p>
            <p className="mt-1 text-xl font-semibold tracking-tight text-jse-texte">{value}</p>
            {note && <p className="mt-1 text-[10px] font-medium text-jse-secondaire">{note}</p>}
        </article>
    );
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
    const [onglet, setOnglet] = useState("dashboard");
    const [modal, setModal] = useState(null);
    const [chargement, setChargement] = useState(false);
    const [produit, setProduit] = useState({
        nom: "",
        description: "",
        prix: "",
        categorie_id: "",
        image: "",
    });
    const [categorie, setCategorie] = useState({ nom: "", description: "" });

    const commandesRecentes = useMemo(
        () => commandes.slice(0, 5),
        [commandes]
    );

    const nomRestaurant = restaurant?.nom || "Mon restaurant";
    const nomUtilisateur = [utilisateur?.prenom, utilisateur?.nom]
        .filter(Boolean)
        .join(" ") || "Responsable";

    const executer = (method, url, data = {}) => {
        setChargement(true);
        router[method](url, data, {
            preserveScroll: true,
            onFinish: () => setChargement(false),
            onSuccess: () => setModal(null),
        });
    };

    const ouvrirSection = (id) => {
        if (id === "categories") {
            setOnglet("menu");
            requestAnimationFrame(() => {
                document.getElementById("categories-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
            });
            return;
        }

        if (["dashboard", "commandes", "menu"].includes(id)) {
            setOnglet(id);
            if (id !== "dashboard") {
                requestAnimationFrame(() => document.getElementById(`${id}-section`)?.scrollIntoView({ behavior: "smooth", block: "start" }));
            }
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

    return (
        <main className="min-h-screen bg-jse-fond text-jse-texte">
            <div className="mx-auto flex min-h-screen max-w-[1600px]">
                <aside className="sticky top-0 hidden h-screen w-[245px] shrink-0 border-r border-jse-texte/8 bg-white px-4 py-5 lg:flex lg:flex-col">
                    <div className="flex items-center gap-3 px-2">
                        <div className="flex size-11 items-center justify-center rounded-2xl bg-jse-principal">
                            <img src="/assets/jse_logo.png" alt="JSE Express" className="size-8 object-contain" />
                        </div>
                        <div className="min-w-0">
                            <p className="font-against text-xl leading-none text-jse-principal">JSE</p>
                            <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-jse-accent">Express</p>
                        </div>
                    </div>

                    <p className="mt-8 px-3 text-[9px] font-semibold uppercase tracking-[0.16em] text-jse-texte/35">
                        Espace restaurant
                    </p>

                    <nav className="mt-3 space-y-1.5">
                        {navigation.map(({ id, label, icon: Icon }) => {
                            const actif = onglet === id || (id === "categories" && onglet === "menu");
                            const disponible = ["dashboard", "commandes", "menu", "categories"].includes(id);

                            return (
                                <button
                                    key={id}
                                    type="button"
                                    disabled={!disponible}
                                    onClick={() => ouvrirSection(id)}
                                    className={`group flex w-full items-center gap-3 rounded-jse-moyen px-3.5 py-3 text-left text-[11px] font-medium transition ${
                                        actif
                                            ? "bg-jse-accent text-white shadow-sm"
                                            : disponible
                                                ? "text-jse-texte/65 hover:bg-jse-fond hover:text-jse-principal"
                                                : "cursor-default text-jse-texte/35"
                                    }`}
                                >
                                    <Icon size={17} strokeWidth={1.9} />
                                    <span className="flex-1">{label}</span>
                                    {id === "commandes" && statistiques?.commandes_en_attente > 0 && (
                                        <span className={`min-w-5 rounded-full px-1.5 py-0.5 text-center text-[9px] font-bold ${
                                            actif ? "bg-white/20 text-white" : "bg-jse-accent text-white"
                                        }`}>
                                            {statistiques.commandes_en_attente}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>

                    <div className="mt-auto space-y-2">
                        <button
                            type="button"
                            onClick={() => router.post("/deconnexion")}
                            className="flex w-full items-center gap-3 rounded-jse-moyen bg-jse-accent px-4 py-3 text-[11px] font-semibold text-white shadow-sm transition hover:brightness-105"
                        >
                            <LogOut size={17} />
                            Déconnexion
                        </button>
                    </div>
                </aside>

                <div className="min-w-0 flex-1">
                    <header className="sticky top-0 z-30 border-b border-jse-texte/8 bg-jse-fond/95 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
                        <div className="mx-auto flex max-w-[1250px] items-center justify-between gap-4">
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-jse-principal text-white lg:hidden">
                                    <Store size={19} />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="truncate text-sm font-semibold text-jse-texte">{nomRestaurant}</p>
                                        <span className="hidden rounded-full bg-jse-secondaire/12 px-2 py-1 text-[9px] font-semibold text-jse-principal sm:inline-flex">
                                            Ouvert
                                        </span>
                                    </div>
                                    <p className="truncate text-[10px] text-jse-texte/45">
                                        {restaurant?.description || "Cuisine locale et internationale"} · {restaurant?.adresse || "Adzopé"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-3">
                                <button type="button" className="relative flex size-10 items-center justify-center rounded-full bg-white text-jse-principal shadow-sm ring-1 ring-jse-texte/8">
                                    <Bell size={18} />
                                    {statistiques?.notifications > 0 && (
                                        <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-jse-accent text-[8px] font-bold text-white">
                                            {statistiques.notifications > 9 ? "9+" : statistiques.notifications}
                                        </span>
                                    )}
                                </button>
                                <div className="hidden items-center gap-2 sm:flex">
                                    <div className="flex size-10 items-center justify-center rounded-full bg-jse-principal text-xs font-bold text-white">
                                        {nomCourt(nomUtilisateur)}
                                    </div>
                                    <div className="hidden min-w-0 xl:block">
                                        <p className="truncate text-[11px] font-semibold">{nomUtilisateur}</p>
                                        <p className="text-[9px] text-jse-accent">Restaurant</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>

                    <div className="mx-auto max-w-[1250px] px-4 pb-28 pt-5 sm:px-6 lg:px-8 lg:pb-10">
                        {flash?.success && (
                            <div className="mb-5 rounded-jse-moyen border border-jse-secondaire/20 bg-jse-secondaire/10 px-4 py-3 text-[11px] font-medium text-jse-principal">
                                {flash.success}
                            </div>
                        )}

                        {onglet === "dashboard" && (
                            <>
                                <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_390px]">
                                    <div className="relative min-h-[220px] overflow-hidden rounded-jse-xxl bg-jse-principal p-6 text-white shadow-jse-elevated sm:p-8">
                                        <img
                                            src="/assets/plat-hero.png"
                                            alt=""
                                            className="absolute inset-y-0 right-0 h-full w-[58%] object-cover opacity-55 mix-blend-screen"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-r from-jse-principal via-jse-principal/90 to-transparent" />
                                        <div className="relative z-10 max-w-[560px]">
                                            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-jse-secondaire">Tableau de bord restaurant</p>
                                            <h1 className="mt-3 font-against text-4xl leading-none sm:text-5xl">
                                                Bonjour, {nomUtilisateur.split(" ")[0] || "Chef"} <span className="font-sans">👋</span>
                                            </h1>
                                            <p className="mt-3 max-w-lg text-xs leading-5 text-white/70">
                                                Gérez vos commandes, votre menu et votre activité JSE Express depuis un seul espace.
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => ouvrirSection("commandes")}
                                                className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-jse-accent px-5 text-[11px] font-semibold text-white shadow-lg transition hover:brightness-105"
                                            >
                                                Voir mes commandes <ChevronRight size={15} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <StatCard
                                            icon={ShoppingBag}
                                            label="Commandes aujourd'hui"
                                            value={statistiques.commandes_du_jour || 0}
                                            note={statistiques.commandes_en_attente ? `${statistiques.commandes_en_attente} à traiter` : "Aucune à traiter"}
                                        />
                                        <StatCard
                                            icon={CreditCard}
                                            label="Revenus du jour"
                                            value={montant(statistiques.revenus_du_jour)}
                                            accent
                                        />
                                        <StatCard
                                            icon={Package}
                                            label="Produits actifs"
                                            value={statistiques.produits_disponibles || 0}
                                            note="Disponibles au menu"
                                        />
                                        <StatCard
                                            icon={Clock3}
                                            label="Commandes à traiter"
                                            value={statistiques.commandes_en_attente || 0}
                                            note="Cycle restaurant"
                                        />
                                    </div>
                                </section>

                                <section className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_310px]">
                                    <div id="commandes-section" className="rounded-jse-xxl border border-jse-texte/8 bg-white p-4 shadow-jse-carte sm:p-5">
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-jse-texte/35">Activité</p>
                                                <h2 className="mt-1 font-against text-2xl leading-none text-jse-principal">Dernières commandes</h2>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => ouvrirSection("commandes")}
                                                className="inline-flex items-center gap-1 text-[10px] font-semibold text-jse-accent"
                                            >
                                                Voir toutes <ChevronRight size={13} />
                                            </button>
                                        </div>

                                        <div className="mt-4 divide-y divide-jse-texte/8">
                                            {commandesRecentes.length === 0 ? (
                                                <div className="py-12 text-center">
                                                    <Package className="mx-auto text-jse-texte/20" size={25} />
                                                    <p className="mt-3 text-xs font-semibold">Aucune commande</p>
                                                    <p className="mt-1 text-[10px] text-jse-texte/45">Les nouvelles commandes apparaîtront ici.</p>
                                                </div>
                                            ) : (
                                                commandesRecentes.map((commande) => (
                                                    <CommandeLigne
                                                        key={commande.id}
                                                        commande={commande}
                                                        onOpen={() => router.visit(`/restaurant/commandes/${commande.id}`)}
                                                        onAction={(event) => {
                                                            event.stopPropagation();
                                                            const suivant = statutSuivant[commande.statut?.code];
                                                            if (suivant) {
                                                                executer("patch", `/restaurant/commandes/${commande.id}/statut`, { statut: suivant.code });
                                                            }
                                                        }}
                                                        chargement={chargement}
                                                    />
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    <div className="relative min-h-[270px] overflow-hidden rounded-jse-xxl bg-jse-principal p-5 text-white shadow-jse-carte">
                                        <img src="/assets/plat-hero.png" alt="" className="absolute inset-0 size-full object-cover opacity-25" />
                                        <div className="absolute inset-0 bg-jse-principal/75" />
                                        <div className="relative z-10">
                                            <div className="flex size-10 items-center justify-center rounded-2xl bg-jse-accent text-white">
                                                <Store size={19} />
                                            </div>
                                            <h2 className="mt-7 font-against text-3xl leading-none">Votre restaurant,<br />votre espace.</h2>
                                            <p className="mt-3 text-xs leading-5 text-white/65">
                                                Mettez à jour votre menu et gardez le contrôle de vos commandes depuis JSE Express.
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => ouvrirSection("menu")}
                                                className="mt-5 inline-flex h-10 items-center gap-2 rounded-full bg-jse-accent px-4 text-[10px] font-semibold text-white"
                                            >
                                                Gérer le menu <ChevronRight size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </section>
                            </>
                        )}

                        {onglet === "commandes" && (
                            <section id="commandes-section" className="scroll-mt-24">
                                <SectionHeader
                                    eyebrow="Gestion"
                                    title="Toutes les commandes"
                                    description="Suivez chaque commande et faites progresser son statut."
                                />
                                <div className="mt-5 overflow-hidden rounded-jse-xxl border border-jse-texte/8 bg-white shadow-jse-carte">
                                    <div className="divide-y divide-jse-texte/8">
                                        {commandes.length === 0 ? (
                                            <EmptyState />
                                        ) : (
                                            commandes.map((commande) => (
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
                                            ))
                                        )}
                                    </div>
                                </div>
                            </section>
                        )}

                        {onglet === "menu" && (
                            <section id="menu-section" className="scroll-mt-24">
                                <SectionHeader
                                    eyebrow="Catalogue"
                                    title="Menu / Produits"
                                    description="Gérez les produits visibles par les clients."
                                    action={
                                        <button type="button" onClick={() => setModal("produit")} className="inline-flex h-10 items-center gap-2 rounded-full bg-jse-accent px-4 text-[10px] font-semibold text-white">
                                            <Plus size={15} /> Ajouter un produit
                                        </button>
                                    }
                                />

                                <div id="categories-section" className="mt-6 scroll-mt-24 rounded-jse-xxl border border-jse-texte/8 bg-white p-5 shadow-jse-carte">
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-jse-texte/35">Organisation</p>
                                            <h2 className="mt-1 font-against text-2xl text-jse-principal">Catégories</h2>
                                        </div>
                                        <button type="button" onClick={() => setModal("categorie")} className="inline-flex size-10 items-center justify-center rounded-full bg-jse-principal text-white">
                                            <Plus size={17} />
                                        </button>
                                    </div>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {categories.length === 0 ? (
                                            <p className="text-xs text-jse-texte/45">Aucune catégorie.</p>
                                        ) : categories.map((item) => (
                                            <span key={item.id} className="rounded-full bg-jse-fond px-3 py-2 text-[10px] font-semibold text-jse-principal">
                                                {item.nom} <span className="text-jse-texte/35">· {item.nombre_produits}</span>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                    {produits.length === 0 ? (
                                        <div className="sm:col-span-2 xl:col-span-3"><EmptyState /></div>
                                    ) : (
                                        produits.map((item) => (
                                            <article key={item.id} className="rounded-jse-xl border border-jse-texte/8 bg-white p-4 shadow-jse-carte">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-jse-fond text-jse-principal">
                                                        <UtensilsCrossed size={19} />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        title={item.disponible ? "Marquer indisponible" : "Rendre disponible"}
                                                        onClick={() => executer("patch", `/restaurant/produits/${item.id}/disponibilite`)}
                                                        className={`flex size-9 items-center justify-center rounded-full ${item.disponible ? "bg-jse-secondaire/12 text-jse-principal" : "bg-jse-texte/5 text-jse-texte/35"}`}
                                                    >
                                                        <Power size={15} />
                                                    </button>
                                                </div>
                                                <p className="mt-4 text-sm font-semibold">{item.nom}</p>
                                                <p className="mt-1 text-[10px] text-jse-texte/45">{item.categorie?.nom || "Sans catégorie"}</p>
                                                <p className="mt-4 font-against text-xl text-jse-accent">{montant(item.prix)}</p>
                                                <span className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-[9px] font-semibold ${item.disponible ? "bg-jse-secondaire/12 text-jse-principal" : "bg-jse-danger/10 text-jse-danger"}`}>
                                                    {item.disponible ? "Disponible" : "Indisponible"}
                                                </span>
                                            </article>
                                        ))
                                    )}
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </div>

            <nav className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3 lg:hidden">
                <div className="mx-auto flex max-w-md items-center justify-around rounded-[24px] border border-jse-texte/8 bg-white/95 p-1.5 shadow-jse-elevated backdrop-blur-xl">
                    {[
                        ["dashboard", LayoutDashboard, "Accueil"],
                        ["commandes", ShoppingBag, "Commandes"],
                        ["menu", UtensilsCrossed, "Menu"],
                        ["profil", UserRound, "Profil"],
                    ].map(([id, Icon, label]) => (
                        <button
                            key={id}
                            type="button"
                            onClick={() => ouvrirSection(id)}
                            className={`flex min-w-16 flex-col items-center gap-1 rounded-[19px] px-3 py-2 text-[9px] font-semibold ${onglet === id ? "bg-jse-accent text-white" : "text-jse-texte/50"}`}
                        >
                            <Icon size={18} />
                            {label}
                        </button>
                    ))}
                </div>
            </nav>

            {modal && (
                <div className="fixed inset-0 z-[90] flex items-end justify-center bg-jse-principal/25 p-0 backdrop-blur-sm sm:items-center sm:p-5" onClick={() => setModal(null)}>
                    <div className="w-full max-w-md rounded-t-[30px] bg-white p-5 shadow-2xl sm:rounded-[30px]" onClick={(event) => event.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-jse-texte/35">JSE Express</p>
                                <h2 className="mt-1 font-against text-2xl text-jse-principal">
                                    {modal === "produit" ? "Ajouter un produit" : "Ajouter une catégorie"}
                                </h2>
                            </div>
                            <button type="button" onClick={() => setModal(null)} className="flex size-10 items-center justify-center rounded-full bg-jse-fond text-jse-principal">
                                <X size={17} />
                            </button>
                        </div>

                        {modal === "categorie" ? (
                            <form onSubmit={creerCategorie} className="mt-6 space-y-4">
                                <input required value={categorie.nom} onChange={(e) => setCategorie({ ...categorie, nom: e.target.value })} placeholder="Nom de la catégorie" className="h-12 w-full rounded-2xl border border-jse-texte/10 bg-jse-fond px-4 text-sm outline-none focus:border-jse-secondaire" />
                                <textarea value={categorie.description} onChange={(e) => setCategorie({ ...categorie, description: e.target.value })} placeholder="Description (facultatif)" className="min-h-24 w-full rounded-2xl border border-jse-texte/10 bg-jse-fond px-4 py-3 text-sm outline-none focus:border-jse-secondaire" />
                                <button disabled={chargement} className="h-12 w-full rounded-full bg-jse-accent text-xs font-semibold text-white disabled:opacity-50">Créer la catégorie</button>
                            </form>
                        ) : (
                            <form onSubmit={creerProduit} className="mt-6 space-y-4">
                                <input required value={produit.nom} onChange={(e) => setProduit({ ...produit, nom: e.target.value })} placeholder="Nom du produit" className="h-12 w-full rounded-2xl border border-jse-texte/10 bg-jse-fond px-4 text-sm outline-none focus:border-jse-secondaire" />
                                <div className="grid grid-cols-2 gap-3">
                                    <input required type="number" min="0" step="50" value={produit.prix} onChange={(e) => setProduit({ ...produit, prix: e.target.value })} placeholder="Prix (FCFA)" className="h-12 w-full rounded-2xl border border-jse-texte/10 bg-jse-fond px-4 text-sm outline-none focus:border-jse-secondaire" />
                                    <select value={produit.categorie_id} onChange={(e) => setProduit({ ...produit, categorie_id: e.target.value })} className="h-12 w-full rounded-2xl border border-jse-texte/10 bg-jse-fond px-4 text-sm outline-none focus:border-jse-secondaire">
                                        <option value="">Sans catégorie</option>
                                        {categories.map((item) => <option key={item.id} value={item.id}>{item.nom}</option>)}
                                    </select>
                                </div>
                                <textarea value={produit.description} onChange={(e) => setProduit({ ...produit, description: e.target.value })} placeholder="Description (facultatif)" className="min-h-24 w-full rounded-2xl border border-jse-texte/10 bg-jse-fond px-4 py-3 text-sm outline-none focus:border-jse-secondaire" />
                                <input value={produit.image} onChange={(e) => setProduit({ ...produit, image: e.target.value })} placeholder="URL de l'image (facultatif)" className="h-12 w-full rounded-2xl border border-jse-texte/10 bg-jse-fond px-4 text-sm outline-none focus:border-jse-secondaire" />
                                <button disabled={chargement} className="h-12 w-full rounded-full bg-jse-accent text-xs font-semibold text-white disabled:opacity-50">Ajouter au menu</button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
}

function SectionHeader({ eyebrow, title, description, action }) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-jse-texte/35">{eyebrow}</p>
                <h1 className="mt-1 font-against text-3xl leading-none text-jse-principal sm:text-4xl">{title}</h1>
                <p className="mt-2 max-w-xl text-xs leading-5 text-jse-texte/55">{description}</p>
            </div>
            {action}
        </div>
    );
}

function CommandeLigne({ commande, onOpen, onAction, chargement }) {
    const action = statutSuivant[commande.statut?.code];

    return (
        <article onClick={onOpen} className="group cursor-pointer px-1 py-3 transition hover:bg-jse-fond/70 sm:px-2">
            <div className="flex items-center gap-3">
                <div className="hidden size-9 shrink-0 items-center justify-center rounded-full bg-jse-principal text-[9px] font-bold text-white sm:flex">
                    {nomCourt(commande.client?.nom || "Client")}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <p className="text-[11px] font-semibold text-jse-principal">{commande.reference}</p>
                        <p className="truncate text-[10px] text-jse-texte/45">{commande.client?.nom || "Client"}</p>
                    </div>
                    <p className="mt-1 text-[9px] text-jse-texte/45">
                        {commande.nombre_articles} article{commande.nombre_articles > 1 ? "s" : ""} · {commande.date} · {commande.heure}
                    </p>
                </div>
                <div className="hidden min-w-[115px] md:block">
                    <BadgeStatut statut={commande.statut} />
                </div>
                <p className="hidden min-w-[105px] text-right text-[11px] font-semibold sm:block">{montant(commande.montant_total)}</p>
                {action && (
                    <button
                        type="button"
                        disabled={chargement}
                        onClick={onAction}
                        className="hidden rounded-full bg-jse-accent px-3 py-2 text-[9px] font-semibold text-white disabled:opacity-50 md:inline-flex"
                    >
                        {action.label}
                    </button>
                )}
                <ChevronRight size={16} className="shrink-0 text-jse-texte/25 transition group-hover:translate-x-0.5" />
            </div>
        </article>
    );
}

function EmptyState() {
    return (
        <div className="p-12 text-center">
            <Package className="mx-auto text-jse-texte/20" size={28} />
            <p className="mt-3 text-sm font-semibold">Aucune commande</p>
            <p className="mt-1 text-xs text-jse-texte/45">Les nouvelles commandes apparaîtront ici.</p>
        </div>
    );
}

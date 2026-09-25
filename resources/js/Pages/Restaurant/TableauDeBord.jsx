import { useMemo, useState } from "react";
import { router, usePage } from "@inertiajs/react";
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

    const [onglet, setOnglet] = useState("dashboard");
    const [modal, setModal] = useState(null);
    const [chargement, setChargement] = useState(false);
    const [produit, setProduit] = useState({ nom: "", description: "", prix: "", categorie_id: "", image: "" });
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

    const utilisateur = auth?.user;
    const nomComplet = [utilisateur?.prenom, utilisateur?.nom].filter(Boolean).join(" ") || "Chef";
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
                                <PageTitle
                                    eyebrow="Catalogue"
                                    title="Menu / Produits"
                                    description="Gérez les plats, boissons et disponibilités de votre restaurant."
                                    action={<button type="button" onClick={() => setModal("produit")} className="inline-flex h-10 items-center gap-2 rounded-xl bg-jse-accent px-4 text-[10px] font-semibold"><Plus size={15} /> Ajouter un produit</button>}
                                />

                                <div id="categories-section" className="mt-5 rounded-2xl border border-white/10 bg-[#101215] p-5">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/30">Organisation</p>
                                            <h2 className="mt-1 font-against text-2xl">Catégories</h2>
                                        </div>
                                        <button type="button" onClick={() => setModal("categorie")} className="flex size-9 items-center justify-center rounded-xl bg-jse-accent"><Plus size={16} /></button>
                                    </div>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {categories.map((item) => (
                                            <span key={item.id} className="rounded-full bg-white/7 px-3 py-2 text-[10px] font-medium text-white/75">
                                                {item.nom} <span className="text-white/30">· {item.nombre_produits}</span>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                    {produits.map((item) => (
                                        <article key={item.id} className="rounded-2xl border border-white/10 bg-[#101215] p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex size-11 items-center justify-center rounded-xl bg-jse-principal text-white"><UtensilsCrossed size={18} /></div>
                                                <button type="button" onClick={() => executer("patch", `/restaurant/produits/${item.id}/disponibilite`)} className={`flex size-9 items-center justify-center rounded-full ${item.disponible ? "bg-jse-secondaire text-jse-texte" : "bg-white/10 text-white/40"}`}>
                                                    <Power size={15} />
                                                </button>
                                            </div>
                                            <p className="mt-4 text-sm font-semibold">{item.nom}</p>
                                            <p className="mt-1 text-[10px] text-white/40">{item.categorie?.nom || "Sans catégorie"}</p>
                                            <p className="mt-3 font-against text-xl text-jse-accent">{montant(item.prix)}</p>
                                            <span className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-[9px] font-semibold ${item.disponible ? "bg-jse-secondaire text-jse-texte" : "bg-jse-danger/15 text-jse-danger"}`}>
                                                {item.disponible ? "Disponible" : "Indisponible"}
                                            </span>
                                        </article>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </div>

            <nav className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(14px,env(safe-area-inset-bottom))] lg:hidden">
                <div className="mx-auto flex h-[68px] max-w-[430px] items-center justify-around rounded-[34px] border border-white/10 bg-[#101215]/90 p-1.5 shadow-[0_18px_50px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
                    {[
                        ["dashboard", LayoutDashboard, "Accueil"],
                        ["commandes", ShoppingBag, "Commandes"],
                        ["menu", UtensilsCrossed, "Menu"],
                        ["profil", UserRound, "Profil"],
                    ].map(([id, Icon, label]) => {
                        const actif = onglet === id;
                        return (
                            <button
                                key={id}
                                type="button"
                                onClick={() => aller(id)}
                                className={`relative flex h-[54px] min-w-[54px] flex-1 items-center justify-center rounded-[28px] px-2 text-[9px] font-semibold transition-all duration-200 active:scale-95 ${actif ? "gap-1.5 bg-jse-accent text-white shadow-[0_6px_18px_rgba(242,140,40,0.28)]" : "gap-0 text-white/45 hover:text-white/75"}`}
                            >
                                <Icon size={18} strokeWidth={actif ? 2.4 : 1.8} />
                                {actif && <span>{label}</span>}
                            </button>
                        );
                    })}
                </div>
            </nav>

            {modal && (
                <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-5" onClick={() => setModal(null)}>
                    <div className="w-full max-w-md rounded-t-3xl border border-white/10 bg-[#101215] p-5 shadow-2xl sm:rounded-3xl" onClick={(event) => event.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/30">JSE Express</p>
                                <h2 className="mt-1 font-against text-2xl">{modal === "produit" ? "Ajouter un produit" : "Ajouter une catégorie"}</h2>
                            </div>
                            <button type="button" onClick={() => setModal(null)} className="flex size-9 items-center justify-center rounded-full bg-white/7"><X size={16} /></button>
                        </div>

                        {modal === "categorie" ? (
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

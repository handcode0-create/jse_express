import { useEffect, useMemo, useState } from "react";
import { Head, router } from "@inertiajs/react";
import { Edit3, Mail, MapPin, Plus, Search, UserRound, X } from "lucide-react";
import AdminBadge from "../../Composants/Admin/AdminBadge";
import AdminButton from "../../Composants/Admin/AdminButton";
import AdminCard from "../../Composants/Admin/AdminCard";
import { AdminField, champAdmin } from "../../Composants/Admin/AdminField";
import AdminLayout from "../../Composants/Admin/AdminLayout";
import AdminPageHeader from "../../Composants/Admin/AdminPageHeader";
import AdminPagination from "../../Composants/Admin/AdminPagination";
import ConfirmDialog from "../../Composants/Admin/ConfirmDialog";

const roles = [
    { value: "client", label: "Client", ton: "neutre" },
    { value: "restaurant", label: "Restaurant", ton: "information" },
    { value: "livreur", label: "Livreur", ton: "attention" },
    { value: "administrateur", label: "Administrateur", ton: "principal" },
];

const formulaireVide = {
    nom: "",
    prenom: "",
    telephone: "",
    email: "",
    mot_de_passe: "",
    role: "client",
    statut: "actif",
    restaurant_nom: "",
    restaurant_description: "",
    restaurant_telephone: "",
    restaurant_email: "",
    restaurant_adresse: "",
    restaurant_zone_id: "",
    livreur_matricule: "",
    livreur_zone_id: "",
    livreur_disponibilite: "indisponible",
    livreur_telephone_secondaire: "",
};

const nomComplet = (item) => [item.prenom, item.nom].filter(Boolean).join(" ") || "Sans nom";

export default function Utilisateurs({ utilisateurs, filtres = {}, roles: rolesDisponibles = [], administrateursActifs = 0, utilisateur, zones = [] }) {
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState(formulaireVide);
    const [processing, setProcessing] = useState(false);
    const [alerte, setAlerte] = useState(null);
    const listeRoles = useMemo(() => roles.filter((role) => rolesDisponibles.includes(role.value)), [rolesDisponibles]);
    const donnees = utilisateurs?.data || [];

    const ouvrirCreation = (role = "client") => {
        setForm({ ...formulaireVide, role });
        setModal({ type: "create" });
    };

    // Les pages Restaurants et Livreurs renvoient ici avec ?nouveau=restaurant|livreur.
    useEffect(() => {
        const role = new URLSearchParams(window.location.search).get("nouveau");

        if (role === "restaurant" || role === "livreur") {
            ouvrirCreation(role);
        }
    }, []);

    const ouvrirEdition = (item) => {
        setForm({
            ...formulaireVide,
            ...item,
            restaurant_nom: item.restaurant?.nom || "",
            restaurant_telephone: item.restaurant?.telephone || "",
            restaurant_email: item.restaurant?.email || "",
            restaurant_adresse: item.restaurant?.adresse || "",
            livreur_matricule: item.profil_livreur?.matricule || "",
            livreur_zone_id: item.profil_livreur?.zone_id || "",
            livreur_disponibilite: item.profil_livreur?.disponibilite || "indisponible",
            livreur_telephone_secondaire: item.profil_livreur?.telephone_secondaire || "",
        });
        setModal({ type: "edit", user: item });
    };

    const changer = (champ, valeur) => setForm((etat) => ({ ...etat, [champ]: valeur }));
    const fermer = () => {
        if (!processing) setModal(null);
    };

    const soumettre = (evenement) => {
        evenement.preventDefault();
        if (processing) return;
        setProcessing(true);

        const options = { preserveScroll: true, onFinish: () => setProcessing(false), onSuccess: () => setModal(null) };

        if (modal?.type === "edit") {
            router.patch("/administration/utilisateurs/" + modal.user.id, form, options);
        } else {
            router.post("/administration/utilisateurs", form, options);
        }
    };

    const requete = (patch) =>
        router.get("/administration/utilisateurs", { ...filtres, ...patch }, { preserveState: true, preserveScroll: true, replace: true });

    const changerStatut = (item) => {
        if (item.role === "administrateur" && item.statut === "actif" && administrateursActifs <= 1) {
            setAlerte("Impossible de désactiver le dernier administrateur actif du système.");
            return;
        }

        router.patch(
            "/administration/utilisateurs/" + item.id + "/statut",
            { statut: item.statut === "actif" ? "inactif" : "actif" },
            { preserveScroll: true },
        );
    };

    const actionsUtilisateur = (item) => (
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <AdminButton variante="contour" taille="petit" onClick={() => ouvrirEdition(item)}>
                <Edit3 size={14} aria-hidden="true" />
                Modifier
            </AdminButton>
            <AdminButton variante={item.statut === "actif" ? "contour" : "principal"} taille="petit" onClick={() => changerStatut(item)}>
                {item.statut === "actif" ? "Désactiver" : "Activer"}
            </AdminButton>
        </div>
    );

    return (
        <>
            <Head title="Utilisateurs & rôles — Administration" />

            <AdminLayout utilisateur={utilisateur}>
                <AdminPageHeader
                    visuel="attieke"
                    title="Utilisateurs & rôles"
                    description="Gérez les comptes, les rôles et les accès de JSE Express."
                    actions={
                        <AdminButton onClick={() => ouvrirCreation()}>
                            <Plus size={17} aria-hidden="true" />
                            Ajouter un utilisateur
                        </AdminButton>
                    }
                />

                <AdminCard className="mt-6 p-3 sm:p-4">
                    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_200px_200px_auto]">
                        <label className="relative block">
                            <span className="sr-only">Rechercher un utilisateur</span>
                            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-jse-theme-muted" aria-hidden="true" />
                            <input
                                type="search"
                                value={filtres.recherche || ""}
                                onChange={(evenement) => requete({ recherche: evenement.target.value || undefined, page: 1 })}
                                placeholder="Rechercher nom, téléphone ou email..."
                                className={champAdmin + " pl-11"}
                            />
                        </label>
                        <select
                            aria-label="Filtrer par rôle"
                            value={filtres.role || ""}
                            onChange={(evenement) => requete({ role: evenement.target.value || undefined, page: 1 })}
                            className={champAdmin}
                        >
                            <option value="">Tous les rôles</option>
                            {listeRoles.map((role) => (
                                <option key={role.value} value={role.value}>
                                    {role.label}
                                </option>
                            ))}
                        </select>
                        <select
                            aria-label="Filtrer par statut"
                            value={filtres.statut || ""}
                            onChange={(evenement) => requete({ statut: evenement.target.value || undefined, page: 1 })}
                            className={champAdmin}
                        >
                            <option value="">Tous les statuts</option>
                            <option value="actif">Actifs</option>
                            <option value="inactif">Inactifs</option>
                        </select>
                        <AdminButton href="/administration/utilisateurs" variante="contour">
                            Réinitialiser
                        </AdminButton>
                    </div>
                </AdminCard>

                <div className="mt-5 flex items-center justify-between gap-3 px-1 text-sm text-jse-theme-muted">
                    <p aria-live="polite">
                        <span className="font-semibold tabular-nums text-jse-theme-text">{utilisateurs?.total || 0}</span> utilisateur(s)
                    </p>
                    <p>
                        <span className="font-semibold tabular-nums text-jse-theme-text">{administrateursActifs}</span> administrateur(s) actif(s)
                    </p>
                </div>

                <AdminCard className="mt-2 hidden overflow-hidden md:block">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[850px] text-left text-sm">
                            <thead className="jse-admin-table border-b border-jse-theme-border bg-jse-theme-surface-soft">
                                <tr>
                                    {["Utilisateur", "Contact", "Rôle", "Statut", "Créé le"].map((libelle) => (
                                        <th key={libelle} scope="col" className="px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.1em] text-jse-theme-muted">
                                            {libelle}
                                        </th>
                                    ))}
                                    <th scope="col" className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-[0.1em] text-jse-theme-muted">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-jse-theme-border">
                                {donnees.map((item) => (
                                    <tr key={item.id} className="transition hover:bg-jse-theme-surface-soft/60">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar item={item} />
                                                <div className="min-w-0">
                                                    <p className="truncate font-semibold text-jse-theme-text">{nomComplet(item)}</p>
                                                    {item.restaurant?.nom && <p className="truncate text-xs text-jse-theme-muted">{item.restaurant.nom}</p>}
                                                    {item.profil_livreur?.matricule && <p className="truncate text-xs text-jse-theme-muted">{item.profil_livreur.matricule}</p>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-jse-theme-muted">
                                            <p>{item.telephone}</p>
                                            {item.email && <p className="mt-0.5">{item.email}</p>}
                                        </td>
                                        <td className="px-5 py-4">
                                            <RoleBadge role={item.role} />
                                        </td>
                                        <td className="px-5 py-4">
                                            <AdminBadge statut={item.statut} />
                                        </td>
                                        <td className="px-5 py-4 text-sm text-jse-theme-muted">{item.created_at || "—"}</td>
                                        <td className="px-5 py-4">{actionsUtilisateur(item)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {donnees.length === 0 && <EtatVide />}
                </AdminCard>

                <ul className="mt-2 space-y-3 md:hidden">
                    {donnees.map((item) => (
                        <AdminCard as="li" key={item.id} className="p-4">
                            <div className="flex items-start gap-3">
                                <Avatar item={item} />
                                <div className="min-w-0 flex-1">
                                    <p className="break-words font-semibold text-jse-theme-heading">{nomComplet(item)}</p>
                                    <div className="mt-1 space-y-1 text-sm text-jse-theme-muted">
                                        <p className="break-words">{item.telephone}</p>
                                        {item.email && (
                                            <p className="flex min-w-0 items-start gap-1.5 break-all">
                                                <Mail className="mt-1 shrink-0" size={13} aria-hidden="true" />
                                                <span>{item.email}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                                <RoleBadge role={item.role} />
                                <AdminBadge statut={item.statut} />
                            </div>

                            {(item.restaurant?.nom || item.profil_livreur?.matricule || item.profil_livreur?.zone) && (
                                <div className="mt-4 rounded-2xl bg-jse-theme-surface-soft p-3 text-sm text-jse-theme-muted">
                                    {item.restaurant?.nom && <p className="font-medium text-jse-theme-text">{item.restaurant.nom}</p>}
                                    {item.profil_livreur?.matricule && <p>Matricule : {item.profil_livreur.matricule}</p>}
                                    {item.profil_livreur?.zone && (
                                        <p className="mt-1 flex items-center gap-1.5">
                                            <MapPin size={13} aria-hidden="true" />
                                            {item.profil_livreur.zone}
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="mt-4 border-t border-jse-theme-border pt-4">{actionsUtilisateur(item)}</div>
                        </AdminCard>
                    ))}
                    {donnees.length === 0 && (
                        <AdminCard as="li">
                            <EtatVide />
                        </AdminCard>
                    )}
                </ul>

                <AdminPagination pagination={utilisateurs} />
            </AdminLayout>

            {modal && (
                <ModalUtilisateur modal={modal} form={form} changer={changer} fermer={fermer} soumettre={soumettre} processing={processing} roles={listeRoles} zones={zones} />
            )}

            <ConfirmDialog ouvert={Boolean(alerte)} ton="info" titre="Action impossible" description={alerte || ""} onFermer={() => setAlerte(null)} />
        </>
    );
}

function Avatar({ item }) {
    return item.photo_profil ? (
        <img src={item.photo_profil} alt="" className="size-11 shrink-0 rounded-2xl object-cover" />
    ) : (
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-jse-principal text-sm font-semibold text-white">
            {(item.prenom?.[0] || item.nom?.[0] || "U").toUpperCase()}
        </div>
    );
}

function RoleBadge({ role }) {
    const trouve = roles.find((item) => item.value === role);

    return <AdminBadge ton={trouve?.ton ?? "neutre"} libelle={trouve?.label ?? role} />;
}

function EtatVide() {
    return (
        <div className="px-5 py-12 text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-jse-theme-surface-soft text-jse-theme-muted">
                <UserRound size={22} aria-hidden="true" />
            </span>
            <p className="mt-3 text-sm font-semibold text-jse-theme-text">Aucun utilisateur trouvé</p>
            <p className="mt-1 text-sm text-jse-theme-muted">Modifiez la recherche ou les filtres.</p>
        </div>
    );
}

function BlocProfil({ titre, children }) {
    return (
        <fieldset className="rounded-2xl border border-jse-theme-border bg-jse-theme-surface-soft p-4">
            <legend className="px-1 text-sm font-semibold text-jse-theme-heading">{titre}</legend>
            <div className="mt-1 grid gap-3 sm:grid-cols-2">{children}</div>
        </fieldset>
    );
}

function ModalUtilisateur({ modal, form, changer, fermer, soumettre, processing, roles: rolesListe, zones }) {
    const edition = modal.type === "edit";
    const metier = form.role === "restaurant" ? "restaurant" : form.role === "livreur" ? "livreur" : null;
    const saisie = (champ, extra = {}) => ({
        value: form[champ] ?? "",
        onChange: (evenement) => changer(champ, evenement.target.value),
        className: champAdmin,
        ...extra,
    });

    useEffect(() => {
        const surClavier = (evenement) => {
            if (evenement.key === "Escape") fermer();
        };
        document.addEventListener("keydown", surClavier);

        return () => document.removeEventListener("keydown", surClavier);
    }, [fermer]);

    return (
        <div className="jse-admin-modal fixed inset-0 z-[100] flex items-end justify-center bg-black/45 backdrop-blur-sm sm:items-center sm:p-5">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="titre-modal-utilisateur"
                className="max-h-[calc(100dvh-env(safe-area-inset-top)-8px)] w-full overflow-y-auto rounded-t-[28px] bg-jse-theme-surface p-5 pb-[calc(20px+env(safe-area-inset-bottom))] shadow-2xl sm:max-h-[92vh] sm:max-w-2xl sm:rounded-[28px] sm:p-7"
            >
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-jse-theme-muted">{edition ? "Modifier le compte" : "Nouveau compte"}</p>
                        <h2 id="titre-modal-utilisateur" className="mt-1 text-xl font-semibold text-jse-theme-heading">
                            {edition ? "Informations utilisateur" : "Ajouter un utilisateur"}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={fermer}
                        aria-label="Fermer"
                        className="flex size-11 shrink-0 items-center justify-center rounded-full border border-jse-theme-border text-jse-theme-text transition hover:bg-jse-theme-surface-soft"
                    >
                        <X size={18} aria-hidden="true" />
                    </button>
                </div>

                <form onSubmit={soumettre} className="mt-6 space-y-5">
                    <div className="grid gap-3 sm:grid-cols-2">
                        <AdminField label="Prénom">
                            <input {...saisie("prenom")} autoComplete="given-name" />
                        </AdminField>
                        <AdminField label="Nom" required>
                            <input {...saisie("nom", { required: true })} autoComplete="family-name" />
                        </AdminField>
                        <AdminField label="Téléphone" required>
                            <input {...saisie("telephone", { required: true, type: "tel" })} autoComplete="tel" />
                        </AdminField>
                        <AdminField label="Email">
                            <input {...saisie("email", { type: "email" })} autoComplete="email" />
                        </AdminField>
                        <AdminField label="Rôle" required>
                            <select {...saisie("role", { required: true })}>
                                {rolesListe.map((role) => (
                                    <option key={role.value} value={role.value}>
                                        {role.label}
                                    </option>
                                ))}
                            </select>
                        </AdminField>
                        <AdminField label="Statut" required>
                            <select {...saisie("statut", { required: true })}>
                                <option value="actif">Actif</option>
                                <option value="inactif">Inactif</option>
                            </select>
                        </AdminField>
                        <AdminField label={edition ? "Nouveau mot de passe (optionnel)" : "Mot de passe"} required={!edition} className="sm:col-span-2">
                            <input {...saisie("mot_de_passe", { type: "password", minLength: 8, required: !edition })} autoComplete="new-password" />
                        </AdminField>
                    </div>

                    {metier === "restaurant" && (
                        <BlocProfil titre="Profil restaurant">
                            <AdminField label="Nom du restaurant" required={!modal.user?.restaurant}>
                                <input {...saisie("restaurant_nom", { required: !modal.user?.restaurant })} />
                            </AdminField>
                            <AdminField label="Téléphone restaurant" required={!modal.user?.restaurant}>
                                <input {...saisie("restaurant_telephone", { required: !modal.user?.restaurant, type: "tel" })} />
                            </AdminField>
                            <AdminField label="Email restaurant">
                                <input {...saisie("restaurant_email", { type: "email" })} />
                            </AdminField>
                            <AdminField label="Zone">
                                <select {...saisie("restaurant_zone_id")}>
                                    <option value="">Aucune zone</option>
                                    {zones.map((zone) => (
                                        <option key={zone.id} value={zone.id}>
                                            {zone.nom}
                                        </option>
                                    ))}
                                </select>
                            </AdminField>
                            <AdminField label="Adresse" required={!modal.user?.restaurant} className="sm:col-span-2">
                                <input {...saisie("restaurant_adresse", { required: !modal.user?.restaurant })} />
                            </AdminField>
                        </BlocProfil>
                    )}

                    {metier === "livreur" && (
                        <BlocProfil titre="Profil livreur">
                            <AdminField label="Matricule" required={!modal.user?.profil_livreur}>
                                <input {...saisie("livreur_matricule", { required: !modal.user?.profil_livreur })} />
                            </AdminField>
                            <AdminField label="Disponibilité" required={!modal.user?.profil_livreur}>
                                <select {...saisie("livreur_disponibilite", { required: !modal.user?.profil_livreur })}>
                                    <option value="disponible">Disponible</option>
                                    <option value="indisponible">Indisponible</option>
                                </select>
                            </AdminField>
                            <AdminField label="Zone">
                                <select {...saisie("livreur_zone_id")}>
                                    <option value="">Aucune zone</option>
                                    {zones.map((zone) => (
                                        <option key={zone.id} value={zone.id}>
                                            {zone.nom}
                                        </option>
                                    ))}
                                </select>
                            </AdminField>
                            <AdminField label="Téléphone secondaire">
                                <input {...saisie("livreur_telephone_secondaire", { type: "tel" })} />
                            </AdminField>
                        </BlocProfil>
                    )}

                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <AdminButton variante="contour" onClick={fermer}>
                            Annuler
                        </AdminButton>
                        <AdminButton type="submit" chargement={processing}>
                            {processing ? "Enregistrement..." : "Enregistrer"}
                        </AdminButton>
                    </div>
                </form>
            </div>
        </div>
    );
}

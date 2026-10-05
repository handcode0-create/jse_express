import { useState } from "react";
import { router, useForm } from "@inertiajs/react";
import { Bell, LogOut, MapPin, Phone, Receipt, UserRound } from "lucide-react";
import AdminBadge from "../Admin/AdminBadge";
import AdminButton from "../Admin/AdminButton";
import AdminCard from "../Admin/AdminCard";
import { AdminField, champAdmin } from "../Admin/AdminField";
import ThemeToggle from "../Interface/ThemeToggle";
import PhotoProfil from "../Profil/PhotoProfil";

function FormulaireProfil({ livreur, zones, onFermer }) {
    const { data, setData, patch, processing, errors, clearErrors } = useForm({
        nom: livreur?.nom || "",
        prenom: livreur?.prenom || "",
        telephone: livreur?.telephone || "",
        email: livreur?.email || "",
        telephone_secondaire: livreur?.telephone_secondaire || "",
        zone_id: livreur?.zone_id || "",
    });

    const modifier = (champ, valeur) => {
        setData(champ, valeur);
        if (errors[champ]) clearErrors(champ);
    };

    const soumettre = (evenement) => {
        evenement.preventDefault();
        patch("/livreur/profil", { preserveScroll: true, onSuccess: onFermer });
    };

    return (
        <AdminCard as="form" onSubmit={soumettre} className="p-5 sm:p-6">
            <h2 className="text-base font-semibold text-jse-theme-heading">Mes informations</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <AdminField label="Prénom" erreur={errors.prenom}>
                    <input autoComplete="given-name" value={data.prenom} onChange={(e) => modifier("prenom", e.target.value)} className={champAdmin} />
                </AdminField>
                <AdminField label="Nom" required erreur={errors.nom}>
                    <input required autoComplete="family-name" value={data.nom} onChange={(e) => modifier("nom", e.target.value)} className={champAdmin} />
                </AdminField>
                <AdminField label="Téléphone de connexion" required erreur={errors.telephone}>
                    <input required type="tel" autoComplete="tel" value={data.telephone} onChange={(e) => modifier("telephone", e.target.value)} className={champAdmin} />
                </AdminField>
                <AdminField label="Téléphone secondaire" erreur={errors.telephone_secondaire}>
                    <input type="tel" value={data.telephone_secondaire} onChange={(e) => modifier("telephone_secondaire", e.target.value)} className={champAdmin} />
                </AdminField>
                <AdminField label="E-mail" erreur={errors.email}>
                    <input type="email" autoComplete="email" value={data.email} onChange={(e) => modifier("email", e.target.value)} className={champAdmin} />
                </AdminField>
                <AdminField label="Zone de desserte" required erreur={errors.zone_id} aide="Non modifiable tant qu'une mission est en cours.">
                    <select required value={data.zone_id} onChange={(e) => modifier("zone_id", e.target.value)} className={champAdmin}>
                        <option value="" disabled>
                            Sélectionner une zone
                        </option>
                        {zones.map((zone) => (
                            <option key={zone.id} value={zone.id}>
                                {zone.nom}
                            </option>
                        ))}
                    </select>
                </AdminField>
            </div>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <AdminButton variante="contour" onClick={onFermer}>
                    Annuler
                </AdminButton>
                <AdminButton type="submit" chargement={processing}>
                    Enregistrer
                </AdminButton>
            </div>
        </AdminCard>
    );
}

/** Profil du livreur : identité, matricule, zone, coordonnées, thème et déconnexion. */
export default function ProfilLivreur({ livreur, zones = [], statistiques = {} }) {
    const [edition, setEdition] = useState(false);
    const nomComplet = [livreur?.prenom, livreur?.nom].filter(Boolean).join(" ") || "Livreur";
    const disponible = livreur?.disponibilite === "disponible";

    return (
        <section aria-labelledby="titre-profil" className="max-w-3xl">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-jse-theme-muted">
                <span className="h-0.5 w-6 rounded-full bg-jse-secondaire" aria-hidden="true" />
                Compte livreur
            </p>
            <h1 id="titre-profil" className="mt-2 text-2xl font-semibold tracking-tight text-jse-theme-heading sm:text-3xl">
                Mon profil
            </h1>

            <AdminCard className="mt-6 flex items-center gap-4 p-4 sm:p-5">
                <PhotoProfil user={livreur} size="size-20" dark />
                <div className="min-w-0">
                    <p className="truncate text-lg font-semibold text-jse-theme-text">{nomComplet}</p>
                    <p className="text-sm text-jse-theme-muted">{livreur?.telephone || "—"}</p>
                    <div className="mt-2">
                        <AdminBadge statut={disponible ? "disponible" : "indisponible"} />
                    </div>
                    <p className="mt-2 text-sm text-jse-theme-muted">Touchez votre photo pour la remplacer.</p>
                </div>
            </AdminCard>

            <div className="mt-4 grid grid-cols-2 gap-3">
                <AdminCard className="p-4">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-jse-theme-muted">
                        <Receipt size={14} aria-hidden="true" /> Matricule
                    </p>
                    <p className="mt-2 text-base font-semibold tabular-nums text-jse-theme-text">{livreur?.matricule || "—"}</p>
                </AdminCard>
                <AdminCard className="p-4">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-jse-theme-muted">
                        <MapPin size={14} aria-hidden="true" /> Zone
                    </p>
                    <p className="mt-2 truncate text-base font-semibold text-jse-theme-text">{livreur?.zone?.nom || "—"}</p>
                </AdminCard>
            </div>

            {edition ? (
                <div className="mt-4">
                    <FormulaireProfil livreur={livreur} zones={zones} onFermer={() => setEdition(false)} />
                </div>
            ) : (
                <AdminCard className="mt-4 p-5 sm:p-6">
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-base font-semibold text-jse-theme-heading">Informations personnelles</h2>
                        <UserRound size={18} className="text-jse-theme-muted" aria-hidden="true" />
                    </div>
                    <dl className="mt-3 divide-y divide-jse-theme-border">
                        {[
                            ["Téléphone", livreur?.telephone || "—", Phone],
                            ["Téléphone secondaire", livreur?.telephone_secondaire || "Non renseigné", Phone],
                            ["E-mail", livreur?.email || "Non renseigné", Bell],
                        ].map(([libelle, valeur, Icone]) => (
                            <div key={libelle} className="flex items-center gap-3 py-3">
                                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-jse-theme-surface-soft text-jse-theme-muted">
                                    <Icone size={15} aria-hidden="true" />
                                </span>
                                <div className="min-w-0">
                                    <dt className="text-xs text-jse-theme-muted">{libelle}</dt>
                                    <dd className="truncate text-sm font-semibold text-jse-theme-text">{valeur}</dd>
                                </div>
                            </div>
                        ))}
                    </dl>
                    <AdminButton className="mt-4" onClick={() => setEdition(true)}>
                        Modifier mes informations
                    </AdminButton>
                </AdminCard>
            )}

            <AdminCard className="mt-4 flex items-center justify-between gap-3 p-5">
                <div>
                    <p className="text-sm text-jse-theme-muted">Livraisons terminées</p>
                    <p className="mt-1 text-2xl font-semibold tabular-nums text-jse-theme-heading">{statistiques.livraisons_terminees || 0}</p>
                </div>
            </AdminCard>

            <AdminCard className="mt-4 p-5 lg:hidden">
                <div className="flex items-center justify-between rounded-2xl bg-jse-theme-surface-soft px-4 py-3">
                    <span className="text-sm font-medium text-jse-theme-text">Thème</span>
                    <ThemeToggle compact />
                </div>
                <AdminButton variante="dangerDoux" className="mt-3" onClick={() => router.post("/deconnexion")}>
                    <LogOut size={16} aria-hidden="true" />
                    Se déconnecter
                </AdminButton>
            </AdminCard>
        </section>
    );
}

import { Head, useForm } from "@inertiajs/react";
import { CalendarDays, Mail, Phone, ShieldCheck } from "lucide-react";
import AdminBadge from "../../Composants/Admin/AdminBadge";
import AdminButton from "../../Composants/Admin/AdminButton";
import AdminCard from "../../Composants/Admin/AdminCard";
import { AdminField, champAdmin } from "../../Composants/Admin/AdminField";
import AdminLayout from "../../Composants/Admin/AdminLayout";
import AdminPageHeader from "../../Composants/Admin/AdminPageHeader";
import FormulaireMotDePasse from "../../Composants/Interface/FormulaireMotDePasse";
import PreferencesCompte from "../../Composants/Interface/PreferencesCompte";
import PhotoProfil from "../../Composants/Profil/PhotoProfil";
import { formaterTelephone } from "../../lib/format";

function FormulaireInformations({ utilisateur }) {
    const { data, setData, patch, processing, errors, clearErrors } = useForm({
        prenom: utilisateur.prenom || "",
        nom: utilisateur.nom || "",
        telephone: utilisateur.telephone || "",
        email: utilisateur.email || "",
    });

    const modifier = (champ, valeur) => {
        setData(champ, valeur);
        if (errors[champ]) clearErrors(champ);
    };

    return (
        <form
            onSubmit={(evenement) => {
                evenement.preventDefault();
                patch("/administration/compte", { preserveScroll: true });
            }}
        >
            <div className="grid gap-4 sm:grid-cols-2">
                <AdminField label="Prénom" erreur={errors.prenom}>
                    <input autoComplete="given-name" value={data.prenom} onChange={(e) => modifier("prenom", e.target.value)} className={champAdmin} />
                </AdminField>
                <AdminField label="Nom" required erreur={errors.nom}>
                    <input required autoComplete="family-name" value={data.nom} onChange={(e) => modifier("nom", e.target.value)} className={champAdmin} />
                </AdminField>
                <AdminField label="Téléphone de connexion" required erreur={errors.telephone} aide="Utilisé pour vous connecter. Les formats 07 01 02 03 04 ou +225 sont acceptés.">
                    <input required type="tel" autoComplete="tel" value={data.telephone} onChange={(e) => modifier("telephone", e.target.value)} className={champAdmin} />
                </AdminField>
                <AdminField label="E-mail" erreur={errors.email}>
                    <input type="email" autoComplete="email" value={data.email} onChange={(e) => modifier("email", e.target.value)} className={champAdmin} />
                </AdminField>
            </div>
            <AdminButton type="submit" chargement={processing} className="mt-5">
                Enregistrer mes informations
            </AdminButton>
        </form>
    );
}

export default function Compte({ utilisateur }) {
    const nomComplet = [utilisateur.prenom, utilisateur.nom].filter(Boolean).join(" ") || "Administrateur";

    return (
        <>
            <Head title="Mon compte — Administration" />

            <AdminLayout utilisateur={utilisateur}>
                <AdminPageHeader eyebrow="Administration" title="Mon compte" description="Vos informations personnelles, votre sécurité et vos préférences." visuel="motos-gauche" />

                <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] lg:items-start">
                    <div className="space-y-5">
                        <AdminCard className="p-5 sm:p-6">
                            <div className="flex items-center gap-4">
                                <PhotoProfil user={utilisateur} size="size-20" dark />
                                <div className="min-w-0">
                                    <p className="truncate text-lg font-semibold text-jse-theme-text">{nomComplet}</p>
                                    <div className="mt-2">
                                        <AdminBadge ton="principal" libelle="Administrateur" />
                                    </div>
                                </div>
                            </div>
                            <p className="mt-3 text-sm text-jse-theme-muted">Touchez votre photo pour la remplacer (JPG, PNG ou WebP, 5 Mo maximum).</p>

                            <dl className="mt-5 divide-y divide-jse-theme-border">
                                {[
                                    [Phone, "Téléphone", formaterTelephone(utilisateur.telephone)],
                                    [Mail, "E-mail", utilisateur.email || "Non renseigné"],
                                    [CalendarDays, "Compte créé le", utilisateur.created_at || "—"],
                                ].map(([Icone, libelle, valeur]) => (
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
                        </AdminCard>

                        <AdminCard className="p-5 sm:p-6">
                            <h2 className="mb-4 text-base font-semibold text-jse-theme-heading">Préférences</h2>
                            <PreferencesCompte photoProfil={utilisateur.photo_profil} />
                        </AdminCard>
                    </div>

                    <div className="space-y-5">
                        <AdminCard className="p-5 sm:p-6">
                            <h2 className="mb-4 text-base font-semibold text-jse-theme-heading">Informations personnelles</h2>
                            <FormulaireInformations utilisateur={utilisateur} />
                        </AdminCard>

                        <AdminCard className="p-5 sm:p-6">
                            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-jse-theme-heading">
                                <ShieldCheck size={18} aria-hidden="true" />
                                Sécurité
                            </h2>
                            <FormulaireMotDePasse />
                        </AdminCard>
                    </div>
                </div>
            </AdminLayout>
        </>
    );
}

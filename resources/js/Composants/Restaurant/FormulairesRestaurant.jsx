import { useState } from "react";
import { useForm } from "@inertiajs/react";
import { MapPin } from "lucide-react";
import AdminButton from "../Admin/AdminButton";
import AdminCard from "../Admin/AdminCard";
import BandeauRubrique from "../Interface/BandeauRubrique";
import { AdminField, champAdmin } from "../Admin/AdminField";

/** Bandeau de marque commun aux rubriques de l'espace restaurant. */
export function TitreRubrique({ surtitre, titre, description, visuel = "motos", children }) {
    return <BandeauRubrique surtitre={surtitre} titre={titre} description={description} visuel={visuel} actions={children} />;
}

function useChamps(valeursInitiales) {
    const formulaire = useForm(valeursInitiales);
    const modifier = (champ, valeur) => {
        formulaire.setData(champ, valeur);
        if (formulaire.errors[champ]) formulaire.clearErrors(champ);
    };

    return { ...formulaire, modifier };
}

/** Informations publiques du restaurant et coordonnées de localisation. */
export function FormulaireProfil({ restaurant }) {
    const { data, modifier, setData, patch, processing, errors } = useChamps({
        nom: restaurant?.nom || "",
        description: restaurant?.description || "",
        telephone: restaurant?.telephone || "",
        email: restaurant?.email || "",
        adresse: restaurant?.adresse || "",
        latitude: restaurant?.latitude ?? "",
        longitude: restaurant?.longitude ?? "",
    });
    const [localisation, setLocalisation] = useState({ enCours: false, message: "" });

    const utiliserMaPosition = () => {
        if (!("geolocation" in navigator)) {
            setLocalisation({ enCours: false, message: "La géolocalisation n'est pas disponible sur cet appareil." });
            return;
        }

        setLocalisation({ enCours: true, message: "" });
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setData((ancien) => ({ ...ancien, latitude: position.coords.latitude.toFixed(7), longitude: position.coords.longitude.toFixed(7) }));
                setLocalisation({ enCours: false, message: "Position récupérée : pensez à enregistrer." });
            },
            () => setLocalisation({ enCours: false, message: "Position impossible à récupérer. Autorisez la localisation dans votre navigateur." }),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
        );
    };

    return (
        <AdminCard as="form" onSubmit={(evenement) => { evenement.preventDefault(); patch("/restaurant/profil", { preserveScroll: true }); }} className="mt-6 max-w-3xl p-5 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
                <AdminField label="Nom du restaurant" required erreur={errors.nom}>
                    <input required value={data.nom} onChange={(e) => modifier("nom", e.target.value)} className={champAdmin} />
                </AdminField>
                <AdminField label="Téléphone" required erreur={errors.telephone}>
                    <input required type="tel" value={data.telephone} onChange={(e) => modifier("telephone", e.target.value)} className={champAdmin} />
                </AdminField>
                <AdminField label="E-mail" erreur={errors.email}>
                    <input type="email" value={data.email} onChange={(e) => modifier("email", e.target.value)} className={champAdmin} />
                </AdminField>
                <AdminField label="Adresse" required erreur={errors.adresse}>
                    <input required value={data.adresse} onChange={(e) => modifier("adresse", e.target.value)} className={champAdmin} />
                </AdminField>
            </div>

            <fieldset className="mt-5 rounded-2xl border border-jse-theme-border bg-jse-theme-surface-soft p-4">
                <legend className="px-1 text-sm font-semibold text-jse-theme-heading">Localisation</legend>
                <p className="text-sm text-jse-theme-muted">Ces coordonnées servent à classer les restaurants par proximité chez le client.</p>
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    <AdminField label="Latitude" erreur={errors.latitude}>
                        <input type="number" step="0.0000001" value={data.latitude} onChange={(e) => modifier("latitude", e.target.value)} className={champAdmin} />
                    </AdminField>
                    <AdminField label="Longitude" erreur={errors.longitude}>
                        <input type="number" step="0.0000001" value={data.longitude} onChange={(e) => modifier("longitude", e.target.value)} className={champAdmin} />
                    </AdminField>
                </div>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                    <AdminButton variante="secondaire" taille="petit" chargement={localisation.enCours} onClick={utiliserMaPosition}>
                        <MapPin size={15} aria-hidden="true" />
                        Utiliser ma position
                    </AdminButton>
                    {localisation.message && (
                        <p className="text-sm text-jse-theme-muted" role="status">
                            {localisation.message}
                        </p>
                    )}
                </div>
            </fieldset>

            <AdminField label="Description" aide="Présentez votre restaurant en quelques lignes." erreur={errors.description} className="mt-5">
                <textarea rows={4} maxLength={2000} value={data.description} onChange={(e) => modifier("description", e.target.value)} className={champAdmin + " resize-none py-3"} />
            </AdminField>

            <AdminButton type="submit" chargement={processing} className="mt-5">
                Enregistrer le profil
            </AdminButton>
        </AdminCard>
    );
}

/** Horaires d'ouverture (texte libre affiché aux clients). */
export function FormulaireHoraires({ restaurant }) {
    const { data, modifier, patch, processing, errors } = useChamps({ horaires: restaurant?.horaires || "" });

    return (
        <AdminCard as="form" onSubmit={(evenement) => { evenement.preventDefault(); patch("/restaurant/horaires", { preserveScroll: true }); }} className="mt-6 max-w-2xl p-5 sm:p-6">
            <AdminField label="Horaires d'ouverture" required aide="Ex. Lun - Dim : 08:00 - 22:00" erreur={errors.horaires}>
                <textarea required rows={5} maxLength={500} value={data.horaires} onChange={(e) => modifier("horaires", e.target.value)} className={champAdmin + " resize-none py-3"} />
            </AdminField>
            <AdminButton type="submit" chargement={processing} className="mt-5">
                Enregistrer les horaires
            </AdminButton>
        </AdminCard>
    );
}

/** Informations du responsable connecté. */
export function FormulaireCompte({ utilisateur }) {
    const { data, modifier, patch, processing, errors } = useChamps({
        prenom: utilisateur?.prenom || "",
        nom: utilisateur?.nom || "",
        telephone: utilisateur?.telephone || "",
        email: utilisateur?.email || "",
    });

    return (
        <AdminCard as="form" onSubmit={(evenement) => { evenement.preventDefault(); patch("/restaurant/compte", { preserveScroll: true }); }} className="mt-6 max-w-3xl p-5 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
                <AdminField label="Prénom" required erreur={errors.prenom}>
                    <input required autoComplete="given-name" value={data.prenom} onChange={(e) => modifier("prenom", e.target.value)} className={champAdmin} />
                </AdminField>
                <AdminField label="Nom" required erreur={errors.nom}>
                    <input required autoComplete="family-name" value={data.nom} onChange={(e) => modifier("nom", e.target.value)} className={champAdmin} />
                </AdminField>
                <AdminField label="Téléphone de connexion" required erreur={errors.telephone}>
                    <input required type="tel" autoComplete="tel" value={data.telephone} onChange={(e) => modifier("telephone", e.target.value)} className={champAdmin} />
                </AdminField>
                <AdminField label="E-mail" erreur={errors.email}>
                    <input type="email" autoComplete="email" value={data.email} onChange={(e) => modifier("email", e.target.value)} className={champAdmin} />
                </AdminField>
            </div>
            <AdminButton type="submit" chargement={processing} className="mt-5">
                Enregistrer mes informations
            </AdminButton>
        </AdminCard>
    );
}

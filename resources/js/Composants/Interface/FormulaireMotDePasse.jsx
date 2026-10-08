import { useState } from "react";
import { useForm } from "@inertiajs/react";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import AdminButton from "../Admin/AdminButton";
import { AdminField, champAdmin } from "../Admin/AdminField";

const NIVEAUX = [
    { label: "Trop court", classe: "bg-jse-danger" },
    { label: "Faible", classe: "bg-jse-danger" },
    { label: "Correct", classe: "bg-jse-accent" },
    { label: "Bon", classe: "bg-jse-secondaire" },
    { label: "Excellent", classe: "bg-jse-secondaire" },
];

/** Robustesse indicative (0 à 4) : longueur, casse, chiffres et symboles. Le serveur n'impose que 8 caractères. */
function robustesse(motDePasse) {
    if (motDePasse.length < 8) return 0;

    const points = [motDePasse.length >= 12, /[a-z]/.test(motDePasse) && /[A-Z]/.test(motDePasse), /\d/.test(motDePasse), /[^A-Za-z0-9]/.test(motDePasse)].filter(Boolean).length;

    return Math.max(1, Math.min(4, points + 1));
}

function ChampSecret({ label, valeur, onChange, erreur, autoComplete, aide = null }) {
    const [visible, setVisible] = useState(false);

    return (
        <AdminField label={label} required erreur={erreur} aide={aide}>
            <span className="relative block">
                <input type={visible ? "text" : "password"} required autoComplete={autoComplete} value={valeur} onChange={(evenement) => onChange(evenement.target.value)} className={champAdmin + " pr-12"} />
                <button
                    type="button"
                    onClick={() => setVisible((courant) => !courant)}
                    aria-label={visible ? `Masquer : ${label}` : `Afficher : ${label}`}
                    aria-pressed={visible}
                    className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-jse-theme-muted transition hover:bg-jse-theme-surface-soft hover:text-jse-theme-text"
                >
                    {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                </button>
            </span>
        </AdminField>
    );
}

/**
 * Changement de mot de passe (tous rôles) : mot de passe actuel, nouveau mot de passe avec jauge
 * de robustesse, confirmation. Les erreurs du serveur s'affichent sous chaque champ.
 */
export default function FormulaireMotDePasse({ className = "" }) {
    const { data, setData, patch, processing, errors, clearErrors, reset } = useForm({
        mot_de_passe_actuel: "",
        nouveau_mot_de_passe: "",
        nouveau_mot_de_passe_confirmation: "",
    });

    const niveau = robustesse(data.nouveau_mot_de_passe);

    const modifier = (champ, valeur) => {
        setData(champ, valeur);
        if (errors[champ]) clearErrors(champ);
    };

    const soumettre = (evenement) => {
        evenement.preventDefault();
        patch("/compte/mot-de-passe", { preserveScroll: true, onSuccess: () => reset() });
    };

    return (
        <form onSubmit={soumettre} className={["space-y-4", className].join(" ")}>
            <div className="flex items-start gap-3 rounded-2xl bg-jse-theme-surface-soft p-4">
                <ShieldCheck size={20} className="mt-0.5 shrink-0 text-jse-secondaire" aria-hidden="true" />
                <p className="text-sm leading-6 text-jse-theme-muted">Choisissez un mot de passe que vous n’utilisez nulle part ailleurs. Ne le communiquez jamais, même à l’équipe JSE Express.</p>
            </div>

            <ChampSecret label="Mot de passe actuel" valeur={data.mot_de_passe_actuel} onChange={(valeur) => modifier("mot_de_passe_actuel", valeur)} erreur={errors.mot_de_passe_actuel} autoComplete="current-password" />

            <div>
                <ChampSecret label="Nouveau mot de passe" valeur={data.nouveau_mot_de_passe} onChange={(valeur) => modifier("nouveau_mot_de_passe", valeur)} erreur={errors.nouveau_mot_de_passe} autoComplete="new-password" aide="8 caractères minimum." />
                {data.nouveau_mot_de_passe && (
                    <div className="mt-2" role="status" aria-live="polite">
                        <div className="flex gap-1.5" aria-hidden="true">
                            {[1, 2, 3, 4].map((segment) => (
                                <span key={segment} className={["h-1.5 flex-1 rounded-full transition-colors", segment <= niveau ? NIVEAUX[niveau].classe : "bg-jse-theme-border"].join(" ")} />
                            ))}
                        </div>
                        <p className="mt-1.5 text-xs font-medium text-jse-theme-muted">Robustesse : {NIVEAUX[niveau].label}</p>
                    </div>
                )}
            </div>

            <ChampSecret label="Confirmer le nouveau mot de passe" valeur={data.nouveau_mot_de_passe_confirmation} onChange={(valeur) => modifier("nouveau_mot_de_passe_confirmation", valeur)} erreur={errors.nouveau_mot_de_passe_confirmation} autoComplete="new-password" />

            <AdminButton type="submit" chargement={processing}>
                Modifier mon mot de passe
            </AdminButton>
        </form>
    );
}

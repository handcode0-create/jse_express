import { Link, router } from "@inertiajs/react";
import { ChevronRight, ImageOff, Palette, ScrollText } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

function Ligne({ icone: Icone, titre, description, children }) {
    return (
        <div className="flex items-center gap-3 py-4 first:pt-0 last:pb-0">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-jse-theme-surface-soft text-jse-theme-heading">
                <Icone size={18} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-jse-theme-text">{titre}</p>
                {description && <p className="text-sm text-jse-theme-muted">{description}</p>}
            </div>
            {children}
        </div>
    );
}

/**
 * Préférences communes à tous les rôles : apparence (thème clair ou sombre), politique de
 * confidentialité et retrait de la photo de profil lorsqu'il y en a une.
 */
export default function PreferencesCompte({ photoProfil = null }) {
    return (
        <div className="divide-y divide-jse-theme-border">
            <Ligne icone={Palette} titre="Apparence" description="Thème clair ou sombre, enregistré sur cet appareil.">
                <ThemeToggle compact />
            </Ligne>

            <Ligne icone={ScrollText} titre="Confidentialité" description="Comment JSE Express utilise vos données.">
                <Link href="/politique-de-confidentialite" className="inline-flex min-h-10 shrink-0 items-center gap-1 text-sm font-semibold text-jse-theme-heading hover:underline">
                    Lire
                    <ChevronRight size={15} aria-hidden="true" />
                </Link>
            </Ligne>

            {photoProfil && (
                <Ligne icone={ImageOff} titre="Photo de profil" description="Retirer votre photo actuelle.">
                    <button
                        type="button"
                        onClick={() => router.delete("/profil/photo", { preserveScroll: true })}
                        className="inline-flex min-h-10 shrink-0 items-center rounded-full border border-jse-theme-border px-4 text-sm font-semibold text-jse-danger transition hover:bg-jse-danger/10"
                    >
                        Retirer
                    </button>
                </Ligne>
            )}
        </div>
    );
}

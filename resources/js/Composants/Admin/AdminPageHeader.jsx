import BandeauRubrique from "../Interface/BandeauRubrique";

/**
 * En-tête de page admin : bandeau de marque avec lien de retour, surtitre, titre, description et actions.
 *
 * @param {{ eyebrow?: string, title: string, description?: string, retour?: { href: string, label: string }, actions?: import("react").ReactNode, visuel?: string }} props
 */
export default function AdminPageHeader({ eyebrow = "Administration", title, description = null, retour = null, actions = null, visuel = "motos" }) {
    return <BandeauRubrique surtitre={eyebrow} titre={title} description={description} retour={retour} actions={actions} visuel={visuel} />;
}

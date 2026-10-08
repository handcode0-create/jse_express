const tons = {
    succes: { fond: "bg-jse-secondaire/15", point: "bg-jse-secondaire" },
    attention: { fond: "bg-jse-accent/15", point: "bg-jse-accent" },
    danger: { fond: "bg-jse-danger/10", point: "bg-jse-danger" },
    information: { fond: "bg-jse-information/10", point: "bg-jse-information" },
    principal: { fond: "bg-jse-principal/10", point: "bg-jse-theme-heading" },
    neutre: { fond: "bg-jse-theme-text/5", point: "bg-jse-theme-muted" },
};

const statuts = {
    actif: { ton: "succes", libelle: "Actif" },
    inactif: { ton: "neutre", libelle: "Inactif" },
    disponible: { ton: "succes", libelle: "Disponible" },
    indisponible: { ton: "neutre", libelle: "Indisponible" },
    active: { ton: "succes", libelle: "Active" },

    EN_ATTENTE: { ton: "attention", libelle: "En attente" },
    CONFIRMEE: { ton: "information", libelle: "Confirmée" },
    EN_PREPARATION: { ton: "information", libelle: "En préparation" },
    PRETE: { ton: "principal", libelle: "Prête" },
    EN_LIVRAISON: { ton: "attention", libelle: "En livraison" },
    LIVREE: { ton: "succes", libelle: "Livrée" },
    ANNULEE: { ton: "danger", libelle: "Annulée" },

    en_attente: { ton: "attention", libelle: "En attente" },
    attribuee: { ton: "information", libelle: "Attribuée" },
    en_cours: { ton: "principal", libelle: "En cours" },
    terminee: { ton: "succes", libelle: "Terminée" },
    livree: { ton: "succes", libelle: "Livrée" },
    annulee: { ton: "danger", libelle: "Annulée" },

    envoye: { ton: "succes", libelle: "Envoyée" },
    envoyee: { ton: "succes", libelle: "Envoyée" },
    echec: { ton: "danger", libelle: "Échec" },
};

/**
 * Badge de statut admin : une pastille colorée + un libellé,
 * la couleur n'est jamais le seul vecteur d'information.
 *
 * @param {{ statut?: string|null, libelle?: string|null, ton?: keyof typeof tons, className?: string }} props
 */
export default function AdminBadge({ statut = null, libelle = null, ton = null, className = "" }) {
    const connu = statut ? statuts[statut] : null;
    const tonFinal = tons[ton ?? connu?.ton] ?? tons.neutre;
    const texte = libelle ?? connu?.libelle ?? statut ?? "—";

    return (
        <span
            className={[
                "inline-flex w-fit max-w-full items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold text-jse-theme-heading",
                tonFinal.fond,
                className,
            ].join(" ")}
        >
            <span className={["size-1.5 shrink-0 rounded-full", tonFinal.point].join(" ")} aria-hidden="true" />
            <span className="truncate">{texte}</span>
        </span>
    );
}

const variantes = {
    principal: [
        "bg-jse-principal",
        "text-white",
        "hover:bg-[#0E3028]",
        "focus-visible:ring-jse-secondaire",
    ],

    secondaire: [
        "bg-jse-secondaire",
        "text-white",
        "hover:bg-[#3DA968]",
        "focus-visible:ring-jse-principal",
    ],

    accent: [
        "bg-jse-accent",
        "text-white",
        "hover:bg-[#DC791C]",
        "focus-visible:ring-jse-accent",
    ],

    contour: [
        "border",
        "border-jse-principal/15",
        "bg-transparent",
        "text-jse-principal",
        "hover:bg-jse-principal/5",
        "focus-visible:ring-jse-secondaire",
    ],

    discret: [
        "bg-transparent",
        "text-jse-principal",
        "hover:bg-jse-principal/5",
        "focus-visible:ring-jse-secondaire",
    ],
};

const tailles = {
    petit: "h-9 px-3 text-xs rounded-jse-moyen",
    moyen: "h-11 px-4 text-sm rounded-jse-grand",
    grand: "h-12 px-6 text-base rounded-jse-grand",
};

export default function Bouton({
    children,
    variante = "principal",
    taille = "moyen",
    chargement = false,
    desactive = false,
    className = "",
    type = "button",
    ...props
}) {
    return (
        <button
            type={type}
            disabled={desactive || chargement}
            className={[
                "inline-flex items-center justify-center gap-2",
                "font-semibold",
                "transition-all duration-200",
                "active:scale-[0.98]",
                "focus-visible:outline-none",
                "focus-visible:ring-2",
                "focus-visible:ring-offset-2",
                "disabled:pointer-events-none",
                "disabled:opacity-50",
                ...(variantes[variante] ?? variantes.principal),
                tailles[taille] ?? tailles.moyen,
                className,
            ].join(" ")}
            {...props}
        >
            {chargement && (
                <span
                    className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                    aria-hidden="true"
                />
            )}

            {children}
        </button>
    );
}

const variantes = {
    principal: "bg-jse-principal/10 text-jse-principal",
    succes: "bg-jse-secondaire/12 text-jse-principal",
    attention: "bg-jse-accent/15 text-[#A85A08]",
    danger: "bg-jse-danger/10 text-jse-danger",
    information: "bg-jse-information/10 text-jse-information",
    neutre: "bg-jse-texte/6 text-jse-texte/65",
};

export default function Badge({
    children,
    variante = "neutre",
    className = "",
}) {
    return (
        <span
            className={[
                "inline-flex items-center",
                "rounded-full",
                "px-2.5 py-1",
                "text-xs font-semibold",
                variantes[variante] ?? variantes.neutre,
                className,
            ].join(" ")}
        >
            {children}
        </span>
    );
}

export default function IndicateurChargement({
    taille = "moyenne",
    className = "",
}) {
    const tailles = {
        petite: "size-4 border-2",
        moyenne: "size-5 border-2",
        grande: "size-8 border-[3px]",
    };

    return (
        <span
            role="status"
            aria-label="Chargement"
            className={[
                "inline-block",
                "animate-spin",
                "rounded-full",
                "border-jse-principal/20",
                "border-t-jse-secondaire",
                tailles[taille] ?? tailles.moyenne,
                className,
            ].join(" ")}
        />
    );
}

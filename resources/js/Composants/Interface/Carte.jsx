export default function Carte({
    children,
    className = "",
    sansMarge = false,
    interactive = false,
}) {
    return (
        <div
            className={[
                "rounded-jse-xl",
                "border border-jse-texte/8",
                "bg-white",
                "shadow-sm",
                sansMarge ? "" : "p-5",
                interactive
                    ? "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                    : "",
                className,
            ].join(" ")}
        >
            {children}
        </div>
    );
}

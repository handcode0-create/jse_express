export default function Champ({
    label,
    erreur,
    aide,
    id,
    className = "",
    ...props
}) {
    return (
        <div className="w-full">
            {label && (
                <label
                    htmlFor={id}
                    className="mb-2 block text-sm font-medium text-jse-texte"
                >
                    {label}
                </label>
            )}

            <input
                id={id}
                className={[
                    "h-11 w-full",
                    "rounded-jse-grand",
                    "border",
                    "bg-white",
                    "px-4",
                    "text-sm",
                    "text-jse-texte",
                    "placeholder:text-jse-texte/40",
                    "outline-none",
                    "transition-colors",
                    "focus:border-jse-secondaire",
                    "focus:ring-2",
                    "focus:ring-jse-secondaire/15",
                    erreur ? "border-jse-danger" : "border-jse-texte/10",
                    className,
                ].join(" ")}
                {...props}
            />

            {erreur && (
                <p className="mt-1.5 text-xs font-medium text-jse-danger">
                    {erreur}
                </p>
            )}

            {!erreur && aide && (
                <p className="mt-1.5 text-xs text-jse-texte/50">{aide}</p>
            )}
        </div>
    );
}

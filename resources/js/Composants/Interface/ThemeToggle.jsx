import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

function lireTheme() {
    if (typeof document === "undefined") return "light";
    return document.documentElement.dataset.theme || localStorage.getItem("jse-theme") || "light";
}

export default function ThemeToggle({ compact = false }) {
    const [theme, setTheme] = useState("light");

    useEffect(() => {
        const initial = lireTheme();
        setTheme(initial);
        document.documentElement.dataset.theme = initial;
    }, []);

    const changer = () => {
        const prochain = theme === "dark" ? "light" : "dark";
        document.documentElement.dataset.theme = prochain;
        localStorage.setItem("jse-theme", prochain);
        setTheme(prochain);
    };

    const sombre = theme === "dark";

    return (
        <button
            type="button"
            onClick={changer}
            aria-label={sombre ? "Activer le thème clair" : "Activer le thème sombre"}
            title={sombre ? "Thème clair" : "Thème sombre"}
            className={[
                "inline-flex items-center justify-center gap-2 rounded-full border transition-all duration-200",
                compact ? "size-10" : "h-10 px-3.5",
                "border-jse-theme-border bg-jse-theme-surface text-jse-theme-text hover:scale-[1.02] hover:border-jse-secondaire/40",
            ].join(" ")}
        >
            {sombre ? <Sun size={17} strokeWidth={2} /> : <Moon size={17} strokeWidth={2} />}
            {!compact && (
                <span className="text-[10px] font-semibold">
                    {sombre ? "Clair" : "Sombre"}
                </span>
            )}
        </button>
    );
}

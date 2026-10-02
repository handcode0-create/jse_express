import React from "react";
import { TrendingUp } from "lucide-react";

export default function AdminStatCard({ label, value, icon: Icon, tone = "principal" }) {
    const tones = {
        principal: "bg-jse-principal/10 text-jse-principal",
        secondaire: "bg-jse-secondaire/10 text-jse-secondaire",
        accent: "bg-jse-accent/10 text-jse-accent",
        neutre: "bg-jse-texte/6 text-jse-texte",
    };

    return (
        <article className="rounded-jse-xl border border-jse-theme-border bg-jse-theme-surface p-4 shadow-sm sm:p-5">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs font-medium text-jse-theme-muted">{label}</p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-jse-theme-text">{value}</p>
                </div>
                <span className={["flex size-10 shrink-0 items-center justify-center rounded-jse-moyen", tones[tone] ?? tones.principal].join(" ")}>
                    <Icon size={18} strokeWidth={2} aria-hidden="true" />
                </span>
            </div>
        </article>
    );
}

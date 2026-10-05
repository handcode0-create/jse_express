import { useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { mouvementReduit } from "../../lib/mouvement";

const LARGEUR_DEFAUT = 640;
const MARGE = { haut: 18, droite: 18, bas: 34, gauche: 38 };

/** Courbe lissée (Bézier cubique) passant par tous les points. */
function courbe(points) {
    if (points.length < 2) return "";

    return points.reduce((chemin, [x, y], index) => {
        if (index === 0) return `M ${x} ${y}`;

        const [xPrecedent, yPrecedent] = points[index - 1];
        const milieu = (xPrecedent + x) / 2;

        return `${chemin} C ${milieu} ${yPrecedent}, ${milieu} ${y}, ${x} ${y}`;
    }, "");
}

/** Plus petit multiple « rond » (1, 2, 5, 10, 20…) couvrant la valeur maximale. */
function plafond(valeur) {
    if (valeur <= 4) return 4;

    const pas = Math.pow(10, Math.floor(Math.log10(valeur)));
    const choix = [1, 2, 5, 10].map((facteur) => facteur * pas).find((candidat) => candidat >= valeur);

    return choix ?? Math.ceil(valeur / pas) * pas;
}

/**
 * Activité des commandes sur sept jours : courbes « reçues » et « livrées » avec aire dégradée,
 * tracé animé, totaux et tableau équivalent pour les lecteurs d'écran.
 *
 * @param {{ serie?: Array<{ date: string, label: string, recues?: number, livrees?: number }> }} props
 */
export default function GraphiqueActivite({ serie = [] }) {
    const idDegrade = useId().replace(/:/g, "");
    const racine = useRef(null);
    const zoneRef = useRef(null);
    const [largeur, setLargeur] = useState(LARGEUR_DEFAUT);
    const hauteur = largeur < 480 ? 230 : largeur < 520 ? 300 : 340;

    useLayoutEffect(() => {
        if (!zoneRef.current || typeof ResizeObserver === "undefined") return undefined;

        const observateur = new ResizeObserver(([entree]) => setLargeur(Math.max(300, Math.round(entree.contentRect.width))));
        observateur.observe(zoneRef.current);

        return () => observateur.disconnect();
    }, []);

    const { points, max, totalRecues, totalLivrees } = useMemo(() => {
        const maximum = plafond(Math.max(...serie.map((jour) => Math.max(jour.recues || 0, jour.livrees || 0)), 1));
        const largeurUtile = largeur - MARGE.gauche - MARGE.droite;
        const hauteurUtile = hauteur - MARGE.haut - MARGE.bas;
        const x = (index) => MARGE.gauche + (serie.length <= 1 ? largeurUtile / 2 : (index / (serie.length - 1)) * largeurUtile);
        const y = (valeur) => MARGE.haut + hauteurUtile - (valeur / maximum) * hauteurUtile;

        return {
            max: maximum,
            points: {
                recues: serie.map((jour, index) => [x(index), y(jour.recues || 0)]),
                livrees: serie.map((jour, index) => [x(index), y(jour.livrees || 0)]),
                base: MARGE.haut + hauteurUtile,
            },
            totalRecues: serie.reduce((somme, jour) => somme + (jour.recues || 0), 0),
            totalLivrees: serie.reduce((somme, jour) => somme + (jour.livrees || 0), 0),
        };
    }, [serie, largeur, hauteur]);

    useLayoutEffect(() => {
        if (!racine.current || mouvementReduit()) return undefined;

        const contexte = gsap.context(() => {
            racine.current.querySelectorAll("[data-trace]").forEach((trace) => {
                const longueur = trace.getTotalLength();
                gsap.fromTo(trace, { strokeDasharray: longueur, strokeDashoffset: longueur }, { strokeDashoffset: 0, duration: 1.3, ease: "power2.out", clearProps: "strokeDasharray,strokeDashoffset" });
            });
            gsap.from("[data-aire]", { opacity: 0, duration: 1, delay: 0.5 });
            gsap.from("[data-point]", { scale: 0, transformOrigin: "center", duration: 0.4, stagger: 0.05, delay: 0.9, ease: "back.out(2)" });
        }, racine);

        return () => contexte.revert();
    }, [serie]);

    const lignes = [0, 1, 2, 3, 4].map((indice) => ({ valeur: Math.round((max / 4) * indice), y: MARGE.haut + (hauteur - MARGE.haut - MARGE.bas) * (1 - indice / 4) }));
    const aire = points.recues.length > 1 ? `${courbe(points.recues)} L ${points.recues[points.recues.length - 1][0]} ${points.base} L ${points.recues[0][0]} ${points.base} Z` : "";

    return (
        <section ref={racine} aria-labelledby="titre-activite" className="jse-admin-card flex h-full flex-col rounded-3xl border border-jse-theme-border bg-jse-theme-surface p-5 shadow-jse-carte sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h2 id="titre-activite" className="font-against text-3xl leading-none text-jse-theme-heading">
                        Activité des commandes
                    </h2>
                    <p className="mt-2 text-sm text-jse-theme-muted">Les 7 derniers jours</p>
                </div>
                <dl className="flex gap-3">
                    <div className="rounded-2xl bg-jse-theme-surface-soft px-4 py-2.5">
                        <dt className="flex items-center gap-2 text-xs text-jse-theme-muted">
                            <span className="size-2.5 rounded-full bg-jse-theme-heading" aria-hidden="true" />
                            Reçues
                        </dt>
                        <dd className="text-xl font-semibold tabular-nums text-jse-theme-heading">{totalRecues}</dd>
                    </div>
                    <div className="rounded-2xl bg-jse-theme-surface-soft px-4 py-2.5">
                        <dt className="flex items-center gap-2 text-xs text-jse-theme-muted">
                            <span className="size-2.5 rounded-full bg-jse-secondaire" aria-hidden="true" />
                            Livrées
                        </dt>
                        <dd className="text-xl font-semibold tabular-nums text-jse-theme-heading">{totalLivrees}</dd>
                    </div>
                </dl>
            </div>

            {serie.length === 0 ? (
                <div className="mt-6 flex min-h-48 flex-1 items-center justify-center rounded-2xl border border-dashed border-jse-theme-border text-sm text-jse-theme-muted">Aucune donnée disponible pour cette période.</div>
            ) : (
                <>
                    <div ref={zoneRef} className="mt-5 min-w-0 flex-1">
                    <svg viewBox={`0 0 ${largeur} ${hauteur}`} width={largeur} height={hauteur} className="block max-w-full" role="img" aria-label={`Commandes reçues : ${totalRecues}. Commandes livrées : ${totalLivrees}. Sur les 7 derniers jours.`}>
                        <defs>
                            <linearGradient id={idDegrade} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" style={{ stopColor: "var(--color-jse-secondaire)", stopOpacity: 0.35 }} />
                                <stop offset="100%" style={{ stopColor: "var(--color-jse-secondaire)", stopOpacity: 0 }} />
                            </linearGradient>
                        </defs>

                        {lignes.map((ligne) => (
                            <g key={ligne.y}>
                                <line x1={MARGE.gauche} x2={largeur - MARGE.droite} y1={ligne.y} y2={ligne.y} className="stroke-jse-theme-border" strokeDasharray="3 5" />
                                <text x={MARGE.gauche - 8} y={ligne.y + 4} textAnchor="end" className="fill-jse-theme-muted text-xs">
                                    {ligne.valeur}
                                </text>
                            </g>
                        ))}

                        {aire && <path data-aire d={aire} fill={`url(#${idDegrade})`} />}
                        <path data-trace d={courbe(points.livrees)} fill="none" className="stroke-jse-secondaire" strokeWidth="3" strokeLinecap="round" />
                        <path data-trace d={courbe(points.recues)} fill="none" className="stroke-jse-theme-heading" strokeWidth="3" strokeLinecap="round" />

                        {serie.map((jour, index) => (
                            <g key={jour.date}>
                                <circle data-point cx={points.recues[index][0]} cy={points.recues[index][1]} r="5" className="fill-jse-theme-surface stroke-jse-theme-heading" strokeWidth="2.5">
                                    <title>{`${jour.label} : ${jour.recues || 0} reçues, ${jour.livrees || 0} livrées`}</title>
                                </circle>
                                <circle data-point cx={points.livrees[index][0]} cy={points.livrees[index][1]} r="4" className="fill-jse-secondaire" />
                                <text x={points.recues[index][0]} y={hauteur - 10} textAnchor="middle" className="fill-jse-theme-muted text-xs">
                                    {jour.label}
                                </text>
                            </g>
                        ))}
                    </svg>
                    </div>

                    <table className="sr-only">
                        <caption>Commandes reçues et livrées par jour</caption>
                        <thead>
                            <tr>
                                <th scope="col">Jour</th>
                                <th scope="col">Reçues</th>
                                <th scope="col">Livrées</th>
                            </tr>
                        </thead>
                        <tbody>
                            {serie.map((jour) => (
                                <tr key={jour.date}>
                                    <th scope="row">{jour.label}</th>
                                    <td>{jour.recues || 0}</td>
                                    <td>{jour.livrees || 0}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}
        </section>
    );
}

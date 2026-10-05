import { useLayoutEffect, useRef } from "react";
import { Link } from "@inertiajs/react";
import { gsap } from "gsap";
import { ArrowRight, Bike, CheckCircle2, ClipboardList, Store, Truck, UserRound } from "lucide-react";
import Compteur from "../Interface/Compteur";
import TuileIndicateur from "../Interface/TuileIndicateur";
import { mouvementReduit } from "../../lib/mouvement";
import GraphiqueActivite from "./GraphiqueActivite";

/** Un point de la situation opérationnelle : vert quand tout va bien, orange quand une action est attendue. */
function PointSituation({ icone: Icone, label, valeur, alerte }) {
    return (
        <li className="flex items-center gap-3">
            <span className={["flex size-10 shrink-0 items-center justify-center rounded-2xl", alerte ? "bg-jse-accent text-white" : "bg-jse-secondaire/25 text-jse-secondaire"].join(" ")}>
                <Icone size={18} aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1 text-sm text-jse-fond/90">{label}</span>
            <span className={["text-2xl font-semibold tabular-nums", alerte ? "text-jse-accent" : "text-jse-fond"].join(" ")}>{valeur}</span>
        </li>
    );
}

function Heros({ prenom, commandesASurveiller, livraisonsSansLivreur, statistiques }) {
    const racine = useRef(null);
    const nom = prenom || "Administrateur";
    const tout = commandesASurveiller === 0 && livraisonsSansLivreur === 0;

    useLayoutEffect(() => {
        if (!racine.current || mouvementReduit()) return undefined;

        const contexte = gsap.context(() => {
            gsap.from("[data-hero]", { y: 26, opacity: 0, duration: 0.7, ease: "power3.out", stagger: 0.09 });
            gsap.from("[data-fond]", { scale: 1.1, duration: 1.8, ease: "power2.out" });
        }, racine);

        return () => contexte.revert();
    }, []);

    const phrase = tout
        ? "Tout est sous contrôle : aucune commande ni livraison ne demande votre intervention."
        : [
              commandesASurveiller > 0 && `${commandesASurveiller} commande${commandesASurveiller > 1 ? "s attendent" : " attend"} la réponse d’un restaurant`,
              livraisonsSansLivreur > 0 && `${livraisonsSansLivreur} livraison${livraisonsSansLivreur > 1 ? "s sont" : " est"} sans livreur`,
          ]
              .filter(Boolean)
              .join(" · ") + ".";

    return (
        <section ref={racine} aria-labelledby="titre-accueil-admin" className="relative isolate overflow-hidden rounded-[2rem] bg-jse-principal text-jse-fond shadow-jse-elevated">
            <img data-fond src="/assets/optimises/fond-marque.webp" alt="" aria-hidden="true" decoding="async" className="absolute inset-0 -z-10 size-full object-cover object-[60%_50%]" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-jse-principal via-jse-principal/90 to-jse-principal/60 sm:bg-gradient-to-r sm:from-jse-principal sm:via-jse-principal/82 sm:to-jse-principal/30" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-jse-principal/80 via-transparent to-transparent" />

            <div className="relative grid items-center gap-8 px-6 py-8 sm:px-10 sm:py-10 lg:min-h-[380px] lg:grid-cols-[1.15fr_0.85fr] lg:px-14">
                <div className="max-w-xl">
                    <p data-hero className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-jse-fond/90">
                        <span className="h-0.5 w-8 shrink-0 rounded-full bg-jse-secondaire" aria-hidden="true" />
                        JSE Express · Administration
                    </p>
                    <h1 id="titre-accueil-admin" data-hero className={["mt-4 font-against leading-[0.92] tracking-tight", nom.length > 9 ? "text-4xl sm:text-5xl lg:text-6xl" : "text-5xl sm:text-6xl lg:text-7xl"].join(" ")}>
                        Bonjour
                        <span className="block break-words text-jse-accent">{nom}.</span>
                    </h1>
                    <p data-hero className="mt-5 max-w-md text-base leading-7 text-jse-fond/85">
                        {phrase}
                    </p>

                    <div data-hero className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                        <Link href="/administration/commandes" className="inline-flex h-12 items-center justify-center gap-3 rounded-full bg-jse-accent px-7 text-sm font-semibold text-white shadow-lg shadow-jse-accent/25 transition hover:-translate-y-0.5 hover:bg-jse-accent/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40">
                            Voir les commandes
                            <ArrowRight size={17} aria-hidden="true" />
                        </Link>
                        <Link href="/administration/livraisons" className="inline-flex h-12 items-center justify-center rounded-full border border-white/30 bg-white/10 px-6 text-sm font-semibold text-jse-fond backdrop-blur-md transition hover:bg-white/15 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40">
                            Livraisons
                        </Link>
                    </div>
                </div>

                <div data-hero className="rounded-3xl border border-white/20 bg-white/10 p-5 backdrop-blur-md sm:p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-jse-fond/70">Situation en ce moment</p>
                    <p className="mt-2 font-against text-3xl leading-none text-jse-fond sm:text-4xl">{tout ? "Tout va bien." : "À traiter."}</p>
                    <ul className="mt-5 space-y-4">
                        <PointSituation icone={ClipboardList} label="Commandes à surveiller" valeur={commandesASurveiller} alerte={commandesASurveiller > 0} />
                        <PointSituation icone={Truck} label="Livraisons sans livreur" valeur={livraisonsSansLivreur} alerte={livraisonsSansLivreur > 0} />
                        <PointSituation icone={Bike} label="Livreurs disponibles" valeur={statistiques.livreurs_disponibles ?? 0} alerte={(statistiques.livreurs_disponibles ?? 0) === 0 && (statistiques.livraisons_actives ?? 0) > 0} />
                    </ul>
                </div>
            </div>
        </section>
    );
}

/**
 * Accueil de l'administration : héro de marque avec la situation opérationnelle, courbe d'activité
 * sur 7 jours et indicateurs cliquables (le premier, sur fond vert, domine).
 */
export default function AccueilAdmin({ prenom, statistiques, serie, commandes, livraisons }) {
    const livraisonsSansLivreur = livraisons.filter((livraison) => !livraison.livreur).length;

    return (
        <div className="space-y-6 sm:space-y-8">
            <Heros prenom={prenom} statistiques={statistiques} commandesASurveiller={commandes.length} livraisonsSansLivreur={livraisonsSansLivreur} />

            <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr] lg:items-stretch">
                <GraphiqueActivite serie={serie} />

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="col-span-2">
                        <TuileIndicateur icone={ClipboardList} label="Commandes actives" sombre href="/administration/commandes">
                            <Compteur valeur={statistiques.commandes_actives || 0} />
                        </TuileIndicateur>
                    </div>
                    <TuileIndicateur icone={Truck} label="Livraisons actives" href="/administration/livraisons">
                        <Compteur valeur={statistiques.livraisons_actives || 0} />
                    </TuileIndicateur>
                    <TuileIndicateur icone={CheckCircle2} label="Commandes livrées" href="/administration/commandes">
                        <Compteur valeur={statistiques.commandes_livrees || 0} />
                    </TuileIndicateur>
                    <TuileIndicateur icone={Store} label="Restaurants actifs" href="/administration/restaurants">
                        <Compteur valeur={statistiques.restaurants_actifs || 0} />
                    </TuileIndicateur>
                    <TuileIndicateur icone={UserRound} label="Clients actifs" href="/administration/clients">
                        <Compteur valeur={statistiques.clients_actifs || 0} />
                    </TuileIndicateur>
                </div>
            </div>
        </div>
    );
}

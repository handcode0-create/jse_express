import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { mouvementReduit } from "../../lib/mouvement";

/** Nombre qui s'anime de 0 à sa valeur (affiché tel quel si l'utilisateur réduit les animations). */
export default function Compteur({ valeur, formater = (nombre) => nombre.toLocaleString("fr-FR"), className = "" }) {
    const ref = useRef(null);

    useEffect(() => {
        const cible = Number(valeur || 0);

        if (!ref.current || mouvementReduit()) return undefined;

        const etat = { v: 0 };
        const animation = gsap.to(etat, {
            v: cible,
            duration: 0.9,
            ease: "power2.out",
            onUpdate: () => {
                if (ref.current) ref.current.textContent = formater(Math.round(etat.v));
            },
        });

        return () => animation.kill();
    }, [valeur]);

    return (
        <span ref={ref} className={className}>
            {formater(Number(valeur || 0))}
        </span>
    );
}

import { useEffect, useState } from "react";
import L from "leaflet";
import { Circle, MapContainer, Marker, Popup, TileLayer, ZoomControl, useMap } from "react-leaflet";
import { MapPin, Navigation } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Centre d'Adzopé, affiché tant qu'aucune position n'est connue.
const CENTRE_PAR_DEFAUT = [6.1069, -3.8619];

const livreurIcon = L.divIcon({
    className: "jse-leaflet-marker",
    html: '<div style="width:48px;height:48px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#F28C28;border:4px solid #FFF7E8;box-shadow:0 0 0 8px rgba(242,140,40,.16),0 10px 24px rgba(0,0,0,.3)"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#123C32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17h14"/><path d="M7 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M17 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="m9 13 2-5h4l2 5"/><path d="M11 8 9 6H7"/></svg></div>',
    iconSize: [48, 48],
    iconAnchor: [24, 24],
});

/**
 * Position de l'appareil du livreur, affichée sur sa propre carte.
 * Elle n'est jamais envoyée au serveur ni partagée avec le client.
 */
export function usePositionLivreur(active = true) {
    const [etat, setEtat] = useState({ position: null, precision: null, erreur: null });

    useEffect(() => {
        if (!active) return undefined;

        if (!("geolocation" in navigator)) {
            setEtat((ancien) => ({ ...ancien, erreur: "La géolocalisation n’est pas disponible sur cet appareil." }));
            return undefined;
        }

        const suivi = navigator.geolocation.watchPosition(
            (resultat) => setEtat({ position: [resultat.coords.latitude, resultat.coords.longitude], precision: resultat.coords.accuracy, erreur: null }),
            (raison) =>
                setEtat((ancien) => ({
                    ...ancien,
                    erreur: raison.code === 1 ? "Autorisez la localisation dans votre navigateur pour afficher votre position." : "Impossible de récupérer votre position pour le moment.",
                })),
            { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
        );

        return () => navigator.geolocation.clearWatch(suivi);
    }, [active]);

    return etat;
}

function Recentrer({ position }) {
    const carte = useMap();

    useEffect(() => {
        if (position) carte.flyTo(position, 16, { duration: 1.1 });
    }, [carte, position]);

    return null;
}

/** Carte OpenStreetMap centrée sur la position du livreur. */
export default function CarteLivreur({ position, precision, erreur, compact = false, className = "" }) {
    const echec = Boolean(erreur) && !position;

    return (
        <div className={["relative h-full min-h-[320px] overflow-hidden rounded-3xl border border-jse-theme-border bg-jse-theme-surface-soft", className].join(" ")}>
            <MapContainer center={position || CENTRE_PAR_DEFAUT} zoom={position ? 16 : 14} zoomControl={false} scrollWheelZoom={!compact} className="h-full min-h-[320px] w-full">
                <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <ZoomControl position="bottomright" />
                {position && (
                    <>
                        <Recentrer position={position} />
                        <Circle center={position} radius={precision || 25} pathOptions={{ color: "#F28C28", fillColor: "#F28C28", fillOpacity: 0.1, weight: 1 }} />
                        <Marker position={position} icon={livreurIcon}>
                            <Popup>
                                <strong>Votre position</strong>
                                <br />
                                Précision ± {Math.round(precision || 0)} m
                            </Popup>
                        </Marker>
                    </>
                )}
            </MapContainer>

            <div className="absolute left-3 top-3 z-[500] flex items-center gap-2 rounded-full border border-jse-theme-border bg-jse-theme-surface/95 px-3 py-2 text-sm font-medium text-jse-theme-text shadow-lg backdrop-blur" role="status">
                <MapPin size={15} className="text-jse-accent" aria-hidden="true" />
                {position ? `GPS actif · ± ${Math.round(precision || 0)} m` : echec ? "Position indisponible" : "Recherche de position…"}
            </div>

            {echec && (
                <div className="absolute inset-x-3 bottom-3 z-[500] flex items-start gap-3 rounded-2xl border border-jse-theme-border bg-jse-theme-surface/95 p-4 shadow-lg backdrop-blur">
                    <Navigation size={18} className="mt-0.5 shrink-0 text-jse-accent" aria-hidden="true" />
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-jse-theme-text">Localisation requise</p>
                        <p className="mt-0.5 text-sm text-jse-theme-muted">{erreur}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

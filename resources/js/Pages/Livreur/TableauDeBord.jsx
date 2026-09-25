import { router, usePage } from "@inertiajs/react";
import NavigationFlottante from "../../Composants/Navigation/NavigationFlottante";
import {
    ArrowLeft,
    Bike,
    Bell,
    Check,
    ChevronRight,
    Clock3,
    Home,
    MapPin,
    Navigation,
    Phone,
    Power,
    Receipt,
    Store,
    UserRound,
    WalletCards,
} from "lucide-react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, Circle, ZoomControl, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useState } from "react";

const formatMontant = (value) =>
    new Intl.NumberFormat("fr-FR").format(Number(value || 0)) + " FCFA";

const statutLabel = {
    en_attente: "Nouveau",
    attribuee: "Nouveau",
    en_cours: "En livraison",
    livree: "Livrée",
};

const initiales = (nom = "") =>
    nom
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((partie) => partie[0]?.toUpperCase())
        .join("") || "JL";

function TopBar({ livreur, onNotifications }) {
    const disponible = livreur?.disponibilite === "disponible";

    return (
        <header className="relative overflow-hidden bg-jse-principal px-5 pb-5 pt-5">
            <div className="absolute -right-20 -top-24 size-64 rounded-full bg-jse-secondaire/10 blur-3xl" />
            <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center overflow-hidden rounded-full bg-jse-fond text-jse-principal">
                        <UserRound size={24} />
                    </div>
                    <div>
                        <p className="text-[8px] font-semibold uppercase tracking-[0.22em] text-white/40">
                            JSE Express
                        </p>
                        <p className="mt-1 text-sm font-bold text-white">
                            {livreur?.nom || "JSE Livreur"}
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-[9px] text-white/55">
                            <span className={"size-1.5 rounded-full " + (disponible ? "bg-jse-secondaire" : "bg-white/25")} />
                            {disponible ? "En ligne" : "Hors ligne"}
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onNotifications}
                    className="relative flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white"
                >
                    <Bell size={18} />
                    <span className="absolute right-2 top-2 size-1.5 rounded-full bg-jse-accent" />
                </button>
            </div>
        </header>
    );
}

function Availability({ livreur, onToggle, loading }) {
    const disponible = livreur?.disponibilite === "disponible";

    return (
        <button
            type="button"
            disabled={loading}
            onClick={onToggle}
            className="mt-3 flex h-[54px] w-full items-center justify-between rounded-[17px] bg-jse-accent px-4 text-left text-jse-principal disabled:opacity-60"
        >
            <span className="text-xs font-bold">
                {disponible ? "En ligne" : "Hors ligne"}
            </span>
            <span className="flex size-9 items-center justify-center rounded-full bg-white text-jse-principal shadow-sm">
                <Power size={17} />
            </span>
        </button>
    );
}

function Stats({ statistiques, zone }) {
    return (
        <section className="rounded-[20px] bg-[#101719] px-3 py-4">
            <div className="grid grid-cols-3 divide-x divide-white/10 text-center">
                <div>
                    <p className="text-xl font-bold text-jse-accent">{statistiques.missions_du_jour || 0}</p>
                    <p className="mt-1 text-[8px] text-white/45">Livraisons</p>
                </div>
                <div>
                    <p className="text-xl font-bold text-jse-accent">{statistiques.missions_actives || 0}</p>
                    <p className="mt-1 text-[8px] text-white/45">Actives</p>
                </div>
                <div>
                    <p className="text-xl font-bold text-jse-accent">{zone?.nom || "—"}</p>
                    <p className="mt-1 text-[8px] text-white/45">Zone</p>
                </div>
            </div>
        </section>
    );
}

function MissionCard({ mission, onOpen }) {
    return (
        <button
            type="button"
            onClick={() => onOpen(mission)}
            className="w-full rounded-[21px] border border-white/8 bg-[#101719] p-3 text-left transition hover:border-jse-accent/40"
        >
            <div className="flex gap-3">
                <div className="flex size-[58px] shrink-0 items-center justify-center overflow-hidden rounded-[16px] bg-jse-principal">
                    {mission.articles?.[0]?.image ? (
                        <img src={mission.articles[0].image} alt="" className="size-full object-cover" />
                    ) : (
                        <Store size={23} className="text-jse-accent" />
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <p className="text-[8px] uppercase tracking-[0.13em] text-white/30">
                                #{mission.reference}
                            </p>
                            <p className="mt-1 truncate text-xs font-bold text-white">
                                {mission.restaurant?.nom || "Restaurant"}
                            </p>
                        </div>
                        <span className="rounded-full bg-jse-accent/15 px-2.5 py-1 text-[8px] font-semibold text-jse-accent">
                            {statutLabel[mission.statut_livraison] || "Mission"}
                        </span>
                    </div>

                    <div className="mt-2 flex items-center gap-1.5 text-[9px] text-white/45">
                        <MapPin size={12} className="text-jse-accent" />
                        {mission.zone || "Zone non définie"}
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                        <span className="text-[9px] text-white/35">
                            {mission.date_attribution || "—"}
                        </span>
                        <span className="flex items-center gap-1 text-[9px] font-bold text-jse-accent">
                            Voir la mission <ChevronRight size={12} />
                        </span>
                    </div>
                </div>
            </div>
        </button>
    );
}

function MissionDetail({ mission, onBack, onTake, loading, onNavigate }) {
    const enCours = mission.statut_livraison === "en_cours";
    const attribuee = ["attribuee", "en_attente"].includes(mission.statut_livraison);

    return (
        <div className="fixed inset-0 z-50 bg-[#070b0d] text-white">
            <div className="mx-auto h-full w-full max-w-[480px] overflow-y-auto px-4 pb-8">
                <div className="flex items-center justify-between py-4">
                    <button onClick={onBack} className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/5">
                        <ArrowLeft size={19} />
                    </button>
                    <div className="text-center">
                        <p className="text-[8px] uppercase tracking-[0.2em] text-white/35">Détail de la mission</p>
                        <p className="mt-1 text-xs font-bold">{mission.reference}</p>
                    </div>
                    <div className="size-10" />
                </div>

                <section className="animate-jse-rise rounded-[24px] border border-white/8 bg-[#101719] p-4 shadow-2xl shadow-black/20">
                    <div className="flex gap-3">
                        <div className="size-[64px] shrink-0 overflow-hidden rounded-[16px] bg-jse-principal">
                            {mission.articles?.[0]?.image ? (
                                <img src={mission.articles[0].image} alt="" className="size-full object-cover" />
                            ) : <div className="flex size-full items-center justify-center"><Store size={24} className="text-jse-accent" /></div>}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <p className="text-sm font-bold">{mission.restaurant?.nom || "Restaurant"}</p>
                                    <p className="mt-1 text-[9px] text-white/45">{mission.restaurant?.adresse || "Adresse non précisée"}</p>
                                </div>
                                {mission.restaurant?.telephone && (
                                    <a href={"tel:" + mission.restaurant.telephone} className="flex size-9 items-center justify-center rounded-full bg-jse-accent text-jse-principal">
                                        <Phone size={15} />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mt-3 rounded-[20px] border border-white/8 bg-[#101719] p-4">
                    <div className="flex items-stretch gap-3">
                        <div className="flex w-5 flex-col items-center">
                            <span className="mt-1 size-2.5 rounded-full bg-jse-accent" />
                            <span className="my-1 flex-1 border-l border-dashed border-white/15" />
                            <span className="size-2.5 rounded-full bg-jse-secondaire" />
                        </div>
                        <div className="flex-1 space-y-5">
                            <div>
                                <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-white/35">Retrait au restaurant</p>
                                <p className="mt-1 text-xs font-semibold">{mission.restaurant?.adresse || "—"}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-white/35">Livraison au client</p>
                                <p className="mt-1 text-xs font-semibold">{mission.adresse_livraison || "—"}</p>
                                <p className="mt-1 text-[9px] text-white/40">{mission.client?.nom || "Client"} · {mission.telephone_livraison || "—"}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mt-3 rounded-[20px] border border-white/8 bg-[#101719] p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-white/45">Commande</span>
                        <span className="text-xs font-bold text-jse-accent">{formatMontant(mission.montant_total)}</span>
                    </div>
                    <p className="mt-3 text-[9px] uppercase tracking-[0.12em] text-white/30">Articles à livrer ({mission.articles?.length || 0})</p>
                    <div className="mt-2 space-y-2">
                        {(mission.articles || []).map((article, index) => (
                            <div key={index} className="flex items-center gap-2 rounded-xl bg-white/[0.035] px-2 py-2">
                                <div className="size-9 overflow-hidden rounded-lg bg-jse-principal">
                                    {article.image && <img src={article.image} alt="" className="size-full object-cover" />}
                                </div>
                                <p className="min-w-0 flex-1 truncate text-[10px] font-semibold">{article.nom}</p>
                                <span className="text-[10px] text-white/45">x{article.quantite}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {attribuee && (
                    <button
                        type="button"
                        disabled={loading}
                        onClick={onTake}
                        className="mt-4 flex h-13 w-full items-center justify-center gap-2 rounded-full bg-jse-accent py-4 text-sm font-bold text-jse-principal disabled:opacity-50"
                    >
                        <Bike size={18} />
                        Accepter la mission
                    </button>
                )}

                {enCours && (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                        <button type="button" onClick={onNavigate} className="flex items-center justify-center gap-2 rounded-full bg-jse-accent py-3 text-xs font-bold text-jse-principal">
                            <Navigation size={16} /> Navigation
                        </button>
                        {mission.telephone_livraison && (
                            <a href={"tel:" + mission.telephone_livraison} className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 py-3 text-xs font-bold">
                                <Phone size={16} /> Appeler
                            </a>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}


const livreurIcon = L.divIcon({
    className: "jse-leaflet-marker",
    html: '<div style="width:52px;height:52px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#F28C28;border:4px solid #FFF7E8;box-shadow:0 0 0 10px rgba(242,140,40,.14),0 14px 32px rgba(0,0,0,.4)"><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#123C32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17h14"/><path d="M7 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M17 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="m9 13 2-5h4l2 5"/><path d="M11 8 9 6H7"/></svg></div>',
    iconSize: [52, 52],
    iconAnchor: [26, 26],
});

function usePositionLivreur(active = true) {
    const [position, setPosition] = useState(null);
    const [accuracy, setAccuracy] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!active || !("geolocation" in navigator)) {
            setError("La géolocalisation n’est pas disponible sur cet appareil.");
            return;
        }

        const watchId = navigator.geolocation.watchPosition(
            (result) => {
                setPosition([result.coords.latitude, result.coords.longitude]);
                setAccuracy(result.coords.accuracy);
                setError(null);
            },
            (reason) => {
                setError(
                    reason.code === 1
                        ? "Autorisez la localisation dans votre navigateur pour utiliser la navigation."
                        : "Impossible de récupérer votre position pour le moment.",
                );
            },
            {
                enableHighAccuracy: true,
                maximumAge: 5000,
                timeout: 15000,
            },
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, [active]);

    return { position, accuracy, error };
}

function RecentrerPosition({ position }) {
    const map = useMap();

    useEffect(() => {
        if (position) {
            map.flyTo(position, 16, { duration: 1.1 });
        }
    }, [map, position]);

    return null;
}

function CarteLeaflet({ compact = false, position, accuracy, error }) {

    if (error && !position) {
        return (
            <div className="relative flex h-full min-h-[360px] items-center justify-center overflow-hidden rounded-[28px] bg-[#0B1112] p-6">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(18,60,50,.75),transparent_65%)]" />
                <div className="relative max-w-xs text-center">
                    <div className="mx-auto flex size-16 items-center justify-center rounded-[22px] border border-jse-accent/20 bg-jse-accent/10 text-jse-accent">
                        <MapPin size={28} />
                    </div>
                    <p className="mt-5 text-sm font-bold text-white">Localisation requise</p>
                    <p className="mt-2 text-[10px] leading-5 text-white/45">{error}</p>
                    <p className="mt-4 text-[9px] leading-4 text-white/25">
                        La carte utilise la géolocalisation native du navigateur. Aucun emplacement fictif n’est utilisé.
                    </p>
                </div>
            </div>
        );
    }

    const center = position || [0, 0];

    return (
        <div className="relative h-full min-h-[360px] overflow-hidden rounded-[28px] border border-white/10 bg-[#0B1112]">
            <MapContainer
                center={center}
                zoom={position ? 16 : 2}
                zoomControl={false}
                scrollWheelZoom={!compact}
                className="h-full min-h-[360px] w-full"
            >
                <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <ZoomControl position="bottomright" />
                {position && (
                    <>
                        <RecentrerPosition position={position} />
                        <Circle
                            center={position}
                            radius={accuracy || 25}
                            pathOptions={{
                                color: "#F28C28",
                                fillColor: "#F28C28",
                                fillOpacity: 0.09,
                                weight: 1,
                            }}
                        />
                        <Marker position={position} icon={livreurIcon}>
                            <Popup>
                                <strong>Votre position</strong><br />
                                Précision ± {Math.round(accuracy || 0)} m
                            </Popup>
                        </Marker>
                    </>
                )}
            </MapContainer>

            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(7,11,13,.38),transparent_35%,transparent_62%,rgba(7,11,13,.72))]" />

            <div className="absolute left-4 right-4 top-4 z-[500] flex items-start justify-between">
                <div className="rounded-[18px] border border-white/10 bg-[#0B1112]/90 px-4 py-3 shadow-2xl backdrop-blur-xl">
                    <p className="text-[8px] font-semibold uppercase tracking-[.18em] text-white/35">Navigation</p>
                    <p className="mt-1 text-xs font-bold text-white">
                        {position ? "Position en direct" : "Recherche de position…"}
                    </p>
                </div>
                {position && (
                    <div className="flex size-11 items-center justify-center rounded-full border border-white/10 bg-[#0B1112]/90 text-jse-accent shadow-2xl backdrop-blur-xl">
                        <MapPin size={18} />
                    </div>
                )}
            </div>

            {position && (
                <div className="absolute bottom-4 left-4 right-4 z-[500] rounded-[22px] border border-white/10 bg-[#0B1112]/92 p-4 shadow-2xl backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-jse-accent text-jse-principal">
                            <Navigation size={17} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[9px] uppercase tracking-[.14em] text-white/35">Position actuelle</p>
                            <p className="mt-1 truncate text-xs font-semibold text-white">
                                GPS actif · ± {Math.round(accuracy || 0)} m
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function NavigationScreen({ mission, onBack, onArrive }) {
    const { position, accuracy } = usePositionLivreur(true);

    return (
        <div className="fixed inset-0 z-50 bg-[#070B0D] text-white">
            <div className="mx-auto flex h-full w-full max-w-[480px] flex-col">
                <header className="absolute left-0 right-0 top-0 z-[600] flex items-center justify-between px-4 py-4">
                    <button onClick={onBack} className="flex size-11 items-center justify-center rounded-full border border-white/10 bg-[#0B1112]/90 text-white shadow-2xl backdrop-blur-xl">
                        <ArrowLeft size={18} />
                    </button>
                    <div className="rounded-full border border-white/10 bg-[#0B1112]/90 px-4 py-2 shadow-2xl backdrop-blur-xl">
                        <p className="text-[8px] font-semibold uppercase tracking-[.18em] text-white/35">Navigation</p>
                    </div>
                    <div className="size-11" />
                </header>

                <div className="relative flex-1 overflow-hidden">
                    <CarteLeaflet position={position} accuracy={accuracy} error={null} />

                    <div className="pointer-events-none absolute left-4 right-4 top-[76px] z-[600] rounded-[22px] border border-white/10 bg-[#0B1112]/94 p-4 shadow-2xl backdrop-blur-xl">
                        <div className="flex items-center gap-3">
                            <div className="flex size-12 shrink-0 items-center justify-center rounded-[16px] bg-white text-jse-principal">
                                <Navigation size={25} fill="currentColor" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold leading-none">Navigation</p>
                                <p className="mt-1 text-[10px] text-white/45">
                                    {position ? "GPS actif · précision ± " + Math.round(accuracy || 0) + " m" : "Activation de la localisation…"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 z-[600] rounded-[25px] border border-white/10 bg-[#0B1112]/94 p-4 shadow-2xl backdrop-blur-xl">
                        <div className="flex items-center gap-3">
                            <div className="flex size-12 shrink-0 items-center justify-center rounded-[16px] bg-jse-accent text-jse-principal">
                                <Store size={21} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[8px] font-semibold uppercase tracking-[.16em] text-white/30">Prochaine étape</p>
                                <p className="mt-1 text-sm font-bold">Retrait au restaurant</p>
                                <p className="mt-1 truncate text-[9px] text-white/40">{mission.restaurant?.adresse || "Adresse non précisée"}</p>
                            </div>
                        </div>
                        <button onClick={onArrive} className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-jse-accent py-4 text-xs font-bold text-jse-principal">
                            <Check size={16} /> J’ai arrivé au restaurant
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PickupScreen({ mission, onBack, onStart }) {
    return (
        <div className="fixed inset-0 z-50 bg-[#070b0d] text-white">
            <div className="mx-auto h-full w-full max-w-[480px] overflow-y-auto px-4 pb-8">
                <header className="flex items-center gap-3 py-4">
                    <button onClick={onBack} className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/5"><ArrowLeft size={19} /></button>
                    <p className="text-sm font-bold">Retrait de la commande</p>
                </header>
                <section className="rounded-[20px] border border-white/8 bg-[#101719] p-3">
                    <p className="text-sm font-bold">{mission.restaurant?.nom || "Restaurant"}</p>
                    <p className="mt-1 text-[9px] text-white/45">{mission.restaurant?.adresse || "Adresse"}</p>
                    <div className="mt-4 space-y-2">
                        {(mission.articles || []).map((article, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <div className="size-9 overflow-hidden rounded-lg bg-jse-principal">{article.image && <img src={article.image} alt="" className="size-full object-cover" />}</div>
                                <span className="min-w-0 flex-1 truncate text-[10px]">{article.nom}</span>
                                <span className="text-[10px] text-white/45">x{article.quantite}</span>
                            </div>
                        ))}
                    </div>
                </section>
                <div className="mt-8 text-center">
                    <div className="mx-auto flex size-24 animate-jse-pop items-center justify-center rounded-full bg-jse-secondaire text-white shadow-[0_0_0_14px_rgba(69,185,119,.08),0_18px_50px_rgba(0,0,0,.28)]"><Check size={42} strokeWidth={2.5} /></div>
                    <p className="mt-5 text-base font-bold text-jse-secondaire">Commande prête au retrait</p>
                    <p className="mt-2 text-[10px] leading-5 text-white/45">Vérifiez que tous les articles sont bien présents avant de commencer la livraison.</p>
                </div>
                <button onClick={onStart} className="mt-8 w-full rounded-full bg-jse-accent py-4 text-xs font-bold text-jse-principal">
                    Commencer la livraison
                </button>
            </div>
        </div>
    );
}

function DeliveryScreen({ mission, onBack, onValidate, loading }) {
    const [pin, setPin] = useState("");
    const { position, accuracy, error } = usePositionLivreur(true);

    const submit = () => {
        if (pin.length === 6) onValidate(pin);
    };

    return (
        <div className="fixed inset-0 z-50 bg-[#070b0d] text-white">
            <div className="mx-auto h-full w-full max-w-[480px] overflow-y-auto px-4 pb-8">
                <header className="flex items-center gap-3 py-4">
                    <button onClick={onBack} className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/5"><ArrowLeft size={19} /></button>
                    <p className="text-sm font-bold">En livraison</p>
                </header>

                <section className="rounded-[20px] border border-white/8 bg-[#101719] p-4">
                    <p className="text-xs font-bold">{mission.client?.nom || "Client"}</p>
                    <p className="mt-1 text-[9px] text-white/45">{mission.adresse_livraison || "Adresse client"}</p>
                    <div className="mt-3 flex items-center gap-2 text-[10px] text-white/45"><Clock3 size={13} /> Livraison en cours</div>
                </section>

                <div className="relative mt-3 h-[310px]">
                    <CarteLeaflet compact position={position} accuracy={accuracy} error={error} />
                    <div className="pointer-events-none absolute left-4 top-4 z-[600] rounded-full border border-white/10 bg-[#0B1112]/90 px-3 py-2 text-[9px] font-semibold text-white shadow-xl backdrop-blur-xl">
                        {position ? "GPS actif · ± " + Math.round(accuracy || 0) + " m" : "Localisation…"}
                    </div>
                </div>

                <section className="mt-3 rounded-[20px] border border-jse-accent/20 bg-jse-accent/5 p-4">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-jse-accent">Confirmation de livraison</p>
                    <p className="mt-2 text-xs font-semibold">Demandez le code PIN au client</p>
                    <div className="mt-4 grid grid-cols-6 gap-2">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <input
                                key={index}
                                value={pin[index] || ""}
                                onChange={(event) => {
                                    const value = event.target.value.replace(/\D/g, "").slice(-1);
                                    if (!value) return;
                                    setPin((current) => (current.slice(0, index) + value + current.slice(index + 1)).slice(0, 6));
                                }}
                                inputMode="numeric"
                                maxLength={1}
                                className="h-12 rounded-xl border border-white/10 bg-[#0a0f11] text-center text-lg font-bold text-white outline-none focus:border-jse-accent"
                            />
                        ))}
                    </div>
                    <button disabled={loading || pin.length !== 6} onClick={submit} className="mt-4 w-full rounded-full bg-jse-accent py-4 text-xs font-bold text-jse-principal disabled:opacity-40">
                        Terminer la livraison
                    </button>
                </section>
            </div>
        </div>
    );
}

function SuccessScreen({ mission, onBack }) {
    return (
        <div className="fixed inset-0 z-50 bg-[#070b0d] text-white">
            <div className="mx-auto flex h-full w-full max-w-[480px] flex-col items-center justify-center px-5 text-center">
                <div className="relative animate-jse-pop">
                    <div className="absolute inset-0 animate-jse-pulse rounded-full bg-jse-secondaire/20" />
                    <div className="relative flex size-24 items-center justify-center rounded-full bg-jse-secondaire shadow-[0_0_60px_rgba(69,185,119,.25)]"><Check size={48} strokeWidth={2.5} /></div>
                </div>
                <p className="mt-7 animate-jse-rise font-against text-3xl">Livraison réussie !</p>
                <p className="mt-2 text-xs text-white/45">Commande #{mission.reference}</p>
                <div className="mt-8 w-full rounded-[22px] border border-white/8 bg-[#101719] p-5">
                    <p className="text-[9px] uppercase tracking-[0.14em] text-white/35">Commande clôturée</p>
                    <p className="mt-2 text-sm font-bold">{mission.restaurant?.nom || "Restaurant"} → {mission.client?.nom || "Client"}</p>
                </div>
                <button onClick={onBack} className="mt-5 w-full rounded-full border border-white/10 py-4 text-xs font-bold">Voir mes missions</button>
            </div>
        </div>
    );
}

function Gains({ statistiques, historique }) {
    return (
        <section>
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/35">Cette semaine</p>
            <h2 className="mt-1 font-against text-3xl">Mes gains</h2>
            <div className="mt-5 rounded-[22px] border border-white/8 bg-[#101719] p-5">
                <p className="text-[9px] text-white/40">Gains du livreur</p>
                <p className="mt-2 text-3xl font-bold text-jse-accent">Non défini</p>
                <p className="mt-2 text-[10px] leading-5 text-white/40">
                    Le MLD actuel ne contient pas encore de montant de rémunération du livreur. Aucun montant n’est donc inventé.
                </p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-[20px] bg-[#101719] p-4">
                    <p className="text-xl font-bold text-white">{statistiques.livraisons_terminees || 0}</p>
                    <p className="mt-1 text-[9px] text-white/40">Livraisons terminées</p>
                </div>
                <div className="rounded-[20px] bg-[#101719] p-4">
                    <p className="text-xl font-bold text-white">{historique.length}</p>
                    <p className="mt-1 text-[9px] text-white/40">Historique chargé</p>
                </div>
            </div>
        </section>
    );
}

function Profile({ livreur }) {
    return (
        <section>
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/35">Compte</p>
            <h2 className="mt-1 font-against text-3xl">Mon profil</h2>
            <div className="mt-5 rounded-[24px] border border-white/8 bg-[#101719] p-5">
                <div className="flex items-center gap-4">
                    <div className="flex size-16 items-center justify-center rounded-full bg-jse-accent text-lg font-bold text-jse-principal">{initiales(livreur?.nom)}</div>
                    <div>
                        <p className="text-base font-bold">{livreur?.nom || "JSE Livreur"}</p>
                        <p className="mt-1 text-[10px] text-white/45">{livreur?.telephone || "—"}</p>
                        <span className="mt-2 inline-flex rounded-full bg-jse-secondaire/15 px-2 py-1 text-[8px] font-semibold text-jse-secondaire">Livreur vérifié</span>
                    </div>
                </div>
                <div className="mt-6 space-y-2">
                    {[
                        ["Mes informations", livreur?.telephone || "—"],
                        ["Ma zone de desserte", livreur?.zone?.nom || "—"],
                        ["Matricule", livreur?.matricule || "—"],
                    ].map(([label, value]) => (
                        <div key={label} className="flex items-center justify-between rounded-2xl bg-white/[0.035] px-4 py-3">
                            <span className="text-[10px] text-white/45">{label}</span>
                            <span className="text-[10px] font-semibold">{value}</span>
                        </div>
                    ))}
                </div>
            </div>
            <button className="mt-3 w-full rounded-full border border-red-500/60 py-3 text-xs font-semibold text-red-400">Se déconnecter</button>
        </section>
    );
}

export default function TableauDeBord() {
    const {
        livreur,
        livraisons = [],
        historique = [],
        statistiques = {},
        flash = {},
    } = usePage().props;

    const [onglet, setOnglet] = useState("accueil");
    const [mission, setMission] = useState(null);
    const [ecran, setEcran] = useState(null);
    const [loading, setLoading] = useState(false);

    const active = useMemo(() => livraisons.filter((item) => item.statut_livraison !== "livree"), [livraisons]);

    const toggleDisponibilite = () => {
        setLoading(true);
        router.patch(
            "/livreur/disponibilite",
            { disponibilite: livreur?.disponibilite === "disponible" ? "indisponible" : "disponible" },
            { preserveScroll: true, onFinish: () => setLoading(false) },
        );
    };

    const takeMission = () => {
        setLoading(true);
        router.patch(
            "/livreur/livraisons/" + mission.attribution_id + "/prise-en-charge",
            {},
            {
                preserveScroll: true,
                onSuccess: () => setEcran("navigation"),
                onFinish: () => setLoading(false),
            },
        );
    };

    const validatePin = (pin) => {
        setLoading(true);
        router.post(
            "/livreur/livraisons/" + mission.attribution_id + "/valider-pin",
            { pin },
            {
                preserveScroll: true,
                onSuccess: () => setEcran("success"),
                onFinish: () => setLoading(false),
            },
        );
    };

    if (ecran === "navigation" && mission) {
        return <NavigationScreen mission={mission} onBack={() => setEcran(null)} onArrive={() => setEcran("pickup")} />;
    }

    if (ecran === "pickup" && mission) {
        return <PickupScreen mission={mission} onBack={() => setEcran("navigation")} onStart={() => setEcran("delivery")} />;
    }

    if (ecran === "delivery" && mission) {
        return <DeliveryScreen mission={mission} onBack={() => setEcran("pickup")} onValidate={validatePin} loading={loading} />;
    }

    if (ecran === "success" && mission) {
        return <SuccessScreen mission={mission} onBack={() => { setEcran(null); setMission(null); }} />;
    }

    return (
        <main className="min-h-screen bg-[#070b0d] pb-28 text-white">
            <div className="mx-auto w-full max-w-[480px]">
                <TopBar livreur={livreur} onNotifications={() => {}} />
                <div className="bg-jse-principal px-5 pb-5">
                    <Stats statistiques={statistiques} zone={livreur?.zone} />
                    <Availability livreur={livreur} onToggle={toggleDisponibilite} loading={loading} />
                </div>

                <div className="px-4 pt-7">
                    {flash?.success && (
                        <div className="mb-4 rounded-2xl border border-jse-secondaire/20 bg-jse-secondaire/10 px-4 py-3 text-[10px] font-semibold text-jse-secondaire">
                            {flash.success}
                        </div>
                    )}

                    {onglet === "accueil" && (
                        <>
                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/35">Aujourd’hui</p>
                                    <h2 className="mt-1 font-against text-3xl">Missions disponibles</h2>
                                </div>
                                <span className="text-[10px] font-bold text-jse-accent">Voir tout →</span>
                            </div>
                            <div className="mt-4 space-y-3">
                                {active.length ? active.map((item) => (
                                    <MissionCard key={item.attribution_id} mission={item} onOpen={(selected) => { setMission(selected); setEcran("detail"); }} />
                                )) : (
                                    <div className="rounded-[22px] border border-white/8 bg-[#101719] p-8 text-center">
                                        <Bike className="mx-auto text-white/20" size={28} />
                                        <p className="mt-3 text-sm font-semibold">Aucune mission disponible</p>
                                        <p className="mt-1 text-[10px] text-white/40">Les missions qui vous sont attribuées apparaîtront ici.</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {onglet === "missions" && (
                        <>
                            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/35">Suivi</p>
                            <h2 className="mt-1 font-against text-3xl">Mes missions</h2>
                            <div className="mt-4 space-y-3">
                                {livraisons.map((item) => <MissionCard key={item.attribution_id} mission={item} onOpen={(selected) => { setMission(selected); setEcran("detail"); }} />)}
                            </div>
                        </>
                    )}

                    {onglet === "carte" && (
                        <section>
                            <p className="text-[9px] font-semibold uppercase tracking-[.2em] text-white/30">Géolocalisation</p>
                            <h2 className="mt-1 font-against text-4xl">Ma carte</h2>
                            <div className="mt-4 h-[520px]">
                                <CarteLeaflet />
                            </div>
                        </section>
                    )}

                    {onglet === "gains" && <Gains statistiques={statistiques} historique={historique} />}
                    {onglet === "profil" && <Profile livreur={livreur} />}
                </div>

                <NavigationFlottante type="livreur" actif={onglet} onChange={setOnglet} />
            </div>

            {mission && ecran === "detail" && (
                <MissionDetail
                    mission={mission}
                    onBack={() => { setMission(null); setEcran(null); }}
                    onTake={takeMission}
                    loading={loading}
                    onNavigate={() => setEcran("navigation")}
                />
            )}
        </main>
    );
}

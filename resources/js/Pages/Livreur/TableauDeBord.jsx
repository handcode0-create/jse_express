import { router, usePage } from "@inertiajs/react";
import {
    ArrowLeft,
    Bike,
    Check,
    ChevronRight,
    Clock3,
    MapPin,
    Navigation,
    Phone,
    Power,
    Store,
    UserRound,
    X,
} from "lucide-react";
import { useMemo, useState } from "react";

const formatMontant = (value) =>
    new Intl.NumberFormat("fr-FR").format(Number(value || 0)) + " FCFA";

const statutLabel = {
    en_attente: "En attente",
    attribuee: "Nouvelle",
    en_cours: "En livraison",
    livree: "Livrée",
};

const initiales = (nom = "") =>
    nom
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((partie) => partie[0]?.toUpperCase())
        .join("") || "L";

function Pill({ children, active = false }) {
    return (
        <span
            className={
                "inline-flex items-center rounded-full px-3 py-1.5 text-[10px] font-semibold " +
                (active
                    ? "bg-jse-secondaire text-jse-principal"
                    : "bg-white/10 text-white/70")
            }
        >
            {children}
        </span>
    );
}

function SectionTitle({ eyebrow, title, action }) {
    return (
        <div className="flex items-end justify-between gap-4">
            <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/35">
                    {eyebrow}
                </p>
                <h2 className="mt-1 font-against text-[1.65rem] leading-none text-white sm:text-[1.9rem]">
                    {title}
                </h2>
            </div>
            {action}
        </div>
    );
}

function MissionCard({ mission, onOpen }) {
    const nouvelle = mission.statut_livraison === "attribuee";
    const enCours = mission.statut_livraison === "en_cours";

    return (
        <button
            type="button"
            onClick={() => onOpen(mission)}
            className="w-full rounded-[24px] border border-white/8 bg-[#11171a] p-3 text-left shadow-[0_14px_40px_rgba(0,0,0,.16)] transition hover:border-jse-accent/40"
        >
            <div className="flex gap-3">
                <div className="flex size-16 shrink-0 items-center justify-center rounded-[18px] bg-jse-principal text-jse-secondaire">
                    {enCours ? <Navigation size={24} /> : <Store size={24} />}
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <p className="text-[9px] uppercase tracking-[0.12em] text-white/35">
                                #{mission.reference}
                            </p>
                            <h3 className="mt-1 truncate text-sm font-bold text-white">
                                {mission.restaurant?.nom || "Restaurant"}
                            </h3>
                        </div>
                        <Pill active={nouvelle}>
                            {statutLabel[mission.statut_livraison] ||
                                "Assignée"}
                        </Pill>
                    </div>

                    <div className="mt-2 flex items-center gap-1.5 text-[10px] text-white/50">
                        <MapPin size={13} className="text-jse-accent" />
                        <span className="truncate">
                            {mission.zone || "Zone non définie"}
                        </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                        <span className="text-[10px] text-white/45">
                            {mission.date_attribution || "Attribution récente"}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-jse-accent">
                            Voir la mission <ChevronRight size={13} />
                        </span>
                    </div>
                </div>
            </div>
        </button>
    );
}

function MissionDetails({ mission, onClose }) {
    const [chargement, setChargement] = useState(false);
    const [pin, setPin] = useState("");

    const prendreEnCharge = () => {
        setChargement(true);
        router.patch(
            "/livreur/livraisons/" + mission.attribution_id + "/prise-en-charge",
            {},
            {
                preserveScroll: true,
                onFinish: () => setChargement(false),
            },
        );
    };

    const validerPin = () => {
        if (pin.length !== 6) return;

        setChargement(true);
        router.post(
            "/livreur/livraisons/" + mission.attribution_id + "/valider-pin",
            { pin },
            {
                preserveScroll: true,
                onFinish: () => setChargement(false),
            },
        );
    };

    const enCours = mission.statut_livraison === "en_cours";
    const attribuee = mission.statut_livraison === "attribuee";

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#070b0d]/95 px-4 py-5 backdrop-blur-xl">
            <div className="mx-auto min-h-full w-full max-w-[520px]">
                <header className="flex items-center justify-between">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex size-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="text-center">
                        <p className="text-[8px] uppercase tracking-[0.2em] text-white/35">
                            Détail de la mission
                        </p>
                        <p className="mt-1 text-sm font-bold text-white">
                            #{mission.reference}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex size-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50"
                    >
                        <X size={18} />
                    </button>
                </header>

                <section className="mt-5 rounded-[28px] border border-white/8 bg-[#101719] p-4">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <Pill active={attribuee}>
                                {statutLabel[mission.statut_livraison] ||
                                    "Mission"}
                            </Pill>
                            <h1 className="mt-3 font-against text-[2rem] leading-none text-white">
                                {mission.restaurant?.nom || "Restaurant"}
                            </h1>
                            <p className="mt-2 text-xs text-white/45">
                                {mission.restaurant?.adresse ||
                                    "Adresse du restaurant non précisée"}
                            </p>
                        </div>
                        {mission.restaurant?.telephone && (
                            <a
                                href={"tel:" + mission.restaurant.telephone}
                                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-jse-accent text-jse-principal"
                            >
                                <Phone size={18} />
                            </a>
                        )}
                    </div>
                </section>

                <section className="mt-3 rounded-[26px] border border-white/8 bg-[#101719] p-4">
                    <div className="flex gap-4">
                        <div className="flex w-1 flex-col items-center">
                            <span className="mt-1 size-2.5 rounded-full bg-jse-accent" />
                            <span className="my-1 flex-1 border-l border-dashed border-white/15" />
                            <span className="size-2.5 rounded-full bg-jse-secondaire" />
                        </div>
                        <div className="flex-1 space-y-5">
                            <div>
                                <p className="text-[9px] uppercase tracking-[0.14em] text-white/35">
                                    Retrait au restaurant
                                </p>
                                <p className="mt-1 text-sm font-semibold text-white">
                                    {mission.restaurant?.adresse || "—"}
                                </p>
                                <p className="mt-1 text-[10px] text-white/45">
                                    {mission.zone || "Zone non définie"}
                                </p>
                            </div>
                            <div>
                                <p className="text-[9px] uppercase tracking-[0.14em] text-white/35">
                                    Livraison au client
                                </p>
                                <p className="mt-1 text-sm font-semibold text-white">
                                    {mission.adresse_livraison || "—"}
                                </p>
                                <p className="mt-1 text-[10px] text-white/45">
                                    {mission.client?.nom || "Client"} ·{" "}
                                    {mission.telephone_livraison || "—"}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mt-3 rounded-[26px] border border-white/8 bg-[#101719] p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-white/45">
                            Montant de la commande
                        </span>
                        <strong className="text-sm text-jse-accent">
                            {formatMontant(mission.montant_total)}
                        </strong>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-white/8 pt-3">
                        <span className="text-xs text-white/45">Client</span>
                        <span className="text-xs font-semibold text-white">
                            {mission.client?.nom || "Client"}
                        </span>
                    </div>
                </section>

                {enCours && (
                    <section className="mt-3 rounded-[26px] border border-jse-accent/20 bg-jse-accent/5 p-4">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-jse-accent">
                            Confirmation de livraison
                        </p>
                        <p className="mt-2 text-sm font-semibold text-white">
                            Demandez le code PIN au client
                        </p>
                        <div className="mt-4 grid grid-cols-6 gap-2">
                            {[0, 1, 2, 3, 4, 5].map((index) => (
                                <input
                                    key={index}
                                    value={pin[index] || ""}
                                    onChange={(event) => {
                                        const valeur =
                                            event.target.value.replace(
                                                /\D/g,
                                                "",
                                            );
                                        if (!valeur) return;
                                        const nouveauPin =
                                            pin.slice(0, index) +
                                            valeur.slice(-1) +
                                            pin.slice(index + 1);
                                        setPin(nouveauPin.slice(0, 6));
                                    }}
                                    inputMode="numeric"
                                    maxLength={1}
                                    className="h-12 w-full rounded-xl border border-white/10 bg-[#0a0f11] text-center text-lg font-bold text-white outline-none focus:border-jse-accent"
                                />
                            ))}
                        </div>
                        <button
                            type="button"
                            disabled={chargement || pin.length !== 6}
                            onClick={validerPin}
                            className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-jse-accent text-sm font-bold text-jse-principal disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <Check size={18} />
                            Terminer la livraison
                        </button>
                    </section>
                )}

                {attribuee && (
                    <button
                        type="button"
                        disabled={chargement}
                        onClick={prendreEnCharge}
                        className="mt-4 flex h-13 w-full items-center justify-center gap-2 rounded-full bg-jse-accent py-4 text-sm font-bold text-jse-principal shadow-[0_10px_30px_rgba(242,140,40,.18)] disabled:opacity-50"
                    >
                        <Bike size={18} />
                        Prendre en charge
                    </button>
                )}
            </div>
        </div>
    );
}

export default function TableauDeBord() {
    const {
        livreur,
        livraisons = [],
        statistiques = {},
        flash = {},
    } = usePage().props;

    const [chargement, setChargement] = useState(false);
    const [missionSelectionnee, setMissionSelectionnee] = useState(null);
    const [onglet, setOnglet] = useState("accueil");

    const disponible = livreur?.disponibilite === "disponible";

    const missions = useMemo(
        () => livraisons.filter((mission) => mission.statut_livraison !== "livree"),
        [livraisons],
    );

    const changerDisponibilite = () => {
        setChargement(true);
        router.patch(
            "/livreur/disponibilite",
            {
                disponibilite: disponible
                    ? "indisponible"
                    : "disponible",
            },
            {
                preserveScroll: true,
                onFinish: () => setChargement(false),
            },
        );
    };

    return (
        <main className="min-h-screen bg-[#070b0d] pb-28 text-white">
            <div className="mx-auto w-full max-w-[560px]">
                <header className="relative overflow-hidden bg-jse-principal px-5 pb-6 pt-7">
                    <div className="absolute -right-16 -top-20 size-52 rounded-full bg-jse-accent/15 blur-3xl" />
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex size-12 items-center justify-center rounded-full bg-jse-fond text-jse-principal">
                                <UserRound size={23} />
                            </div>
                            <div>
                                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/45">
                                    JSE Express
                                </p>
                                <h1 className="mt-1 text-base font-bold">
                                    {livreur?.nom || "Livreur"}
                                </h1>
                                <p className="mt-1 flex items-center gap-1 text-[9px] text-white/50">
                                    <span
                                        className={
                                            "size-1.5 rounded-full " +
                                            (disponible
                                                ? "bg-jse-secondaire"
                                                : "bg-white/25")
                                        }
                                    />
                                    {disponible ? "En ligne" : "Hors ligne"}
                                </p>
                            </div>
                        </div>
                        <div className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/5">
                            <Bike size={19} />
                        </div>
                    </div>

                    <div className="mt-5 rounded-[22px] border border-white/8 bg-[#101719]/80 p-4 backdrop-blur-xl">
                        <div className="grid grid-cols-3 divide-x divide-white/10 text-center">
                            <div>
                                <p className="text-xl font-bold text-jse-accent">
                                    {statistiques.missions_actives || 0}
                                </p>
                                <p className="mt-1 text-[8px] text-white/45">
                                    Missions actives
                                </p>
                            </div>
                            <div>
                                <p className="text-xl font-bold text-jse-accent">
                                    {statistiques.missions_du_jour || 0}
                                </p>
                                <p className="mt-1 text-[8px] text-white/45">
                                    Aujourd'hui
                                </p>
                            </div>
                            <div>
                                <p className="text-xl font-bold text-jse-accent">
                                    {livreur?.zone?.nom || "—"}
                                </p>
                                <p className="mt-1 text-[8px] text-white/45">
                                    Zone
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        disabled={chargement}
                        onClick={changerDisponibilite}
                        className="mt-3 flex w-full items-center justify-between rounded-[18px] bg-jse-accent px-4 py-3 text-left text-jse-principal disabled:opacity-50"
                    >
                        <span className="text-xs font-bold">
                            {disponible
                                ? "Vous êtes en ligne"
                                : "Passer en ligne"}
                        </span>
                        <span className="flex size-8 items-center justify-center rounded-full bg-white/90">
                            <Power size={16} />
                        </span>
                    </button>
                </header>

                {flash?.success && (
                    <div className="mx-4 mt-3 rounded-2xl border border-jse-secondaire/20 bg-jse-secondaire/10 px-4 py-3 text-xs font-semibold text-jse-secondaire">
                        {flash.success}
                    </div>
                )}

                <div className="px-4 pt-6">
                    {onglet === "accueil" && (
                        <>
                            <SectionTitle
                                eyebrow="Missions disponibles"
                                title="Mes missions"
                                action={
                                    <span className="rounded-full bg-white/5 px-3 py-2 text-[9px] font-semibold text-white/60">
                                        {missions.length}
                                    </span>
                                }
                            />

                            <div className="mt-4 space-y-3">
                                {missions.length === 0 ? (
                                    <div className="rounded-[26px] border border-white/8 bg-[#101719] p-8 text-center">
                                        <Bike
                                            className="mx-auto text-white/20"
                                            size={30}
                                        />
                                        <p className="mt-3 text-sm font-semibold">
                                            Aucune mission active
                                        </p>
                                        <p className="mt-1 text-[11px] text-white/40">
                                            Les missions attribuées à votre
                                            profil apparaîtront ici.
                                        </p>
                                    </div>
                                ) : (
                                    missions.map((mission) => (
                                        <MissionCard
                                            key={mission.attribution_id}
                                            mission={mission}
                                            onOpen={setMissionSelectionnee}
                                        />
                                    ))
                                )}
                            </div>
                        </>
                    )}

                    {onglet === "missions" && (
                        <>
                            <SectionTitle
                                eyebrow="Suivi"
                                title="Toutes mes missions"
                            />
                            <div className="mt-4 space-y-3">
                                {livraisons.map((mission) => (
                                    <MissionCard
                                        key={mission.attribution_id}
                                        mission={mission}
                                        onOpen={setMissionSelectionnee}
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    {onglet === "profil" && (
                        <section className="rounded-[28px] border border-white/8 bg-[#101719] p-5">
                            <div className="flex items-center gap-4">
                                <div className="flex size-16 items-center justify-center rounded-full bg-jse-accent text-xl font-bold text-jse-principal">
                                    {initiales(livreur?.nom)}
                                </div>
                                <div>
                                    <p className="text-lg font-bold">
                                        {livreur?.nom || "Livreur"}
                                    </p>
                                    <p className="mt-1 text-xs text-white/45">
                                        Matricule {livreur?.matricule || "—"}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 space-y-2">
                                <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                                    <span className="text-xs text-white/45">
                                        Téléphone
                                    </span>
                                    <span className="text-xs font-semibold">
                                        {livreur?.telephone || "—"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                                    <span className="text-xs text-white/45">
                                        Zone de desserte
                                    </span>
                                    <span className="text-xs font-semibold">
                                        {livreur?.zone?.nom || "—"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                                    <span className="text-xs text-white/45">
                                        Disponibilité
                                    </span>
                                    <span className="text-xs font-semibold text-jse-secondaire">
                                        {disponible
                                            ? "Disponible"
                                            : "Indisponible"}
                                    </span>
                                </div>
                            </div>
                        </section>
                    )}
                </div>

                <nav className="fixed bottom-4 left-1/2 z-40 flex h-[68px] w-[calc(100%-24px)] max-w-[536px] -translate-x-1/2 items-center justify-around rounded-[34px] border border-white/10 bg-[#101719]/95 px-2 shadow-[0_20px_60px_rgba(0,0,0,.45)] backdrop-blur-2xl">
                    {[
                        { id: "accueil", label: "Accueil", icon: Bike },
                        { id: "missions", label: "Missions", icon: Store },
                        { id: "profil", label: "Profil", icon: UserRound },
                    ].map(({ id, label, icon: Icon }) => {
                        const active = onglet === id;
                        return (
                            <button
                                key={id}
                                type="button"
                                onClick={() => setOnglet(id)}
                                className={
                                    "flex items-center gap-2 rounded-full px-4 py-3 transition " +
                                    (active
                                        ? "bg-jse-accent text-jse-principal"
                                        : "text-white/45")
                                }
                            >
                                <Icon size={18} />
                                {active && (
                                    <span className="text-[10px] font-bold">
                                        {label}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {missionSelectionnee && (
                <MissionDetails
                    mission={missionSelectionnee}
                    onClose={() => setMissionSelectionnee(null)}
                />
            )}
        </main>
    );
}

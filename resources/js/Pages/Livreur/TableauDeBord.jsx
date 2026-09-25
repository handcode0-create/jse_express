import { router, usePage } from "@inertiajs/react";
import {
    Bike,
    Check,
    ChevronRight,
    Clock3,
    MapPin,
    Navigation,
    Phone,
    Power,
    ShieldCheck,
    Store,
    UserRound,
} from "lucide-react";
import { useMemo, useState } from "react";

const formatMontant = (value) =>
    new Intl.NumberFormat("fr-FR").format(Number(value || 0)) + " FCFA";

const statutLivraison = {
    en_attente: "En attente",
    attribuee: "Assignée",
    en_cours: "En cours",
    livree: "Livrée",
};

export default function TableauDeBord() {
    const {
        livreur,
        livraisons = [],
        statistiques = {},
        flash = {},
    } = usePage().props;

    const [chargement, setChargement] = useState(false);
    const [missionActive, setMissionActive] = useState(null);
    const [pin, setPin] = useState("");

    const missionsEnCours = useMemo(
        () => livraisons.filter((mission) => mission.statut_livraison === "en_cours"),
        [livraisons],
    );

    const changerDisponibilite = () => {
        setChargement(true);

        router.patch(
            "/livreur/disponibilite",
            {
                disponibilite:
                    livreur?.disponibilite === "disponible"
                        ? "indisponible"
                        : "disponible",
            },
            {
                preserveScroll: true,
                onFinish: () => setChargement(false),
            },
        );
    };

    const prendreEnCharge = (mission) => {
        setChargement(true);

        router.patch(
            `/livreur/livraisons/${mission.attribution_id}/prise-en-charge`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setChargement(false),
            },
        );
    };

    const validerPin = (mission) => {
        if (!/^\d{6}$/.test(pin)) return;

        setChargement(true);

        router.post(
            `/livreur/livraisons/${mission.attribution_id}/valider-pin`,
            { pin },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setPin("");
                    setMissionActive(null);
                },
                onFinish: () => setChargement(false),
            },
        );
    };

    return (
        <main className="min-h-screen bg-jse-fond pb-32 text-jse-texte">
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
                <header className="relative overflow-hidden rounded-b-[34px] bg-jse-principal px-5 pb-7 pt-6 text-white shadow-xl shadow-jse-principal/10 sm:mt-5 sm:rounded-[34px] sm:px-7">
                    <div className="absolute -right-20 -top-24 size-64 rounded-full bg-jse-secondaire/20 blur-3xl" />
                    <div className="absolute -bottom-24 left-1/3 size-52 rounded-full bg-jse-accent/10 blur-3xl" />

                    <div className="relative flex items-start justify-between gap-5">
                        <div className="min-w-0">
                            <p className="font-sans text-[9px] font-bold uppercase tracking-[0.2em] text-jse-secondaire">
                                Espace livreur
                            </p>
                            <h1 className="mt-2 truncate font-against text-[2.1rem] leading-none sm:text-4xl">
                                Bonjour, {livreur?.nom || "Livreur"}
                            </h1>
                            <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] text-white/55">
                                <span className="rounded-full bg-white/10 px-3 py-1.5">
                                    {livreur?.matricule || "Matricule —"}
                                </span>
                                <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5">
                                    <MapPin size={12} />
                                    {livreur?.zone?.nom || "Zone non définie"}
                                </span>
                            </div>
                        </div>

                        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10">
                            <Bike size={22} />
                        </div>
                    </div>

                    <button
                        type="button"
                        disabled={chargement}
                        onClick={changerDisponibilite}
                        className="relative mt-6 flex w-full items-center justify-between rounded-[22px] bg-white/10 p-3.5 text-left backdrop-blur-xl ring-1 ring-white/10 transition hover:bg-white/15 disabled:opacity-50"
                    >
                        <span className="flex items-center gap-3">
                            <span
                                className={`flex size-10 items-center justify-center rounded-full ${
                                    livreur?.disponibilite === "disponible"
                                        ? "bg-jse-secondaire text-white"
                                        : "bg-white/10 text-white/60"
                                }`}
                            >
                                <Power size={17} />
                            </span>
                            <span>
                                <span className="block text-[9px] font-semibold uppercase tracking-[0.12em] text-white/40">
                                    Disponibilité
                                </span>
                                <span className="mt-1 block text-xs font-semibold">
                                    {livreur?.disponibilite === "disponible"
                                        ? "Disponible pour les missions"
                                        : "Indisponible"}
                                </span>
                            </span>
                        </span>
                        <span className="text-[10px] font-semibold text-white/50">
                            Modifier
                        </span>
                    </button>
                </header>

                {flash?.success && (
                    <div className="mt-4 rounded-2xl bg-jse-secondaire/10 px-4 py-3 text-xs font-semibold text-jse-principal">
                        {flash.success}
                    </div>
                )}

                <section className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div className="rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-jse-texte/5">
                        <div className="flex size-9 items-center justify-center rounded-xl bg-jse-principal/5 text-jse-principal">
                            <Bike size={17} />
                        </div>
                        <p className="mt-4 text-2xl font-bold text-jse-principal">
                            {statistiques.missions_actives || 0}
                        </p>
                        <p className="mt-1 text-[10px] text-jse-texte/45">
                            Missions actives
                        </p>
                    </div>

                    <div className="rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-jse-texte/5">
                        <div className="flex size-9 items-center justify-center rounded-xl bg-jse-secondaire/10 text-jse-secondaire">
                            <Clock3 size={17} />
                        </div>
                        <p className="mt-4 text-2xl font-bold text-jse-principal">
                            {statistiques.missions_du_jour || 0}
                        </p>
                        <p className="mt-1 text-[10px] text-jse-texte/45">
                            Attributions aujourd’hui
                        </p>
                    </div>

                    <div className="col-span-2 rounded-[24px] bg-jse-principal p-4 text-white shadow-sm sm:col-span-1">
                        <div className="flex size-9 items-center justify-center rounded-xl bg-white/10">
                            <ShieldCheck size={17} />
                        </div>
                        <p className="mt-4 text-sm font-semibold">
                            PIN sécurisé
                        </p>
                        <p className="mt-1 text-[10px] text-white/50">
                            Validation requise à la remise.
                        </p>
                    </div>
                </section>

                {missionsEnCours.length > 0 && (
                    <section className="mt-6 rounded-[28px] bg-jse-principal p-5 text-white shadow-xl shadow-jse-principal/10 sm:p-6">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-jse-secondaire">
                                    Livraison en cours
                                </p>
                                <h2 className="mt-1 font-against text-2xl">
                                    Mission active
                                </h2>
                            </div>
                            <Navigation size={22} className="text-jse-secondaire" />
                        </div>

                        {missionsEnCours.slice(0, 1).map((mission) => (
                            <div
                                key={mission.id}
                                className="mt-5 rounded-[22px] bg-white/10 p-4 ring-1 ring-white/10"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/40">
                                            #{mission.reference}
                                        </p>
                                        <p className="mt-1 text-sm font-bold">
                                            {mission.client?.nom || "Client"}
                                        </p>
                                    </div>
                                    <span className="rounded-full bg-jse-secondaire/20 px-3 py-1.5 text-[9px] font-bold text-jse-secondaire">
                                        En cours
                                    </span>
                                </div>

                                <div className="mt-4 rounded-[18px] bg-black/10 p-3">
                                    <div className="flex items-start gap-2">
                                        <MapPin size={16} className="mt-0.5 shrink-0 text-jse-secondaire" />
                                        <div>
                                            <p className="text-[9px] uppercase tracking-[0.1em] text-white/40">
                                                Adresse de livraison
                                            </p>
                                            <p className="mt-1 text-xs font-semibold">
                                                {mission.adresse_livraison || "Adresse non précisée"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setMissionActive(mission)}
                                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-[18px] bg-jse-accent px-4 py-3 text-xs font-bold text-jse-principal"
                                >
                                    Valider la remise
                                    <ChevronRight size={15} />
                                </button>
                            </div>
                        ))}
                    </section>
                )}

                <section className="mt-7">
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-jse-texte/35">
                                Missions
                            </p>
                            <h2 className="mt-1 font-against text-[1.8rem] leading-none text-jse-principal sm:text-2xl">
                                Livraisons assignées
                            </h2>
                        </div>
                        <span className="rounded-full bg-white px-3 py-2 text-[10px] font-bold text-jse-principal ring-1 ring-jse-texte/5">
                            {livraisons.length}
                        </span>
                    </div>

                    <div className="mt-4 space-y-3">
                        {livraisons.length === 0 ? (
                            <div className="rounded-[28px] bg-white p-9 text-center shadow-sm ring-1 ring-jse-texte/5">
                                <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-jse-principal/5 text-jse-principal">
                                    <Bike size={25} />
                                </div>
                                <p className="mt-4 text-sm font-bold text-jse-principal">
                                    Aucune mission assignée
                                </p>
                                <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-jse-texte/45">
                                    Les livraisons qui vous sont attribuées apparaîtront ici.
                                </p>
                            </div>
                        ) : (
                            livraisons.map((mission) => (
                                <article
                                    key={mission.id}
                                    className="overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-jse-texte/5"
                                >
                                    <div className="p-5 sm:p-6">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0">
                                                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-jse-texte/35">
                                                    #{mission.reference}
                                                </p>
                                                <h3 className="mt-1 truncate text-sm font-bold text-jse-principal">
                                                    {mission.restaurant?.nom || "Restaurant"}
                                                </h3>
                                                <p className="mt-1 flex items-center gap-1 text-[10px] text-jse-texte/45">
                                                    <MapPin size={11} />
                                                    {mission.zone || "Zone non précisée"}
                                                </p>
                                            </div>
                                            <span className="shrink-0 rounded-full bg-jse-secondaire/10 px-3 py-1.5 text-[9px] font-bold text-jse-secondaire">
                                                {statutLivraison[mission.statut_livraison] || "Assignée"}
                                            </span>
                                        </div>

                                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                            <div className="rounded-[20px] bg-jse-fond p-4">
                                                <div className="flex items-start gap-2.5">
                                                    <Store size={16} className="mt-0.5 shrink-0 text-jse-principal" />
                                                    <div className="min-w-0">
                                                        <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-jse-texte/35">
                                                            Retrait
                                                        </p>
                                                        <p className="mt-1 text-xs font-bold text-jse-principal">
                                                            {mission.restaurant?.adresse || "Adresse non précisée"}
                                                        </p>
                                                        {mission.restaurant?.telephone && (
                                                            <a
                                                                href={`tel:${mission.restaurant.telephone}`}
                                                                className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-jse-secondaire"
                                                            >
                                                                <Phone size={11} />
                                                                Appeler
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="rounded-[20px] bg-jse-fond p-4">
                                                <div className="flex items-start gap-2.5">
                                                    <MapPin size={16} className="mt-0.5 shrink-0 text-jse-secondaire" />
                                                    <div className="min-w-0">
                                                        <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-jse-texte/35">
                                                            Livraison
                                                        </p>
                                                        <p className="mt-1 text-xs font-bold text-jse-principal">
                                                            {mission.adresse_livraison || "Adresse non précisée"}
                                                        </p>
                                                        {mission.telephone_livraison && (
                                                            <a
                                                                href={`tel:${mission.telephone_livraison}`}
                                                                className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-jse-secondaire"
                                                            >
                                                                <Phone size={11} />
                                                                Appeler le client
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex items-center justify-between gap-3 border-t border-jse-texte/8 pt-4">
                                            <div className="min-w-0">
                                                <p className="text-[9px] uppercase tracking-[0.1em] text-jse-texte/35">
                                                    Client
                                                </p>
                                                <div className="mt-1 flex items-center gap-2">
                                                    <span className="flex size-8 items-center justify-center rounded-full bg-jse-principal/5 text-jse-principal">
                                                        <UserRound size={14} />
                                                    </span>
                                                    <div className="min-w-0">
                                                        <p className="truncate text-xs font-bold text-jse-principal">
                                                            {mission.client?.nom || "Client"}
                                                        </p>
                                                        <p className="text-[10px] text-jse-texte/40">
                                                            {mission.telephone_livraison || mission.client?.telephone || "Téléphone non précisé"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {mission.statut_livraison !== "en_cours" && (
                                                <button
                                                    type="button"
                                                    disabled={chargement || mission.statut_livraison === "livree"}
                                                    onClick={() => prendreEnCharge(mission)}
                                                    className="shrink-0 rounded-full bg-jse-principal px-4 py-3 text-[10px] font-bold text-white transition hover:bg-jse-principal/90 disabled:opacity-50"
                                                >
                                                    Prendre en charge
                                                </button>
                                            )}
                                        </div>

                                        {mission.statut_livraison === "en_cours" && (
                                            <div className="mt-4 flex items-center gap-2 rounded-[18px] bg-jse-secondaire/10 px-4 py-3">
                                                <Check size={16} className="text-jse-secondaire" />
                                                <p className="text-[10px] font-semibold text-jse-principal">
                                                    Livraison en cours — le PIN sera demandé à la remise.
                                                </p>
                                            </div>
                                        )}

                                        {mission.montant_total !== undefined && (
                                            <div className="mt-4 flex items-center justify-between rounded-[18px] bg-jse-fond px-4 py-3">
                                                <span className="text-[10px] text-jse-texte/45">Commande</span>
                                                <span className="text-xs font-bold text-jse-principal">
                                                    {formatMontant(mission.montant_total)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </article>
                            ))
                        )}
                    </div>
                </section>

                <nav className="fixed bottom-4 left-1/2 z-40 flex h-[68px] w-[calc(100%-32px)] max-w-md -translate-x-1/2 items-center justify-around rounded-[34px] bg-[#101215]/90 px-2 shadow-2xl backdrop-blur-2xl ring-1 ring-white/10">
                    <button
                        type="button"
                        className="flex h-12 items-center gap-2 rounded-full bg-jse-accent px-5 text-jse-principal shadow-lg"
                    >
                        <Bike size={18} />
                        <span className="text-[10px] font-bold">Missions</span>
                    </button>
                    <button
                        type="button"
                        onClick={changerDisponibilite}
                        disabled={chargement}
                        className="flex size-12 items-center justify-center rounded-full text-white/60 transition hover:text-white disabled:opacity-50"
                    >
                        <Power size={18} />
                    </button>
                    <button
                        type="button"
                        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                        className="flex size-12 items-center justify-center rounded-full text-white/60 transition hover:text-white"
                    >
                        <UserRound size={18} />
                    </button>
                </nav>
            </div>

            {missionActive && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-jse-principal/45 p-4 backdrop-blur-sm sm:items-center">
                    <div className="w-full max-w-md rounded-[30px] bg-jse-fond p-5 shadow-2xl sm:p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-jse-secondaire">
                                    Validation
                                </p>
                                <h2 className="mt-1 font-against text-2xl text-jse-principal">
                                    Code de livraison
                                </h2>
                                <p className="mt-2 text-xs leading-5 text-jse-texte/50">
                                    Demande le PIN au client puis saisis les 6 chiffres pour clôturer la livraison.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setMissionActive(null);
                                    setPin("");
                                }}
                                className="flex size-10 items-center justify-center rounded-full bg-white text-jse-principal ring-1 ring-jse-texte/5"
                                aria-label="Fermer"
                            >
                                ×
                            </button>
                        </div>

                        <div className="mt-5 rounded-[22px] bg-white p-4 ring-1 ring-jse-texte/5">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] text-jse-texte/45">Commande</span>
                                <span className="text-xs font-bold text-jse-principal">
                                    #{missionActive.reference}
                                </span>
                            </div>
                            <div className="mt-3 flex items-center justify-between">
                                <span className="text-[10px] text-jse-texte/45">Client</span>
                                <span className="text-xs font-bold text-jse-principal">
                                    {missionActive.client?.nom || "Client"}
                                </span>
                            </div>
                        </div>

                        <input
                            value={pin}
                            onChange={(event) =>
                                setPin(event.target.value.replace(/\D/g, "").slice(0, 6))
                            }
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={6}
                            placeholder="••••••"
                            className="mt-4 h-16 w-full rounded-[22px] bg-white text-center font-sans text-2xl font-bold tracking-[0.5em] text-jse-principal outline-none ring-1 ring-jse-texte/5 placeholder:text-jse-texte/15 focus:ring-2 focus:ring-jse-secondaire"
                        />

                        <button
                            type="button"
                            disabled={chargement || pin.length !== 6}
                            onClick={() => validerPin(missionActive)}
                            className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-jse-principal text-sm font-bold text-white transition hover:bg-jse-principal/90 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ShieldCheck size={18} />
                            Valider la livraison
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
}

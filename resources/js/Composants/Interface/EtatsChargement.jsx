import IndicateurChargement from "./IndicateurChargement";

export function ChargementPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-jse-fond px-6 text-jse-texte">
            <div className="flex w-full max-w-xs flex-col items-center text-center">
                <IndicateurChargement taille="grande" />
                <h1 className="mt-7 font-against text-2xl leading-none text-jse-principal">Chargement...</h1>
                <p className="mt-3 font-sans text-xs leading-5 text-jse-texte/50">Veuillez patienter pendant que nous préparons votre expérience.</p>
                <div className="mt-28">
                    <p className="font-against text-xl text-jse-principal">JSE Express</p>
                    <p className="mt-1 font-sans text-[10px] text-jse-texte/45">Des saveurs plus proche de vous</p>
                    <span className="mx-auto mt-3 block h-0.5 w-8 rounded-full bg-jse-accent" />
                </div>
            </div>
        </main>
    );
}

function LigneSquelette({ large = false }) {
    return <div className={["animate-pulse rounded-full bg-jse-texte/10", large ? "h-3 w-36" : "h-2.5 w-24"].join(" ")} />;
}

export function CarteRestaurantChargement() {
    return (
        <div className="rounded-[22px] bg-white p-3 shadow-sm ring-1 ring-jse-texte/5">
            <div className="aspect-[1.45/1] animate-pulse rounded-[18px] bg-jse-texte/10" />
            <div className="mt-3 space-y-2"><LigneSquelette large /><LigneSquelette /><div className="flex gap-2"><LigneSquelette /><LigneSquelette /></div></div>
        </div>
    );
}

export function ListeRestaurantsChargement({ nombre = 4 }) {
    return <div className="grid gap-3 sm:grid-cols-2">{Array.from({ length: nombre }).map((_, index) => <CarteRestaurantChargement key={index} />)}</div>;
}

export function ListeProduitsChargement({ nombre = 5 }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: nombre }).map((_, index) => (
                <div key={index} className="flex items-center gap-3 rounded-[20px] bg-white p-3 shadow-sm ring-1 ring-jse-texte/5">
                    <div className="size-20 shrink-0 animate-pulse rounded-[16px] bg-jse-texte/10" />
                    <div className="min-w-0 flex-1 space-y-2"><LigneSquelette large /><LigneSquelette /><LigneSquelette /></div>
                    <div className="size-9 shrink-0 animate-pulse rounded-full bg-jse-texte/10" />
                </div>
            ))}
        </div>
    );
}

export function RestaurantDetailChargement() {
    return <main className="min-h-screen bg-jse-fond"><div className="mx-auto w-full max-w-6xl"><div className="h-[310px] animate-pulse bg-jse-texte/10 sm:h-[380px]" /><div className="-mt-8 rounded-t-[30px] bg-jse-fond px-4 pt-6 sm:px-8"><LigneSquelette large /><LigneSquelette /><div className="mt-5 grid grid-cols-3 gap-2">{Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-20 animate-pulse rounded-[18px] bg-white ring-1 ring-jse-texte/5" />)}</div><div className="mt-6"><ListeProduitsChargement nombre={4} /></div></div></div></main>;
}

export function CommandeDetailChargement() {
    return <main className="min-h-screen bg-jse-fond px-4 py-5"><div className="mx-auto max-w-2xl"><div className="flex items-center gap-3"><div className="size-10 animate-pulse rounded-full bg-jse-texte/10" /><LigneSquelette large /></div><div className="mt-6 space-y-3">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-20 animate-pulse rounded-[22px] bg-white ring-1 ring-jse-texte/5" />)}</div></div></main>;
}

export function BoutonChargement({ variante = "principal", className = "" }) {
    const fonds = { principal: "bg-jse-principal text-white", secondaire: "bg-jse-secondaire text-white", contour: "border border-jse-principal/15 text-jse-principal", neutre: "bg-jse-texte/10 text-jse-texte/50" };
    return <div className={["flex h-12 items-center justify-center gap-2 rounded-full px-5 font-sans text-xs font-semibold", fonds[variante] ?? fonds.principal, className].join(" ")}><IndicateurChargement taille="petite" />Chargement...</div>;
}

export function ValidationPinChargement() {
    return <main className="flex min-h-screen items-center justify-center bg-jse-fond px-6"><div className="w-full max-w-sm text-center"><IndicateurChargement taille="grande" /><h1 className="mt-6 font-against text-2xl text-jse-principal">Vérification du PIN...</h1><p className="mt-2 font-sans text-xs leading-5 text-jse-texte/50">Merci de patienter pendant la validation.</p><div className="mt-7 rounded-[20px] bg-jse-secondaire/10 p-4 text-left"><p className="font-sans text-xs font-medium text-jse-principal">Cette opération sécurise la remise de la commande au client.</p></div></div></main>;
}

export function RecuperationDonneesChargement() {
    return <main className="flex min-h-screen items-center justify-center bg-jse-fond px-6"><div className="w-full max-w-sm text-center"><div className="mx-auto flex size-20 items-center justify-center rounded-[24px] bg-white shadow-sm ring-1 ring-jse-texte/5"><div className="h-14 w-11 animate-pulse rounded-xl bg-jse-texte/10" /></div><IndicateurChargement taille="moyenne" className="mt-8" /><h1 className="mt-5 font-against text-2xl text-jse-principal">Récupération des données...</h1><p className="mt-2 font-sans text-xs leading-5 text-jse-texte/50">Veuillez patienter pendant que nous chargeons les informations.</p></div></main>;
}
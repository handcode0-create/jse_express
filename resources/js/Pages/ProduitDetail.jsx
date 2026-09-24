import { router, usePage } from "@inertiajs/react";
import { ArrowLeft, Check, ChevronRight, Clock3, Heart, Info, Minus, Plus, Share2, ShoppingCart, UtensilsCrossed } from "lucide-react";
import { useState } from "react";
import SidebarJSE from "../Composants/Navigation/SidebarJSE";

const imagesPlats = [
    "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=90",
    "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1200&q=90",
    "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=90",
];

const prix = (value) =>
    new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(
        Number(value || 0),
    );

function Action({ label, onClick, active = false, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            className={`flex size-11 items-center justify-center rounded-full bg-white/95 text-jse-principal shadow-lg shadow-black/10 backdrop-blur-md transition active:scale-95 ${active ? "text-jse-accent" : ""}`}
        >
            {children}
        </button>
    );
}

function InfoBadge({ icon: Icon, titre, valeur, accent = "orange" }) {
    const styles =
        accent === "green"
            ? "bg-jse-secondaire/10 text-jse-secondaire"
            : accent === "dark"
              ? "bg-jse-principal/5 text-jse-principal"
              : "bg-jse-accent/10 text-jse-accent";

    return (
        <div className="flex min-w-0 items-center gap-2.5">
            <span
                className={`flex size-11 shrink-0 items-center justify-center rounded-full ${styles}`}
            >
                <Icon size={21} strokeWidth={2} />
            </span>
            <div className="min-w-0">
                <p className="font-sans text-xs font-bold text-jse-principal">
                    {titre}
                </p>
                <p className="mt-0.5 truncate font-sans text-[11px] text-jse-texte/55">
                    {valeur}
                </p>
            </div>
        </div>
    );
}

export default function ProduitDetail() {
    const { restaurant, produit, panier = {} } = usePage().props;
    const [favori, setFavori] = useState(false);
    const [quantite, setQuantite] = useState(1);
    const [ajout, setAjout] = useState(false);

    const image =
        produit?.image ||
        imagesPlats[(Number(produit?.id || 1) - 1) % imagesPlats.length];

    const total = Number(produit?.prix || 0) * quantite;

    const ajouterAuPanier = () => {
        setAjout(true);

        router.post(
            `/panier/produits/${produit.id}/ajouter`,
            { quantite },
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setAjout(false),
            },
        );
    };

    const partager = async () => {
        const url = window.location.href;

        if (navigator.share) {
            await navigator.share({
                title: produit?.nom || "JSE Express",
                text: `Découvrez ${produit?.nom || "ce plat"} chez ${restaurant?.nom || "ce restaurant"} sur JSE Express.`,
                url,
            });
        } else if (navigator.clipboard) {
            await navigator.clipboard.writeText(url);
            window.alert("Lien du plat copié.");
        }
    };

    return (
        <main className="min-h-screen bg-jse-fond text-jse-texte">
            <div className="mx-auto flex min-h-screen w-full max-w-[1440px] lg:px-8">
                <SidebarJSE />
                <div className="min-w-0 flex-1">
                <div className="relative mx-auto min-h-screen w-full max-w-[760px] overflow-hidden bg-jse-fond shadow-none lg:my-6 lg:rounded-[32px] lg:shadow-2xl">
                    <section className="relative h-[390px] overflow-hidden bg-jse-principal sm:h-[440px]">
                        <img
                            src={image}
                            alt={produit?.nom || "Plat"}
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/35" />

                        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-5 pt-6 sm:px-7 sm:pt-7">
                            <Action
                                label="Retour au restaurant"
                                onClick={() =>
                                    router.visit(
                                        `/restaurants/${restaurant.id}`,
                                    )
                                }
                            >
                                <ArrowLeft size={22} />
                            </Action>

                            <div className="flex gap-2.5">
                                <Action
                                    label="Favori"
                                    active={favori}
                                    onClick={() => setFavori(!favori)}
                                >
                                    <Heart
                                        size={22}
                                        fill={
                                            favori ? "currentColor" : "none"
                                        }
                                    />
                                </Action>
                                <Action label="Partager" onClick={partager}>
                                    <Share2 size={21} />
                                </Action>
                            </div>
                        </div>

                        <span className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-1.5">
                            <span className="size-2.5 rounded-full bg-jse-accent" />
                            <span className="size-2.5 rounded-full bg-white/70" />
                            <span className="size-2.5 rounded-full bg-white/70" />
                        </span>

                        <span className="absolute bottom-5 right-5 rounded-full bg-black/45 px-3 py-1.5 font-sans text-xs font-semibold text-white">
                            1/1
                        </span>
                    </section>

                    <section className="relative -mt-1 rounded-t-[34px] bg-jse-fond px-5 pb-36 pt-6 sm:px-8">
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                                <h1 className="font-against text-[2.35rem] leading-[0.98] text-jse-principal sm:text-[2.8rem]">
                                    {produit?.nom}
                                </h1>
                                <p className="mt-3 font-sans text-sm leading-6 text-jse-texte/65">
                                    {produit?.description ||
                                        "Plat disponible au menu du restaurant."}
                                </p>
                            </div>

                            <div className="shrink-0 rounded-full bg-white px-3.5 py-2 shadow-sm ring-1 ring-jse-texte/5">
                                <p className="font-sans text-lg font-extrabold text-jse-principal">
                                    {prix(produit?.prix)}
                                </p>
                                <p className="font-sans text-[9px] font-semibold uppercase tracking-[0.08em] text-jse-texte/40">
                                    FCFA
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-3 gap-3 border-b border-jse-texte/8 pb-6">
                            <InfoBadge
                                icon={UtensilsCrossed}
                                titre="Catégorie"
                                valeur={
                                    produit?.categorie?.nom ||
                                    "Menu du restaurant"
                                }
                                accent="green"
                            />
                            <InfoBadge
                                icon={Clock3}
                                titre="Disponibilité"
                                valeur="Disponible"
                                accent="orange"
                            />
                            <InfoBadge
                                icon={Info}
                                titre="Restaurant"
                                valeur={restaurant?.nom}
                                accent="dark"
                            />
                        </div>

                        <section className="mt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-jse-texte/40">
                                        Personnalisation
                                    </p>
                                    <h2 className="mt-1 font-against text-2xl text-jse-principal">
                                        Quantité
                                    </h2>
                                </div>
                                <span className="font-sans text-xs text-jse-texte/45">
                                    1 article = {prix(produit?.prix)} FCFA
                                </span>
                            </div>

                            <div className="mt-4 flex h-[68px] w-full max-w-[290px] items-center justify-between rounded-[22px] bg-white p-2 ring-1 ring-jse-texte/8">
                                <button
                                    type="button"
                                    disabled={quantite <= 1}
                                    onClick={() =>
                                        setQuantite((value) =>
                                            Math.max(1, value - 1),
                                        )
                                    }
                                    className="flex size-12 items-center justify-center rounded-full bg-jse-fond text-jse-principal transition active:scale-90 disabled:opacity-35"
                                >
                                    <Minus size={21} />
                                </button>

                                <span className="font-sans text-xl font-bold text-jse-principal">
                                    {quantite}
                                </span>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setQuantite((value) => value + 1)
                                    }
                                    className="flex size-12 items-center justify-center rounded-full bg-jse-principal text-white transition active:scale-90"
                                >
                                    <Plus size={22} />
                                </button>
                            </div>
                        </section>

                        <section className="mt-7 rounded-[24px] bg-white/65 p-4 ring-1 ring-jse-texte/6">
                            <p className="font-sans text-xs font-semibold text-jse-principal">
                                Informations du plat
                            </p>
                            <p className="mt-2 font-sans text-xs leading-5 text-jse-texte/55">
                                Ce plat est proposé par{" "}
                                <strong className="text-jse-principal">
                                    {restaurant?.nom}
                                </strong>
                                . Les informations affichées proviennent du
                                menu enregistré dans JSE Express.
                            </p>
                        </section>
                    </section>

                    <div className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[760px] px-5 pb-5 sm:px-8">
                        <button
                            type="button"
                            onClick={ajouterAuPanier}
                            disabled={ajout}
                            className="flex h-[72px] w-full items-center rounded-full bg-jse-secondaire px-5 text-white shadow-2xl shadow-jse-secondaire/25 transition active:scale-[0.99] disabled:opacity-70"
                        >
                            <div className="flex size-12 items-center justify-center rounded-full bg-white/15">
                                {ajout ? (
                                    <Check size={27} />
                                ) : (
                                    <ShoppingCart size={27} />
                                )}
                            </div>
                            <span className="ml-4 flex-1 text-left font-sans text-base font-bold sm:text-lg">
                                {ajout
                                    ? "Ajouté au panier"
                                    : `Ajouter au panier — ${prix(total)} FCFA`}
                            </span>
                            <ChevronRight size={25} />
                        </button>
                    </div>
                </div>
                </div>
            </div>
        </main>
    );
}

import Bouton from "../Composants/Interface/Bouton";
import Champ from "../Composants/Interface/Champ";
import Carte from "../Composants/Interface/Carte";
import Badge from "../Composants/Interface/Badge";
import IndicateurChargement from "../Composants/Interface/IndicateurChargement";

const couleurs = [
    {
        nom: "Principal",
        valeur: "#123C32",
        classe: "bg-jse-principal",
        texte: "text-white",
    },
    {
        nom: "Secondaire",
        valeur: "#45B977",
        classe: "bg-jse-secondaire",
        texte: "text-white",
    },
    {
        nom: "Accent",
        valeur: "#F28C28",
        classe: "bg-jse-accent",
        texte: "text-white",
    },
    {
        nom: "Fond",
        valeur: "#FFF7E8",
        classe: "bg-jse-fond",
        texte: "text-jse-texte",
    },
    {
        nom: "Texte",
        valeur: "#191919",
        classe: "bg-jse-texte",
        texte: "text-white",
    },
];

export default function DesignSystem() {
    return (
        <main className="min-h-screen bg-jse-fond text-jse-texte">
            {/* En-tête */}
            <header className="border-b border-jse-texte/8 bg-white">
                <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
                    <div className="flex flex-col gap-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-jse-secondaire">
                            JSE Express
                        </span>

                        <h1 className="text-3xl font-semibold tracking-tight text-jse-principal sm:text-4xl">
                            Système de design
                        </h1>

                        <p className="max-w-2xl text-sm leading-6 text-jse-texte/60 sm:text-base">
                            Référence visuelle et fonctionnelle des composants
                            utilisés dans l'application JSE Express.
                        </p>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-7xl space-y-12 px-5 py-10 sm:px-8">
                {/* Couleurs */}
                <section>
                    <SectionTitre
                        numero="01"
                        titre="Couleurs"
                        description="Palette officielle de l'identité JSE Express."
                    />

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                        {couleurs.map((couleur) => (
                            <Carte key={couleur.nom} sansMarge>
                                <div
                                    className={[
                                        "flex h-32 items-end rounded-t-jse-xl p-4",
                                        couleur.classe,
                                        couleur.texte,
                                    ].join(" ")}
                                >
                                    <span className="text-sm font-semibold">
                                        {couleur.nom}
                                    </span>
                                </div>

                                <div className="p-4">
                                    <p className="text-sm font-medium">
                                        {couleur.nom}
                                    </p>

                                    <p className="mt-1 font-mono text-xs text-jse-texte/50">
                                        {couleur.valeur}
                                    </p>
                                </div>
                            </Carte>
                        ))}
                    </div>
                </section>

                {/* Typographie */}
                <section>
                    <SectionTitre
                        numero="02"
                        titre="Typographie"
                        description="Poppins constitue la typographie principale de l'interface."
                    />

                    <Carte>
                        <div className="space-y-8">
                            <div>
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-jse-texte/40">
                                    Affichage
                                </p>

                                <p className="text-4xl font-semibold tracking-tight text-jse-principal sm:text-5xl">
                                    Commandez simplement.
                                </p>
                            </div>

                            <div>
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-jse-texte/40">
                                    Titre
                                </p>

                                <p className="text-2xl font-semibold text-jse-texte">
                                    Restaurants à proximité
                                </p>
                            </div>

                            <div>
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-jse-texte/40">
                                    Texte
                                </p>

                                <p className="max-w-2xl text-base leading-7 text-jse-texte/65">
                                    Découvrez les restaurants disponibles dans
                                    votre zone et commandez vos plats
                                    directement depuis JSE Express.
                                </p>
                            </div>

                            <div>
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-jse-texte/40">
                                    Petit texte
                                </p>

                                <p className="text-sm text-jse-texte/55">
                                    Dernière mise à jour il y a quelques
                                    instants
                                </p>
                            </div>
                        </div>
                    </Carte>
                </section>

                {/* Boutons */}
                <section>
                    <SectionTitre
                        numero="03"
                        titre="Boutons"
                        description="Actions principales et secondaires."
                    />

                    <Carte>
                        <div className="flex flex-wrap items-center gap-3">
                            <Bouton>Commander</Bouton>

                            <Bouton variante="secondaire">
                                Ajouter au panier
                            </Bouton>

                            <Bouton variante="accent">Confirmer</Bouton>

                            <Bouton variante="contour">Annuler</Bouton>

                            <Bouton variante="discret">Voir les détails</Bouton>
                        </div>

                        <div className="mt-8 flex flex-wrap items-center gap-3">
                            <Bouton taille="petit">Petit</Bouton>

                            <Bouton taille="moyen">Moyen</Bouton>

                            <Bouton taille="grand">Grand</Bouton>

                            <Bouton chargement>Traitement</Bouton>
                        </div>
                    </Carte>
                </section>

                {/* Champs */}
                <section>
                    <SectionTitre
                        numero="04"
                        titre="Champs de formulaire"
                        description="Champs utilisés pour les comptes et les commandes."
                    />

                    <Carte>
                        <div className="grid gap-5 md:grid-cols-2">
                            <Champ
                                id="nom"
                                label="Nom"
                                placeholder="Votre nom"
                            />

                            <Champ
                                id="telephone"
                                label="Téléphone"
                                type="tel"
                                placeholder="07 00 00 00 00"
                            />

                            <Champ
                                id="adresse"
                                label="Adresse de livraison"
                                placeholder="Votre adresse"
                                aide="Cette adresse sera utilisée pour la livraison."
                            />

                            <Champ
                                id="erreur"
                                label="Téléphone"
                                type="tel"
                                placeholder="07 00 00 00 00"
                                erreur="Veuillez saisir un numéro de téléphone valide."
                            />
                        </div>
                    </Carte>
                </section>

                {/* Cartes */}
                <section>
                    <SectionTitre
                        numero="05"
                        titre="Cartes"
                        description="Conteneurs de contenu et éléments interactifs."
                    />

                    <div className="grid gap-5 md:grid-cols-2">
                        <Carte>
                            <div className="space-y-3">
                                <Badge variante="succes">Disponible</Badge>

                                <h3 className="text-lg font-semibold text-jse-principal">
                                    JSE Kitchen
                                </h3>

                                <p className="text-sm leading-6 text-jse-texte/60">
                                    Découvrez les plats disponibles dans ce
                                    restaurant.
                                </p>

                                <Bouton taille="petit">
                                    Voir le restaurant
                                </Bouton>
                            </div>
                        </Carte>

                        <Carte interactive>
                            <div className="space-y-3">
                                <Badge variante="attention">
                                    En préparation
                                </Badge>

                                <h3 className="text-lg font-semibold">
                                    Commande JSE-000001
                                </h3>

                                <p className="text-sm text-jse-texte/60">
                                    Votre commande est actuellement préparée par
                                    le restaurant.
                                </p>
                            </div>
                        </Carte>
                    </div>
                </section>

                {/* Badges */}
                <section>
                    <SectionTitre
                        numero="06"
                        titre="Badges"
                        description="États courts et informations contextuelles."
                    />

                    <Carte>
                        <div className="flex flex-wrap gap-3">
                            <Badge variante="principal">Principal</Badge>

                            <Badge variante="succes">Disponible</Badge>

                            <Badge variante="attention">En attente</Badge>

                            <Badge variante="danger">Indisponible</Badge>

                            <Badge variante="information">Information</Badge>

                            <Badge variante="neutre">Neutre</Badge>
                        </div>
                    </Carte>
                </section>

                {/* Chargement */}
                <section>
                    <SectionTitre
                        numero="07"
                        titre="Chargement"
                        description="Indicateurs utilisés pendant les traitements."
                    />

                    <Carte>
                        <div className="flex items-center gap-8">
                            <div className="flex flex-col items-center gap-3">
                                <IndicateurChargement taille="petite" />

                                <span className="text-xs text-jse-texte/50">
                                    Petit
                                </span>
                            </div>

                            <div className="flex flex-col items-center gap-3">
                                <IndicateurChargement taille="moyenne" />

                                <span className="text-xs text-jse-texte/50">
                                    Moyen
                                </span>
                            </div>

                            <div className="flex flex-col items-center gap-3">
                                <IndicateurChargement taille="grande" />

                                <span className="text-xs text-jse-texte/50">
                                    Grand
                                </span>
                            </div>
                        </div>
                    </Carte>
                </section>

                {/* Rayons */}
                <section>
                    <SectionTitre
                        numero="08"
                        titre="Rayons et surfaces"
                        description="Hiérarchie des arrondis utilisée dans l'interface."
                    />

                    <Carte>
                        <div className="grid gap-4 sm:grid-cols-5">
                            <Surface nom="Petit" classe="rounded-jse-petit" />

                            <Surface nom="Moyen" classe="rounded-jse-moyen" />

                            <Surface nom="Grand" classe="rounded-jse-grand" />

                            <Surface nom="XL" classe="rounded-jse-xl" />

                            <Surface nom="XXL" classe="rounded-jse-xxl" />
                        </div>
                    </Carte>
                </section>
            </div>
        </main>
    );
}

function SectionTitre({ numero, titre, description }) {
    return (
        <div className="mb-5">
            <div className="mb-1 flex items-center gap-3">
                <span className="text-xs font-semibold text-jse-secondaire">
                    {numero}
                </span>

                <h2 className="text-xl font-semibold text-jse-principal">
                    {titre}
                </h2>
            </div>

            <p className="text-sm text-jse-texte/55">{description}</p>
        </div>
    );
}

function Surface({ nom, classe }) {
    return (
        <div
            className={[
                "flex h-24 items-center justify-center",
                "bg-jse-principal",
                "text-sm font-medium text-white",
                classe,
            ].join(" ")}
        >
            {nom}
        </div>
    );
}

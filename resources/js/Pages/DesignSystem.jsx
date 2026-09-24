import Bouton from "../Composants/Interface/Bouton";
import Champ from "../Composants/Interface/Champ";
import Carte from "../Composants/Interface/Carte";
import Badge from "../Composants/Interface/Badge";
import IndicateurChargement from "../Composants/Interface/IndicateurChargement";

const couleurs = [
    { nom: "Principal", valeur: "#123C32", classe: "bg-jse-principal", texte: "text-white" },
    { nom: "Secondaire", valeur: "#45B977", classe: "bg-jse-secondaire", texte: "text-white" },
    { nom: "Accent", valeur: "#F28C28", classe: "bg-jse-accent", texte: "text-white" },
    { nom: "Fond", valeur: "#FFF7E8", classe: "bg-jse-fond", texte: "text-jse-texte" },
    { nom: "Texte", valeur: "#191919", classe: "bg-jse-texte", texte: "text-white" },
];

export default function DesignSystem() {
    return (
        <main className="min-h-screen bg-jse-fond text-jse-texte">
            <header className="border-b border-jse-texte/5 bg-white">
                <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:py-10">
                    <div className="flex items-center gap-4">
                        <img src="/assets/jse_logo.png" alt="JSE Express" className="h-12 w-auto object-contain" />
                        <div>
                            <p className="font-sans text-[10px] font-bold uppercase tracking-[0.18em] text-jse-secondaire">JSE Express</p>
                            <h1 className="mt-1 font-against text-3xl leading-none text-jse-principal sm:text-4xl">Système de design</h1>
                            <p className="mt-2 max-w-2xl font-sans text-xs leading-5 text-jse-texte/55 sm:text-sm">La référence visuelle des composants, surfaces et règles responsive de JSE Express.</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-7xl space-y-10 px-5 py-8 sm:px-8 lg:space-y-12 lg:py-12">
                <section>
                    <SectionTitre numero="01" titre="Couleurs" description="Palette officielle JSE Express." />
                    <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
                        {couleurs.map((couleur) => (
                            <Carte key={couleur.nom} sansMarge>
                                <div className={[`flex h-28 items-end rounded-t-jse-xl p-4`, couleur.classe, couleur.texte].join(" ")}>
                                    <span className="font-sans text-xs font-semibold">{couleur.nom}</span>
                                </div>
                                <div className="p-4">
                                    <p className="font-sans text-sm font-semibold">{couleur.nom}</p>
                                    <p className="mt-1 font-mono text-[11px] text-jse-texte/45">{couleur.valeur}</p>
                                </div>
                            </Carte>
                        ))}
                    </div>
                </section>

                <section>
                    <SectionTitre numero="02" titre="Typographie" description="Against pour les titres et Poppins pour l'interface." />
                    <Carte>
                        <div className="space-y-8">
                            <div>
                                <p className="mb-2 font-sans text-[10px] font-bold uppercase tracking-[0.16em] text-jse-texte/35">Against · Affichage</p>
                                <p className="font-against text-4xl leading-none text-jse-principal sm:text-5xl">Qu’est-ce qu’on vous sert aujourd’hui ?</p>
                            </div>
                            <div>
                                <p className="mb-2 font-sans text-[10px] font-bold uppercase tracking-[0.16em] text-jse-texte/35">Poppins · Interface</p>
                                <p className="font-sans text-2xl font-semibold text-jse-texte">Restaurants populaires</p>
                            </div>
                            <p className="max-w-2xl font-sans text-sm leading-6 text-jse-texte/60">Les titres utilisent Against. Les boutons, labels, champs, données et textes fonctionnels utilisent Poppins.</p>
                        </div>
                    </Carte>
                </section>

                <section>
                    <SectionTitre numero="03" titre="Boutons" description="Actions principales et secondaires." />
                    <Carte>
                        <div className="flex flex-wrap items-center gap-3">
                            <Bouton>Commander</Bouton>
                            <Bouton variante="secondaire">Ajouter au panier</Bouton>
                            <Bouton variante="accent">Confirmer</Bouton>
                            <Bouton variante="contour">Annuler</Bouton>
                            <Bouton variante="discret">Voir les détails</Bouton>
                        </div>
                        <div className="mt-7 flex flex-wrap items-center gap-3">
                            <Bouton taille="petit">Petit</Bouton>
                            <Bouton taille="moyen">Moyen</Bouton>
                            <Bouton taille="grand">Grand</Bouton>
                            <Bouton chargement>Traitement</Bouton>
                        </div>
                    </Carte>
                </section>

                <section>
                    <SectionTitre numero="04" titre="Champs de formulaire" description="Champs utilisés pour les comptes et commandes." />
                    <Carte>
                        <div className="grid gap-5 md:grid-cols-2">
                            <Champ id="nom" label="Nom" placeholder="Votre nom" />
                            <Champ id="telephone" label="Téléphone" type="tel" placeholder="07 00 00 00 00" />
                            <Champ id="adresse" label="Adresse de livraison" placeholder="Votre adresse" aide="Cette adresse sera utilisée pour la livraison." />
                            <Champ id="erreur" label="Téléphone" type="tel" placeholder="07 00 00 00 00" erreur="Veuillez saisir un numéro de téléphone valide." />
                        </div>
                    </Carte>
                </section>

                <section>
                    <SectionTitre numero="05" titre="Cartes" description="Surfaces, cartes restaurant et commandes." />
                    <div className="grid gap-5 md:grid-cols-2">
                        <Carte>
                            <div className="space-y-3">
                                <Badge variante="succes">Disponible</Badge>
                                <h3 className="font-sans text-lg font-semibold text-jse-principal">JSE Kitchen</h3>
                                <p className="font-sans text-sm leading-6 text-jse-texte/60">Découvrez les plats disponibles dans ce restaurant.</p>
                                <Bouton taille="petit">Voir le restaurant</Bouton>
                            </div>
                        </Carte>
                        <Carte interactive>
                            <div className="space-y-3">
                                <Badge variante="attention">En préparation</Badge>
                                <h3 className="font-sans text-lg font-semibold">Commande JSE-000001</h3>
                                <p className="font-sans text-sm text-jse-texte/60">Votre commande est actuellement préparée par le restaurant.</p>
                            </div>
                        </Carte>
                    </div>
                </section>

                <section>
                    <SectionTitre numero="06" titre="Navigation et responsive" description="Même système visuel, adapté à chaque largeur d'écran." />
                    <Carte>
                        <div className="grid gap-5 md:grid-cols-2">
                            <div className="rounded-jse-xl bg-jse-fond p-5">
                                <p className="font-sans text-[10px] font-bold uppercase tracking-[0.16em] text-jse-texte/35">Mobile</p>
                                <p className="mt-2 font-against text-2xl text-jse-principal">Bottom bar</p>
                                <p className="mt-2 font-sans text-xs leading-5 text-jse-texte/55">Navigation compacte, cartes horizontales et contenu tactile.</p>
                            </div>
                            <div className="rounded-jse-xl bg-jse-fond p-5">
                                <p className="font-sans text-[10px] font-bold uppercase tracking-[0.16em] text-jse-texte/35">Web</p>
                                <p className="mt-2 font-against text-2xl text-jse-principal">Sidebar + contenu</p>
                                <p className="mt-2 font-sans text-xs leading-5 text-jse-texte/55">Navigation persistante, grille et surfaces plus larges.</p>
                            </div>
                        </div>
                    </Carte>
                </section>

                <section>
                    <SectionTitre numero="07" titre="Badges et chargement" description="États courts et indicateurs de traitement." />
                    <Carte>
                        <div className="flex flex-wrap gap-3">
                            <Badge variante="principal">Principal</Badge>
                            <Badge variante="succes">Disponible</Badge>
                            <Badge variante="attention">En attente</Badge>
                            <Badge variante="danger">Indisponible</Badge>
                            <Badge variante="information">Information</Badge>
                            <Badge variante="neutre">Neutre</Badge>
                        </div>
                        <div className="mt-8 flex items-center gap-8">
                            <div className="flex flex-col items-center gap-3"><IndicateurChargement taille="petite" /><span className="font-sans text-xs text-jse-texte/50">Petit</span></div>
                            <div className="flex flex-col items-center gap-3"><IndicateurChargement taille="moyenne" /><span className="font-sans text-xs text-jse-texte/50">Moyen</span></div>
                            <div className="flex flex-col items-center gap-3"><IndicateurChargement taille="grande" /><span className="font-sans text-xs text-jse-texte/50">Grand</span></div>
                        </div>
                    </Carte>
                </section>

                <section>
                    <SectionTitre numero="08" titre="Rayons et surfaces" description="Hiérarchie des arrondis conservant les classes existantes." />
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
                <span className="font-sans text-[10px] font-bold text-jse-secondaire">{numero}</span>
                <h2 className="font-against text-2xl leading-none text-jse-principal">{titre}</h2>
            </div>
            <p className="font-sans text-xs leading-5 text-jse-texte/55">{description}</p>
        </div>
    );
}

function Surface({ nom, classe }) {
    return (
        <div className={[`flex h-24 items-center justify-center bg-jse-principal font-sans text-sm font-medium text-white`, classe].join(" ")}>
            {nom}
        </div>
    );
}

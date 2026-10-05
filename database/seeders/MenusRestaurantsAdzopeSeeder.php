<?php

namespace Database\Seeders;

use App\Models\Categorie;
use App\Models\Produit;
use App\Models\Restaurant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Complète les menus de démonstration : chaque restaurant reçoit des plats
 * cohérents avec son type (maquis, restaurant, boulangerie-pâtisserie), des
 * descriptions et des horaires.
 *
 * Les menus et les prix sont fictifs : ce seeder sert aux tests en local et
 * ne doit pas être exécuté en production. Il est rejouable : il ne modifie
 * jamais le prix ni la disponibilité d'un produit existant et ne supprime rien.
 */
class MenusRestaurantsAdzopeSeeder extends Seeder
{
    /** Anciens noms génériques, remplacés par des noms de plats réels. */
    private const RENOMMAGES = [
        'Boisson' => 'Boisson gazeuse',
        'Plat de démonstration' => 'Poulet braisé et attiéké',
    ];

    private const HORAIRES = [
        'maquis' => '10:00-23:00',
        'restaurant' => '09:00-22:00',
        'boulangerie' => '06:00-19:00',
    ];

    public function run(): void
    {
        if (app()->isProduction()) {
            throw new RuntimeException('MenusRestaurantsAdzopeSeeder contient des menus fictifs et ne doit pas être exécuté en production.');
        }

        DB::transaction(function () {
            $types = (new RestaurantsAdzopeSeeder)->typesParNom();

            foreach (Restaurant::query()->whereIn('nom', array_keys($types))->get() as $restaurant) {
                $type = $types[$restaurant->nom];

                $this->completer(
                    $restaurant,
                    array_merge_recursive($this->menus()[$type], $this->specialites()[$restaurant->nom] ?? []),
                    self::HORAIRES[$type],
                );
            }

            $jseKitchen = Restaurant::query()->where('nom', 'JSE Kitchen')->first();

            if ($jseKitchen) {
                $this->completer($jseKitchen, $this->menuJseKitchen(), self::HORAIRES['restaurant']);
            }
        });
    }

    /**
     * @param  array<string, array<string, int>>  $menu
     */
    private function completer(Restaurant $restaurant, array $menu, string $horaires): void
    {
        $this->renommerProduitsGeneriques($restaurant);

        foreach ($menu as $nomCategorie => $produits) {
            $categorie = Categorie::query()->firstOrCreate(
                ['restaurant_id' => $restaurant->id, 'nom' => $nomCategorie],
                ['description' => null, 'statut' => 'actif']
            );

            foreach ($produits as $nomProduit => $prix) {
                $produit = Produit::query()->firstOrCreate(
                    ['restaurant_id' => $restaurant->id, 'nom' => $nomProduit],
                    [
                        'categorie_id' => $categorie->id,
                        'description' => $this->descriptions()[$nomProduit] ?? null,
                        'prix' => $prix,
                        'image' => null,
                        'options' => [],
                        'disponible' => true,
                        'statut' => 'actif',
                    ]
                );

                $this->remplacerDescriptionDeDemonstration($produit);
            }
        }

        // Produits déjà présents (menus du premier seeder) : descriptions réelles.
        Produit::query()->where('restaurant_id', $restaurant->id)->get()->each(
            fn (Produit $produit) => $this->remplacerDescriptionDeDemonstration($produit)
        );

        if (blank($restaurant->horaires)) {
            $restaurant->update(['horaires' => $horaires]);
        }
    }

    private function renommerProduitsGeneriques(Restaurant $restaurant): void
    {
        foreach (self::RENOMMAGES as $ancien => $nouveau) {
            $existant = Produit::query()->where('restaurant_id', $restaurant->id)->where('nom', $ancien)->first();
            $dejaRenomme = Produit::query()->where('restaurant_id', $restaurant->id)->where('nom', $nouveau)->exists();

            if ($existant && ! $dejaRenomme) {
                $existant->update(['nom' => $nouveau]);
            }
        }
    }

    private function remplacerDescriptionDeDemonstration(Produit $produit): void
    {
        $actuelle = (string) $produit->description;
        $estGenerique = $actuelle === '' || str_contains(mb_strtolower($actuelle), 'démonstration') || str_contains(mb_strtolower($actuelle), 'produit de test');
        $nouvelle = $this->descriptions()[$produit->nom] ?? null;

        if ($estGenerique && $nouvelle !== null) {
            $produit->update(['description' => $nouvelle]);
        }
    }

    /**
     * @return array<string, array<string, array<string, int>>>
     */
    private function menus(): array
    {
        return [
            'maquis' => [
                'Grillades' => [
                    'Demi-poulet braisé' => 2500,
                    'Côtelettes de porc braisées' => 3000,
                ],
                'Plats' => [
                    'Garba' => 1000,
                    'Placali sauce gombo' => 2000,
                ],
                'Accompagnements' => [
                    'Alloco' => 1000,
                    'Attiéké' => 500,
                    'Banane braisée' => 800,
                ],
                'Boissons' => [
                    'Jus de gingembre' => 500,
                    'Bière (65 cl)' => 1000,
                ],
            ],
            'restaurant' => [
                'Plats' => [
                    'Riz sauce graine' => 2500,
                    'Poisson braisé et attiéké' => 3500,
                    'Ragoût d\'igname' => 2500,
                ],
                'Desserts' => [
                    'Salade de fruits' => 1000,
                    'Beignets (5 pièces)' => 500,
                ],
                'Boissons' => [
                    'Jus de bissap' => 500,
                    'Bière (65 cl)' => 1000,
                ],
            ],
            'boulangerie' => [
                'Pains' => [
                    'Pain de mie' => 1000,
                    'Brioche' => 500,
                ],
                'Pâtisseries' => [
                    'Beignets sucrés (5 pièces)' => 500,
                    'Tarte aux fruits' => 1500,
                    'Éclair au chocolat' => 700,
                ],
                'Sandwichs' => [
                    'Sandwich poulet' => 1500,
                    'Sandwich thon' => 1500,
                ],
                'Boissons' => [
                    'Jus de fruits' => 600,
                    'Chocolat chaud' => 800,
                ],
            ],
        ];
    }

    /**
     * Une spécialité par établissement, pour que les menus ne soient pas identiques.
     *
     * @return array<string, array<string, array<string, int>>>
     */
    private function specialites(): array
    {
        return [
            'Au braisé' => ['Grillades' => ['Capitaine braisé' => 5000]],
            'Rives de Mansan' => ['Plats' => ['Tilapia braisé' => 3500]],
            'Maquis San-pedro' => ['Plats' => ['Poisson sauce tomate' => 3000]],
            'Maquis Chez Tantie Marthe' => ['Plats' => ['Sauce feuille et foutou' => 2500]],
            'Le Djama' => ['Plats' => ['Kedjenou de pintade' => 4500]],
        ];
    }

    /**
     * @return array<string, array<string, int>>
     */
    private function menuJseKitchen(): array
    {
        return [
            'Plats' => [
                'Kedjenou de poulet' => 3500,
                'Attiéké poisson' => 2000,
                'Alloco poulet' => 2500,
            ],
            'Accompagnements' => [
                'Alloco' => 1000,
                'Riz blanc' => 500,
            ],
            'Boissons' => [
                'Jus de bissap' => 500,
                'Jus de gingembre' => 500,
                'Eau minérale' => 500,
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    private function descriptions(): array
    {
        return [
            'Poulet braisé' => 'Poulet braisé au charbon, servi avec oignons et piment.',
            'Poisson braisé' => 'Poisson braisé au charbon, servi avec oignons et piment.',
            'Brochettes de bœuf' => 'Brochettes de bœuf grillées, servies avec oignons.',
            'Demi-poulet braisé' => 'Une demi-portion de poulet braisé au charbon.',
            'Côtelettes de porc braisées' => 'Côtelettes de porc marinées puis braisées.',
            'Capitaine braisé' => 'Poisson capitaine braisé, servi avec oignons et piment.',
            'Attiéké poisson' => 'Attiéké accompagné de poisson et de sauce tomate pimentée.',
            'Alloco poisson' => 'Bananes plantain frites accompagnées de poisson.',
            'Alloco poulet' => 'Bananes plantain frites accompagnées de poulet.',
            'Foutou sauce graine' => 'Foutou de banane servi avec une sauce graine.',
            'Garba' => 'Attiéké accompagné de thon frit et de piment.',
            'Placali sauce gombo' => 'Placali (pâte de manioc fermenté) servi avec une sauce gombo.',
            'Riz sauce arachide' => 'Riz blanc servi avec une sauce arachide.',
            'Riz sauce graine' => 'Riz blanc servi avec une sauce graine.',
            'Kedjenou de poulet' => 'Poulet mijoté à l\'étouffée avec légumes et épices.',
            'Kedjenou de pintade' => 'Pintade mijotée à l\'étouffée avec légumes et épices.',
            'Menu complet' => 'Formule complète proposée par le restaurant.',
            'Riz Sauce Graine' => 'Riz blanc servi avec une sauce graine, accompagnement au choix.',
            'Poisson braisé et attiéké' => 'Poisson braisé servi avec de l\'attiéké.',
            'Poulet braisé et attiéké' => 'Poulet braisé servi avec de l\'attiéké.',
            'Tilapia braisé' => 'Tilapia braisé au charbon, servi avec oignons et piment.',
            'Poisson sauce tomate' => 'Poisson mijoté dans une sauce tomate.',
            'Sauce feuille et foutou' => 'Sauce aux feuilles servie avec du foutou.',
            'Ragoût d\'igname' => 'Igname mijotée en sauce.',
            'Alloco' => 'Bananes plantain mûres frites.',
            'Attiéké' => 'Semoule de manioc, accompagnement.',
            'Banane braisée' => 'Banane plantain braisée.',
            'Riz blanc' => 'Riz blanc nature.',
            'Boisson gazeuse' => 'Boisson gazeuse en bouteille.',
            'Jus de bissap' => 'Jus d\'hibiscus (bissap) frais.',
            'Jus de gingembre' => 'Jus de gingembre frais.',
            'Eau minérale' => 'Eau minérale en bouteille.',
            'Bière (65 cl)' => 'Bière en bouteille de 65 cl.',
            'Salade de fruits' => 'Mélange de fruits frais de saison.',
            'Beignets (5 pièces)' => 'Cinq beignets frits.',
            'Baguette' => 'Baguette de pain traditionnelle.',
            'Pain au lait' => 'Petit pain moelleux au lait.',
            'Pain de mie' => 'Pain de mie en tranches.',
            'Brioche' => 'Brioche moelleuse.',
            'Croissant' => 'Croissant au beurre.',
            'Pain au chocolat' => 'Viennoiserie feuilletée au chocolat.',
            'Gâteau au yaourt' => 'Gâteau moelleux au yaourt.',
            'Beignets sucrés (5 pièces)' => 'Cinq beignets sucrés.',
            'Tarte aux fruits' => 'Tarte garnie de fruits.',
            'Éclair au chocolat' => 'Éclair fourré et glacé au chocolat.',
            'Sandwich poulet' => 'Sandwich garni de poulet.',
            'Sandwich thon' => 'Sandwich garni de thon.',
            'Café' => 'Café chaud.',
            'Jus de fruits' => 'Jus de fruits.',
            'Chocolat chaud' => 'Chocolat chaud.',
        ];
    }
}

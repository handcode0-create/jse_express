<?php

namespace Database\Seeders;

use App\Models\Categorie;
use App\Models\Produit;
use App\Models\Restaurant;
use App\Models\User;
use App\Models\Zone;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

/**
 * Fiches de démonstration d'établissements réels d'Adzopé.
 *
 * Les noms, adresses, téléphones et coordonnées viennent de sources publiques
 * non vérifiées sur place (OpenStreetMap, Go Africa Online, octobre 2026).
 * Les menus, les prix et les comptes propriétaires sont fictifs : ce seeder
 * sert aux tests en local et ne doit pas être exécuté en production.
 */
class RestaurantsAdzopeSeeder extends Seeder
{
    private const DESCRIPTION = 'Fiche de démonstration : menu et prix fictifs.';

    public function run(): void
    {
        if (app()->isProduction()) {
            throw new RuntimeException('RestaurantsAdzopeSeeder contient des menus fictifs et ne doit pas être exécuté en production.');
        }

        DB::transaction(function () {
            $zone = Zone::query()->firstOrCreate(
                ['nom' => 'Centre'],
                ['description' => 'Zone centrale de desserte', 'zone_parent_id' => null, 'statut' => 'actif']
            );

            foreach ($this->etablissements() as $index => $etablissement) {
                $numero = $index + 1;

                $proprietaire = User::query()->updateOrCreate(
                    ['telephone' => sprintf('00000001%02d', $numero)],
                    [
                        'nom' => 'Démo Adzopé',
                        'prenom' => 'Restaurant '.$numero,
                        'email' => sprintf('adzope-%02d@jse-express.test', $numero),
                        'password' => Hash::make('password'),
                        'role' => 'restaurant',
                        'statut' => 'actif',
                    ]
                );

                $restaurant = Restaurant::query()->updateOrCreate(
                    ['user_id' => $proprietaire->id],
                    [
                        'zone_id' => $zone->id,
                        'nom' => $etablissement['nom'],
                        'description' => self::DESCRIPTION,
                        'telephone' => $etablissement['telephone'] ?? '',
                        'email' => null,
                        'adresse' => $etablissement['adresse'] ?? 'Adzopé',
                        'latitude' => $etablissement['latitude'] ?? null,
                        'longitude' => $etablissement['longitude'] ?? null,
                        'horaires' => null,
                        'statut' => 'actif',
                    ]
                );

                $this->creerMenu($restaurant, $etablissement['type']);
            }
        });
    }

    private function creerMenu(Restaurant $restaurant, string $type): void
    {
        foreach ($this->menus()[$type] as $nomCategorie => $produits) {
            $categorie = Categorie::query()->updateOrCreate(
                ['restaurant_id' => $restaurant->id, 'nom' => $nomCategorie],
                ['description' => null, 'statut' => 'actif']
            );

            foreach ($produits as $nomProduit => $prix) {
                Produit::query()->updateOrCreate(
                    ['restaurant_id' => $restaurant->id, 'nom' => $nomProduit],
                    [
                        'categorie_id' => $categorie->id,
                        'description' => 'Produit de démonstration.',
                        'prix' => $prix,
                        'image' => null,
                        'options' => [],
                        'disponible' => true,
                        'statut' => 'actif',
                    ]
                );
            }
        }
    }

    /**
     * Type de menu (maquis, restaurant, boulangerie) de chaque fiche, indexé par nom.
     *
     * @return array<string, string>
     */
    public function typesParNom(): array
    {
        return array_column($this->etablissements(), 'type', 'nom');
    }

    /**
     * @return list<array{nom: string, type: string, adresse?: string, telephone?: string, latitude?: float, longitude?: float}>
     */
    private function etablissements(): array
    {
        return [
            ['nom' => 'Maquis Restaurant Petit Bassam', 'type' => 'maquis', 'adresse' => 'Près du stade, Adzopé', 'telephone' => '0707345950', 'latitude' => 6.1037267, 'longitude' => -3.8551634],
            ['nom' => 'Restaurant L\'Escalier', 'type' => 'maquis', 'adresse' => 'Nouvelle gare, Adzopé', 'telephone' => '0708297250'],
            ['nom' => 'O\'Canari', 'type' => 'restaurant', 'telephone' => '0708737166'],
            ['nom' => 'Maquis La Cour Des Grands (CDG)', 'type' => 'maquis'],
            ['nom' => 'Maquis Chez Tantie Marthe', 'type' => 'maquis'],
            ['nom' => 'Rives de Mansan', 'type' => 'restaurant'],
            ['nom' => 'L\'escale', 'type' => 'restaurant'],
            ['nom' => 'Espace Mundo Trokaper', 'type' => 'restaurant'],
            ['nom' => 'Restaurant Lebonkoin', 'type' => 'restaurant'],
            ['nom' => 'Maquis Palmeraie Adzopé', 'type' => 'maquis'],
            ['nom' => 'Maquis San-pedro', 'type' => 'maquis'],
            ['nom' => 'Au braisé', 'type' => 'maquis', 'latitude' => 6.0979196, 'longitude' => -3.8615220],
            ['nom' => 'La luciole', 'type' => 'restaurant', 'latitude' => 6.1042609, 'longitude' => -3.8623884],
            ['nom' => 'L\'esplanade chez ami', 'type' => 'restaurant', 'latitude' => 6.0992899, 'longitude' => -3.8606376],
            ['nom' => 'Le Djama', 'type' => 'restaurant', 'latitude' => 6.0997692, 'longitude' => -3.8593157],
            ['nom' => 'Maquis Restaurant', 'type' => 'maquis', 'latitude' => 6.1002848, 'longitude' => -3.8612452],
            ['nom' => 'Nouvelle boulangerie pâtisserie d\'Adzopé', 'type' => 'boulangerie', 'latitude' => 6.0998502, 'longitude' => -3.8602220],
            ['nom' => 'Boulangerie du Château', 'type' => 'boulangerie', 'adresse' => 'Quartier Château, Adzopé', 'telephone' => '2723540473'],
        ];
    }

    /**
     * @return array<string, array<string, array<string, int>>>
     */
    private function menus(): array
    {
        return [
            'maquis' => [
                'Grillades' => [
                    'Poulet braisé' => 4500,
                    'Poisson braisé' => 4000,
                    'Brochettes de bœuf' => 2000,
                ],
                'Plats' => [
                    'Attiéké poisson' => 2000,
                    'Alloco poisson' => 1500,
                    'Foutou sauce graine' => 2500,
                ],
                'Boissons' => [
                    'Boisson gazeuse' => 500,
                    'Jus de bissap' => 500,
                    'Eau minérale' => 500,
                ],
            ],
            'restaurant' => [
                'Plats' => [
                    'Riz sauce arachide' => 2000,
                    'Kedjenou de poulet' => 3500,
                    'Attiéké poisson' => 2000,
                    'Menu complet' => 5000,
                ],
                'Accompagnements' => [
                    'Alloco' => 1000,
                    'Riz blanc' => 500,
                ],
                'Boissons' => [
                    'Boisson gazeuse' => 500,
                    'Jus de gingembre' => 500,
                    'Eau minérale' => 500,
                ],
            ],
            'boulangerie' => [
                'Pains' => [
                    'Baguette' => 150,
                    'Pain au lait' => 300,
                ],
                'Pâtisseries' => [
                    'Croissant' => 500,
                    'Pain au chocolat' => 600,
                    'Gâteau au yaourt' => 1500,
                ],
                'Boissons' => [
                    'Boisson gazeuse' => 500,
                    'Café' => 500,
                ],
            ],
        ];
    }
}

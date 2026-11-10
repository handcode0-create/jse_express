<?php

namespace Database\Seeders;

use App\Models\Categorie;
use App\Models\Produit;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class JseKitchenMenuSeeder extends Seeder
{
    public function run(): void
    {
        $proprietaire = User::query()
            ->where('email', 'restaurant@jse-express.test')
            ->first();

        if (!$proprietaire) {
            throw new RuntimeException('Le compte restaurant de démonstration est introuvable. Exécutez d’abord JseExpressSeeder.');
        }

        $restaurant = Restaurant::query()
            ->where('user_id', $proprietaire->id)
            ->where('nom', 'JSE Kitchen')
            ->first();

        if (!$restaurant) {
            throw new RuntimeException('Le restaurant JSE Kitchen est introuvable. Exécutez d’abord JseExpressSeeder.');
        }

        $menu = [
            'Plats' => [
                ['nom' => 'Attiéké poisson braisé', 'description' => 'Attiéké accompagné de poisson braisé.', 'prix' => 2500],
                ['nom' => 'Kedjenou de poulet', 'description' => 'Poulet mijoté façon kedjenou.', 'prix' => 3000],
                ['nom' => 'Riz sauce arachide', 'description' => 'Riz accompagné de sauce à l’arachide.', 'prix' => 2000],
                ['nom' => 'Foutou sauce graine', 'description' => 'Foutou accompagné de sauce graine.', 'prix' => 2500],
                ['nom' => 'Alloco poisson', 'description' => 'Bananes plantain frites accompagnées de poisson.', 'prix' => 2000],
            ],
            'Grillades' => [
                ['nom' => 'Poulet braisé entier', 'description' => 'Poulet entier braisé.', 'prix' => 5000],
                ['nom' => 'Demi-poulet braisé', 'description' => 'Demi-poulet braisé.', 'prix' => 2500],
                ['nom' => 'Brochettes de bœuf', 'description' => 'Brochettes de bœuf grillées.', 'prix' => 1500],
            ],
            'Accompagnements' => [
                ['nom' => 'Portion d’attiéké', 'description' => 'Portion d’attiéké en accompagnement.', 'prix' => 500],
                ['nom' => 'Portion d’alloco', 'description' => 'Portion de bananes plantain frites.', 'prix' => 1000],
            ],
            'Boissons' => [
                ['nom' => 'Jus de bissap', 'description' => 'Jus de bissap de démonstration.', 'prix' => 500],
                ['nom' => 'Jus de gingembre', 'description' => 'Jus de gingembre de démonstration.', 'prix' => 500],
                ['nom' => 'Eau minérale', 'description' => 'Bouteille d’eau minérale.', 'prix' => 500],
            ],
            'Desserts' => [
                ['nom' => 'Salade de fruits', 'description' => 'Salade de fruits de saison.', 'prix' => 1000],
            ],
        ];

        $descriptionsCategories = [
            'Plats' => 'Plats principaux',
            'Grillades' => 'Viandes et poissons grillés',
            'Accompagnements' => 'Garnitures et accompagnements',
            'Boissons' => 'Boissons fraîches',
            'Desserts' => 'Desserts',
        ];

        DB::transaction(function () use ($restaurant, $menu, $descriptionsCategories): void {
            foreach ($menu as $nomCategorie => $produits) {
                $categorie = Categorie::query()->updateOrCreate(
                    ['restaurant_id' => $restaurant->id, 'nom' => $nomCategorie],
                    [
                        'description' => $descriptionsCategories[$nomCategorie],
                        'statut' => 'actif',
                    ]
                );

                foreach ($produits as $donnees) {
                    Produit::query()->updateOrCreate(
                        ['restaurant_id' => $restaurant->id, 'nom' => $donnees['nom']],
                        [
                            'categorie_id' => $categorie->id,
                            'description' => $donnees['description'],
                            'prix' => $donnees['prix'],
                            'image' => null,
                            'options' => [],
                            'disponible' => true,
                            'statut' => 'actif',
                        ]
                    );
                }
            }
        });

        $this->command?->info('JSE Kitchen : 14 produits supplémentaires vérifiés/créés sans doublons.');
    }
}

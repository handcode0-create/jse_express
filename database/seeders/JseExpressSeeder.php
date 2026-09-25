<?php

namespace Database\Seeders;

use App\Models\AttributionLivraison;
use App\Models\Categorie;
use App\Models\Commande;
use App\Models\HistoriqueCommande;
use App\Models\LigneCommande;
use App\Models\LignePanier;
use App\Models\Livraison;
use App\Models\Notification;
use App\Models\Paiement;
use App\Models\Panier;
use App\Models\Produit;
use App\Models\ProfilLivreur;
use App\Models\Restaurant;
use App\Models\StatutCommande;
use App\Models\User;
use App\Models\Zone;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Hash;

class JseExpressSeeder extends Seeder
{
    public function run(): void
    {
        $zoneCentre = Zone::query()->updateOrCreate(
            ['nom' => 'Centre'],
            [
                'description' => 'Zone centrale de desserte',
                'zone_parent_id' => null,
                'statut' => 'actif',
            ]
        );

        $zoneNord = Zone::query()->updateOrCreate(
            ['nom' => 'Nord'],
            [
                'description' => 'Zone nord de desserte',
                'zone_parent_id' => $zoneCentre->id,
                'statut' => 'actif',
            ]
        );

        $zoneSud = Zone::query()->updateOrCreate(
            ['nom' => 'Sud'],
            [
                'description' => 'Zone sud de desserte',
                'zone_parent_id' => $zoneCentre->id,
                'statut' => 'actif',
            ]
        );

        $statuts = [];

        foreach ([
            ['code' => 'EN_ATTENTE', 'libelle' => 'Reçue', 'ordre' => 1],
            ['code' => 'CONFIRMEE', 'libelle' => 'Confirmée', 'ordre' => 2],
            ['code' => 'EN_PREPARATION', 'libelle' => 'En préparation', 'ordre' => 3],
            ['code' => 'PRETE', 'libelle' => 'Prête / à récupérer', 'ordre' => 4],
            ['code' => 'EN_LIVRAISON', 'libelle' => 'En livraison', 'ordre' => 5],
            ['code' => 'LIVREE', 'libelle' => 'Livrée', 'ordre' => 6],
            ['code' => 'ANNULEE', 'libelle' => 'Annulée', 'ordre' => 7],
        ] as $data) {
            $statuts[$data['code']] = StatutCommande::query()->updateOrCreate(
                ['code' => $data['code']],
                [
                    'libelle' => $data['libelle'],
                    'ordre' => $data['ordre'],
                ]
            );
        }

        $comptesDemo = [
            'admin' => [
                'nom' => 'Admin',
                'prenom' => 'JSE',
                'telephone' => '0700000001',
                'email' => 'admin@jse-express.test',
                'role' => 'administrateur',
            ],
            'client' => [
                'nom' => 'Client',
                'prenom' => 'JSE',
                'telephone' => '0700000002',
                'email' => 'client@jse-express.test',
                'role' => 'client',
            ],
            'restaurant' => [
                'nom' => 'Restaurant',
                'prenom' => 'JSE',
                'telephone' => '0700000003',
                'email' => 'restaurant@jse-express.test',
                'role' => 'restaurant',
            ],
            'livreur' => [
                'nom' => 'Livreur',
                'prenom' => 'JSE',
                'telephone' => '0700000004',
                'email' => 'livreur@jse-express.test',
                'role' => 'livreur',
            ],
        ];

        $utilisateurs = [];

        foreach ($comptesDemo as $cle => $donnees) {
            $utilisateurs[$cle] = User::query()->updateOrCreate(
                ['telephone' => $donnees['telephone']],
                [
                    'nom' => $donnees['nom'],
                    'prenom' => $donnees['prenom'],
                    'email' => $donnees['email'],
                    'password' => Hash::make('password'),
                    'role' => $donnees['role'],
                    'statut' => 'actif',
                ]
            );
        }

        $admin = $utilisateurs['admin'];
        $client = $utilisateurs['client'];
        $restaurantUser = $utilisateurs['restaurant'];
        $livreurUser = $utilisateurs['livreur'];

        $profilLivreur = ProfilLivreur::query()->updateOrCreate(
            ['user_id' => $livreurUser->id],
            [
                'matricule' => 'JSE-LIV-0001',
                'zone_id' => $zoneCentre->id,
                'disponibilite' => 'disponible',
                'telephone_secondaire' => null,
            ]
        );

        $restaurant = Restaurant::query()->updateOrCreate(
            ['user_id' => $restaurantUser->id],
            [
                'zone_id' => $zoneCentre->id,
                'nom' => 'JSE Kitchen',
                'description' => 'Restaurant de démonstration JSE Express.',
                'telephone' => '0700000003',
                'email' => 'restaurant@jse-express.test',
                'adresse' => 'Centre-ville',
                'horaires' => '08:00-22:00',
                'statut' => 'actif',
            ]
        );

        $categoriePlats = Categorie::query()->updateOrCreate(
            ['restaurant_id' => $restaurant->id, 'nom' => 'Plats'],
            [
                'description' => 'Plats principaux',
                'statut' => 'actif',
            ]
        );

        $categorieBoissons = Categorie::query()->updateOrCreate(
            ['restaurant_id' => $restaurant->id, 'nom' => 'Boissons'],
            [
                'description' => 'Boissons',
                'statut' => 'actif',
            ]
        );

        $produit1 = Produit::query()->updateOrCreate(
            ['restaurant_id' => $restaurant->id, 'nom' => 'Plat de démonstration'],
            [
                'categorie_id' => $categoriePlats->id,
                'description' => 'Produit de test JSE Express.',
                'prix' => 3500,
                'image' => null,
                'disponible' => true,
                'statut' => 'actif',
            ]
        );

        $produit2 = Produit::query()->updateOrCreate(
            ['restaurant_id' => $restaurant->id, 'nom' => 'Menu complet'],
            [
                'categorie_id' => $categoriePlats->id,
                'description' => 'Menu de démonstration.',
                'prix' => 5000,
                'image' => null,
                'disponible' => true,
                'statut' => 'actif',
            ]
        );

        $produit3 = Produit::query()->updateOrCreate(
            ['restaurant_id' => $restaurant->id, 'nom' => 'Boisson'],
            [
                'categorie_id' => $categorieBoissons->id,
                'description' => 'Boisson de démonstration.',
                'prix' => 1000,
                'image' => null,
                'disponible' => true,
                'statut' => 'actif',
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | COMMANDE DE DÉMONSTRATION
        |--------------------------------------------------------------------------
        |
        | Si elle existe déjà, le seeder s'arrête ici afin de ne pas recréer
        | les lignes, paiements, livraisons et notifications associées.
        |
        */

        $commandeExistante = Commande::query()
            ->where('reference', 'JSE-000001')
            ->first();

        if ($commandeExistante) {
            $this->command?->info('JSE Express : données de développement déjà présentes.');
            $this->command?->info("Admin : {$admin->email}");
            $this->command?->info("Client : {$client->email}");
            $this->command?->info("Restaurant : {$restaurantUser->email}");
            $this->command?->info("Livreur : {$livreurUser->email}");

            return;
        }

        $panier = Panier::create([
            'user_id' => $client->id,
            'statut' => 'actif',
        ]);

        LignePanier::create([
            'panier_id' => $panier->id,
            'produit_id' => $produit1->id,
            'quantite' => 1,
            'prix_unitaire' => $produit1->prix,
        ]);

        LignePanier::create([
            'panier_id' => $panier->id,
            'produit_id' => $produit3->id,
            'quantite' => 2,
            'prix_unitaire' => $produit3->prix,
        ]);

        $sousTotal = ($produit1->prix * 1) + ($produit3->prix * 2);
        $fraisLivraison = 500;
        $montantTotal = $sousTotal + $fraisLivraison;

        $commande = Commande::create([
            'reference' => 'JSE-000001',
            'user_id' => $client->id,
            'restaurant_id' => $restaurant->id,
            'zone_id' => $zoneCentre->id,
            'statut_id' => $statuts['EN_LIVRAISON']->id,
            'adresse_livraison' => 'Centre-ville',
            'telephone_livraison' => $client->telephone,
            'sous_total' => $sousTotal,
            'frais_livraison' => $fraisLivraison,
            'montant_total' => $montantTotal,
            'pin_livraison_hash' => Hash::make('123456'),
            'pin_livraison_chiffre' => Crypt::encryptString('123456'),
            'pin_genere_at' => now(),
            'date_commande' => now(),
        ]);

        LigneCommande::create([
            'commande_id' => $commande->id,
            'produit_id' => $produit1->id,
            'nom_produit_snapshot' => $produit1->nom,
            'quantite' => 1,
            'prix_unitaire' => $produit1->prix,
            'total_ligne' => $produit1->prix,
        ]);

        LigneCommande::create([
            'commande_id' => $commande->id,
            'produit_id' => $produit3->id,
            'nom_produit_snapshot' => $produit3->nom,
            'quantite' => 2,
            'prix_unitaire' => $produit3->prix,
            'total_ligne' => $produit3->prix * 2,
        ]);

        Paiement::create([
            'commande_id' => $commande->id,
            'moyen' => 'mobile_money',
            'reference_transaction' => 'TX-JSE-000001',
            'montant' => $montantTotal,
            'statut' => 'reussi',
            'date_paiement' => now(),
        ]);

        $livraison = Livraison::create([
            'commande_id' => $commande->id,
            'zone_id' => $zoneCentre->id,
            'statut' => 'en_cours',
            'mode_attribution' => 'automatique',
            'date_attribution' => now(),
            'date_prise_en_charge' => now(),
            'date_livraison' => null,
        ]);

        AttributionLivraison::create([
            'livraison_id' => $livraison->id,
            'livreur_id' => $livreurUser->id,
            'admin_id' => null,
            'type_attribution' => 'automatique',
            'statut' => 'active',
            'date_attribution' => now(),
            'motif' => null,
        ]);

        foreach ([
            ['code' => 'EN_ATTENTE', 'user_id' => $client->id, 'commentaire' => 'Commande créée.', 'minutes' => 20],
            ['code' => 'CONFIRMEE', 'user_id' => $restaurantUser->id, 'commentaire' => 'Commande confirmée par le restaurant.', 'minutes' => 15],
            ['code' => 'EN_PREPARATION', 'user_id' => $restaurantUser->id, 'commentaire' => 'Commande en préparation.', 'minutes' => 10],
            ['code' => 'PRETE', 'user_id' => $restaurantUser->id, 'commentaire' => 'Commande prête.', 'minutes' => 5],
            ['code' => 'EN_LIVRAISON', 'user_id' => $livreurUser->id, 'commentaire' => 'Commande prise en charge pour livraison.', 'minutes' => 0],
        ] as $historique) {
            HistoriqueCommande::create([
                'commande_id' => $commande->id,
                'statut_id' => $statuts[$historique['code']]->id,
                'user_id' => $historique['user_id'],
                'commentaire' => $historique['commentaire'],
                'date_changement' => now()->subMinutes($historique['minutes']),
            ]);
        }

        Notification::create([
            'user_id' => $client->id,
            'commande_id' => $commande->id,
            'livraison_id' => $livraison->id,
            'type_evenement' => 'commande',
            'canal' => 'SMS',
            'contenu' => 'Votre commande JSE-000001 est en cours de livraison.',
            'telephone_destination' => $client->telephone,
            'operateur' => null,
            'statut_envoi' => 'en_attente',
            'tentatives' => 0,
            'date_envoi' => null,
        ]);

        $this->command?->info('JSE Express : données de développement créées.');
        $this->command?->info("Admin : {$admin->email}");
        $this->command?->info("Client : {$client->email}");
        $this->command?->info("Restaurant : {$restaurantUser->email}");
        $this->command?->info("Livreur : {$livreurUser->email}");
    }
}
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

class JseExpressSeeder extends Seeder
{
    public function run(): void
    {
        /*
        |--------------------------------------------------------------------------
        | ZONES
        |--------------------------------------------------------------------------
        */

        $zoneCentre = Zone::create([
            'nom' => 'Centre',
            'description' => 'Zone centrale de desserte',
            'zone_parent_id' => null,
            'statut' => 'actif',
        ]);

        $zoneNord = Zone::create([
            'nom' => 'Nord',
            'description' => 'Zone nord de desserte',
            'zone_parent_id' => $zoneCentre->id,
            'statut' => 'actif',
        ]);

        $zoneSud = Zone::create([
            'nom' => 'Sud',
            'description' => 'Zone sud de desserte',
            'zone_parent_id' => $zoneCentre->id,
            'statut' => 'actif',
        ]);

        /*
        |--------------------------------------------------------------------------
        | STATUTS COMMANDE
        |--------------------------------------------------------------------------
        |
        | Jeu de données de développement.
        | Ces valeurs ne constituent pas une nouvelle spécification métier.
        |
        */

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
            $statuts[$data['code']] = StatutCommande::create($data);
        }

        /*
        |--------------------------------------------------------------------------
        | UTILISATEURS
        |--------------------------------------------------------------------------
        */

        $admin = User::factory()
            ->administrateur()
            ->create([
                'nom' => 'Admin',
                'prenom' => 'JSE',
                'telephone' => '0700000001',
                'email' => 'admin@jse-express.test',
            ]);

        $client = User::factory()
            ->client()
            ->create([
                'nom' => 'Client',
                'prenom' => 'JSE',
                'telephone' => '0700000002',
                'email' => 'client@jse-express.test',
            ]);

        $restaurantUser = User::factory()
            ->restaurant()
            ->create([
                'nom' => 'Restaurant',
                'prenom' => 'JSE',
                'telephone' => '0700000003',
                'email' => 'restaurant@jse-express.test',
            ]);

        $livreurUser = User::factory()
            ->livreur()
            ->create([
                'nom' => 'Livreur',
                'prenom' => 'JSE',
                'telephone' => '0700000004',
                'email' => 'livreur@jse-express.test',
            ]);

        /*
        |--------------------------------------------------------------------------
        | PROFIL LIVREUR
        |--------------------------------------------------------------------------
        */

        $profilLivreur = ProfilLivreur::create([
            'user_id' => $livreurUser->id,
            'matricule' => 'JSE-LIV-0001',
            'zone_id' => $zoneCentre->id,
            'disponibilite' => 'disponible',
            'telephone_secondaire' => null,
        ]);

        /*
        |--------------------------------------------------------------------------
        | RESTAURANT
        |--------------------------------------------------------------------------
        */

        $restaurant = Restaurant::create([
            'user_id' => $restaurantUser->id,
            'zone_id' => $zoneCentre->id,
            'nom' => 'JSE Kitchen',
            'description' => 'Restaurant de démonstration JSE Express.',
            'telephone' => '0700000003',
            'email' => 'restaurant@jse-express.test',
            'adresse' => 'Centre-ville',
            'horaires' => '08:00-22:00',
            'statut' => 'actif',
        ]);

        /*
        |--------------------------------------------------------------------------
        | CATEGORIES
        |--------------------------------------------------------------------------
        */

        $categoriePlats = Categorie::create([
            'restaurant_id' => $restaurant->id,
            'nom' => 'Plats',
            'description' => 'Plats principaux',
            'statut' => 'actif',
        ]);

        $categorieBoissons = Categorie::create([
            'restaurant_id' => $restaurant->id,
            'nom' => 'Boissons',
            'description' => 'Boissons',
            'statut' => 'actif',
        ]);

        /*
        |--------------------------------------------------------------------------
        | PRODUITS
        |--------------------------------------------------------------------------
        */

        $produit1 = Produit::create([
            'restaurant_id' => $restaurant->id,
            'categorie_id' => $categoriePlats->id,
            'nom' => 'Plat de démonstration',
            'description' => 'Produit de test JSE Express.',
            'prix' => 3500,
            'image' => null,
            'disponible' => true,
            'statut' => 'actif',
        ]);

        $produit2 = Produit::create([
            'restaurant_id' => $restaurant->id,
            'categorie_id' => $categoriePlats->id,
            'nom' => 'Menu complet',
            'description' => 'Menu de démonstration.',
            'prix' => 5000,
            'image' => null,
            'disponible' => true,
            'statut' => 'actif',
        ]);

        $produit3 = Produit::create([
            'restaurant_id' => $restaurant->id,
            'categorie_id' => $categorieBoissons->id,
            'nom' => 'Boisson',
            'description' => 'Boisson de démonstration.',
            'prix' => 1000,
            'image' => null,
            'disponible' => true,
            'statut' => 'actif',
        ]);

        /*
        |--------------------------------------------------------------------------
        | PANIER
        |--------------------------------------------------------------------------
        */

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

        /*
        |--------------------------------------------------------------------------
        | COMMANDE
        |--------------------------------------------------------------------------
        */

        $sousTotal =
            ($produit1->prix * 1) +
            ($produit3->prix * 2);

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
            'date_commande' => now(),
        ]);

        /*
        |--------------------------------------------------------------------------
        | LIGNES COMMANDE
        |--------------------------------------------------------------------------
        */

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

        /*
        |--------------------------------------------------------------------------
        | PAIEMENT
        |--------------------------------------------------------------------------
        */

        Paiement::create([
            'commande_id' => $commande->id,
            'moyen' => 'mobile_money',
            'reference_transaction' => 'TX-JSE-000001',
            'montant' => $montantTotal,
            'statut' => 'reussi',
            'date_paiement' => now(),
        ]);

        /*
        |--------------------------------------------------------------------------
        | LIVRAISON
        |--------------------------------------------------------------------------
        */

        $livraison = Livraison::create([
            'commande_id' => $commande->id,
            'zone_id' => $zoneCentre->id,
            'statut' => 'en_cours',
            'mode_attribution' => 'automatique',
            'date_attribution' => now(),
            'date_prise_en_charge' => now(),
            'date_livraison' => null,
        ]);

        /*
        |--------------------------------------------------------------------------
        | ATTRIBUTION
        |--------------------------------------------------------------------------
        */

        AttributionLivraison::create([
            'livraison_id' => $livraison->id,
            'livreur_id' => $livreurUser->id,
            'admin_id' => null,
            'type_attribution' => 'automatique',
            'statut' => 'active',
            'date_attribution' => now(),
            'motif' => null,
        ]);

        /*
        |--------------------------------------------------------------------------
        | HISTORIQUE
        |--------------------------------------------------------------------------
        */

        HistoriqueCommande::create([
            'commande_id' => $commande->id,
            'statut_id' => $statuts['EN_ATTENTE']->id,
            'user_id' => $client->id,
            'commentaire' => 'Commande créée.',
            'date_changement' => now()->subMinutes(20),
        ]);

        HistoriqueCommande::create([
            'commande_id' => $commande->id,
            'statut_id' => $statuts['CONFIRMEE']->id,
            'user_id' => $restaurantUser->id,
            'commentaire' => 'Commande confirmée par le restaurant.',
            'date_changement' => now()->subMinutes(15),
        ]);

        HistoriqueCommande::create([
            'commande_id' => $commande->id,
            'statut_id' => $statuts['EN_PREPARATION']->id,
            'user_id' => $restaurantUser->id,
            'commentaire' => 'Commande en préparation.',
            'date_changement' => now()->subMinutes(10),
        ]);

        HistoriqueCommande::create([
            'commande_id' => $commande->id,
            'statut_id' => $statuts['PRETE']->id,
            'user_id' => $restaurantUser->id,
            'commentaire' => 'Commande prête.',
            'date_changement' => now()->subMinutes(5),
        ]);

        HistoriqueCommande::create([
            'commande_id' => $commande->id,
            'statut_id' => $statuts['EN_LIVRAISON']->id,
            'user_id' => $livreurUser->id,
            'commentaire' => 'Commande prise en charge pour livraison.',
            'date_changement' => now(),
        ]);

        /*
        |--------------------------------------------------------------------------
        | NOTIFICATIONS
        |--------------------------------------------------------------------------
        */

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

        /*
        |--------------------------------------------------------------------------
        | MESSAGE CONSOLE
        |--------------------------------------------------------------------------
        */

        $this->command?->info('JSE Express : données de développement créées.');
        $this->command?->info("Admin : {$admin->email}");
        $this->command?->info("Client : {$client->email}");
        $this->command?->info("Restaurant : {$restaurantUser->email}");
        $this->command?->info("Livreur : {$livreurUser->email}");
    }
}
<?php

namespace Database\Seeders;

use App\Models\StatutCommande;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Données minimales pour une base de PRODUCTION vide.
 * Aucune donnée de test, aucun compte de démonstration.
 *
 *   php artisan db:seed --class=ProductionSeeder --force
 *
 * Variables requises pour créer l'administrateur :
 *   ADMIN_NOM, ADMIN_TELEPHONE, ADMIN_PASSWORD (12 caractères minimum), ADMIN_EMAIL (facultatif)
 */
class ProductionSeeder extends Seeder
{
    public function run(): void
    {
        foreach ([
            ['code' => 'EN_ATTENTE', 'libelle' => 'Reçue', 'ordre' => 1],
            ['code' => 'CONFIRMEE', 'libelle' => 'Confirmée', 'ordre' => 2],
            ['code' => 'EN_PREPARATION', 'libelle' => 'En préparation', 'ordre' => 3],
            ['code' => 'PRETE', 'libelle' => 'Prête / à récupérer', 'ordre' => 4],
            ['code' => 'EN_LIVRAISON', 'libelle' => 'En livraison', 'ordre' => 5],
            ['code' => 'LIVREE', 'libelle' => 'Livrée', 'ordre' => 6],
            ['code' => 'ANNULEE', 'libelle' => 'Annulée', 'ordre' => 7],
        ] as $statut) {
            StatutCommande::query()->updateOrCreate(
                ['code' => $statut['code']],
                ['libelle' => $statut['libelle'], 'ordre' => $statut['ordre']],
            );
        }

        $this->command?->info('Statuts de commande : OK');

        $telephone = env('ADMIN_TELEPHONE');
        $motDePasse = env('ADMIN_PASSWORD');

        if (! $telephone || ! $motDePasse) {
            $this->command?->warn('ADMIN_TELEPHONE / ADMIN_PASSWORD absents : aucun administrateur créé.');

            return;
        }

        if (strlen($motDePasse) < 12) {
            $this->command?->error('ADMIN_PASSWORD doit contenir au moins 12 caractères : administrateur non créé.');

            return;
        }

        User::query()->updateOrCreate(
            ['telephone' => $telephone],
            [
                'nom' => env('ADMIN_NOM', 'Administrateur'),
                'prenom' => env('ADMIN_PRENOM', 'JSE Express'),
                'email' => env('ADMIN_EMAIL') ?: null,
                'password' => Hash::make($motDePasse),
                'role' => 'administrateur',
                'statut' => 'actif',
            ],
        );

        $this->command?->info('Administrateur : '.$telephone);
    }
}

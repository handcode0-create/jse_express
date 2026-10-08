<?php

namespace Database\Seeders;

use App\Models\ProfilLivreur;
use App\Models\User;
use App\Models\Zone;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

/**
 * Livreurs de démonstration répartis par zone, pour tester l'attribution automatique
 * et la réattribution administrative.
 *
 * Les identités, téléphones et matricules sont fictifs : ce seeder sert aux tests en local
 * et ne doit pas être exécuté en production. Il est rejouable (un compte par téléphone,
 * un profil par compte) et ne supprime rien.
 */
class LivreursAdzopeSeeder extends Seeder
{
    public function run(): void
    {
        if (app()->isProduction()) {
            throw new RuntimeException('LivreursAdzopeSeeder contient des comptes fictifs et ne doit pas être exécuté en production.');
        }

        DB::transaction(function () {
            foreach ($this->livreurs() as $index => $livreur) {
                $zone = Zone::query()->firstOrCreate(
                    ['nom' => $livreur['zone']],
                    ['description' => 'Zone de desserte '.$livreur['zone'], 'zone_parent_id' => null, 'statut' => 'actif']
                );

                $utilisateur = User::query()->updateOrCreate(
                    ['telephone' => sprintf('00000002%02d', $index + 1)],
                    [
                        'nom' => 'Démo Adzopé',
                        'prenom' => 'Livreur '.($index + 2),
                        'email' => sprintf('livreur-%02d@jse-express.test', $index + 2),
                        'password' => Hash::make('password'),
                        'role' => 'livreur',
                        'statut' => 'actif',
                    ]
                );

                ProfilLivreur::query()->updateOrCreate(
                    ['user_id' => $utilisateur->id],
                    [
                        'matricule' => sprintf('JSE-LIV-%04d', $index + 2),
                        'zone_id' => $zone->id,
                        'disponibilite' => $livreur['disponibilite'],
                        'telephone_secondaire' => null,
                    ]
                );
            }
        });
    }

    /**
     * @return list<array{zone: string, disponibilite: string}>
     */
    private function livreurs(): array
    {
        return [
            ['zone' => 'Centre', 'disponibilite' => 'disponible'],
            ['zone' => 'Centre', 'disponibilite' => 'disponible'],
            ['zone' => 'Nord', 'disponibilite' => 'disponible'],
            ['zone' => 'Sud', 'disponibilite' => 'indisponible'],
        ];
    }
}

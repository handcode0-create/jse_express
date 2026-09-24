<?php

namespace Database\Factories;

use App\Models\ProfilLivreur;
use App\Models\User;
use App\Models\Zone;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProfilLivreurFactory extends Factory
{
    protected $model = ProfilLivreur::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory()->livreur(),
            'matricule' => 'JSE-LIV-' . fake()->unique()->numerify('####'),
            'zone_id' => Zone::factory(),
            'disponibilite' => 'disponible',
            'telephone_secondaire' => null,
        ];
    }
}
<?php

namespace Database\Factories;

use App\Models\Panier;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PanierFactory extends Factory
{
    protected $model = Panier::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory()->client(),
            'statut' => 'actif',
        ];
    }
}
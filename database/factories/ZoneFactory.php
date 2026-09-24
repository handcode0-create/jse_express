<?php

namespace Database\Factories;

use App\Models\Zone;
use Illuminate\Database\Eloquent\Factories\Factory;

class ZoneFactory extends Factory
{
    protected $model = Zone::class;

    public function definition(): array
    {
        return [
            'nom' => fake()->unique()->city(),
            'description' => fake()->optional()->sentence(),
            'zone_parent_id' => null,
            'statut' => 'actif',
        ];
    }
}
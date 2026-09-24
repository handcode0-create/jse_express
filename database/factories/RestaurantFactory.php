<?php

namespace Database\Factories;

use App\Models\Restaurant;
use App\Models\User;
use App\Models\Zone;
use Illuminate\Database\Eloquent\Factories\Factory;

class RestaurantFactory extends Factory
{
    protected $model = Restaurant::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory()->restaurant(),
            'zone_id' => Zone::factory(),
            'nom' => fake()->company(),
            'description' => fake()->optional()->paragraph(),
            'telephone' => fake()->numerify('07########'),
            'email' => fake()->unique()->safeEmail(),
            'adresse' => fake()->address(),
            'horaires' => '08:00-22:00',
            'statut' => 'actif',
        ];
    }
}
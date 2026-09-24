<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    protected $model = User::class;

    public function definition(): array
    {
        return [
            'nom' => fake()->lastName(),
            'prenom' => fake()->firstName(),
            'telephone' => fake()->unique()->numerify('07########'),
            'email' => fake()->unique()->safeEmail(),
            'password' => Hash::make('password'),
            'role' => 'client',
            'statut' => 'actif',
        ];
    }

    public function administrateur(): static
    {
        return $this->state(fn () => [
            'role' => 'administrateur',
        ]);
    }

    public function client(): static
    {
        return $this->state(fn () => [
            'role' => 'client',
        ]);
    }

    public function restaurant(): static
    {
        return $this->state(fn () => [
            'role' => 'restaurant',
        ]);
    }

    public function livreur(): static
    {
        return $this->state(fn () => [
            'role' => 'livreur',
        ]);
    }
}
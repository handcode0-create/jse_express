<?php

namespace Database\Factories;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class NotificationFactory extends Factory
{
    protected $model = Notification::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'commande_id' => null,
            'livraison_id' => null,
            'type_evenement' => 'commande',
            'canal' => 'SMS',
            'contenu' => fake()->sentence(),
            'telephone_destination' => fake()->numerify('07########'),
            'operateur' => null,
            'statut_envoi' => 'en_attente',
            'tentatives' => 0,
            'date_envoi' => null,
        ];
    }
}
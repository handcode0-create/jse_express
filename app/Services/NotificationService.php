<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;

class NotificationService
{
    public function sms(
        User $destinataire,
        string $contenu,
        ?int $commandeId = null,
        ?int $livraisonId = null,
        string $typeEvenement = 'commande'
    ): Notification {
        return Notification::create([
            'user_id' => $destinataire->id,
            'commande_id' => $commandeId,
            'livraison_id' => $livraisonId,
            'type_evenement' => $typeEvenement,
            'canal' => 'SMS',
            'contenu' => $contenu,
            'telephone_destination' => $destinataire->telephone,
            'operateur' => null,
            'statut_envoi' => 'en_attente',
            'tentatives' => 0,
            'date_envoi' => null,
        ]);
    }
}
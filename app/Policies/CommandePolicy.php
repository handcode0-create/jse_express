<?php

namespace App\Policies;

use App\Models\Commande;
use App\Models\User;

class CommandePolicy
{
    private const STATUTS_ANNULABLES = [
        'EN_ATTENTE',
        'CONFIRMEE',
    ];

    public function annuler(User $user, Commande $commande): bool
    {
        return (int) $commande->user_id === (int) $user->id;
    }

    public function peutEtreAnnulee(Commande $commande): bool
    {
        return in_array(
            $commande->statutCommande?->code,
            self::STATUTS_ANNULABLES,
            true
        );
    }
}

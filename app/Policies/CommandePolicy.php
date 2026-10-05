<?php

namespace App\Policies;

use App\Models\Commande;
use App\Models\User;
use App\Services\CommandeService;

class CommandePolicy
{
    public function annuler(User $user, Commande $commande): bool
    {
        return (int) $commande->user_id === (int) $user->id;
    }

    public function peutEtreAnnulee(Commande $commande): bool
    {
        return in_array(
            $commande->statutCommande?->code,
            CommandeService::STATUTS_ANNULABLES,
            true
        );
    }
}

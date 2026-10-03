<?php

namespace App\Policies;

use App\Models\MoyenPaiement;
use App\Models\User;

class MoyenPaiementPolicy
{
    public function update(User $user, MoyenPaiement $moyenPaiement): bool
    {
        return $user->role === 'client' && (int) $moyenPaiement->user_id === (int) $user->id;
    }

    public function delete(User $user, MoyenPaiement $moyenPaiement): bool
    {
        return $user->role === 'client' && (int) $moyenPaiement->user_id === (int) $user->id;
    }
}

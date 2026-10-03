<?php

namespace App\Policies;

use App\Models\AdresseLivraison;
use App\Models\User;

class AdresseLivraisonPolicy
{
    public function update(User $user, AdresseLivraison $adresseLivraison): bool
    {
        return $user->role === 'client' && (int) $adresseLivraison->user_id === (int) $user->id;
    }

    public function delete(User $user, AdresseLivraison $adresseLivraison): bool
    {
        return $user->role === 'client' && (int) $adresseLivraison->user_id === (int) $user->id;
    }
}

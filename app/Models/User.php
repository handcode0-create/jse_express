<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;


class User extends Authenticatable
{
    protected $fillable = [
        'nom',
        'prenom',
        'telephone',
        'email',
        'password',
        'role',
        'statut',
    ];

    public function restaurant(): HasOne
    {
        return $this->hasOne(Restaurant::class, 'user_id', 'id');
    }

    public function paniers(): HasMany
    {
        return $this->hasMany(Panier::class, 'user_id', 'id');
    }

    public function commandes(): HasMany
    {
        return $this->hasMany(Commande::class, 'user_id', 'id');
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class, 'user_id', 'id');
    }

    public function profilLivreur(): HasOne
    {
        return $this->hasOne(ProfilLivreur::class, 'user_id', 'id');
    }
}

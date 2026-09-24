<?php

namespace AppModels;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    use HasFactory;

    protected $fillable = [
        'nom','prenom','telephone','email','password','role','statut',
    ];

    public function restaurant(): HasOne { return $this->hasOne(Restaurant::class, 'user_id', 'id'); }
    public function paniers(): HasMany { return $this->hasMany(Panier::class, 'user_id', 'id'); }
    public function commandes(): HasMany { return $this->hasMany(Commande::class, 'user_id', 'id'); }
    public function notifications(): HasMany { return $this->hasMany(Notification::class, 'user_id', 'id'); }
    public function profilLivreur(): HasOne { return $this->hasOne(ProfilLivreur::class, 'user_id', 'id'); }
    public function adressesLivraison(): HasMany { return $this->hasMany(AdresseLivraison::class, 'user_id', 'id'); }
    public function moyensPaiement(): HasMany { return $this->hasMany(MoyenPaiement::class, 'user_id', 'id'); }
    public function favoris(): HasMany { return $this->hasMany(Favori::class, 'user_id', 'id'); }
}

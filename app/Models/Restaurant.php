<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class Restaurant extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id','zone_id','nom','description','telephone','email','adresse','horaires','statut'
    ];

    public function user(): BelongsTo { return $this->belongsTo(User::class, 'user_id', 'id'); }
    public function zone(): BelongsTo { return $this->belongsTo(Zone::class, 'zone_id', 'id'); }
    public function categories(): HasMany { return $this->hasMany(Categorie::class, 'restaurant_id', 'id'); }
    public function produits(): HasMany { return $this->hasMany(Produit::class, 'restaurant_id', 'id'); }
    public function commandes(): HasMany { return $this->hasMany(Commande::class, 'restaurant_id', 'id'); }
    public function favoris(): HasMany { return $this->hasMany(Favori::class, 'restaurant_id', 'id'); }
}

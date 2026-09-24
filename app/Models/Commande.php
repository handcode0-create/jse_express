<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;

class Commande extends Model
{

    public $timestamps = false;
    protected $casts = [
        'date_commande' => 'datetime',
        'sous_total' => 'decimal:2',
        'frais_livraison' => 'decimal:2',
        'montant_total' => 'decimal:2',
    ];

    protected $fillable = [
        'reference',
        'user_id',
        'restaurant_id',
        'zone_id',
        'statut_id',
        'adresse_livraison',
        'telephone_livraison',
        'sous_total',
        'frais_livraison',
        'montant_total',
        'date_commande',
    ];


    
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class, 'restaurant_id', 'id');
    }

    public function zone(): BelongsTo
    {
        return $this->belongsTo(Zone::class, 'zone_id', 'id');
    }

    public function statutCommande(): BelongsTo
    {
        return $this->belongsTo(StatutCommande::class, 'statut_id', 'id');
    }

    public function paiements(): HasMany
    {
        return $this->hasMany(Paiement::class, 'commande_id', 'id');
    }

    public function livraison(): HasOne
    {
        return $this->hasOne(Livraison::class, 'commande_id', 'id');
    }

    public function historiquesCommande(): HasMany
    {
        return $this->hasMany(HistoriqueCommande::class, 'commande_id', 'id');
    }

    public function lignesCommande(): HasMany
    {
        return $this->hasMany(LigneCommande::class, 'commande_id', 'id');
    }
}
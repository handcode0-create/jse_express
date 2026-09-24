<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class LignePanier extends Model
{

    public $timestamps = false;
    protected $fillable = [
        'panier_id',
        'produit_id',
        'quantite',
        'prix_unitaire',
    ];

    public function panier(): BelongsTo
    {
        return $this->belongsTo(Panier::class, 'panier_id', 'id');
    }

    public function produit(): BelongsTo
    {
        return $this->belongsTo(Produit::class, 'produit_id', 'id');
    }

}

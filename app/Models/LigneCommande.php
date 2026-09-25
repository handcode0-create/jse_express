<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class LigneCommande extends Model
{
    
    use HasFactory;
public $timestamps = false;
    protected $fillable = [
        'commande_id',
        'produit_id',
        'nom_produit_snapshot',
        'quantite',
        'prix_unitaire',
        'total_ligne',
    ];

    public function commande(): BelongsTo
    {
        return $this->belongsTo(Commande::class, 'commande_id', 'id');
    }

    public function produit(): BelongsTo
    {
        return $this->belongsTo(Produit::class, 'produit_id', 'id');
    }
}
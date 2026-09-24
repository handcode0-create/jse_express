<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class Paiement extends Model
{   
    public $timestamps = false;
    protected $fillable = [
        'commande_id',
        'moyen',
        'reference_transaction',
        'montant',
        'statut',
        'date_paiement',
    ];

    public function commande(): BelongsTo
    {
        return $this->belongsTo(Commande::class, 'commande_id', 'id');
    }

}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TarifLivraison extends Model
{
    protected $table = 'tarifs_livraison';

    protected $fillable = ['distance_min_km', 'distance_max_km', 'frais', 'statut'];

    protected $casts = [
        'distance_min_km' => 'decimal:2',
        'distance_max_km' => 'decimal:2',
        'frais' => 'decimal:2',
    ];
}

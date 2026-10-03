<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdresseLivraison extends Model
{
    protected $table = 'adresses_livraison';

    protected $fillable = [
        'user_id',
        'zone_id',
        'libelle',
        'adresse',
        'complement',
        'telephone',
        'latitude',
        'longitude',
        'par_defaut',
        'statut',
    ];

    protected $casts = ['par_defaut' => 'boolean', 'latitude' => 'float', 'longitude' => 'float'];

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function zone(): BelongsTo { return $this->belongsTo(Zone::class); }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;

class Livraison extends Model
{   

    
    use HasFactory;
public $timestamps = false;
    protected $fillable = [
        'commande_id',
        'zone_id',
        'statut',
        'mode_attribution',
        'date_attribution',
        'date_prise_en_charge',
        'date_livraison',
    ];

    public function commande(): BelongsTo
    {
        return $this->belongsTo(Commande::class, 'commande_id', 'id');
    }

    public function zone(): BelongsTo
    {
        return $this->belongsTo(Zone::class, 'zone_id', 'id');
    }

    public function attributions(): HasMany
    {
        return $this->hasMany(AttributionLivraison::class,'livraison_id', 'id');
    }
}
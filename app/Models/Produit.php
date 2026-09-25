<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;

class Produit extends Model
{

    
    use HasFactory;
public $timestamps = false;
    protected $fillable = [
        'restaurant_id',
        'categorie_id',
        'nom',
        'description',
        'prix',
        'image',
        'options',
        'disponible',
        'statut',
    ];

    protected $casts = [
        'options' => 'array',
        'disponible' => 'boolean',
    ];

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class, 'restaurant_id', 'id');
    }
    
    public function categorie(): BelongsTo
    {
        return $this->belongsTo(Categorie::class, 'categorie_id', 'id');
    }

    public function lignesPanier(): HasMany
    {
        return $this->hasMany(LignePanier::class, 'produit_id', 'id');
    }
}

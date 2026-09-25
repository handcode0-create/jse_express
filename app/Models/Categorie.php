<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;

class Categorie extends Model
{

    
    use HasFactory;
public $timestamps = false;
    protected $fillable = [
        'restaurant_id',
        'nom',
        'description',
        'statut',
    ];

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class, 'restaurant_id', 'id');
    }

    public function produits(): HasMany
    {
        return $this->hasMany(Produit::class, 'categorie_id', 'id');
    }
}

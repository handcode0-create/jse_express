<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;

class Panier extends Model
{
    protected $fillable = [
        'user_id',
        'statut',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function lignesPanier(): HasMany
    {
        return $this->hasMany(LignePanier::class, 'panier_id', 'id');
    }
}

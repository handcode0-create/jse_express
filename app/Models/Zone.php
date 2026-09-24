<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;

class Zone extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'nom',
        'description',
        'zone_parent_id',
        'statut',
    ];


    public function zoneParent(): BelongsTo
    {
        return $this->belongsTo(Zone::class, 'zone_parent_id', 'id');
    }

    public function enfants(): HasMany
    {
        return $this->hasMany(Zone::class, 'zone_parent_id', 'id');
    }

    public function restaurants(): HasMany
    {
        return $this->hasMany(Restaurant::class, 'zone_id', 'id');
    }

    public function livraisons(): HasMany
    {
        return $this->hasMany(Livraison::class, 'zone_id', 'id');
    }
}

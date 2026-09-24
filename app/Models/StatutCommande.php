<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StatutCommande extends Model
{
    use HasFactory;

    protected $table = 'statuts_commandes';

    public $timestamps = false;

    protected $fillable = [
        'code',
        'libelle',
        'ordre',
    ];

    public function commandes(): HasMany
    {
        return $this->hasMany(Commande::class, 'statut_id', 'id');
    }
}
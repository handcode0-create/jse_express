<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class AttributionLivraison extends Model
{
    protected $table = 'attributions_livraison';

    public $timestamps = false;

    protected $fillable = [
        'livraison_id',
        'livreur_id',
        'admin_id',
        'type_attribution',
        'statut',
        'date_attribution',
        'motif',
    ];

    public function livraison(): BelongsTo
    {
        return $this->belongsTo(Livraison::class, 'livraison_id', 'id');
    }

    public function livreur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'livreur_id', 'id');
    }

    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id', 'id');
    }
}

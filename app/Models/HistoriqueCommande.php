<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class HistoriqueCommande extends Model
{
    use HasFactory;

    public $timestamps = false;
    protected $fillable = [
        'commande_id',
        'statut_id',
        'user_id',
        'commentaire',
        'date_changement',
    ];

    public function commande(): BelongsTo
    {
        return $this->belongsTo(Commande::class, 'commande_id', 'id');
    }

    public function statut(): BelongsTo
    {
        return $this->belongsTo(StatutCommande::class, 'statut_id', 'id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

}





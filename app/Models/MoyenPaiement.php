<?php

namespace AppModels;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MoyenPaiement extends Model
{
    protected $table = 'moyens_paiement';

    protected $fillable = [
        'user_id',
        'type',
        'operateur',
        'libelle',
        'identifiant_masque',
        'reference_externe',
        'par_defaut',
        'statut',
    ];

    protected $casts = ['par_defaut' => 'boolean'];

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
}

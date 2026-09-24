<?php

namespace AppModels;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Favori extends Model
{
    protected $table = 'favoris';

    protected $fillable = ['user_id', 'restaurant_id'];

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function restaurant(): BelongsTo { return $this->belongsTo(Restaurant::class); }
}

<?php

namespace App\Models;

use Closure;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    use HasFactory;

    protected $fillable = [
        'nom','prenom','telephone','email','photo_profil','couverture_profil','password','role','statut',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Normalise un numéro ivoirien au format international sans symbole
     * (ex. « 07 00 00 00 01 » → « 2250700000001 »).
     */
    public static function normaliserTelephone(string $telephone): string
    {
        $telephone = preg_replace('/[^0-9]/', '', $telephone) ?? '';

        if (str_starts_with($telephone, '00225')) {
            $telephone = substr($telephone, 2);
        }

        if (str_starts_with($telephone, '0') && strlen($telephone) === 10) {
            $telephone = '225' . $telephone;
        }

        return $telephone;
    }

    /**
     * Règle de validation : le numéro (une fois normalisé) ne doit pas déjà
     * appartenir à un autre compte, quel que soit le format enregistré.
     */
    public static function regleTelephoneUnique(?int $ignorerId = null): Closure
    {
        return function (string $attribut, mixed $valeur, Closure $echec) use ($ignorerId) {
            $normalise = self::normaliserTelephone((string) $valeur);

            if ($normalise === '') {
                return;
            }

            $dejaUtilise = self::query()
                ->when($ignorerId !== null, fn ($query) => $query->whereKeyNot($ignorerId))
                ->pluck('telephone')
                ->contains(fn ($telephone) => self::normaliserTelephone((string) $telephone) === $normalise);

            if ($dejaUtilise) {
                $echec('Ce numéro est déjà utilisé.');
            }
        };
    }

    public function restaurant(): HasOne { return $this->hasOne(Restaurant::class, 'user_id', 'id'); }
    public function paniers(): HasMany { return $this->hasMany(Panier::class, 'user_id', 'id'); }
    public function commandes(): HasMany { return $this->hasMany(Commande::class, 'user_id', 'id'); }
    public function notifications(): HasMany { return $this->hasMany(Notification::class, 'user_id', 'id'); }
    public function profilLivreur(): HasOne { return $this->hasOne(ProfilLivreur::class, 'user_id', 'id'); }
    public function adressesLivraison(): HasMany { return $this->hasMany(AdresseLivraison::class, 'user_id', 'id'); }
    public function moyensPaiement(): HasMany { return $this->hasMany(MoyenPaiement::class, 'user_id', 'id'); }
    public function favoris(): HasMany { return $this->hasMany(Favori::class, 'user_id', 'id'); }
}

<?php

namespace App\Services;

use App\Models\User;
use Closure;

/**
 * Numéros de téléphone ivoiriens : forme canonique (`225` + 10 chiffres), formes équivalentes
 * et contrôle d'unicité indépendant du format de saisie.
 */
class TelephoneService
{
    /** Forme canonique : chiffres seuls, préfixe pays `225` (ex. `0701020304` devient `2250701020304`). */
    public function normaliser(string $telephone): string
    {
        $chiffres = preg_replace('/[^0-9]/', '', $telephone) ?? '';

        if (str_starts_with($chiffres, '00225')) {
            $chiffres = substr($chiffres, 2);
        }

        if (str_starts_with($chiffres, '0') && strlen($chiffres) === 10) {
            $chiffres = '225'.$chiffres;
        }

        return $chiffres;
    }

    /**
     * Écritures équivalentes d'un même numéro, telles qu'elles ont pu être enregistrées.
     *
     * @return list<string>
     */
    public function variantes(string $telephone): array
    {
        $canonique = $this->normaliser($telephone);
        $local = str_starts_with($canonique, '225') && strlen($canonique) === 13 ? substr($canonique, 3) : null;

        return array_values(array_unique(array_filter([$canonique, $local, '00'.$canonique])));
    }

    /** Vrai si un autre compte utilise déjà ce numéro, quel que soit son format d'écriture. */
    public function dejaUtilise(string $telephone, ?int $ignorerUserId = null): bool
    {
        $variantes = $this->variantes($telephone);

        if ($variantes === []) {
            return false;
        }

        // Compare les numéros enregistrés une fois espaces, tirets, points, plus et parenthèses retirés.
        $nettoye = "REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(telephone, ' ', ''), '-', ''), '.', ''), '+', ''), '(', ''), ')', '')";

        return User::query()
            ->when($ignorerUserId, fn ($requete) => $requete->where('id', '!=', $ignorerUserId))
            ->whereRaw($nettoye.' IN ('.implode(',', array_fill(0, count($variantes), '?')).')', $variantes)
            ->exists();
    }

    /**
     * Règle de validation « numéro unique » insensible au format.
     *
     * @return Closure(string, mixed, Closure(string): void): void
     */
    public function regleUnique(?int $ignorerUserId = null, string $message = 'Ce numéro de téléphone est déjà utilisé par un autre compte.'): Closure
    {
        return function (string $attribut, mixed $valeur, Closure $echec) use ($ignorerUserId, $message): void {
            if (is_string($valeur) && $valeur !== '' && $this->dejaUtilise($valeur, $ignorerUserId)) {
                $echec($message);
            }
        };
    }
}

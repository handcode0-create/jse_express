<?php

namespace App\Services;

use App\Models\LignePanier;
use Illuminate\Support\Collection;

class PanierService
{
    public function prixUnitaire(LignePanier $ligne): float
    {
        $produit = $ligne->produit;
        abort_unless($produit && $produit->statut === 'actif' && $produit->disponible, 422, 'Un produit du panier n’est plus disponible.');

        $configuration = collect($produit->options ?? []);
        $selection = collect($ligne->options ?? []);

        foreach ($selection as $choix) {
            $groupe = $configuration->first(fn ($item) => ($item['name'] ?? '') === ($choix['groupe'] ?? ''));
            abort_unless($groupe, 422, 'Une option du panier n’existe plus.');

            $item = collect($groupe['items'] ?? [])->first(fn ($element) =>
                ($element['name'] ?? '') === ($choix['nom'] ?? '')
                && (bool) ($element['disponible'] ?? true)
            );
            abort_unless($item, 422, 'Une option du panier n’est plus disponible.');
        }

        foreach ($configuration as $groupe) {
            $nomGroupe = $groupe['name'] ?? '';
            $nombre = $selection->where('groupe', $nomGroupe)->count();
            $minimum = (int) ($groupe['min'] ?? 0);
            $maximum = (int) ($groupe['max'] ?? 1);

            if (($groupe['obligatoire'] ?? false) && $minimum < 1) {
                $minimum = 1;
            }

            abort_unless($nombre >= $minimum, 422, "Une sélection est manquante dans « {$nomGroupe} ».");
            abort_unless($nombre <= $maximum, 422, "Trop d’options dans « {$nomGroupe} ».");

            if (! ($groupe['multiple'] ?? false)) {
                abort_unless($nombre <= 1, 422, "Une seule option est autorisée dans « {$nomGroupe} ».");
            }
        }

        return (float) $produit->prix + (float) $selection->sum(function ($choix) use ($configuration) {
            $groupe = $configuration->first(fn ($item) => ($item['name'] ?? '') === ($choix['groupe'] ?? ''));
            $item = collect($groupe['items'] ?? [])->first(fn ($element) => ($element['name'] ?? '') === ($choix['nom'] ?? ''));
            return (float) ($item['prix'] ?? 0);
        });
    }
}

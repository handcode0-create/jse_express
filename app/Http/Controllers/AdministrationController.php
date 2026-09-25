<?php

namespace App\Http\Controllers;

use App\Models\Commande;
use App\Models\Livraison;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class AdministrationController extends Controller
{
    public function tableauDeBord(): Response
    {
        return Inertia::render('Admin/TableauDeBord', [
            'statistiques' => [
                'commandes_actives' => Commande::query()->whereHas('statutCommande', fn ($q) => $q->whereNotIn('code', ['LIVREE', 'ANNULEE']))->count(),
                'commandes_livrees' => Commande::query()->whereHas('statutCommande', fn ($q) => $q->where('code', 'LIVREE'))->count(),
                'livraisons_actives' => Livraison::query()->whereIn('statut', ['en_attente', 'attribuee', 'en_cours'])->count(),
                'livreurs_disponibles' => User::query()->where('role', 'livreur')->where('statut', 'actif')->whereHas('profilLivreur', fn ($q) => $q->where('disponibilite', 'disponible'))->count(),
            ],
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Commande;
use App\Models\HistoriqueCommande;
use App\Models\StatutCommande;
use App\Models\Livraison;
use App\Services\LivraisonService;
use App\Services\NotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
    public function annulerCommande(Request $request, Commande $commande): RedirectResponse
    {
        $donnees = $request->validate(['motif' => ['nullable', 'string', 'max:500']]);

        DB::transaction(function () use ($request, $commande, $donnees) {
            $commande = Commande::query()->whereKey($commande->id)->lockForUpdate()->with('statutCommande')->firstOrFail();
            abort_unless(in_array($commande->statutCommande?->code, ['EN_ATTENTE', 'CONFIRMEE', 'EN_PREPARATION'], true), 422, 'Cette commande ne peut plus être annulée.');
            $statut = StatutCommande::query()->where('code', 'ANNULEE')->firstOrFail();
            $commande->update(['statut_id' => $statut->id]);
            HistoriqueCommande::create([
                'commande_id' => $commande->id,
                'statut_id' => $statut->id,
                'user_id' => $request->user()->id,
                'commentaire' => $donnees['motif'] ?? 'Commande annulée par l’administrateur.',
                'date_changement' => now(),
            ]);
        });

        return back()->with('success', 'La commande a été annulée.');
    }

    public function reattribuerLivraison(Request $request, Livraison $livraison, LivraisonService $livraisonService, NotificationService $notificationService): RedirectResponse
    {
        $donnees = $request->validate([
            'livreur_id' => ['required', 'integer', 'exists:users,id'],
            'motif' => ['required', 'string', 'max:500'],
        ]);

        $livreur = User::query()->whereKey($donnees['livreur_id'])->where('role', 'livreur')->where('statut', 'actif')->with('profilLivreur')->firstOrFail();
        abort_unless($livreur->profilLivreur?->zone_id === $livraison->zone_id, 422, 'Le livreur doit appartenir à la zone de la livraison.');

        $livraisonService->reattribuer($livraison, $request->user()->id, $livreur->id, $donnees['motif']);
        $livraison->load('commande.user');
        $commande = $livraison->commande;
        $pin = \Illuminate\Support\Facades\Crypt::decryptString($commande->pin_livraison_chiffre);
        $notificationService->sms($livreur, 'Une livraison '.$commande->reference.' vous a été attribuée par l’administration.', $commande->id, $livraison->id, 'attribution');
        $notificationService->sms($commande->user, 'Votre code de livraison pour '.$commande->reference.' est '.$pin.'.', $commande->id, $livraison->id, 'pin_livraison');
        return back()->with('success', 'La livraison a été réattribuée.');
    }

}

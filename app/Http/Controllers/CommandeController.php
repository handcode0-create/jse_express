<?php

namespace App\Http\Controllers;

use App\Models\Commande;
use App\Models\HistoriqueCommande;
use App\Models\StatutCommande;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CommandeController extends Controller
{
    public function annuler(Request $request, Commande $commande): RedirectResponse
    {
        abort_unless((int) $commande->user_id === (int) $request->user()->id, 404);

        $donnees = $request->validate([
            'motif' => ['nullable', 'string', 'max:500'],
        ]);

        DB::transaction(function () use ($request, $commande, $donnees) {
            $commande = Commande::query()->whereKey($commande->id)->lockForUpdate()->with('statutCommande')->firstOrFail();

            abort_unless(in_array($commande->statutCommande?->code, ['EN_ATTENTE', 'CONFIRMEE', 'EN_PREPARATION'], true), 422, 'Cette commande ne peut plus être annulée.');

            $statut = StatutCommande::query()->where('code', 'ANNULEE')->firstOrFail();
            $commande->update(['statut_id' => $statut->id]);

            HistoriqueCommande::create([
                'commande_id' => $commande->id,
                'statut_id' => $statut->id,
                'user_id' => $request->user()->id,
                'commentaire' => $donnees['motif'] ?? 'Commande annulée par le client.',
                'date_changement' => now(),
            ]);
        });

        return back()->with('success', 'La commande a été annulée.');
    }
}

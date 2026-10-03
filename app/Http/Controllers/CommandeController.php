<?php

namespace App\Http\Controllers;

use App\Models\Commande;
use App\Policies\CommandePolicy;
use App\Services\CommandeService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Http\Request;

class CommandeController extends Controller
{
    public function annuler(Request $request, Commande $commande, CommandeService $commandeService): RedirectResponse
    {
        Gate::authorize('annuler', $commande);

        $commandeService->annuler($commande, $request->user());

        return back()->with('success', 'La commande a été annulée.');
    }
}

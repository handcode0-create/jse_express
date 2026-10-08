<?php

namespace App\Http\Controllers;

use App\Services\TelephoneService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CompteAdministrateurController extends Controller
{
    public function afficher(Request $request): Response
    {
        $utilisateur = $request->user();

        return Inertia::render('Admin/Compte', [
            'utilisateur' => [
                'id' => $utilisateur->id,
                'nom' => $utilisateur->nom,
                'prenom' => $utilisateur->prenom,
                'telephone' => $utilisateur->telephone,
                'email' => $utilisateur->email,
                'photo_profil' => $utilisateur->photo_profil,
                'created_at' => $utilisateur->created_at?->format('d/m/Y'),
            ],
        ]);
    }

    /** Un administrateur modifie uniquement ses informations personnelles : jamais son rôle ni son statut. */
    public function modifier(Request $request, TelephoneService $telephones): RedirectResponse
    {
        $utilisateur = $request->user();

        $donnees = $request->validate([
            'prenom' => ['nullable', 'string', 'max:100'],
            'nom' => ['required', 'string', 'max:100'],
            'telephone' => ['required', 'string', 'max:30', $telephones->regleUnique($utilisateur->id)],
            'email' => ['nullable', 'email', 'max:255', Rule::unique('users', 'email')->ignore($utilisateur->id)],
        ], [
            'nom.required' => 'Le nom est obligatoire.',
            'telephone.required' => 'Le téléphone est obligatoire.',
            'email.email' => 'Saisissez une adresse e-mail valide.',
            'email.unique' => 'Cette adresse e-mail est déjà utilisée par un autre compte.',
        ]);

        $utilisateur->update([
            'prenom' => $donnees['prenom'] ?? null,
            'nom' => $donnees['nom'],
            'telephone' => $telephones->normaliser($donnees['telephone']),
            'email' => $donnees['email'] ?? null,
        ]);

        return back()->with('success', 'Vos informations ont été mises à jour.');
    }
}

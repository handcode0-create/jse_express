<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AuthentificationController extends Controller
{
    public function show(Request $request): Response|RedirectResponse
    {
        if (Auth::check()) {
            return $this->redirectionApresConnexion();
        }

        return Inertia::render('Authentification', [
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
        ]);
    }

    public function inscription(Request $request): RedirectResponse
    {
        if (Auth::check()) {
            return $this->redirectionApresConnexion();
        }

        $donnees = $request->validate([
            'nom' => ['required', 'string', 'max:100'],
            'prenom' => ['required', 'string', 'max:100'],
            'telephone' => ['required', 'string', 'max:30', 'unique:users,telephone'],
            'email' => ['nullable', 'email', 'max:255', 'unique:users,email'],
            'mot_de_passe' => ['required', 'string', 'min:8'],
            'confirmation_mot_de_passe' => ['required', 'same:mot_de_passe'],
            'consentement' => ['accepted'],
        ], [
            'nom.required' => 'Le nom est obligatoire.',
            'prenom.required' => 'Le prénom est obligatoire.',
            'telephone.required' => 'Le numéro de téléphone est obligatoire.',
            'telephone.unique' => 'Ce numéro de téléphone est déjà utilisé.',
            'email.email' => 'Veuillez saisir une adresse e-mail valide.',
            'email.unique' => 'Cette adresse e-mail est déjà utilisée.',
            'mot_de_passe.required' => 'Le mot de passe est obligatoire.',
            'mot_de_passe.min' => 'Le mot de passe doit contenir au moins 8 caractères.',
            'confirmation_mot_de_passe.required' => 'La confirmation du mot de passe est obligatoire.',
            'confirmation_mot_de_passe.same' => 'Les mots de passe ne correspondent pas.',
            'consentement.accepted' => 'Vous devez accepter la politique de confidentialité.',
        ]);

        User::create([
            'nom' => $donnees['nom'],
            'prenom' => $donnees['prenom'],
            'telephone' => $donnees['telephone'],
            'email' => $donnees['email'] ?? null,
            'password' => Hash::make($donnees['mot_de_passe']),
            'role' => 'client',
            'statut' => 'actif',
        ]);

        return redirect()
            ->route('authentification')
            ->with('success', 'Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.');
    }

    public function connexion(Request $request): RedirectResponse
    {
        if (Auth::check()) {
            return $this->redirectionApresConnexion();
        }

        $donnees = $request->validate([
            'telephone' => ['required', 'string', 'max:30'],
            'mot_de_passe' => ['required', 'string'],
            'consentement' => ['accepted'],
        ], [
            'telephone.required' => 'Le numéro de téléphone est obligatoire.',
            'mot_de_passe.required' => 'Le mot de passe est obligatoire.',
            'consentement.accepted' => 'Vous devez accepter la politique de confidentialité.',
        ]);

        $utilisateur = User::query()
            ->where('telephone', $donnees['telephone'])
            ->where('statut', 'actif')
            ->whereIn('role', ['client', 'restaurant'])
            ->first();

        if (! $utilisateur || ! Hash::check($donnees['mot_de_passe'], $utilisateur->password)) {
            throw ValidationException::withMessages([
                'telephone' => 'Le numéro de téléphone ou le mot de passe est incorrect.',
            ]);
        }

        Auth::login($utilisateur);
        $request->session()->regenerate();

        return redirect()->intended($this->routeApresConnexion($utilisateur));
    }

    private function routeApresConnexion(User $utilisateur): string
    {
        return $utilisateur->role === 'restaurant'
            ? route('restaurant.tableau-de-bord')
            : route('accueil.client');
    }

    private function redirectionApresConnexion(): RedirectResponse
    {
        $utilisateur = Auth::user();

        return redirect()->route(
            $utilisateur->role === 'restaurant'
                ? 'restaurant.tableau-de-bord'
                : 'accueil.client'
        );
    }

    public function deconnexion(Request $request): RedirectResponse
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('bienvenue');
    }
}

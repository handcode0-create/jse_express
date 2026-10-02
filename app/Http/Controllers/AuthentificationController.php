<?php

namespace App\Http\Controllers;

use App\Models\Restaurant;
use App\Models\User;
use App\Models\ProfilLivreur;
use App\Models\Zone;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
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

    public function showInscription(): Response|RedirectResponse
    {
        if (Auth::check()) {
            return $this->redirectionApresConnexion();
        }

        return Inertia::render('Inscription', [
            'zones' => Zone::query()
                ->where('statut', 'actif')
                ->orderBy('nom')
                ->get(['id', 'nom']),
        ]);
    }

    public function inscription(Request $request): RedirectResponse
    {
        if (Auth::check()) {
            return $this->redirectionApresConnexion();
        }

        $donnees = $request->validate([
            'role' => ['required', 'in:client,restaurant,livreur'],
            'nom' => ['required', 'string', 'max:100'],
            'prenom' => ['required', 'string', 'max:100'],
            'telephone' => ['required', 'string', 'max:30', 'unique:users,telephone'],
            'email' => ['nullable', 'email', 'max:255', 'unique:users,email'],
            'mot_de_passe' => ['required', 'string', 'min:8'],
            'confirmation_mot_de_passe' => ['required', 'same:mot_de_passe'],
            'consentement' => ['accepted'],

            'restaurant_nom' => ['required_if:role,restaurant', 'string', 'max:150'],
            'restaurant_description' => ['nullable', 'string', 'max:2000'],
            'restaurant_telephone' => ['required_if:role,restaurant', 'string', 'max:30'],
            'restaurant_email' => ['nullable', 'email', 'max:150'],
            'restaurant_adresse' => ['required_if:role,restaurant', 'string', 'max:1000'],
            'restaurant_zone_id' => ['nullable', 'integer', 'exists:zones,id'],

            'livreur_matricule' => ['required_if:role,livreur', 'string', 'max:100', 'unique:profils_livreurs,matricule'],
            'livreur_zone_id' => ['nullable', 'integer', 'exists:zones,id'],
            'livreur_disponibilite' => ['required_if:role,livreur', 'in:disponible,indisponible'],
            'livreur_telephone_secondaire' => ['nullable', 'string', 'max:30'],
        ], [
            'role.required' => 'Veuillez indiquer votre usage de JSE Express.',
            'role.in' => 'Le profil sélectionné n’est pas valide.',
            'restaurant_nom.required_if' => 'Le nom du restaurant est obligatoire.',
            'restaurant_telephone.required_if' => 'Le téléphone du restaurant est obligatoire.',
            'restaurant_adresse.required_if' => 'L’adresse du restaurant est obligatoire.',
            'livreur_matricule.required_if' => 'Le matricule livreur est obligatoire.',
            'livreur_matricule.unique' => 'Ce matricule livreur est déjà utilisé.',
            'livreur_disponibilite.required_if' => 'Veuillez indiquer votre disponibilité.',
        ]);

        DB::transaction(function () use ($donnees) {
            $utilisateur = User::create([
                'nom' => $donnees['nom'],
                'prenom' => $donnees['prenom'],
                'telephone' => $donnees['telephone'],
                'email' => $donnees['email'] ?? null,
                'password' => Hash::make($donnees['mot_de_passe']),
                'role' => $donnees['role'],
                'statut' => 'actif',
            ]);

            if ($donnees['role'] === 'restaurant') {
                Restaurant::create([
                    'user_id' => $utilisateur->id,
                    'zone_id' => $donnees['restaurant_zone_id'] ?? null,
                    'nom' => $donnees['restaurant_nom'],
                    'description' => $donnees['restaurant_description'] ?? null,
                    'telephone' => $donnees['restaurant_telephone'],
                    'email' => $donnees['restaurant_email'] ?? null,
                    'adresse' => $donnees['restaurant_adresse'],
                    'horaires' => null,
                    'statut' => 'actif',
                ]);
            }

            if ($donnees['role'] === 'livreur') {
                ProfilLivreur::create([
                    'user_id' => $utilisateur->id,
                    'matricule' => $donnees['livreur_matricule'],
                    'zone_id' => $donnees['livreur_zone_id'] ?? null,
                    'disponibilite' => $donnees['livreur_disponibilite'],
                    'telephone_secondaire' => $donnees['livreur_telephone_secondaire'] ?? null,
                ]);
            }
        });

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
            ->whereIn('role', ['client', 'restaurant', 'livreur', 'administrateur'])
            ->first();

        if (! $utilisateur || ! Hash::check($donnees['mot_de_passe'], $utilisateur->password)) {
            throw ValidationException::withMessages([
                'telephone' => 'Le numéro de téléphone ou le mot de passe est incorrect.',
            ]);
        }

        Auth::login($utilisateur);
        $request->session()->regenerate();

        return redirect()->to($this->routeApresConnexion($utilisateur));
    }

    private function routeApresConnexion(User $utilisateur): string
    {
        return match ($utilisateur->role) {
            'administrateur' => route('admin.tableau-de-bord'),
            'restaurant' => route('restaurant.tableau-de-bord'),
            'livreur' => route('livreur.tableau-de-bord'),
            default => route('accueil.client'),
        };
    }

    private function redirectionApresConnexion(): RedirectResponse
    {
        $utilisateur = Auth::user();

        return redirect()->route(match ($utilisateur->role) {
            'administrateur' => 'admin.tableau-de-bord',
            'restaurant' => 'restaurant.tableau-de-bord',
            'livreur' => 'livreur.tableau-de-bord',
            default => 'accueil.client',
        });
    }

    public function deconnexion(Request $request): RedirectResponse
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('bienvenue');
    }
}

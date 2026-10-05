<?php

namespace App\Http\Controllers;

use App\Models\ProfilLivreur;
use App\Models\Restaurant;
use App\Models\User;
use App\Models\Zone;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\RateLimiter;
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
            'captcha' => [
                'enabled' => filled(config('services.recaptcha.site_key')) && filled(config('services.recaptcha.secret_key')),
                'site_key' => config('services.recaptcha.site_key'),
            ],
        ]);
    }

    public function inscription(Request $request): RedirectResponse
    {
        if (Auth::check()) {
            return $this->redirectionApresConnexion();
        }

        $captchaActif = filled(config('services.recaptcha.site_key')) && filled(config('services.recaptcha.secret_key'));

        $inscriptionKey = 'auth:inscription:'.($request->ip() ?: 'unknown');
        if (RateLimiter::tooManyAttempts($inscriptionKey, 5)) {
            abort(429, 'Trop de tentatives d’inscription. Veuillez réessayer dans une minute.');
        }
        RateLimiter::hit($inscriptionKey, 60);

        if ($captchaActif) {
            $token = (string) $request->input('recaptcha_token');

            if ($token === '') {
                throw ValidationException::withMessages([
                    'recaptcha_token' => 'Veuillez confirmer que vous n’êtes pas un robot.',
                ]);
            }

            $verification = Http::asForm()
                ->timeout(8)
                ->post('https://www.google.com/recaptcha/api/siteverify', [
                    'secret' => config('services.recaptcha.secret_key'),
                    'response' => $token,
                    'remoteip' => $request->ip(),
                ]);

            if (! $verification->successful() || ! $verification->json('success')) {
                throw ValidationException::withMessages([
                    'recaptcha_token' => 'La vérification CAPTCHA a échoué. Veuillez réessayer.',
                ]);
            }
        }

        $telephoneBrut = (string) $request->input('telephone');
        $request->merge(['telephone' => $this->normaliserTelephone($telephoneBrut)]);

        $donnees = $request->validate([
            'role' => ['required', 'in:client,restaurant,livreur'],
            'nom' => ['required', 'string', 'max:100'],
            'prenom' => ['required', 'string', 'max:100'],
            'telephone' => ['required', 'string', 'max:30', 'unique:users,telephone'],
            'email' => ['nullable', 'email', 'max:255', 'unique:users,email'],
            'mot_de_passe' => ['required', 'string', 'min:8'],
            'confirmation_mot_de_passe' => ['required', 'same:mot_de_passe'],
            'consentement' => ['accepted'],
            'recaptcha_token' => [$captchaActif ? 'required' : 'nullable', 'string'],

            'restaurant_nom' => ['required_if:role,restaurant', 'nullable', 'string', 'max:150'],
            'restaurant_description' => ['nullable', 'string', 'max:2000'],
            'restaurant_telephone' => ['required_if:role,restaurant', 'nullable', 'string', 'max:30'],
            'restaurant_email' => ['nullable', 'email', 'max:150'],
            'restaurant_adresse' => ['required_if:role,restaurant', 'nullable', 'string', 'max:1000'],
            'restaurant_zone_id' => ['nullable', 'integer', 'exists:zones,id'],

            'livreur_matricule' => ['required_if:role,livreur', 'nullable', 'string', 'max:100', 'unique:profils_livreurs,matricule'],
            'livreur_zone_id' => ['nullable', 'integer', 'exists:zones,id'],
            'livreur_disponibilite' => ['required_if:role,livreur', 'nullable', 'in:disponible,indisponible'],
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

        // Les comptes restaurant et livreur restent inactifs jusqu'à leur
        // validation par un administrateur.
        $validationRequise = in_array($donnees['role'], ['restaurant', 'livreur'], true);
        $statutInitial = $validationRequise ? 'inactif' : 'actif';

        DB::transaction(function () use ($donnees, $statutInitial) {
            $utilisateur = User::create([
                'nom' => $donnees['nom'],
                'prenom' => $donnees['prenom'],
                'telephone' => $donnees['telephone'],
                'email' => $donnees['email'] ?? null,
                'password' => Hash::make($donnees['mot_de_passe']),
                'role' => $donnees['role'],
                'statut' => $statutInitial,
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
                    'statut' => $statutInitial,
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
            ->with('success', $validationRequise
                ? 'Votre compte a été créé. Il sera activé après validation par l’administration.'
                : 'Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.');
    }

    public function connexion(Request $request): RedirectResponse
    {
        if (Auth::check()) {
            return $this->redirectionApresConnexion();
        }

        $telephone = $this->normaliserTelephone((string) $request->input('telephone'));
        $connexionKey = 'auth:connexion:'.$telephone;
        if (RateLimiter::tooManyAttempts($connexionKey, 5)) {
            abort(429, 'Trop de tentatives de connexion. Veuillez réessayer dans une minute.');
        }
        RateLimiter::hit($connexionKey, 60);

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
            ->whereIn('role', ['client', 'restaurant', 'livreur', 'administrateur'])
            ->get()
            ->first(fn (User $user) => $this->normaliserTelephone((string) $user->telephone) === $telephone);

        if (! $utilisateur || ! Hash::check($donnees['mot_de_passe'], $utilisateur->password)) {
            throw ValidationException::withMessages([
                'telephone' => 'Le numéro de téléphone ou le mot de passe est incorrect.',
            ]);
        }

        if ($utilisateur->statut !== 'actif') {
            throw ValidationException::withMessages([
                'telephone' => 'Votre compte n’est pas actif. Il doit être validé par l’administration avant de pouvoir vous connecter.',
            ]);
        }

        RateLimiter::clear($connexionKey);

        Auth::login($utilisateur);
        $request->session()->regenerate();

        return redirect()->to($this->routeApresConnexion($utilisateur));
    }

    private function normaliserTelephone(string $telephone): string
    {
        $telephone = preg_replace('/[^0-9]/', '', $telephone) ?? '';

        if (str_starts_with($telephone, '00225')) {
            $telephone = substr($telephone, 2);
        }

        if (str_starts_with($telephone, '0') && strlen($telephone) === 10) {
            $telephone = '225'.$telephone;
        }

        return $telephone;
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

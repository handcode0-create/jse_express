<?php

use App\Models\Categorie;
use App\Models\Panier;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Splash');
})->name('accueil');

Route::get('/design-system', function () {
    return Inertia::render('DesignSystem');
})->name('design-system');

Route::get('/splash', function () {
    return Inertia::render('Splash');
})->name('splash');

Route::get('/bienvenue', function () {
    return Inertia::render('Bienvenue');
})->name('bienvenue');

Route::get('/authentification', function (Request $request) {
    if (Auth::check()) {
        return redirect()->route('accueil.client');
    }

    return Inertia::render('Authentification', [
        'flash' => [
            'success' => $request->session()->get('success'),
            'error' => $request->session()->get('error'),
        ],
    ]);
})->name('authentification');

Route::post('/inscription', function (Request $request) {
    if (Auth::check()) {
        return redirect()->route('accueil.client');
    }

    $donnees = $request->validate(
        [
            'nom' => ['required', 'string', 'max:100'],
            'prenom' => ['required', 'string', 'max:100'],
            'telephone' => ['required', 'string', 'max:30', 'unique:users,telephone'],
            'email' => ['nullable', 'email', 'max:255', 'unique:users,email'],
            'mot_de_passe' => ['required', 'string', 'min:8'],
            'confirmation_mot_de_passe' => ['required', 'same:mot_de_passe'],
            'consentement' => ['accepted'],
        ],
        [
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
        ],
    );

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
})->name('inscription');

Route::post('/connexion', function (Request $request) {
    if (Auth::check()) {
        return redirect()->route('accueil.client');
    }

    $donnees = $request->validate(
        [
            'telephone' => ['required', 'string', 'max:30'],
            'mot_de_passe' => ['required', 'string'],
            'consentement' => ['accepted'],
        ],
        [
            'telephone.required' => 'Le numéro de téléphone est obligatoire.',
            'mot_de_passe.required' => 'Le mot de passe est obligatoire.',
            'consentement.accepted' => 'Vous devez accepter la politique de confidentialité.',
        ],
    );

    if (! Auth::attempt([
        'telephone' => $donnees['telephone'],
        'password' => $donnees['mot_de_passe'],
        'statut' => 'actif',
        'role' => 'client',
    ])) {
        return back()
            ->withErrors([
                'telephone' => 'Le numéro de téléphone ou le mot de passe est incorrect.',
            ])
            ->withInput(['telephone' => $donnees['telephone']]);
    }

    $request->session()->regenerate();

    return redirect()->intended(route('accueil.client'));
})->name('connexion');

Route::post('/deconnexion', function (Request $request) {
    Auth::logout();

    $request->session()->invalidate();
    $request->session()->regenerateToken();

    return redirect()->route('bienvenue');
})->middleware('auth')->name('deconnexion');

Route::get('/politique-de-confidentialite', function () {
    return Inertia::render('PolitiqueConfidentialite');
})->name('politique.confidentialite');

Route::get('/accueil', function (Request $request) {
    abort_unless(Auth::check() && Auth::user()->role === 'client', 403);

    $recherche = trim((string) $request->query('recherche', ''));

    $restaurants = Restaurant::query()
        ->with('zone')
        ->where('statut', 'actif')
        ->when($recherche !== '', function ($query) use ($recherche) {
            $query->where(function ($sousRequete) use ($recherche) {
                $sousRequete
                    ->where('nom', 'like', '%' . $recherche . '%')
                    ->orWhere('description', 'like', '%' . $recherche . '%');
            });
        })
        ->orderBy('nom')
        ->get()
        ->map(function (Restaurant $restaurant) {
            return [
                'id' => $restaurant->id,
                'nom' => $restaurant->nom,
                'description' => $restaurant->description,
                'adresse' => $restaurant->adresse,
                'horaires' => $restaurant->horaires,
                'zone' => $restaurant->zone
                    ? ['id' => $restaurant->zone->id, 'nom' => $restaurant->zone->nom]
                    : null,
            ];
        })
        ->values();

    $categories = Categorie::query()
        ->where('statut', 'actif')
        ->whereHas('restaurant', function ($query) {
            $query->where('statut', 'actif');
        })
        ->orderBy('nom')
        ->get(['id', 'nom'])
        ->unique('nom')
        ->values();

    $imagesCategories = [
        '/assets/hero_icon/fast_food.jpeg',
        '/assets/hero_icon/glacier.jpeg',
        '/assets/hero_icon/promo.jpeg',
        '/assets/hero_icon/resto.jpeg',
    ];

    $categories = $categories->map(function ($categorie, $index) use ($imagesCategories) {
        return [
            'id' => $categorie->id,
            'nom' => $categorie->nom,
            'image' => $imagesCategories[$index % count($imagesCategories)],
        ];
    })->values();

    $panier = Panier::query()
        ->where('user_id', Auth::id())
        ->where('statut', 'actif')
        ->with('lignesPanier')
        ->latest('id')
        ->first();

    return Inertia::render('Accueil', [
        'categories' => $categories,
        'restaurants' => $restaurants,
        'recherche' => $recherche,
        'panier' => [
            'nombre_articles' => $panier?->lignesPanier->sum('quantite') ?? 0,
        ],
    ]);
})->middleware('auth')->name('accueil.client');

<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Models\User;

/*
|--------------------------------------------------------------------------
| Accueil
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return Inertia::render('Splash');
})->name('accueil');

/*
|--------------------------------------------------------------------------
| Design system
|--------------------------------------------------------------------------
*/

Route::get('/design-system', function () {
    return Inertia::render('DesignSystem');
})->name('design-system');

/*
|--------------------------------------------------------------------------
| Splash
|--------------------------------------------------------------------------
*/

Route::get('/splash', function () {
    return Inertia::render('Splash');
})->name('splash');

/*
|--------------------------------------------------------------------------
| Bienvenue
|--------------------------------------------------------------------------
*/

Route::get('/bienvenue', function () {
    return Inertia::render('Bienvenue');
})->name('bienvenue');

/*
|--------------------------------------------------------------------------
| Authentification
|--------------------------------------------------------------------------
*/

Route::get('/authentification', function (Request $request) {
    return Inertia::render('Authentification', [
        'flash' => [
            'success' => $request->session()->get('success'),
            'error' => $request->session()->get('error'),
        ],
    ]);
})->name('authentification');

/*
|--------------------------------------------------------------------------
| Politique de confidentialité
|--------------------------------------------------------------------------
*/

Route::get('/politique-de-confidentialite', function () {
    return Inertia::render('PolitiqueConfidentialite');
})->name('politique.confidentialite');

/*
|--------------------------------------------------------------------------
| Inscription
|--------------------------------------------------------------------------
*/

Route::post('/inscription', function (Request $request) {

    $donnees = $request->validate(
        [
            'nom' => [
                'required',
                'string',
                'max:100',
            ],

            'prenom' => [
                'required',
                'string',
                'max:100',
            ],

            'telephone' => [
                'required',
                'string',
                'max:30',
                'unique:users,telephone',
            ],

            'email' => [
                'nullable',
                'email',
                'max:255',
                'unique:users,email',
            ],

            'mot_de_passe' => [
                'required',
                'string',
                'min:8',
            ],

            'confirmation_mot_de_passe' => [
                'required',
                'same:mot_de_passe',
            ],

            'consentement' => [
                'accepted',
            ],
        ],

        [
            'nom.required' =>
                'Le nom est obligatoire.',

            'prenom.required' =>
                'Le prénom est obligatoire.',

            'telephone.required' =>
                'Le numéro de téléphone est obligatoire.',

            'telephone.unique' =>
                'Ce numéro de téléphone est déjà utilisé.',

            'email.email' =>
                'Veuillez saisir une adresse e-mail valide.',

            'email.unique' =>
                'Cette adresse e-mail est déjà utilisée.',

            'mot_de_passe.required' =>
                'Le mot de passe est obligatoire.',

            'mot_de_passe.min' =>
                'Le mot de passe doit contenir au moins 8 caractères.',

            'confirmation_mot_de_passe.required' =>
                'La confirmation du mot de passe est obligatoire.',

            'confirmation_mot_de_passe.same' =>
                'Les mots de passe ne correspondent pas.',

            'consentement.accepted' =>
                'Vous devez accepter la politique de confidentialité.',
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
        ->with(
            'success',
            'Votre compte a été créé avec succès.'
        );
})->name('inscription');

Route::get('/accueil', function () {
    return Inertia::render('Accueil', [
        'categories' => [],
        'restaurants' => [],
        'panier' => [
            'nombre_articles' => 0,
        ],
    ]);
})->name('accueil.client');
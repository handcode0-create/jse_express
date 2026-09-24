<?php

use App\Models\Categorie;
use App\Models\Commande;
use App\Models\HistoriqueCommande;
use App\Models\LigneCommande;
use App\Models\LignePanier;
use App\Models\Panier;
use App\Models\Produit;
use App\Models\Restaurant;
use App\Models\User;
use App\Models\Zone;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
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


Route::get('/panier', function () {
    abort_unless(Auth::check() && Auth::user()->role === 'client', 403);

    $panier = Panier::query()
        ->where('user_id', Auth::id())
        ->where('statut', 'actif')
        ->with(['lignesPanier.produit.restaurant'])
        ->latest('id')
        ->first();

    $lignes = $panier?->lignesPanier ?? collect();
    $sousTotal = (float) $lignes->sum(fn (LignePanier $ligne) => $ligne->quantite * $ligne->prix_unitaire);
    $restaurants = $lignes->map(fn (LignePanier $ligne) => $ligne->produit?->restaurant_id)->filter()->unique()->values();

    return Inertia::render('Panier', [
        'panier' => [
            'nombre_articles' => (int) $lignes->sum('quantite'),
            'sous_total' => $sousTotal,
            'frais_livraison' => 500,
            'montant_total' => $sousTotal + ($lignes->isNotEmpty() ? 500 : 0),
            'restaurant_unique' => $restaurants->count() === 1 ? $restaurants->first() : null,
            'plusieurs_restaurants' => $restaurants->count() > 1,
            'lignes' => $lignes->map(fn (LignePanier $ligne) => [
                'id' => $ligne->id,
                'produit_id' => $ligne->produit_id,
                'nom' => $ligne->produit?->nom,
                'image' => $ligne->produit?->image,
                'restaurant_id' => $ligne->produit?->restaurant_id,
                'restaurant_nom' => $ligne->produit?->restaurant?->nom,
                'quantite' => $ligne->quantite,
                'prix_unitaire' => (float) $ligne->prix_unitaire,
                'total' => (float) ($ligne->quantite * $ligne->prix_unitaire),
            ])->values(),
        ],
    ]);
})->middleware('auth')->name('panier');

Route::get('/favoris', function () {
    abort_unless(Auth::check() && Auth::user()->role === 'client', 403);

    return Inertia::render('Favoris');
})->middleware('auth')->name('favoris');

Route::get('/commandes', function (Request $request) {
    abort_unless(Auth::check() && Auth::user()->role === 'client', 403);

    $filtre = (string) $request->query('filtre', 'toutes');

    $commandes = Commande::query()
        ->where('user_id', Auth::id())
        ->with([
            'restaurant',
            'statutCommande',
            'lignesCommande.produit',
        ])
        ->latest('date_commande')
        ->get();

    $commandes = $commandes->filter(function (Commande $commande) use ($filtre) {
        $code = $commande->statutCommande?->code;

        return match ($filtre) {
            'en_cours' => $code !== 'LIVREE' && $code !== 'ANNULEE',
            'terminees' => $code === 'LIVREE',
            'annulees' => $code === 'ANNULEE',
            default => true,
        };
    })->values();

    return Inertia::render('Commandes', [
        'filtreActif' => $filtre,
        'commandes' => $commandes->map(function (Commande $commande) {
            $premiereLigne = $commande->lignesCommande->first();
            $statut = $commande->statutCommande;

            return [
                'id' => $commande->id,
                'reference' => $commande->reference,
                'date_commande' => $commande->date_commande?->format('d/m/Y'),
                'date_brute' => $commande->date_commande?->toIso8601String(),
                'restaurant' => $commande->restaurant ? [
                    'id' => $commande->restaurant->id,
                    'nom' => $commande->restaurant->nom,
                ] : null,
                'image' => $premiereLigne?->produit?->image,
                'nombre_articles' => (int) $commande->lignesCommande->sum('quantite'),
                'montant_total' => (float) $commande->montant_total,
                'statut' => $statut ? [
                    'code' => $statut->code,
                    'libelle' => $statut->libelle,
                    'ordre' => (int) $statut->ordre,
                ] : null,
                'peut_recommander' => $statut?->code !== 'ANNULEE',
            ];
        })->values(),
    ]);
})->middleware('auth')->name('commandes');

Route::get('/commandes/{commande}', function (Commande $commande) {
    abort_unless(Auth::check() && Auth::user()->role === 'client', 403);
    abort_unless((int) $commande->user_id === (int) Auth::id(), 404);

    $commande->load([
        'restaurant',
        'zone',
        'statutCommande',
        'lignesCommande.produit',
        'paiements',
        'historiquesCommande.statut',
    ]);

    $paiement = $commande->paiements
        ->sortByDesc(fn ($item) => $item->date_paiement)
        ->first();

    $historique = $commande->historiquesCommande
        ->sortBy('date_changement')
        ->map(function ($element) {
            return [
                'code' => $element->statut?->code,
                'libelle' => $element->statut?->libelle,
                'date' => $element->date_changement
                    ? \Illuminate\Support\Carbon::parse($element->date_changement)->format('d/m/Y'),
                'heure' => $element->date_changement
                    ? \Illuminate\Support\Carbon::parse($element->date_changement)->format('H:i'),
            ];
        })
        ->values();

    return Inertia::render('CommandeDetails', [
        'commande' => [
            'id' => $commande->id,
            'reference' => $commande->reference,
            'date_commande' => $commande->date_commande?->format('d/m/Y'),
            'heure_commande' => $commande->date_commande?->format('H:i'),
            'restaurant' => $commande->restaurant ? [
                'id' => $commande->restaurant->id,
                'nom' => $commande->restaurant->nom,
                'image' => $commande->lignesCommande->first()?->produit?->image,
                'adresse' => $commande->restaurant->adresse,
                'telephone' => $commande->restaurant->telephone,
            ] : null,
            'zone' => $commande->zone ? [
                'id' => $commande->zone->id,
                'nom' => $commande->zone->nom,
            ] : null,
            'adresse_livraison' => $commande->adresse_livraison,
            'telephone_livraison' => $commande->telephone_livraison,
            'sous_total' => (float) $commande->sous_total,
            'frais_livraison' => (float) $commande->frais_livraison,
            'montant_total' => (float) $commande->montant_total,
            'statut' => $commande->statutCommande ? [
                'code' => $commande->statutCommande->code,
                'libelle' => $commande->statutCommande->libelle,
                'ordre' => (int) $commande->statutCommande->ordre,
            ] : null,
            'lignes' => $commande->lignesCommande->map(fn (LigneCommande $ligne) => [
                'id' => $ligne->id,
                'nom' => $ligne->nom_produit_snapshot,
                'description' => $ligne->produit?->description,
                'quantite' => (int) $ligne->quantite,
                'prix_unitaire' => (float) $ligne->prix_unitaire,
                'total' => (float) $ligne->total_ligne,
                'image' => $ligne->produit?->image,
            ])->values(),
            'paiement' => $paiement ? [
                'moyen' => $paiement->moyen,
                'reference_transaction' => $paiement->reference_transaction,
                'montant' => (float) $paiement->montant,
                'statut' => $paiement->statut,
                'date' => $paiement->date_paiement
                    ? \Illuminate\Support\Carbon::parse($paiement->date_paiement)->format('d/m/Y'),
                'heure' => $paiement->date_paiement
                    ? \Illuminate\Support\Carbon::parse($paiement->date_paiement)->format('H:i'),
            ] : null,
            'historique' => $historique,
        ],
    ]);
})->whereNumber('commande')->middleware('auth')->name('commandes.details');

Route::post('/commandes/{commande}/recommander', function (Commande $commande) {
    abort_unless(Auth::check() && Auth::user()->role === 'client', 403);
    abort_unless((int) $commande->user_id === (int) Auth::id(), 404);

    $commande->load('lignesCommande.produit');

    $ajouts = 0;

    DB::transaction(function () use ($commande, &$ajouts) {
        $panier = Panier::firstOrCreate([
            'user_id' => Auth::id(),
            'statut' => 'actif',
        ]);

        foreach ($commande->lignesCommande as $ligneCommande) {
            $produit = $ligneCommande->produit;

            if (! $produit || $produit->statut !== 'actif' || ! $produit->disponible) {
                continue;
            }

            $lignePanier = LignePanier::query()
                ->where('panier_id', $panier->id)
                ->where('produit_id', $produit->id)
                ->lockForUpdate()
                ->first();

            if ($lignePanier) {
                $lignePanier->increment('quantite', $ligneCommande->quantite);
            } else {
                LignePanier::create([
                    'panier_id' => $panier->id,
                    'produit_id' => $produit->id,
                    'quantite' => $ligneCommande->quantite,
                    'prix_unitaire' => $produit->prix,
                ]);
            }

            $ajouts += $ligneCommande->quantite;
        }
    });

    return redirect()->route('panier')->with(
        $ajouts > 0 ? 'success' : 'error',
        $ajouts > 0
            ? 'Les articles disponibles ont été ajoutés à votre panier.'
            : 'Aucun article de cette commande n’est actuellement disponible.'
    );
})->whereNumber('commande')->middleware('auth')->name('commandes.recommander');

Route::get('/commande/{commande}', function (Commande $commande) {
    abort_unless(Auth::check() && Auth::user()->role === 'client', 403);
    abort_unless((int) $commande->user_id === (int) Auth::id(), 404);
    $commande->load('restaurant');

    return Inertia::render('CommandeConfirmation', [
        'commande' => [
            'id' => $commande->id,
            'reference' => $commande->reference,
            'montant_total' => (float) $commande->montant_total,
            'restaurant_nom' => $commande->restaurant?->nom,
            'statut' => $commande->statutCommande ? [
                'code' => $commande->statutCommande->code,
                'libelle' => $commande->statutCommande->libelle,
            ] : null,
        ],
    ]);
})->whereNumber('commande')->middleware('auth')->name('commande.confirmation');

Route::get('/commande/validation', function () {
    abort_unless(Auth::check() && Auth::user()->role === 'client', 403);

    $panier = Panier::query()
        ->where('user_id', Auth::id())
        ->where('statut', 'actif')
        ->with(['lignesPanier.produit.restaurant'])
        ->latest('id')
        ->first();

    $lignes = $panier?->lignesPanier ?? collect();
    abort_if($lignes->isEmpty(), 404);

    $restaurantIds = $lignes->map(fn (LignePanier $ligne) => $ligne->produit?->restaurant_id)->filter()->unique()->values();
    abort_if($restaurantIds->count() !== 1, 422);

    $restaurant = $lignes->first()->produit?->restaurant;
    $zones = Zone::query()->where('statut', 'actif')->orderBy('nom')->get(['id', 'nom']);

    return Inertia::render('CommandeValidation', [
        'restaurant' => $restaurant ? [
            'id' => $restaurant->id,
            'nom' => $restaurant->nom,
            'adresse' => $restaurant->adresse,
        ] : null,
        'zones' => $zones,
        'client' => [
            'nom' => Auth::user()->nom,
            'prenom' => Auth::user()->prenom,
            'telephone' => Auth::user()->telephone,
        ],
        'panier' => [
            'nombre_articles' => (int) $lignes->sum('quantite'),
            'sous_total' => (float) $lignes->sum(fn (LignePanier $ligne) => $ligne->quantite * $ligne->prix_unitaire),
            'frais_livraison' => 500,
            'montant_total' => (float) $lignes->sum(fn (LignePanier $ligne) => $ligne->quantite * $ligne->prix_unitaire) + 500,
            'lignes' => $lignes->map(fn (LignePanier $ligne) => [
                'id' => $ligne->id,
                'nom' => $ligne->produit?->nom,
                'quantite' => $ligne->quantite,
                'prix_unitaire' => (float) $ligne->prix_unitaire,
                'total' => (float) ($ligne->quantite * $ligne->prix_unitaire),
            ])->values(),
        ],
    ]);
})->middleware('auth')->name('commande.validation');

Route::post('/commande', function (Request $request) {
    abort_unless(Auth::check() && Auth::user()->role === 'client', 403);

    $donnees = $request->validate([
        'zone_id' => ['required', 'integer', 'exists:zones,id'],
        'adresse_livraison' => ['required', 'string', 'max:500'],
        'telephone_livraison' => ['required', 'string', 'max:30'],
    ]);

    $commande = DB::transaction(function () use ($donnees) {
        $panier = Panier::query()
            ->where('user_id', Auth::id())
            ->where('statut', 'actif')
            ->with(['lignesPanier.produit.restaurant'])
            ->lockForUpdate()
            ->latest('id')
            ->first();

        abort_if(! $panier || $panier->lignesPanier->isEmpty(), 422);

        $lignes = $panier->lignesPanier;
        $restaurantIds = $lignes->map(fn (LignePanier $ligne) => $ligne->produit?->restaurant_id)->filter()->unique()->values();
        abort_if($restaurantIds->count() !== 1, 422);

        $restaurant = $lignes->first()->produit?->restaurant;
        abort_unless($restaurant && $restaurant->statut === 'actif', 422);

        foreach ($lignes as $ligne) {
            abort_unless($ligne->produit && $ligne->produit->statut === 'actif' && $ligne->produit->disponible, 422);
        }

        $sousTotal = (float) $lignes->sum(fn (LignePanier $ligne) => $ligne->quantite * $ligne->prix_unitaire);
        $fraisLivraison = 500;
        $reference = 'JSE-' . str_pad((string) ((Commande::max('id') ?? 0) + 1), 6, '0', STR_PAD_LEFT);

        $statutId = DB::table('statuts_commandes')->where('code', 'EN_ATTENTE')->value('id');
        abort_unless($statutId, 422);

        $commande = Commande::create([
            'reference' => $reference,
            'user_id' => Auth::id(),
            'restaurant_id' => $restaurant->id,
            'zone_id' => $donnees['zone_id'],
            'statut_id' => $statutId,
            'adresse_livraison' => $donnees['adresse_livraison'],
            'telephone_livraison' => $donnees['telephone_livraison'],
            'sous_total' => $sousTotal,
            'frais_livraison' => $fraisLivraison,
            'montant_total' => $sousTotal + $fraisLivraison,
            'date_commande' => now(),
        ]);

        HistoriqueCommande::create([
            'commande_id' => $commande->id,
            'statut_id' => $statutId,
            'user_id' => Auth::id(),
            'commentaire' => 'Commande reçue.',
            'date_changement' => now(),
        ]);

        foreach ($lignes as $ligne) {
            LigneCommande::create([
                'commande_id' => $commande->id,
                'produit_id' => $ligne->produit_id,
                'nom_produit_snapshot' => $ligne->produit->nom,
                'quantite' => $ligne->quantite,
                'prix_unitaire' => $ligne->prix_unitaire,
                'total_ligne' => $ligne->quantite * $ligne->prix_unitaire,
            ]);
        }

        $panier->lignesPanier()->delete();

        return $commande;
    });

    return redirect()->route('commande.confirmation', ['commande' => $commande->id]);
})->middleware('auth')->name('commande.creer');

Route::get('/restaurants/{restaurant}/produits/{produit}', function (Restaurant $restaurant, Produit $produit) {
    abort_unless(Auth::check() && Auth::user()->role === 'client', 403);
    abort_unless($restaurant->statut === 'actif', 404);
    abort_unless((int) $produit->restaurant_id === (int) $restaurant->id, 404);
    abort_unless($produit->statut === 'actif' && $produit->disponible, 404);

    $produit->load('categorie');

    $panier = Panier::query()
        ->where('user_id', Auth::id())
        ->where('statut', 'actif')
        ->with('lignesPanier.produit')
        ->latest('id')
        ->first();

    return Inertia::render('ProduitDetail', [
        'restaurant' => [
            'id' => $restaurant->id,
            'nom' => $restaurant->nom,
            'description' => $restaurant->description,
            'adresse' => $restaurant->adresse,
            'horaires' => $restaurant->horaires,
            'telephone' => $restaurant->telephone,
            'zone' => $restaurant->zone ? ['id' => $restaurant->zone->id, 'nom' => $restaurant->zone->nom] : null,
        ],
        'produit' => [
            'id' => $produit->id,
            'nom' => $produit->nom,
            'description' => $produit->description,
            'prix' => (float) $produit->prix,
            'image' => $produit->image,
            'disponible' => (bool) $produit->disponible,
            'categorie' => $produit->categorie ? [
                'id' => $produit->categorie->id,
                'nom' => $produit->categorie->nom,
            ] : null,
        ],
        'panier' => [
            'nombre_articles' => $panier?->lignesPanier->sum('quantite') ?? 0,
            'montant_total' => $panier
                ? (float) $panier->lignesPanier->sum(fn ($ligne) => $ligne->quantite * $ligne->prix_unitaire)
                : 0,
        ],
    ]);
})->middleware('auth')->name('produit.detail');

Route::get('/restaurants/{restaurant}', function (Restaurant $restaurant) {
    abort_unless(Auth::check() && Auth::user()->role === 'client', 403);
    abort_unless($restaurant->statut === 'actif', 404);

    $categories = Categorie::query()
        ->where('restaurant_id', $restaurant->id)
        ->where('statut', 'actif')
        ->with(['produits' => function ($query) {
            $query->where('statut', 'actif')
                ->where('disponible', true)
                ->orderBy('nom');
        }])
        ->orderBy('nom')
        ->get()
        ->map(fn (Categorie $categorie) => [
            'id' => $categorie->id,
            'nom' => $categorie->nom,
            'description' => $categorie->description,
            'produits' => $categorie->produits->map(fn (Produit $produit) => [
                'id' => $produit->id,
                'nom' => $produit->nom,
                'description' => $produit->description,
                'prix' => (float) $produit->prix,
                'image' => $produit->image,
            ])->values(),
        ])
        ->filter(fn ($categorie) => $categorie['produits']->isNotEmpty())
        ->values();

    $panier = Panier::query()
        ->where('user_id', Auth::id())
        ->where('statut', 'actif')
        ->with('lignesPanier.produit')
        ->latest('id')
        ->first();

    return Inertia::render('RestaurantDetail', [
        'restaurant' => [
            'id' => $restaurant->id,
            'nom' => $restaurant->nom,
            'description' => $restaurant->description,
            'adresse' => $restaurant->adresse,
            'horaires' => $restaurant->horaires,
            'telephone' => $restaurant->telephone,
            'zone' => $restaurant->zone ? ['id' => $restaurant->zone->id, 'nom' => $restaurant->zone->nom] : null,
        ],
        'categories' => $categories,
        'panier' => [
            'nombre_articles' => $panier?->lignesPanier->sum('quantite') ?? 0,
            'montant_total' => $panier ? (float) $panier->lignesPanier->sum(fn ($ligne) => $ligne->quantite * $ligne->prix_unitaire) : 0,
            'lignes' => $panier?->lignesPanier->map(fn (LignePanier $ligne) => [
                'id' => $ligne->id,
                'produit_id' => $ligne->produit_id,
                'nom' => $ligne->produit?->nom,
                'image' => $ligne->produit?->image,
                'quantite' => $ligne->quantite,
                'prix_unitaire' => (float) $ligne->prix_unitaire,
                'total' => (float) ($ligne->quantite * $ligne->prix_unitaire),
            ])->values() ?? collect(),
        ],
    ]);
})->middleware('auth')->name('restaurant.detail');

Route::post('/panier/produits/{produit}/ajouter', function (Request $request, Produit $produit) {
    abort_unless(Auth::check() && Auth::user()->role === 'client', 403);
    abort_unless($produit->statut === 'actif' && $produit->disponible, 404);
    abort_unless($produit->restaurant?->statut === 'actif', 404);

    $panier = Panier::firstOrCreate(['user_id' => Auth::id(), 'statut' => 'actif']);
    $quantite = max(1, (int) $request->input('quantite', 1));

    DB::transaction(function () use ($panier, $produit, $quantite) {
        $ligne = LignePanier::query()
            ->where('panier_id', $panier->id)
            ->where('produit_id', $produit->id)
            ->lockForUpdate()
            ->first();

        if ($ligne) {
            $ligne->increment('quantite', $quantite);
        } else {
            LignePanier::create([
                'panier_id' => $panier->id,
                'produit_id' => $produit->id,
                'quantite' => $quantite,
                'prix_unitaire' => $produit->prix,
            ]);
        }
    });

    return back();
})->middleware('auth')->name('panier.ajouter');

Route::patch('/panier/lignes/{lignePanier}', function (Request $request, LignePanier $lignePanier) {
    abort_unless(Auth::check() && Auth::user()->role === 'client', 403);
    $lignePanier->load('panier');
    abort_unless($lignePanier->panier?->user_id === Auth::id() && $lignePanier->panier?->statut === 'actif', 404);

    $quantite = (int) $request->input('quantite', 1);
    $quantite > 0 ? $lignePanier->update(['quantite' => $quantite]) : $lignePanier->delete();

    return back();
})->middleware('auth')->name('panier.ligne.modifier');

Route::delete('/panier/lignes/{lignePanier}', function (LignePanier $lignePanier) {
    abort_unless(Auth::check() && Auth::user()->role === 'client', 403);
    $lignePanier->load('panier');
    abort_unless($lignePanier->panier?->user_id === Auth::id() && $lignePanier->panier?->statut === 'actif', 404);
    $lignePanier->delete();

    return back();
})->middleware('auth')->name('panier.ligne.supprimer');

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

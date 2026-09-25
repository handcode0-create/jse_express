<?php

namespace App\Http\Controllers;

use App\Models\Categorie;
use App\Models\Commande;
use App\Models\HistoriqueCommande;
use App\Models\Livraison;
use App\Models\Notification;
use App\Models\Paiement;
use App\Models\Produit;
use App\Models\Restaurant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Services\LivraisonService;
use App\Services\NotificationService;
use Inertia\Inertia;
use Inertia\Response;

class RestaurantController extends Controller
{
    private function restaurant(Request $request): Restaurant
    {
        return Restaurant::query()
            ->where('user_id', $request->user()->id)
            ->where('statut', 'actif')
            ->firstOrFail();
    }

    public function tableauDeBord(Request $request): Response
    {
        $restaurant = $this->restaurant($request);

        $commandes = Commande::query()
            ->where('restaurant_id', $restaurant->id)
            ->with(['user:id,nom,prenom,telephone', 'statutCommande:id,code,libelle,ordre', 'zone:id,nom'])
            ->withCount('lignesCommande')
            ->latest('date_commande')
            ->limit(30)
            ->get()
            ->map(fn (Commande $commande) => [
                'id' => $commande->id,
                'reference' => $commande->reference,
                'client' => $commande->user ? [
                    'nom' => trim($commande->user->prenom . ' ' . $commande->user->nom),
                    'telephone' => $commande->user->telephone,
                ] : null,
                'zone' => $commande->zone?->nom,
                'adresse' => $commande->adresse_livraison,
                'nombre_articles' => (int) $commande->lignes_commande_count,
                'montant_total' => (float) $commande->montant_total,
                'statut' => $commande->statutCommande ? [
                    'code' => $commande->statutCommande->code,
                    'libelle' => $commande->statutCommande->libelle,
                    'ordre' => (int) $commande->statutCommande->ordre,
                ] : null,
                'date' => $commande->date_commande?->format('d/m/Y'),
                'heure' => $commande->date_commande?->format('H:i'),
            ]);

        $categories = Categorie::query()
            ->where('restaurant_id', $restaurant->id)
            ->where('statut', 'actif')
            ->withCount('produits')
            ->orderBy('nom')
            ->get(['id', 'nom', 'description', 'statut'])
            ->map(fn (Categorie $categorie) => [
                'id' => $categorie->id,
                'nom' => $categorie->nom,
                'description' => $categorie->description,
                'nombre_produits' => (int) $categorie->produits_count,
            ]);

        $produits = Produit::query()
            ->where('restaurant_id', $restaurant->id)
            ->with('categorie:id,nom')
            ->orderBy('nom')
            ->get()
            ->map(fn (Produit $produit) => [
                'id' => $produit->id,
                'nom' => $produit->nom,
                'description' => $produit->description,
                'prix' => (float) $produit->prix,
                'image' => $produit->image,
                'options' => $produit->options ?? [],
                'disponible' => (bool) $produit->disponible,
                'statut' => $produit->statut,
                'categorie' => $produit->categorie ? [
                    'id' => $produit->categorie->id,
                    'nom' => $produit->categorie->nom,
                ] : null,
            ]);

        return Inertia::render('Restaurant/TableauDeBord', [
            'restaurant' => [
                'id' => $restaurant->id,
                'nom' => $restaurant->nom,
                'description' => $restaurant->description,
                'telephone' => $restaurant->telephone,
                'email' => $restaurant->email,
                'adresse' => $restaurant->adresse,
                'horaires' => $restaurant->horaires,
            ],
            'commandes' => $commandes,
            'categories' => $categories,
            'produits' => $produits,
            'statistiques' => [
                'commandes_en_attente' => Commande::query()
                    ->where('restaurant_id', $restaurant->id)
                    ->whereHas('statutCommande', fn ($query) => $query->whereIn('code', ['EN_ATTENTE', 'CONFIRMEE', 'EN_PREPARATION']))
                    ->count(),
                'commandes_du_jour' => Commande::query()
                    ->where('restaurant_id', $restaurant->id)
                    ->whereDate('date_commande', today())
                    ->count(),
                'produits_disponibles' => Produit::query()
                    ->where('restaurant_id', $restaurant->id)
                    ->where('statut', 'actif')
                    ->where('disponible', true)
                    ->count(),
                'revenus_du_jour' => (float) Paiement::query()
                    ->whereHas('commande', fn ($query) => $query->where('restaurant_id', $restaurant->id))
                    ->where('statut', 'reussi')
                    ->whereDate('date_paiement', today())
                    ->sum('montant'),
                'notifications' => Notification::query()
                    ->where('user_id', $request->user()->id)
                    ->count(),
                'commandes_total' => Commande::query()
                    ->where('restaurant_id', $restaurant->id)
                    ->count(),
                'commandes_livrees' => Commande::query()
                    ->where('restaurant_id', $restaurant->id)
                    ->whereHas('statutCommande', fn ($query) => $query->where('code', 'LIVREE'))
                    ->count(),
                'revenus_total' => (float) Paiement::query()
                    ->whereHas('commande', fn ($query) => $query->where('restaurant_id', $restaurant->id))
                    ->where('statut', 'reussi')
                    ->sum('montant'),
                'panier_moyen' => (float) Paiement::query()
                    ->whereHas('commande', fn ($query) => $query->where('restaurant_id', $restaurant->id))
                    ->where('statut', 'reussi')
                    ->avg('montant'),
            ],
        ]);
    }

    public function detailsCommande(Request $request, Commande $commande): Response
    {
        $restaurant = $this->restaurant($request);

        abort_unless((int) $commande->restaurant_id === (int) $restaurant->id, 404);

        $commande->load([
            'user:id,nom,prenom,telephone,email',
            'zone:id,nom',
            'statutCommande:id,code,libelle,ordre',
            'lignesCommande.produit:id,nom,description,image',
            'paiements' => fn ($query) => $query->latest('id'),
            'livraison.attributions' => fn ($query) => $query
                ->where('statut', 'active')
                ->with('livreur:id,nom,prenom,telephone'),
            'historiquesCommande.statut:id,code,libelle,ordre',
        ]);

        $paiement = $commande->paiements->first();

        return Inertia::render('Restaurant/CommandeDetails', [
            'restaurant' => [
                'id' => $restaurant->id,
                'nom' => $restaurant->nom,
            ],
            'commande' => [
                'id' => $commande->id,
                'reference' => $commande->reference,
                'client' => $commande->user ? [
                    'nom' => trim($commande->user->prenom . ' ' . $commande->user->nom),
                    'telephone' => $commande->user->telephone,
                    'email' => $commande->user->email,
                ] : null,
                'adresse_livraison' => $commande->adresse_livraison,
                'telephone_livraison' => $commande->telephone_livraison,
                'zone' => $commande->zone ? [
                    'id' => $commande->zone->id,
                    'nom' => $commande->zone->nom,
                ] : null,
                'sous_total' => (float) $commande->sous_total,
                'frais_livraison' => (float) $commande->frais_livraison,
                'montant_total' => (float) $commande->montant_total,
                'date_commande' => $commande->date_commande?->format('d/m/Y'),
                'heure_commande' => $commande->date_commande?->format('H:i'),
                'statut' => $commande->statutCommande ? [
                    'code' => $commande->statutCommande->code,
                    'libelle' => $commande->statutCommande->libelle,
                ] : null,
                'lignes' => $commande->lignesCommande->map(fn ($ligne) => [
                    'id' => $ligne->id,
                    'nom' => $ligne->nom_produit_snapshot,
                    'description' => $ligne->produit?->description,
                    'image' => $ligne->produit?->image,
                    'quantite' => (int) $ligne->quantite,
                    'prix_unitaire' => (float) $ligne->prix_unitaire,
                    'total' => (float) $ligne->total_ligne,
                    'options' => $ligne->options ?? [],
                ])->values(),
                'paiement' => $paiement ? [
                    'moyen' => $paiement->moyen,
                    'reference_transaction' => $paiement->reference_transaction,
                    'montant' => (float) $paiement->montant,
                    'statut' => $paiement->statut,
                    'date' => $paiement->date_paiement ? \Carbon\Carbon::parse($paiement->date_paiement)->format('d/m/Y') : null,
                    'heure' => $paiement->date_paiement ? \Carbon\Carbon::parse($paiement->date_paiement)->format('H:i') : null,
                ] : null,
                'livraison' => $commande->livraison ? [
                    'statut' => $commande->livraison->statut,
                    'mode_attribution' => $commande->livraison->mode_attribution,
                    'livreur' => $commande->livraison->attributions->first()?->livreur ? [
                        'nom' => trim(
                            $commande->livraison->attributions->first()->livreur->prenom . ' ' .
                            $commande->livraison->attributions->first()->livreur->nom
                        ),
                        'telephone' => $commande->livraison->attributions->first()->livreur->telephone,
                    ] : null,
                ] : null,
                'historique' => $commande->historiquesCommande
                    ->sortBy('date_changement')
                    ->map(fn ($historique) => [
                        'code' => $historique->statut?->code,
                        'libelle' => $historique->statut?->libelle,
                        'commentaire' => $historique->commentaire,
                        'date' => $historique->date_changement ? \Carbon\Carbon::parse($historique->date_changement)->format('d/m/Y') : null,
                        'heure' => $historique->date_changement ? \Carbon\Carbon::parse($historique->date_changement)->format('H:i') : null,
                    ])->values(),
            ],
        ]);
    }

    public function modifierProfilRestaurant(Request $request): RedirectResponse
    {
        $restaurant = $this->restaurant($request);

        $donnees = $request->validate([
            'nom' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:2000'],
            'telephone' => ['required', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:150'],
            'adresse' => ['required', 'string', 'max:255'],
        ]);

        $restaurant->update($donnees);

        return back()->with('success', 'Les informations du restaurant ont été mises à jour.');
    }

    public function modifierHoraires(Request $request): RedirectResponse
    {
        $restaurant = $this->restaurant($request);

        $donnees = $request->validate([
            'horaires' => ['required', 'string', 'max:500'],
        ]);

        $restaurant->update(['horaires' => $donnees['horaires']]);

        return back()->with('success', 'Les horaires ont été mis à jour.');
    }

    public function modifierCompte(Request $request): RedirectResponse
    {
        $utilisateur = $request->user();

        $donnees = $request->validate([
            'prenom' => ['required', 'string', 'max:100'],
            'nom' => ['required', 'string', 'max:100'],
            'telephone' => ['required', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:150'],
        ]);

        $utilisateur->update($donnees);

        return back()->with('success', 'Votre profil a été mis à jour.');
    }

    public function changerStatutCommande(Request $request, Commande $commande, LivraisonService $livraisonService, NotificationService $notificationService): RedirectResponse
    {
        $restaurant = $this->restaurant($request);

        abort_unless((int) $commande->restaurant_id === (int) $restaurant->id, 404);

        $donnees = $request->validate([
            'statut' => ['required', 'in:CONFIRMEE,EN_PREPARATION,PRETE'],
        ]);

        DB::transaction(function () use ($request, $commande, $restaurant, $donnees, $livraisonService, $notificationService) {
            $commande = Commande::query()->whereKey($commande->id)->lockForUpdate()->with(['statutCommande', 'user'])->firstOrFail();

            $transitions = [
                'EN_ATTENTE' => ['CONFIRMEE'],
                'CONFIRMEE' => ['EN_PREPARATION'],
                'EN_PREPARATION' => ['PRETE'],
            ];

            $actuel = $commande->statutCommande?->code;
            abort_unless($actuel && in_array($donnees['statut'], $transitions[$actuel] ?? [], true), 422, 'Cette commande ne peut pas passer à ce statut.');

            $statut = \App\Models\StatutCommande::query()->where('code', $donnees['statut'])->firstOrFail();

            $commande->update(['statut_id' => $statut->id]);

            HistoriqueCommande::create([
                'commande_id' => $commande->id,
                'statut_id' => $statut->id,
                'user_id' => $request->user()->id,
                'commentaire' => 'Statut mis à jour par le restaurant.',
                'date_changement' => now(),
            ]);

            $notificationService->sms(
                $commande->user,
                $donnees['statut'] === 'PRETE'
                    ? 'Votre commande '.$commande->reference.' est prête et va être attribuée à un livreur.'
                    : 'Le statut de votre commande '.$commande->reference.' a été mis à jour.',
                $commande->id,
                null,
                'commande'
            );

            if ($donnees['statut'] === 'PRETE') {
                $livraison = Livraison::query()->firstOrCreate(
                    ['commande_id' => $commande->id],
                    [
                        'zone_id' => $commande->zone_id,
                        'statut' => 'en_attente',
                        'mode_attribution' => 'automatique',
                    ]
                );

                $attribution = $livraisonService->attribuerPremierDisponible($livraison);

                if ($attribution) {
                    $attribution->load('livreur');
                    $notificationService->sms(
                        $attribution->livreur,
                        'Nouvelle livraison '.$commande->reference.' à prendre en charge.',
                        $commande->id,
                        $livraison->id,
                        'attribution'
                    );

                    $pin = \Illuminate\Support\Facades\Crypt::decryptString(
                        $commande->fresh()->pin_livraison_chiffre
                    );

                    $notificationService->sms(
                        $commande->user,
                        'Votre code de livraison pour '.$commande->reference.' est '.$pin.'. Communiquez-le au livreur à la remise.',
                        $commande->id,
                        $livraison->id,
                        'pin_livraison'
                    );
                }
            }
        });

        return back()->with('success', 'Le statut de la commande a été mis à jour.');
    }

    public function annulerCommande(Request $request, Commande $commande): RedirectResponse
    {
        $restaurant = $this->restaurant($request);
        abort_unless((int) $commande->restaurant_id === (int) $restaurant->id, 404);

        $donnees = $request->validate(['motif' => ['nullable', 'string', 'max:500']]);

        DB::transaction(function () use ($request, $commande, $donnees) {
            $commande = Commande::query()->whereKey($commande->id)->lockForUpdate()->with('statutCommande')->firstOrFail();
            abort_unless(in_array($commande->statutCommande?->code, ['EN_ATTENTE', 'CONFIRMEE', 'EN_PREPARATION'], true), 422, 'Cette commande ne peut plus être annulée.');

            $statut = \App\Models\StatutCommande::query()->where('code', 'ANNULEE')->firstOrFail();
            $commande->update(['statut_id' => $statut->id]);

            HistoriqueCommande::create([
                'commande_id' => $commande->id,
                'statut_id' => $statut->id,
                'user_id' => $request->user()->id,
                'commentaire' => $donnees['motif'] ?? 'Commande annulée par le restaurant.',
                'date_changement' => now(),
            ]);
        });

        return back()->with('success', 'La commande a été annulée.');
    }

    public function changerDisponibiliteProduit(Request $request, Produit $produit): RedirectResponse
    {
        $restaurant = $this->restaurant($request);

        abort_unless((int) $produit->restaurant_id === (int) $restaurant->id, 404);

        $produit->update(['disponible' => ! $produit->disponible]);

        return back()->with('success', $produit->disponible
            ? 'Produit rendu disponible.'
            : 'Produit marqué comme indisponible.');
    }

    public function creerCategorie(Request $request): RedirectResponse
    {
        $restaurant = $this->restaurant($request);

        $donnees = $request->validate([
            'nom' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        Categorie::create([
            'restaurant_id' => $restaurant->id,
            'nom' => $donnees['nom'],
            'description' => $donnees['description'] ?? null,
            'statut' => 'actif',
        ]);

        return back()->with('success', 'Catégorie créée.');
    }

    public function creerProduit(Request $request): RedirectResponse
    {
        $restaurant = $this->restaurant($request);

        $donnees = $request->validate([
            'categorie_id' => ['nullable', 'integer'],
            'nom' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:2000'],
            'prix' => ['required', 'numeric', 'min:0'],
            'image' => ['nullable', 'string', 'max:500'],
        ]);

        if (! empty($donnees['categorie_id'])) {
            abort_unless(
                Categorie::query()
                    ->where('id', $donnees['categorie_id'])
                    ->where('restaurant_id', $restaurant->id)
                    ->exists(),
                422,
                'Cette catégorie n’appartient pas à votre restaurant.'
            );
        }

        Produit::create([
            'restaurant_id' => $restaurant->id,
            'categorie_id' => $donnees['categorie_id'] ?? null,
            'nom' => $donnees['nom'],
            'description' => $donnees['description'] ?? null,
            'prix' => $donnees['prix'],
            'image' => $donnees['image'] ?? null,
            'options' => [],
            'disponible' => true,
            'statut' => 'actif',
        ]);

        return back()->with('success', 'Produit ajouté au menu.');
    }

    public function modifierOptionsProduit(Request $request, Produit $produit): RedirectResponse
    {
        $restaurant = $this->restaurant($request);

        abort_unless((int) $produit->restaurant_id === (int) $restaurant->id, 404);

        $donnees = $request->validate([
            'options' => ['nullable', 'array', 'max:12'],
            'options.*' => ['array:name,obligatoire,multiple,min,max,items'],
            'options.*.name' => ['required', 'string', 'max:100'],
            'options.*.obligatoire' => ['boolean'],
            'options.*.multiple' => ['boolean'],
            'options.*.min' => ['integer', 'min:0', 'max:20'],
            'options.*.max' => ['integer', 'min:1', 'max:20'],
            'options.*.items' => ['array', 'max:30'],
            'options.*.items.*' => ['array:name,prix,disponible'],
            'options.*.items.*.name' => ['required', 'string', 'max:100'],
            'options.*.items.*.prix' => ['required', 'numeric', 'min:0', 'max:1000000'],
            'options.*.items.*.disponible' => ['boolean'],
        ]);

        $options = collect($donnees['options'] ?? [])->map(function (array $groupe) {
            $items = collect($groupe['items'] ?? [])->map(fn (array $item) => [
                'name' => trim($item['name']),
                'prix' => (float) $item['prix'],
                'disponible' => (bool) ($item['disponible'] ?? true),
            ])->filter(fn (array $item) => $item['name'] !== '')->values()->all();

            return [
                'name' => trim($groupe['name']),
                'obligatoire' => (bool) ($groupe['obligatoire'] ?? false),
                'multiple' => (bool) ($groupe['multiple'] ?? false),
                'min' => max(0, (int) ($groupe['min'] ?? 0)),
                'max' => max(1, (int) ($groupe['max'] ?? 1)),
                'items' => $items,
            ];
        })->filter(fn (array $groupe) => $groupe['name'] !== '' && count($groupe['items']) > 0)->values()->all();

        $produit->update(['options' => $options]);

        return back()->with('success', 'Les options du produit ont été mises à jour.');
    }
}

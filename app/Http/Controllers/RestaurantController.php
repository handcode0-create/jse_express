<?php

namespace App\Http\Controllers;

use App\Models\Categorie;
use App\Models\Commande;
use App\Models\HistoriqueCommande;
use App\Models\Produit;
use App\Models\Restaurant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
            ],
        ]);
    }

    public function changerStatutCommande(Request $request, Commande $commande): RedirectResponse
    {
        $restaurant = $this->restaurant($request);

        abort_unless((int) $commande->restaurant_id === (int) $restaurant->id, 404);

        $donnees = $request->validate([
            'statut' => ['required', 'in:CONFIRMEE,EN_PREPARATION,PRETE'],
        ]);

        $commande->load('statutCommande');

        $transitions = [
            'EN_ATTENTE' => ['CONFIRMEE'],
            'CONFIRMEE' => ['EN_PREPARATION'],
            'EN_PREPARATION' => ['PRETE'],
        ];

        $actuel = $commande->statutCommande?->code;
        abort_unless(
            $actuel && in_array($donnees['statut'], $transitions[$actuel] ?? [], true),
            422,
            'Cette commande ne peut pas passer à ce statut.'
        );

        $statut = \App\Models\StatutCommande::query()
            ->where('code', $donnees['statut'])
            ->firstOrFail();

        $commande->update(['statut_id' => $statut->id]);

        HistoriqueCommande::create([
            'commande_id' => $commande->id,
            'statut_id' => $statut->id,
            'user_id' => $request->user()->id,
            'commentaire' => 'Statut mis à jour par le restaurant.',
            'date_changement' => now(),
        ]);

        return back()->with('success', 'Le statut de la commande a été mis à jour.');
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
            'disponible' => true,
            'statut' => 'actif',
        ]);

        return back()->with('success', 'Produit ajouté au menu.');
    }
}

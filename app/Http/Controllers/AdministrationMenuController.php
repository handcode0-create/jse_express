<?php

namespace App\Http\Controllers;

use App\Models\Categorie;
use App\Models\Produit;
use App\Models\Restaurant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdministrationMenuController extends Controller
{
    public function afficher(Request $request, Restaurant $restaurant): Response
    {
        $restaurant->load('zone:id,nom');

        $categories = Categorie::query()
            ->where('restaurant_id', $restaurant->id)
            ->where('statut', 'actif')
            ->orderBy('nom')
            ->get(['id', 'nom', 'description'])
            ->map(fn (Categorie $categorie) => [
                'id' => $categorie->id,
                'nom' => $categorie->nom,
                'description' => $categorie->description,
            ]);

        $produits = Produit::query()
            ->where('restaurant_id', $restaurant->id)
            ->orderBy('nom')
            ->get()
            ->map(fn (Produit $produit) => [
                'id' => $produit->id,
                'categorie_id' => $produit->categorie_id,
                'nom' => $produit->nom,
                'description' => $produit->description,
                'prix' => (float) $produit->prix,
                'image' => $produit->image,
                'disponible' => (bool) $produit->disponible,
            ]);

        $utilisateur = $request->user();

        return Inertia::render('Admin/RestaurantMenu', [
            'utilisateur' => [
                'id' => $utilisateur->id,
                'nom' => $utilisateur->nom,
                'prenom' => $utilisateur->prenom,
                'telephone' => $utilisateur->telephone,
                'email' => $utilisateur->email,
                'photo_profil' => $utilisateur->photo_profil,
                'role' => $utilisateur->role,
                'statut' => $utilisateur->statut,
            ],
            'restaurant' => [
                'id' => $restaurant->id,
                'nom' => $restaurant->nom,
                'adresse' => $restaurant->adresse,
                'zone' => $restaurant->zone?->nom,
                'statut' => $restaurant->statut,
            ],
            'categories' => $categories,
            'produits' => $produits,
        ]);
    }

    public function creerCategorie(Request $request, Restaurant $restaurant): RedirectResponse
    {
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

    public function creerProduit(Request $request, Restaurant $restaurant): RedirectResponse
    {
        $donnees = $this->validerProduit($request, $restaurant);

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

    public function modifierProduit(Request $request, Restaurant $restaurant, Produit $produit): RedirectResponse
    {
        abort_unless((int) $produit->restaurant_id === (int) $restaurant->id, 404);

        $donnees = $this->validerProduit($request, $restaurant);

        $produit->update([
            'categorie_id' => $donnees['categorie_id'] ?? null,
            'nom' => $donnees['nom'],
            'description' => $donnees['description'] ?? null,
            'prix' => $donnees['prix'],
            'image' => $donnees['image'] ?? null,
        ]);

        return back()->with('success', 'Produit mis à jour.');
    }

    public function changerDisponibiliteProduit(Restaurant $restaurant, Produit $produit): RedirectResponse
    {
        abort_unless((int) $produit->restaurant_id === (int) $restaurant->id, 404);

        $produit->update(['disponible' => ! $produit->disponible]);

        return back()->with('success', $produit->disponible
            ? 'Produit rendu disponible.'
            : 'Produit marqué comme indisponible.');
    }

    /**
     * @return array{categorie_id?: int|null, nom: string, description?: string|null, prix: float|int|string, image?: string|null}
     */
    private function validerProduit(Request $request, Restaurant $restaurant): array
    {
        $donnees = $request->validate([
            'categorie_id' => ['nullable', 'integer'],
            'nom' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:2000'],
            'prix' => ['required', 'numeric', 'min:0', 'max:1000000'],
            'image' => ['nullable', 'string', 'max:500'],
        ]);

        if (! empty($donnees['categorie_id'])) {
            abort_unless(
                Categorie::query()
                    ->whereKey($donnees['categorie_id'])
                    ->where('restaurant_id', $restaurant->id)
                    ->where('statut', 'actif')
                    ->exists(),
                422,
                'Cette catégorie n’appartient pas à ce restaurant.'
            );
        }

        return $donnees;
    }
}

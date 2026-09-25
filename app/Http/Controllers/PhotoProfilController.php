<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class PhotoProfilController extends Controller
{
    public function modifier(Request $request): RedirectResponse
    {
        $donnees = $request->validate([
            'photo' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ], [
            'photo.required' => 'Sélectionnez une photo.',
            'photo.image' => 'Le fichier sélectionné doit être une image.',
            'photo.mimes' => 'Formats acceptés : JPG, PNG ou WebP.',
            'photo.max' => 'La photo ne doit pas dépasser 5 Mo.',
        ]);

        $utilisateur = $request->user();
        $directory = public_path('uploads/profils');

        File::ensureDirectoryExists($directory);

        if ($utilisateur->photo_profil) {
            $ancien = public_path(ltrim($utilisateur->photo_profil, '/'));
            if (File::exists($ancien)) {
                File::delete($ancien);
            }
        }

        $extension = strtolower($donnees['photo']->getClientOriginalExtension());
        $nom = Str::uuid()->toString() . '.' . $extension;
        $donnees['photo']->move($directory, $nom);

        $utilisateur->forceFill([
            'photo_profil' => '/uploads/profils/' . $nom,
        ])->save();

        return match ($utilisateur->role) {
            'client' => to_route('profil')->with('success', 'Photo de profil mise à jour.'),
            'livreur' => to_route('livreur.tableau-de-bord')->with('success', 'Photo de profil mise à jour.'),
            'restaurant' => to_route('restaurant.tableau-de-bord')->with('success', 'Photo de profil mise à jour.'),
            'administrateur' => to_route('admin.tableau-de-bord')->with('success', 'Photo de profil mise à jour.'),
            default => back()->with('success', 'Photo de profil mise à jour.'),
        };
    }
}

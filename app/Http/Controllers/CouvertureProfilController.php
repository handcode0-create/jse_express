<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class CouvertureProfilController extends Controller
{
    public function modifier(Request $request): RedirectResponse
    {
        $donnees = $request->validate([
            'couverture' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ], [
            'couverture.required' => 'Sélectionnez une image de couverture.',
            'couverture.image' => 'Le fichier sélectionné doit être une image.',
            'couverture.mimes' => 'Formats acceptés : JPG, PNG ou WebP.',
            'couverture.max' => 'La couverture ne doit pas dépasser 5 Mo.',
        ]);

        $utilisateur = $request->user();
        $directory = public_path('uploads/couvertures');

        File::ensureDirectoryExists($directory);

        if ($utilisateur->couverture_profil) {
            $ancien = public_path(ltrim($utilisateur->couverture_profil, '/'));
            if (File::exists($ancien)) {
                File::delete($ancien);
            }
        }

        $extension = strtolower($donnees['couverture']->getClientOriginalExtension());
        $nom = Str::uuid()->toString() . '.' . $extension;
        $donnees['couverture']->move($directory, $nom);

        $utilisateur->forceFill([
            'couverture_profil' => '/uploads/couvertures/' . $nom,
        ])->save();

        return back()->with('success', 'Couverture de profil mise à jour.');
    }
}

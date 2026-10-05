<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class MotDePasseController extends Controller
{
    /**
     * Changement de mot de passe de l'utilisateur connecté (tous rôles) : le mot de passe actuel
     * est exigé, le nouveau doit être confirmé, différent de l'actuel et d'au moins 8 caractères.
     */
    public function modifier(Request $request): RedirectResponse
    {
        $donnees = $request->validate([
            'mot_de_passe_actuel' => ['required', 'string', 'current_password'],
            'nouveau_mot_de_passe' => ['required', 'string', 'min:8', 'max:255', 'different:mot_de_passe_actuel', 'confirmed'],
        ], [
            'mot_de_passe_actuel.required' => 'Saisissez votre mot de passe actuel.',
            'mot_de_passe_actuel.current_password' => 'Le mot de passe actuel est incorrect.',
            'nouveau_mot_de_passe.required' => 'Saisissez un nouveau mot de passe.',
            'nouveau_mot_de_passe.min' => 'Le nouveau mot de passe doit contenir au moins 8 caractères.',
            'nouveau_mot_de_passe.different' => 'Le nouveau mot de passe doit être différent de l’actuel.',
            'nouveau_mot_de_passe.confirmed' => 'La confirmation ne correspond pas au nouveau mot de passe.',
        ]);

        $request->user()->forceFill([
            'password' => Hash::make($donnees['nouveau_mot_de_passe']),
        ])->save();

        $request->session()->regenerate();

        return back()->with('success', 'Votre mot de passe a été modifié.');
    }
}

<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class TarificationAdminAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_administrator_can_access_tarification(): void
    {
        foreach (['client', 'restaurant', 'livreur'] as $role) {
            $user = User::create([
                'nom' => 'Test',
                'prenom' => ucfirst($role),
                'telephone' => '07000000'.strlen($role),
                'password' => Hash::make('password'),
                'role' => $role,
                'statut' => 'actif',
            ]);
            $this->actingAs($user)->get('/administration/tarification')->assertForbidden();
        }

        $admin = User::create([
            'nom' => 'Admin',
            'prenom' => 'Test',
            'telephone' => '0700000099',
            'password' => Hash::make('password'),
            'role' => 'administrateur',
            'statut' => 'actif',
        ]);

        $this->actingAs($admin)->get('/administration/tarification')->assertOk();
    }
}

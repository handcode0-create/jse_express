<?php

namespace Tests\Feature;

use App\Models\Commande;
use App\Models\HistoriqueCommande;
use App\Models\StatutCommande;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdministrationCommandeTest extends TestCase
{
    use RefreshDatabase;

    public function test_un_administrateur_peut_annuler_une_commande_en_traitement(): void
    {
        $admin = User::factory()->administrateur()->create();

        $enAttente = StatutCommande::factory()->create([
            'code' => 'EN_ATTENTE',
            'libelle' => 'En attente',
            'ordre' => 1,
        ]);

        $annulee = StatutCommande::factory()->create([
            'code' => 'ANNULEE',
            'libelle' => 'Annulée',
            'ordre' => 99,
        ]);

        $commande = Commande::factory()->create([
            'statut_id' => $enAttente->id,
        ]);

        $response = $this->actingAs($admin)->post(
            route('admin.commandes.annuler', $commande),
            ['motif' => 'Restaurant indisponible.']
        );

        $response->assertRedirect();
        $response->assertSessionHas('success', 'La commande a été annulée.');

        $this->assertDatabaseHas('commandes', [
            'id' => $commande->id,
            'statut_id' => $annulee->id,
        ]);

        $this->assertDatabaseHas('historiques_commandes', [
            'commande_id' => $commande->id,
            'statut_id' => $annulee->id,
            'user_id' => $admin->id,
            'commentaire' => 'Restaurant indisponible.',
        ]);
    }

    public function test_un_client_ne_peut_pas_utiliser_l_annulation_administrateur(): void
    {
        $client = User::factory()->client()->create();

        $enAttente = StatutCommande::factory()->create([
            'code' => 'EN_ATTENTE',
            'libelle' => 'En attente',
            'ordre' => 1,
        ]);

        $commande = Commande::factory()->create([
            'statut_id' => $enAttente->id,
        ]);

        $response = $this->actingAs($client)->post(
            route('admin.commandes.annuler', $commande),
            ['motif' => 'Tentative']
        );

        $response->assertForbidden();
        $this->assertDatabaseHas('commandes', [
            'id' => $commande->id,
            'statut_id' => $enAttente->id,
        ]);
    }
}

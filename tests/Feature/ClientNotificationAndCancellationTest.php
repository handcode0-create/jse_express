<?php

namespace Tests\Feature;

use App\Models\AttributionLivraison;
use App\Models\Commande;
use App\Models\Livraison;
use App\Models\Notification;
use App\Models\Paiement;
use App\Models\ProfilLivreur;
use App\Models\Restaurant;
use App\Models\StatutCommande;
use App\Models\User;
use App\Models\Zone;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ClientNotificationAndCancellationTest extends TestCase
{
    use RefreshDatabase;

    private function creerStatuts(): void
    {
        foreach ([
            ['EN_ATTENTE', 'Reçue', 1],
            ['CONFIRMEE', 'Confirmée', 2],
            ['EN_PREPARATION', 'En préparation', 3],
            ['PRETE', 'Prête / à récupérer', 4],
            ['EN_LIVRAISON', 'En livraison', 5],
            ['LIVREE', 'Livrée', 6],
            ['ANNULEE', 'Annulée', 7],
        ] as [$code, $libelle, $ordre]) {
            StatutCommande::query()->updateOrCreate(
                ['code' => $code],
                ['libelle' => $libelle, 'ordre' => $ordre],
            );
        }
    }

    private function creerCommande(User $client, string $statut = 'EN_ATTENTE'): Commande
    {
        $this->creerStatuts();

        $zone = Zone::factory()->create();
        $restaurantUser = User::factory()->restaurant()->create();
        $restaurant = Restaurant::factory()->create([
            'user_id' => $restaurantUser->id,
            'zone_id' => $zone->id,
        ]);

        return Commande::factory()->create([
            'user_id' => $client->id,
            'restaurant_id' => $restaurant->id,
            'zone_id' => $zone->id,
            'statut_id' => StatutCommande::query()->where('code', $statut)->value('id'),
        ]);
    }

    public function test_un_client_peut_masquer_sa_notification_sans_supprimer_le_journal(): void
    {
        $client = User::factory()->client()->create();
        $notification = Notification::factory()->create(['user_id' => $client->id]);

        $response = $this->actingAs($client)->deleteJson(
            route('notifications.supprimer', $notification)
        );

        $response
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.id', $notification->id);

        $this->assertDatabaseHas('notifications', [
            'id' => $notification->id,
        ]);
        $this->assertNotNull(
            Notification::query()->findOrFail($notification->id)->hidden_by_recipient_at
        );
    }

    public function test_un_client_ne_peut_pas_masquer_la_notification_d_un_autre_client(): void
    {
        $client = User::factory()->client()->create();
        $autreClient = User::factory()->client()->create();
        $notification = Notification::factory()->create(['user_id' => $autreClient->id]);

        $this->actingAs($client)
            ->deleteJson(route('notifications.supprimer', $notification))
            ->assertForbidden();

        $this->assertNull($notification->fresh()->hidden_by_recipient_at);
    }

    public function test_une_commande_en_attente_est_annulee_et_libere_le_livreur(): void
    {
        $client = User::factory()->client()->create();
        $commande = $this->creerCommande($client, 'EN_ATTENTE');

        $livraison = Livraison::factory()->create([
            'commande_id' => $commande->id,
            'zone_id' => $commande->zone_id,
            'statut' => 'attribuee',
        ]);

        $livreur = User::factory()->livreur()->create();
        ProfilLivreur::factory()->create([
            'user_id' => $livreur->id,
            'zone_id' => $commande->zone_id,
            'disponibilite' => 'indisponible',
        ]);

        AttributionLivraison::factory()->create([
            'livraison_id' => $livraison->id,
            'livreur_id' => $livreur->id,
            'statut' => 'active',
        ]);

        $commande->update([
            'pin_livraison_hash' => Hash::make('123456'),
            'pin_livraison_chiffre' => Crypt::encryptString('123456'),
            'pin_genere_at' => now(),
            'pin_valide_at' => null,
        ]);

        $this->actingAs($client)
            ->post(route('commande.annuler', $commande))
            ->assertRedirect();

        $this->assertDatabaseHas('commandes', [
            'id' => $commande->id,
            'statut_id' => StatutCommande::query()->where('code', 'ANNULEE')->value('id'),
            'pin_livraison_hash' => null,
            'pin_livraison_chiffre' => null,
        ]);

        $this->assertDatabaseHas('livraisons', [
            'id' => $livraison->id,
            'statut' => 'annulee',
        ]);

        $this->assertDatabaseHas('attributions_livraison', [
            'id' => $livraison->attributions()->firstOrFail()->id,
            'statut' => 'terminee',
        ]);

        $this->assertDatabaseHas('profils_livreurs', [
            'user_id' => $livreur->id,
            'disponibilite' => 'disponible',
        ]);
    }

    public function test_une_commande_en_preparation_ne_peut_pas_etre_annulee_par_le_client(): void
    {
        $client = User::factory()->client()->create();
        $commande = $this->creerCommande($client, 'EN_PREPARATION');

        $this->actingAs($client)
            ->post(route('commande.annuler', $commande))
            ->assertStatus(422);

        $this->assertDatabaseHas('commandes', [
            'id' => $commande->id,
            'statut_id' => StatutCommande::query()->where('code', 'EN_PREPARATION')->value('id'),
        ]);
    }

    public function test_un_client_ne_peut_pas_annuler_la_commande_d_un_autre_client(): void
    {
        $client = User::factory()->client()->create();
        $autreClient = User::factory()->client()->create();
        $commande = $this->creerCommande($autreClient, 'EN_ATTENTE');

        $this->actingAs($client)
            ->post(route('commande.annuler', $commande))
            ->assertForbidden();

        $this->assertDatabaseHas('commandes', [
            'id' => $commande->id,
            'statut_id' => StatutCommande::query()->where('code', 'EN_ATTENTE')->value('id'),
        ]);
    }

    public function test_la_seconde_annulation_est_idempotente(): void
    {
        $client = User::factory()->client()->create();
        $commande = $this->creerCommande($client, 'CONFIRMEE');

        $premiere = $this->actingAs($client)
            ->post(route('commande.annuler', $commande))
            ->assertRedirect();

        $seconde = $this->actingAs($client)
            ->post(route('commande.annuler', $commande->fresh()))
            ->assertRedirect();

        $this->assertNotNull($premiere);
        $this->assertNotNull($seconde);

        $this->assertDatabaseCount(
            'historique_commandes',
            1
        );
    }

    public function test_une_requete_non_authentifiee_est_refusee(): void
    {
        $client = User::factory()->client()->create();
        $notification = Notification::factory()->create(['user_id' => $client->id]);
        $commande = $this->creerCommande($client, 'EN_ATTENTE');

        $this->deleteJson(route('notifications.supprimer', $notification))
            ->assertRedirect();

        $this->post(route('commande.annuler', $commande))
            ->assertRedirect();

        $this->assertDatabaseHas('commandes', [
            'id' => $commande->id,
            'statut_id' => StatutCommande::query()->where('code', 'EN_ATTENTE')->value('id'),
        ]);
    }
}

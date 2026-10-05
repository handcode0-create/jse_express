<?php

namespace Tests\Feature;

use App\Models\AttributionLivraison;
use App\Models\Commande;
use App\Models\Livraison;
use App\Models\Notification;
use App\Models\ProfilLivreur;
use App\Models\Restaurant;
use App\Models\StatutCommande;
use App\Models\User;
use App\Models\Zone;
use App\Services\LivraisonService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class PinLivraisonTest extends TestCase
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

    private function creerUtilisateur(string $role, int $index = 1): User
    {
        return User::create([
            'nom' => ucfirst($role),
            'prenom' => 'Test',
            'telephone' => '0700000'.str_pad((string) $index, 3, '0', STR_PAD_LEFT),
            'email' => $role.$index.'@jse.test',
            'password' => Hash::make('password'),
            'role' => $role,
            'statut' => 'actif',
        ]);
    }

    private function creerLivraisonScenario(string $statutLivraison = 'en_cours', string $statutCommande = 'EN_LIVRAISON'): array
    {
        $this->creerStatuts();

        $zone = Zone::create([
            'nom' => 'Zone test',
            'description' => null,
            'statut' => 'actif',
        ]);

        $client = $this->creerUtilisateur('client', 1);
        $restaurantUser = $this->creerUtilisateur('restaurant', 2);
        $livreur = $this->creerUtilisateur('livreur', 3);

        $restaurant = Restaurant::create([
            'user_id' => $restaurantUser->id,
            'zone_id' => $zone->id,
            'nom' => 'Restaurant test',
            'description' => null,
            'telephone' => $restaurantUser->telephone,
            'email' => $restaurantUser->email,
            'adresse' => 'Adresse restaurant test',
            'horaires' => null,
            'statut' => 'actif',
        ]);

        ProfilLivreur::create([
            'user_id' => $livreur->id,
            'matricule' => 'LIV-TEST-'.$livreur->id,
            'zone_id' => $zone->id,
            'disponibilite' => 'disponible',
            'telephone_secondaire' => null,
        ]);

        $statutId = DB::table('statuts_commandes')
            ->where('code', $statutCommande)
            ->value('id');

        $commande = Commande::create([
            'reference' => 'JSE-TEST-'.str_pad((string) $client->id, 6, '0', STR_PAD_LEFT),
            'user_id' => $client->id,
            'restaurant_id' => $restaurant->id,
            'zone_id' => $zone->id,
            'statut_id' => $statutId,
            'adresse_livraison' => 'Adresse client test',
            'telephone_livraison' => $client->telephone,
            'sous_total' => 5000,
            'frais_livraison' => 500,
            'montant_total' => 5500,
            'date_commande' => now(),
        ]);

        $livraison = Livraison::create([
            'commande_id' => $commande->id,
            'zone_id' => $zone->id,
            'statut' => $statutLivraison,
            'mode_attribution' => 'automatique',
            'date_attribution' => now(),
            'date_prise_en_charge' => $statutLivraison === 'en_cours' ? now() : null,
            'date_livraison' => null,
        ]);

        $attribution = AttributionLivraison::create([
            'livraison_id' => $livraison->id,
            'livreur_id' => $livreur->id,
            'admin_id' => null,
            'type_attribution' => 'automatique',
            'statut' => 'active',
            'date_attribution' => now(),
            'motif' => 'Attribution de test.',
        ]);

        return compact('zone', 'client', 'restaurantUser', 'restaurant', 'livreur', 'commande', 'livraison', 'attribution');
    }

    public function test_un_pin_genere_est_compose_de_six_chiffres_et_est_stocke_hash_et_chiffre(): void
    {
        $this->creerStatuts();

        $client = $this->creerUtilisateur('client', 1);
        $restaurantUser = $this->creerUtilisateur('restaurant', 2);
        $zone = Zone::create(['nom' => 'Zone test', 'description' => null, 'statut' => 'actif']);
        $restaurant = Restaurant::create([
            'user_id' => $restaurantUser->id,
            'zone_id' => $zone->id,
            'nom' => 'Restaurant test',
            'telephone' => $restaurantUser->telephone,
            'email' => $restaurantUser->email,
            'adresse' => 'Adresse test',
            'statut' => 'actif',
        ]);

        $commande = Commande::create([
            'reference' => 'JSE-PIN-001',
            'user_id' => $client->id,
            'restaurant_id' => $restaurant->id,
            'zone_id' => $zone->id,
            'statut_id' => DB::table('statuts_commandes')->where('code', 'PRETE')->value('id'),
            'adresse_livraison' => 'Adresse test',
            'telephone_livraison' => $client->telephone,
            'sous_total' => 1000,
            'frais_livraison' => 500,
            'montant_total' => 1500,
            'date_commande' => now(),
        ]);

        $pin = app(LivraisonService::class)->genererPin($commande);

        $commande->refresh();

        $this->assertMatchesRegularExpression('/^\d{6}$/', $pin);
        $this->assertNotNull($commande->pin_livraison_hash);
        $this->assertNotNull($commande->pin_livraison_chiffre);
        $this->assertTrue(Hash::check($pin, $commande->pin_livraison_hash));
        $this->assertSame($pin, Crypt::decryptString($commande->pin_livraison_chiffre));
        $this->assertNotNull($commande->pin_genere_at);
        $this->assertNull($commande->pin_valide_at);
    }

    public function test_le_service_accepte_le_bon_pin_et_refuse_un_mauvais_pin(): void
    {
        $scenario = $this->creerLivraisonScenario();

        $service = app(LivraisonService::class);
        $pin = $service->genererPin($scenario['commande']);

        $this->assertTrue($service->validerPin($scenario['commande']->fresh(), $pin));
        $this->assertFalse($service->validerPin($scenario['commande']->fresh(), '000000'));
    }

    public function test_le_service_refuse_un_pin_qui_n_a_pas_exactement_six_chiffres(): void
    {
        $scenario = $this->creerLivraisonScenario();

        $service = app(LivraisonService::class);
        $service->genererPin($scenario['commande']);

        foreach (['', '123', '12345', '1234567', '12A456', ' 123456 '] as $pin) {
            $this->assertFalse(
                $service->validerPin($scenario['commande']->fresh(), $pin),
                'Le PIN invalide suivant doit être refusé : '.json_encode($pin)
            );
        }
    }

    public function test_le_endpoint_refuse_un_mauvais_pin_sans_cloturer_la_livraison(): void
    {
        $scenario = $this->creerLivraisonScenario();

        $service = app(LivraisonService::class);
        $service->genererPin($scenario['commande']);

        $this->actingAs($scenario['livreur'])
            ->from('/livreur/tableau-de-bord')
            ->post('/livreur/livraisons/'.$scenario['attribution']->id.'/valider-pin', [
                'pin' => '000000',
            ])
            ->assertSessionHasErrors('pin');

        $this->assertSame('en_cours', $scenario['livraison']->fresh()->statut);
        $this->assertSame(
            'EN_LIVRAISON',
            $scenario['commande']->fresh()->statutCommande->code
        );
        $this->assertSame('active', $scenario['attribution']->fresh()->statut);
    }

    public function test_un_livreur_ne_peut_pas_valider_le_pin_d_une_autre_attribution(): void
    {
        $scenario = $this->creerLivraisonScenario();

        $service = app(LivraisonService::class);
        $service->genererPin($scenario['commande']);

        $autreLivreur = $this->creerUtilisateur('livreur', 4);
        ProfilLivreur::create([
            'user_id' => $autreLivreur->id,
            'matricule' => 'LIV-TEST-'.$autreLivreur->id,
            'zone_id' => $scenario['zone']->id,
            'disponibilite' => 'disponible',
        ]);

        $this->actingAs($autreLivreur)
            ->post('/livreur/livraisons/'.$scenario['attribution']->id.'/valider-pin', [
                'pin' => $service->genererPin($scenario['commande']),
            ])
            ->assertStatus(404);

        $this->assertSame('en_cours', $scenario['livraison']->fresh()->statut);
        $this->assertSame('active', $scenario['attribution']->fresh()->statut);
    }

    public function test_le_bon_pin_cloture_la_livraison_et_cree_les_notifications(): void
    {
        $scenario = $this->creerLivraisonScenario();

        $service = app(LivraisonService::class);
        $pin = $service->genererPin($scenario['commande']);

        $response = $this->actingAs($scenario['livreur'])
            ->from('/livreur/tableau-de-bord')
            ->post('/livreur/livraisons/'.$scenario['attribution']->id.'/valider-pin', [
                'pin' => $pin,
            ]);

        $response->assertRedirect('/livreur/tableau-de-bord');
        $response->assertSessionHas('success', 'Livraison validée et commande clôturée.');

        $this->assertSame('livree', $scenario['livraison']->fresh()->statut);
        $this->assertSame('terminee', $scenario['attribution']->fresh()->statut);

        $commande = $scenario['commande']->fresh();
        $this->assertSame('LIVREE', $commande->statutCommande->code);
        $this->assertNotNull($commande->pin_valide_at);

        $this->assertDatabaseHas('historique_commandes', [
            'commande_id' => $commande->id,
            'statut_id' => DB::table('statuts_commandes')->where('code', 'LIVREE')->value('id'),
            'user_id' => $scenario['livreur']->id,
            'commentaire' => 'Livraison validée par PIN.',
        ]);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $scenario['client']->id,
            'commande_id' => $commande->id,
            'livraison_id' => $scenario['livraison']->id,
            'type_evenement' => 'livraison_terminee',
        ]);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $scenario['restaurantUser']->id,
            'commande_id' => $commande->id,
            'livraison_id' => $scenario['livraison']->id,
            'type_evenement' => 'livraison_terminee',
        ]);

        $this->assertSame(2, Notification::query()
            ->where('commande_id', $commande->id)
            ->where('type_evenement', 'livraison_terminee')
            ->count());
    }

    public function test_le_pin_ne_peut_pas_cloturer_une_livraison_qui_n_est_pas_en_cours(): void
    {
        $scenario = $this->creerLivraisonScenario('attribuee');

        $service = app(LivraisonService::class);
        $pin = $service->genererPin($scenario['commande']);

        $this->actingAs($scenario['livreur'])
            ->post('/livreur/livraisons/'.$scenario['attribution']->id.'/valider-pin', [
                'pin' => $pin,
            ])
            ->assertSessionHasErrors('mission');

        $this->assertSame('attribuee', $scenario['livraison']->fresh()->statut);
        $this->assertSame('active', $scenario['attribution']->fresh()->statut);
    }

    public function test_le_pin_ne_peut_pas_cloturer_une_commande_qui_n_est_pas_en_livraison(): void
    {
        $scenario = $this->creerLivraisonScenario('en_cours', 'PRETE');

        $service = app(LivraisonService::class);
        $pin = $service->genererPin($scenario['commande']);

        $this->actingAs($scenario['livreur'])
            ->post('/livreur/livraisons/'.$scenario['attribution']->id.'/valider-pin', [
                'pin' => $pin,
            ])
            ->assertSessionHasErrors('mission');

        $this->assertSame('en_cours', $scenario['livraison']->fresh()->statut);
        $this->assertSame('PRETE', $scenario['commande']->fresh()->statutCommande->code);
    }

    public function test_le_flux_complet_restaurant_livreur_pin_cloture_la_commande(): void
    {
        $scenario = $this->creerLivraisonScenario('en_attente', 'EN_ATTENTE');

        $scenario['attribution']->delete();

        foreach (['CONFIRMEE', 'EN_PREPARATION', 'PRETE'] as $statut) {
            $this->actingAs($scenario['restaurantUser'])
                ->from('/restaurant/commandes/'.$scenario['commande']->id)
                ->patch('/restaurant/commandes/'.$scenario['commande']->id.'/statut', [
                    'statut' => $statut,
                ])
                ->assertRedirect('/restaurant/commandes/'.$scenario['commande']->id);
        }

        $commande = $scenario['commande']->fresh();
        $livraison = $scenario['livraison']->fresh();
        $attribution = AttributionLivraison::query()
            ->where('livraison_id', $livraison->id)
            ->where('statut', 'active')
            ->firstOrFail();

        $this->assertSame('PRETE', $commande->statutCommande->code);
        $this->assertSame('attribuee', $livraison->statut);
        $this->assertSame($scenario['livreur']->id, $attribution->livreur_id);
        $this->assertNotNull($commande->pin_livraison_hash);
        $this->assertNotNull($commande->pin_livraison_chiffre);

        $pin = Crypt::decryptString($commande->pin_livraison_chiffre);

        $this->actingAs($scenario['livreur'])
            ->from('/livreur/tableau-de-bord')
            ->patch('/livreur/livraisons/'.$attribution->id.'/prise-en-charge')
            ->assertRedirect('/livreur/tableau-de-bord');

        $this->assertSame('EN_LIVRAISON', $commande->fresh()->statutCommande->code);
        $this->assertSame('en_cours', $livraison->fresh()->statut);

        $this->actingAs($scenario['livreur'])
            ->from('/livreur/tableau-de-bord')
            ->post('/livreur/livraisons/'.$attribution->id.'/valider-pin', [
                'pin' => $pin,
            ])
            ->assertRedirect('/livreur/tableau-de-bord')
            ->assertSessionHas('success', 'Livraison validée et commande clôturée.');

        $commandeFinale = $commande->fresh();

        $this->assertSame('LIVREE', $commandeFinale->statutCommande->code);
        $this->assertSame('livree', $livraison->fresh()->statut);
        $this->assertSame('terminee', $attribution->fresh()->statut);
        $this->assertNotNull($commandeFinale->pin_valide_at);
        $this->assertDatabaseHas('historique_commandes', [
            'commande_id' => $commandeFinale->id,
            'statut_id' => DB::table('statuts_commandes')->where('code', 'LIVREE')->value('id'),
            'user_id' => $scenario['livreur']->id,
            'commentaire' => 'Livraison validée par PIN.',
        ]);
    }
}

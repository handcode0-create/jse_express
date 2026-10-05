<?php

namespace Tests\Feature;

use App\Models\Categorie;
use App\Models\Commande;
use App\Models\Notification;
use App\Models\Produit;
use App\Models\Restaurant;
use App\Models\StatutCommande;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class RestaurantEspaceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        foreach ([
            ['EN_ATTENTE', 'Reçue', 1],
            ['CONFIRMEE', 'Confirmée', 2],
            ['EN_PREPARATION', 'En préparation', 3],
            ['PRETE', 'Prête / à récupérer', 4],
            ['EN_LIVRAISON', 'En livraison', 5],
            ['LIVREE', 'Livrée', 6],
            ['ANNULEE', 'Annulée', 7],
        ] as [$code, $libelle, $ordre]) {
            StatutCommande::query()->updateOrCreate(['code' => $code], ['libelle' => $libelle, 'ordre' => $ordre]);
        }
    }

    private function commande(Restaurant $restaurant, string $statut): Commande
    {
        return Commande::factory()->create([
            'restaurant_id' => $restaurant->id,
            'zone_id' => $restaurant->zone_id,
            'statut_id' => StatutCommande::query()->where('code', $statut)->value('id'),
        ]);
    }

    private function statut(Commande $commande): string
    {
        return $commande->fresh()->statutCommande->code;
    }

    public function test_le_tableau_de_bord_n_expose_que_les_donnees_du_restaurant_connecte(): void
    {
        $restaurant = Restaurant::factory()->create();
        $autre = Restaurant::factory()->create();
        $propre = $this->commande($restaurant, 'EN_ATTENTE');
        $this->commande($autre, 'EN_ATTENTE');
        $produit = Produit::factory()->create(['restaurant_id' => $restaurant->id]);
        Produit::factory()->create(['restaurant_id' => $autre->id]);

        $this->actingAs($restaurant->user)
            ->get(route('restaurant.tableau-de-bord'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('Restaurant/TableauDeBord')
                ->has('commandes', 1)
                ->where('commandes.0.id', $propre->id)
                ->has('produits', 1)
                ->where('produits.0.id', $produit->id)
                ->where('statistiques.commandes_en_attente', 1));
    }

    public function test_un_client_ne_peut_pas_ouvrir_l_espace_restaurant(): void
    {
        $this->actingAs(User::factory()->client()->create())
            ->get(route('restaurant.tableau-de-bord'))
            ->assertForbidden();
    }

    public function test_les_notifications_masquees_ne_sont_pas_comptees(): void
    {
        $restaurant = Restaurant::factory()->create();
        Notification::factory()->create(['user_id' => $restaurant->user_id, 'masquee_par_destinataire_at' => null]);
        Notification::factory()->create(['user_id' => $restaurant->user_id, 'masquee_par_destinataire_at' => now()]);

        $this->actingAs($restaurant->user)
            ->get(route('restaurant.tableau-de-bord'))
            ->assertInertia(fn (Assert $page) => $page->where('statistiques.notifications', 1));
    }

    public function test_le_restaurant_fait_avancer_la_commande_et_l_historique_est_enregistre(): void
    {
        $restaurant = Restaurant::factory()->create();
        $commande = $this->commande($restaurant, 'EN_ATTENTE');

        $this->actingAs($restaurant->user)
            ->patch(route('restaurant.commandes.statut', $commande), ['statut' => 'CONFIRMEE'])
            ->assertSessionHas('success');

        $this->assertSame('CONFIRMEE', $this->statut($commande));
        $this->assertDatabaseHas('historique_commandes', ['commande_id' => $commande->id, 'user_id' => $restaurant->user_id]);
    }

    public function test_une_transition_interdite_renvoie_une_erreur_de_validation_lisible(): void
    {
        $restaurant = Restaurant::factory()->create();
        $commande = $this->commande($restaurant, 'EN_ATTENTE');

        $this->actingAs($restaurant->user)
            ->patch(route('restaurant.commandes.statut', $commande), ['statut' => 'PRETE'])
            ->assertSessionHasErrors(['statut' => 'Cette commande ne peut pas passer à ce statut.']);

        $this->assertSame('EN_ATTENTE', $this->statut($commande));
    }

    public function test_un_restaurant_ne_peut_pas_modifier_la_commande_d_un_autre_restaurant(): void
    {
        $restaurant = Restaurant::factory()->create();
        $commandeAutre = $this->commande(Restaurant::factory()->create(), 'EN_ATTENTE');

        $this->actingAs($restaurant->user)
            ->patch(route('restaurant.commandes.statut', $commandeAutre), ['statut' => 'CONFIRMEE'])
            ->assertNotFound();

        $this->assertSame('EN_ATTENTE', $this->statut($commandeAutre));
    }

    public function test_le_restaurant_annule_une_commande_en_attente_avec_son_motif(): void
    {
        $restaurant = Restaurant::factory()->create();
        $commande = $this->commande($restaurant, 'EN_ATTENTE');

        $this->actingAs($restaurant->user)
            ->post(route('restaurant.commandes.annuler', $commande), ['motif' => 'Rupture de stock'])
            ->assertSessionHas('success');

        $this->assertSame('ANNULEE', $this->statut($commande));
        $this->assertDatabaseHas('historique_commandes', ['commande_id' => $commande->id, 'commentaire' => 'Rupture de stock']);
    }

    public function test_une_commande_en_preparation_ne_peut_plus_etre_annulee_par_le_restaurant(): void
    {
        $restaurant = Restaurant::factory()->create();
        $commande = $this->commande($restaurant, 'EN_PREPARATION');

        $this->actingAs($restaurant->user)
            ->post(route('restaurant.commandes.annuler', $commande), ['motif' => 'Trop tard'])
            ->assertStatus(422);

        $this->assertSame('EN_PREPARATION', $this->statut($commande));
    }

    public function test_le_restaurant_change_la_disponibilite_de_son_produit_uniquement(): void
    {
        $restaurant = Restaurant::factory()->create();
        $produit = Produit::factory()->create(['restaurant_id' => $restaurant->id, 'disponible' => true]);
        $produitAutre = Produit::factory()->create(['disponible' => true]);

        $this->actingAs($restaurant->user)
            ->patch(route('restaurant.produits.disponibilite', $produit))
            ->assertSessionHas('success', 'Produit marqué comme indisponible.');
        $this->actingAs($restaurant->user)
            ->patch(route('restaurant.produits.disponibilite', $produitAutre))
            ->assertNotFound();

        $this->assertFalse($produit->fresh()->disponible);
        $this->assertTrue($produitAutre->fresh()->disponible);
    }

    public function test_le_restaurant_cree_un_produit_dans_sa_categorie(): void
    {
        $restaurant = Restaurant::factory()->create();
        $categorie = Categorie::factory()->create(['restaurant_id' => $restaurant->id]);

        $this->actingAs($restaurant->user)
            ->post(route('restaurant.produits.creer'), ['nom' => 'Garba', 'prix' => 1000, 'categorie_id' => $categorie->id])
            ->assertSessionHas('success', 'Produit ajouté au menu.');

        $this->assertDatabaseHas('produits', ['restaurant_id' => $restaurant->id, 'nom' => 'Garba', 'disponible' => true]);
    }

    public function test_la_categorie_d_un_autre_restaurant_est_refusee_avec_une_erreur_de_champ(): void
    {
        $restaurant = Restaurant::factory()->create();
        $categorieAutre = Categorie::factory()->create();

        $this->actingAs($restaurant->user)
            ->post(route('restaurant.produits.creer'), ['nom' => 'Garba', 'prix' => 1000, 'categorie_id' => $categorieAutre->id])
            ->assertSessionHasErrors('categorie_id');

        $this->assertDatabaseMissing('produits', ['nom' => 'Garba']);
    }

    public function test_le_restaurant_cree_une_categorie_et_modifie_ses_horaires(): void
    {
        $restaurant = Restaurant::factory()->create(['horaires' => null]);

        $this->actingAs($restaurant->user)
            ->post(route('restaurant.categories.creer'), ['nom' => 'Desserts'])
            ->assertSessionHas('success');
        $this->actingAs($restaurant->user)
            ->patch(route('restaurant.horaires.modifier'), ['horaires' => 'Lun - Dim : 08:00 - 22:00'])
            ->assertSessionHas('success');
        $this->actingAs($restaurant->user)
            ->patch(route('restaurant.horaires.modifier'), ['horaires' => ''])
            ->assertSessionHasErrors('horaires');

        $this->assertDatabaseHas('categories', ['restaurant_id' => $restaurant->id, 'nom' => 'Desserts']);
        $this->assertSame('Lun - Dim : 08:00 - 22:00', $restaurant->fresh()->horaires);
    }

    public function test_le_compte_refuse_un_telephone_ou_un_email_deja_utilise(): void
    {
        $restaurant = Restaurant::factory()->create();
        $autre = User::factory()->client()->create(['telephone' => '2250700000099', 'email' => 'pris@example.com']);

        $this->actingAs($restaurant->user)
            ->patch(route('restaurant.compte.modifier'), [
                'prenom' => 'Koffi',
                'nom' => 'Test',
                'telephone' => $autre->telephone,
                'email' => $autre->email,
            ])
            ->assertSessionHasErrors(['telephone', 'email']);
    }

    public function test_le_compte_accepte_de_conserver_son_propre_telephone(): void
    {
        $restaurant = Restaurant::factory()->create();

        $this->actingAs($restaurant->user)
            ->patch(route('restaurant.compte.modifier'), [
                'prenom' => 'Koffi',
                'nom' => 'Test',
                'telephone' => $restaurant->user->telephone,
                'email' => $restaurant->user->email,
            ])
            ->assertSessionHasNoErrors()
            ->assertSessionHas('success');
    }
}

<?php

namespace Tests\Feature;

use App\Models\AttributionLivraison;
use App\Models\Commande;
use App\Models\Livraison;
use App\Models\Notification;
use App\Models\ProfilLivreur;
use App\Models\StatutCommande;
use App\Models\User;
use App\Models\Zone;
use App\Services\LivraisonService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class LivreurEspaceTest extends TestCase
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

    /**
     * Mission attribuée à un livreur : commande `PRETE` + livraison `attribuee` dans la zone donnée.
     *
     * @return array{livreur: User, profil: ProfilLivreur, commande: Commande, livraison: Livraison, attribution: AttributionLivraison}
     */
    private function mission(?Zone $zoneLivraison = null, ?Zone $zoneLivreur = null, string $statutCommande = 'PRETE', string $statutLivraison = 'attribuee'): array
    {
        $zoneLivraison ??= Zone::factory()->create();
        $profil = ProfilLivreur::factory()->create(['zone_id' => ($zoneLivreur ?? $zoneLivraison)->id]);
        $commande = Commande::factory()->create([
            'zone_id' => $zoneLivraison->id,
            'statut_id' => StatutCommande::query()->where('code', $statutCommande)->value('id'),
        ]);
        $livraison = Livraison::factory()->create([
            'commande_id' => $commande->id,
            'zone_id' => $zoneLivraison->id,
            'statut' => $statutLivraison,
        ]);
        $attribution = AttributionLivraison::factory()->create([
            'livraison_id' => $livraison->id,
            'livreur_id' => $profil->user_id,
            'statut' => 'active',
        ]);

        return ['livreur' => $profil->user, 'profil' => $profil, 'commande' => $commande, 'livraison' => $livraison, 'attribution' => $attribution];
    }

    public function test_le_tableau_de_bord_n_expose_que_les_missions_et_notifications_du_livreur(): void
    {
        $propre = $this->mission();
        $this->mission();
        Notification::factory()->create(['user_id' => $propre['livreur']->id, 'masquee_par_destinataire_at' => null]);
        Notification::factory()->create(['user_id' => $propre['livreur']->id, 'masquee_par_destinataire_at' => now()]);

        $this->actingAs($propre['livreur'])
            ->get(route('livreur.tableau-de-bord'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('Livreur/TableauDeBord')
                ->has('livraisons', 1)
                ->where('livraisons.0.attribution_id', $propre['attribution']->id)
                ->has('notifications', 1)
                ->where('statistiques.missions_actives', 1));
    }

    public function test_un_client_ne_peut_pas_ouvrir_l_espace_livreur(): void
    {
        $this->actingAs(User::factory()->client()->create())
            ->get(route('livreur.tableau-de-bord'))
            ->assertForbidden();
    }

    public function test_le_livreur_prend_en_charge_sa_mission_et_la_commande_passe_en_livraison(): void
    {
        $mission = $this->mission();

        $this->actingAs($mission['livreur'])
            ->patch(route('livreur.livraisons.prise-en-charge', $mission['attribution']->id))
            ->assertSessionHas('success');

        $this->assertSame('en_cours', $mission['livraison']->fresh()->statut);
        $this->assertSame('EN_LIVRAISON', $mission['commande']->fresh()->statutCommande->code);
        $this->assertDatabaseHas('historique_commandes', ['commande_id' => $mission['commande']->id, 'user_id' => $mission['livreur']->id]);
    }

    public function test_la_prise_en_charge_d_une_commande_pas_encore_prete_renvoie_une_erreur_lisible(): void
    {
        $mission = $this->mission(statutCommande: 'EN_PREPARATION');

        $this->actingAs($mission['livreur'])
            ->patch(route('livreur.livraisons.prise-en-charge', $mission['attribution']->id))
            ->assertSessionHasErrors('mission');

        $this->assertSame('attribuee', $mission['livraison']->fresh()->statut);
    }

    public function test_un_livreur_ne_peut_pas_prendre_en_charge_la_mission_d_un_autre(): void
    {
        $mission = $this->mission();
        $autre = ProfilLivreur::factory()->create(['zone_id' => $mission['livraison']->zone_id]);

        $this->actingAs($autre->user)
            ->patch(route('livreur.livraisons.prise-en-charge', $mission['attribution']->id))
            ->assertNotFound();

        $this->assertSame('attribuee', $mission['livraison']->fresh()->statut);
    }

    public function test_un_livreur_d_une_zone_soeur_attribue_automatiquement_peut_prendre_la_mission(): void
    {
        $parent = Zone::factory()->create();
        $zoneA = Zone::factory()->create(['zone_parent_id' => $parent->id]);
        $zoneB = Zone::factory()->create(['zone_parent_id' => $parent->id]);

        $profil = ProfilLivreur::factory()->create(['zone_id' => $zoneB->id]);
        $commande = Commande::factory()->create([
            'zone_id' => $zoneA->id,
            'statut_id' => StatutCommande::query()->where('code', 'PRETE')->value('id'),
        ]);
        $livraison = Livraison::factory()->create(['commande_id' => $commande->id, 'zone_id' => $zoneA->id, 'statut' => 'en_attente']);

        $attribution = app(LivraisonService::class)->attribuerPremierDisponible($livraison);

        $this->assertSame($profil->user_id, $attribution->livreur_id);
        $this->actingAs($profil->user)
            ->patch(route('livreur.livraisons.prise-en-charge', $attribution->id))
            ->assertSessionHas('success');
        $this->assertSame('en_cours', $livraison->fresh()->statut);
    }

    public function test_un_livreur_hors_de_la_zone_et_de_ses_zones_soeurs_est_refuse(): void
    {
        $mission = $this->mission(zoneLivreur: Zone::factory()->create());

        $this->actingAs($mission['livreur'])
            ->patch(route('livreur.livraisons.prise-en-charge', $mission['attribution']->id))
            ->assertForbidden();
    }

    public function test_un_mauvais_pin_renvoie_une_erreur_sur_le_champ_pin_sans_cloturer(): void
    {
        $mission = $this->mission(statutCommande: 'EN_LIVRAISON', statutLivraison: 'en_cours');
        app(LivraisonService::class)->genererPin($mission['commande']);

        $this->actingAs($mission['livreur'])
            ->post(route('livreur.livraisons.valider-pin', $mission['attribution']->id), ['pin' => '000000'])
            ->assertSessionHasErrors(['pin' => 'Le PIN de livraison est incorrect.']);

        $this->assertSame('en_cours', $mission['livraison']->fresh()->statut);
    }

    public function test_un_pin_de_moins_de_six_chiffres_est_refuse(): void
    {
        $mission = $this->mission(statutCommande: 'EN_LIVRAISON', statutLivraison: 'en_cours');

        $this->actingAs($mission['livreur'])
            ->post(route('livreur.livraisons.valider-pin', $mission['attribution']->id), ['pin' => '123'])
            ->assertSessionHasErrors('pin');
    }

    public function test_le_livreur_change_sa_disponibilite(): void
    {
        $profil = ProfilLivreur::factory()->create(['disponibilite' => 'disponible']);

        $this->actingAs($profil->user)
            ->patch(route('livreur.disponibilite'), ['disponibilite' => 'indisponible'])
            ->assertSessionHas('success');
        $this->actingAs($profil->user)
            ->patch(route('livreur.disponibilite'), ['disponibilite' => 'absent'])
            ->assertSessionHasErrors('disponibilite');

        $this->assertSame('indisponible', $profil->fresh()->disponibilite);
    }

    public function test_le_profil_refuse_un_telephone_ou_un_email_deja_utilise(): void
    {
        $profil = ProfilLivreur::factory()->create();
        $autre = User::factory()->client()->create(['telephone' => '2250700000098', 'email' => 'occupe@example.com']);

        $this->actingAs($profil->user)
            ->patch(route('livreur.profil.modifier'), $this->donneesProfil($profil, ['telephone' => $autre->telephone, 'email' => $autre->email]))
            ->assertSessionHasErrors(['telephone', 'email']);
    }

    public function test_le_profil_accepte_de_conserver_son_propre_telephone(): void
    {
        $profil = ProfilLivreur::factory()->create();

        $this->actingAs($profil->user)
            ->patch(route('livreur.profil.modifier'), $this->donneesProfil($profil))
            ->assertSessionHasNoErrors()
            ->assertSessionHas('success', 'Profil mis à jour.');
    }

    public function test_le_livreur_ne_peut_pas_changer_de_zone_pendant_une_mission_active(): void
    {
        $mission = $this->mission();
        $autreZone = Zone::factory()->create();

        $this->actingAs($mission['livreur'])
            ->patch(route('livreur.profil.modifier'), $this->donneesProfil($mission['profil'], ['zone_id' => $autreZone->id]))
            ->assertSessionHasErrors('zone_id');

        $this->assertSame($mission['livraison']->zone_id, $mission['profil']->fresh()->zone_id);
    }

    public function test_le_livreur_change_de_zone_quand_il_n_a_aucune_mission_active(): void
    {
        $profil = ProfilLivreur::factory()->create();
        $autreZone = Zone::factory()->create();

        $this->actingAs($profil->user)
            ->patch(route('livreur.profil.modifier'), $this->donneesProfil($profil, ['zone_id' => $autreZone->id]))
            ->assertSessionHasNoErrors();

        $this->assertSame($autreZone->id, $profil->fresh()->zone_id);
    }

    /**
     * @param  array<string, mixed>  $surcharge
     * @return array<string, mixed>
     */
    private function donneesProfil(ProfilLivreur $profil, array $surcharge = []): array
    {
        return array_merge([
            'nom' => $profil->user->nom,
            'prenom' => $profil->user->prenom,
            'telephone' => $profil->user->telephone,
            'email' => $profil->user->email,
            'telephone_secondaire' => null,
            'zone_id' => $profil->zone_id,
        ], $surcharge);
    }
}

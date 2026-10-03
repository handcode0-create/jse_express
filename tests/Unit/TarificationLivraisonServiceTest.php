<?php

namespace Tests\Unit;

use App\Models\TarifLivraison;
use App\Services\TarificationLivraisonService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Tests\TestCase;

class TarificationLivraisonServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_exactly_two_km_uses_next_range(): void
    {
        TarifLivraison::insert([
            ['distance_min_km'=>0,'distance_max_km'=>2,'frais'=>500,'statut'=>'actif'],
            ['distance_min_km'=>2,'distance_max_km'=>4,'frais'=>800,'statut'=>'actif'],
        ]);

        $this->assertSame(800.0, app(TarificationLivraisonService::class)->fraisPourDistance(2.00));
    }

    public function test_overlap_is_detected(): void
    {
        TarifLivraison::create(['distance_min_km'=>0,'distance_max_km'=>2,'frais'=>500,'statut'=>'actif']);
        $this->assertTrue(app(TarificationLivraisonService::class)->tranchesChevauchent(1.5, 3));
    }

    public function test_distance_beyond_last_range_is_rejected(): void
    {
        TarifLivraison::create(['distance_min_km'=>0,'distance_max_km'=>6,'frais'=>1000,'statut'=>'actif']);
        $this->expectException(HttpException::class);
        $this->expectExceptionCode(422);
        app(TarificationLivraisonService::class)->fraisPourDistance(6.00);
    }
    public function test_village_range_covers_7_5_and_29_99_km_but_not_30(): void
    {
        TarifLivraison::query()->delete();
        TarifLivraison::insert([
            ['distance_min_km'=>0,'distance_max_km'=>2,'frais'=>500,'statut'=>'actif'],
            ['distance_min_km'=>2,'distance_max_km'=>4,'frais'=>800,'statut'=>'actif'],
            ['distance_min_km'=>4,'distance_max_km'=>6,'frais'=>1000,'statut'=>'actif'],
            ['distance_min_km'=>6,'distance_max_km'=>30,'frais'=>2000,'statut'=>'actif'],
        ]);

        $service = app(TarificationLivraisonService::class);

        $this->assertSame(2000.0, $service->fraisPourDistance(7.5));
        $this->assertSame(2000.0, $service->fraisPourDistance(29.99));

        $this->expectException(HttpException::class);
        $this->expectExceptionCode(422);
        $service->fraisPourDistance(30.0);
    }

}

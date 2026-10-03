<?php

namespace Tests\Unit;

use App\Services\DistanceService;
use Tests\TestCase;

class DistanceServiceTest extends TestCase
{
    public function test_haversine_known_pair_is_within_tolerance(): void
    {
        $distance = app(DistanceService::class)->calculer(5.3364, -4.0267, 5.3599, -4.0083);
        $this->assertEqualsWithDelta(3.25, $distance, 0.05);
    }
}

<?php

namespace Tests\Feature;

use Tests\TestCase;

class SecurityHeadersTest extends TestCase
{
    public function test_les_reponses_web_exposent_les_headers_de_securite(): void
    {
        $response = $this->get('/authentification');

        $response->assertOk()
            ->assertHeader('X-Content-Type-Options', 'nosniff')
            ->assertHeader('X-Frame-Options', 'DENY')
            ->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
            ->assertHeader('Cross-Origin-Opener-Policy', 'same-origin')
            ->assertHeader('Cross-Origin-Resource-Policy', 'same-origin')
            ->assertHeader('X-DNS-Prefetch-Control', 'off')
            ->assertHeader('X-Permitted-Cross-Domain-Policies', 'none')
            ->assertHeader('X-Download-Options', 'noopen');

        $permissionsPolicy = $response->headers->get('Permissions-Policy');
        $contentSecurityPolicy = $response->headers->get('Content-Security-Policy');

        $this->assertNotEmpty($permissionsPolicy);
        $this->assertStringContainsString('geolocation=()', $permissionsPolicy);
        $this->assertStringContainsString('camera=()', $permissionsPolicy);
        $this->assertStringContainsString('microphone=()', $permissionsPolicy);

        $this->assertNotEmpty($contentSecurityPolicy);
        $this->assertStringContainsString("default-src 'self'", $contentSecurityPolicy);
        $this->assertStringContainsString("object-src 'none'", $contentSecurityPolicy);
        $this->assertStringContainsString("frame-ancestors 'none'", $contentSecurityPolicy);
        $this->assertStringContainsString("https://www.google.com/recaptcha/", $contentSecurityPolicy);
    }

    public function test_hsts_est_active_sur_une_requete_https(): void
    {
        $response = $this->withServerVariables([
            'HTTPS' => 'on',
        ])->get('/authentification');

        $response->assertOk()
            ->assertHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

        $this->assertStringContainsString(
            'upgrade-insecure-requests',
            $response->headers->get('Content-Security-Policy')
        );
    }
}

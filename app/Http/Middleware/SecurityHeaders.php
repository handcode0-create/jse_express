<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set(
            'Permissions-Policy',
            'accelerometer=(), ambient-light-sensor=(), autoplay=(), camera=(), '
            .'display-capture=(), document-domain=(), encrypted-media=(), '
            .'fullscreen=(), geolocation=(), gyroscope=(), magnetometer=(), '
            .'microphone=(), midi=(), payment=(), picture-in-picture=(), '
            .'publickey-credentials-get=(), usb=(), xr-spatial-tracking=()'
        );
        $response->headers->set('Cross-Origin-Opener-Policy', 'same-origin');
        $response->headers->set('Cross-Origin-Resource-Policy', 'same-origin');
        $response->headers->set('X-DNS-Prefetch-Control', 'off');
        $response->headers->set('X-Permitted-Cross-Domain-Policies', 'none');
        $response->headers->set('X-Download-Options', 'noopen');

        // Keep local HTTP development working while enforcing HSTS over HTTPS.
        if ($request->isSecure()) {
            $response->headers->set(
                'Strict-Transport-Security',
                'max-age=31536000; includeSubDomains'
            );
        }

        $csp = implode('; ', [
            "default-src 'self'",
            "base-uri 'self'",
            "object-src 'none'",
            "frame-ancestors 'none'",
            "form-action 'self'",
            "script-src 'self' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: blob: https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/",
            "font-src 'self' data:",
            "connect-src 'self'",
            "frame-src 'self' https://www.google.com/recaptcha/ https://recaptcha.google.com/recaptcha/",
            "manifest-src 'self'",
            "worker-src 'self' blob:",
            "media-src 'self'",
        ]);

        if ($request->isSecure()) {
            $csp .= "; upgrade-insecure-requests";
        }

        $response->headers->set('Content-Security-Policy', $csp);

        return $response;
    }
}

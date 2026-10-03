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
            .'fullscreen=(), geolocation=(self), gyroscope=(), magnetometer=(), '
            .'microphone=(), midi=(), payment=(), picture-in-picture=(), '
            .'publickey-credentials-get=(), usb=(), xr-spatial-tracking=()'
        );
        $response->headers->set('Cross-Origin-Opener-Policy', 'same-origin');
        $response->headers->set('Cross-Origin-Resource-Policy', 'same-origin');
        $response->headers->set('X-DNS-Prefetch-Control', 'off');
        $response->headers->set('X-Permitted-Cross-Domain-Policies', 'none');
        $response->headers->set('X-Download-Options', 'noopen');

        // Remove framework/runtime fingerprinting when those headers are present.
        $response->headers->remove('Server');
        $response->headers->remove('X-Powered-By');

        // Keep local HTTP development working while enforcing HSTS over HTTPS.
        if ($request->isSecure()) {
            $response->headers->set(
                'Strict-Transport-Security',
                'max-age=31536000; includeSubDomains'
            );
        }

        $scriptSources = [
            "'self'",
            'https://www.google.com/recaptcha/',
            'https://www.gstatic.com/recaptcha/',
        ];
        $styleSources = [
            "'self'",
            "'unsafe-inline'",
            'https://fonts.googleapis.com',
            'https://db.onlinewebfonts.com',
        ];
        $connectSources = ["'self'"];

        // Vite HMR is only exposed during local development.
        if (app()->environment('local')) {
            $scriptSources[] = 'http://localhost:5173';
            $scriptSources[] = 'http://127.0.0.1:5173';
            $scriptSources[] = 'http://[::1]:5173';
            $scriptSources[] = "'unsafe-inline'";
            $scriptSources[] = "'unsafe-eval'";
            $styleSources[] = 'http://localhost:5173';
            $styleSources[] = 'http://127.0.0.1:5173';
            $styleSources[] = 'http://[::1]:5173';
            $connectSources[] = 'ws://localhost:5173';
            $connectSources[] = 'ws://127.0.0.1:5173';
            $connectSources[] = 'ws://[::1]:5173';
            $connectSources[] = 'http://localhost:5173';
            $connectSources[] = 'http://127.0.0.1:5173';
            $connectSources[] = 'http://[::1]:5173';
        }

        $csp = implode('; ', [
            "default-src 'self'",
            "base-uri 'self'",
            "object-src 'none'",
            "frame-ancestors 'none'",
            "form-action 'self'",
            'script-src '.implode(' ', $scriptSources),
            'style-src '.implode(' ', $styleSources),
            "img-src 'self' data: blob: https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/",
            "font-src 'self' data: https://fonts.gstatic.com https://db.onlinewebfonts.com",
            'connect-src '.implode(' ', $connectSources),
            "frame-src 'self' https://www.google.com/recaptcha/ https://recaptcha.google.com/recaptcha/",
            "manifest-src 'self'",
            "worker-src 'self' blob:",
            "media-src 'self'",
        ]);

        if ($request->isSecure() && app()->environment('production')) {
            $csp .= "; upgrade-insecure-requests";
        }

        $response->headers->set('Content-Security-Policy', $csp);

        return $response;
    }
}

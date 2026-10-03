<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\JsonResponse;

class NotificationController extends Controller
{
    public function supprimer(Notification $notification): JsonResponse
    {
        $this->authorize('supprimer', $notification);

        if (! $notification->masquee_par_destinataire_at) {
            $notification->update([
                'masquee_par_destinataire_at' => now(),
            ]);
        }

        return response()->json([
            'succes' => true,
            'donnees' => [
                'id' => $notification->id,
                'masquee_par_destinataire_at' => $notification->masquee_par_destinataire_at?->toIso8601String(),
            ],
            'message' => 'Notification masquée de votre compte.',
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function destroy(Request $request, Notification $notification): JsonResponse
    {
        $this->authorize('delete', $notification);

        if (! $notification->hidden_by_recipient_at) {
            $notification->update([
                'hidden_by_recipient_at' => now(),
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $notification->id,
                'hidden_by_recipient_at' => $notification->hidden_by_recipient_at?->toIso8601String(),
            ],
            'message' => 'Notification supprimée de votre compte.',
        ]);
    }
}

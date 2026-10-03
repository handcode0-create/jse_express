<?php

namespace App\Policies;

use App\Models\Notification;
use App\Models\User;

class NotificationPolicy
{
    public function supprimer(User $user, Notification $notification): bool
    {
        return (int) $notification->user_id === (int) $user->id;
    }
}

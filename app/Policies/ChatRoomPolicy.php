<?php

namespace App\Policies;

use App\Models\ChatRoom;
use App\Models\User;

class ChatRoomPolicy
{
    public function view(User $user, ChatRoom $chat): bool
    {
        return $chat->participants()->where('user_id', $user->id)->exists();
    }

    public function send(User $user, ChatRoom $chat): bool
    {
        return $this->view($user, $chat);
    }
}


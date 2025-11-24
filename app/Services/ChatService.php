<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\ChatMessage;
use App\Models\ChatParticipant;
use App\Models\ChatRoom;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ChatService
{
    public function ensureChatForBooking(Booking $booking): ?ChatRoom
    {
        if (!$booking) {
            return null;
        }

        $booking->loadMissing(['teacher.user', 'student']);

        $student = $booking->student ?? null;
        if (!$student && $booking->student_id) {
            $student = User::find($booking->student_id);
        }
        if (!$student && !empty($booking->student_email)) {
            $student = User::where('email', $booking->student_email)->first();
        }

        $teacher = $booking->teacher;
        $teacherUser = $teacher?->user ?? null;

        if (!$student || !$teacherUser) {
            return null;
        }

        return DB::transaction(function () use ($booking, $student, $teacher, $teacherUser) {
            $chat = ChatRoom::firstOrCreate(
                ['booking_id' => $booking->id],
                [
                    'student_id' => $student->id,
                    'teacher_id' => $teacher->id ?? null,
                    'last_message_at' => now(),
                ]
            );

            $this->syncParticipant($chat, $student, 'student');
            $this->syncParticipant($chat, $teacherUser, 'teacher');

            if (!$chat->messages()->exists()) {
                $this->addSystemMessage($chat, 'تم إنشاء هذه المحادثة بعد تأكيد الدفع بنجاح. يمكنك البدء بالتواصل الآن.');
            }

            return $chat;
        });
    }

    public function addMessage(ChatRoom $chat, User $sender, string $message, bool $isSystem = false): ChatMessage
    {
        $chatMessage = $chat->messages()->create([
            'user_id' => $isSystem ? null : $sender->id,
            'message' => $message,
            'is_system' => $isSystem,
        ]);

        $chat->update(['last_message_at' => now()]);

        ChatParticipant::where('chat_room_id', $chat->id)
            ->where('user_id', $sender->id)
            ->update(['last_read_at' => now()]);

        return $chatMessage;
    }

    public function markAsRead(ChatRoom $chat, User $user): void
    {
        ChatParticipant::where('chat_room_id', $chat->id)
            ->where('user_id', $user->id)
            ->update(['last_read_at' => now()]);
    }

    protected function syncParticipant(ChatRoom $chat, User $user, ?string $role = null): void
    {
        ChatParticipant::updateOrCreate(
            [
                'chat_room_id' => $chat->id,
                'user_id' => $user->id,
            ],
            [
                'role' => $role,
                'last_read_at' => now(),
            ]
        );
    }

    protected function addSystemMessage(ChatRoom $chat, string $message): ChatMessage
    {
        return $chat->messages()->create([
            'message' => $message,
            'is_system' => true,
        ]);
    }
}


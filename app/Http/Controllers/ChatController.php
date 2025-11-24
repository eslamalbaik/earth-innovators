<?php

namespace App\Http\Controllers;

use App\Models\ChatRoom;
use App\Services\ChatService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class ChatController extends Controller
{
    public function __construct(
        private ChatService $chatService
    ) {}

    public function index(Request $request)
    {
        $user = Auth::user();
        $chats = $this->getUserChats($user->id);

        if ($chats->isEmpty()) {
            return Inertia::render('Chats/Show', [
                'chats' => [],
                'activeChat' => null,
                'filters' => [],
            ]);
        }

        $firstChatId = $chats->first()['id'];
        return redirect()->route('chats.show', $firstChatId);
    }

    public function show(Request $request, ChatRoom $chat)
    {
        Gate::authorize('view', $chat);

        $user = Auth::user();
        $this->chatService->markAsRead($chat, $user);

        $chats = $this->getUserChats($user->id);
        $activeChat = $this->transformChatRoom($chat, $user->id, true);

        return Inertia::render('Chats/Show', [
            'chats' => $chats,
            'activeChat' => $activeChat,
            'filters' => [],
        ]);
    }

    public function storeMessage(Request $request, ChatRoom $chat)
    {
        Gate::authorize('send', $chat);

        $request->validate([
            'message' => 'required|string|max:2000',
        ]);

        $this->chatService->addMessage($chat, Auth::user(), $request->message);

        return redirect()->route('chats.show', $chat->id);
    }

    protected function getUserChats(int $userId)
    {
        return ChatRoom::with([
            'booking',
            'teacher.user',
            'student',
            'messages' => function ($query) {
                $query->latest()->limit(1)->with('user');
            },
            'participants.user',
        ])
            ->whereHas('participants', function ($query) use ($userId) {
                $query->where('user_id', $userId);
            })
            ->orderByDesc('last_message_at')
            ->get()
            ->map(fn ($chat) => $this->transformChatRoom($chat, $userId));
    }

    protected function transformChatRoom(ChatRoom $chat, int $userId, bool $includeMessages = false): array
    {
        $chat->loadMissing(['teacher.user', 'student', 'booking', 'participants.user']);

        $otherParticipant = $chat->participants
            ->firstWhere('user_id', '!=', $userId)?->user;

        $messagesRelation = $chat->relationLoaded('messages') ? $chat->messages : null;
        $lastMessageModel = $messagesRelation && $messagesRelation->isNotEmpty()
            ? $messagesRelation->first()
            : $chat->messages()->latest()->with('user')->first();

        $participant = $chat->participants->firstWhere('user_id', $userId);
        $unreadQuery = $chat->messages()->where('user_id', '!=', $userId);
        if ($participant && $participant->last_read_at) {
            $unreadQuery->where('created_at', '>', $participant->last_read_at);
        }
        $unreadCount = $unreadQuery->count();

        $messages = [];
        if ($includeMessages) {
            $messages = $chat->messages()
                ->with('user')
                ->orderBy('created_at')
                ->get()
                ->map(function ($message) use ($userId) {
                    return [
                        'id' => $message->id,
                        'message' => $message->message,
                        'is_system' => $message->is_system,
                        'created_at' => $message->created_at?->toIso8601String(),
                        'created_at_human' => $message->created_at?->translatedFormat('Y-m-d H:i'),
                        'is_mine' => $message->user_id === $userId,
                        'user' => $message->user ? [
                            'id' => $message->user->id,
                            'name' => $message->user->name,
                            'role' => $message->user->role,
                            'image' => $message->user->image,
                            'teacher_image' => $message->user->teacher?->image,
                        ] : null,
                    ];
                });
        }

        return [
            'id' => $chat->id,
            'booking' => $chat->booking ? [
                'id' => $chat->booking->id,
                'date' => $chat->booking->date?->toDateString(),
                'start_time' => $chat->booking->start_time,
                'end_time' => $chat->booking->end_time,
                'subject' => $chat->booking->subject,
                'status' => $chat->booking->status,
            ] : null,
            'other_participant' => $otherParticipant ? [
                'id' => $otherParticipant->id,
                'name' => $otherParticipant->name,
                'role' => $otherParticipant->role,
                'image' => $otherParticipant->image,
                'teacher_image' => $otherParticipant->teacher?->image,
            ] : null,
            'last_message' => $lastMessageModel ? [
                'message' => $lastMessageModel->message,
                'is_system' => $lastMessageModel->is_system,
                'created_at' => $lastMessageModel->created_at?->toIso8601String(),
                'created_at_human' => $lastMessageModel->created_at?->diffForHumans(),
            ] : null,
            'unread_count' => $unreadCount,
            'last_message_at' => $chat->last_message_at?->toIso8601String(),
            'messages' => $messages,
        ];
    }
}


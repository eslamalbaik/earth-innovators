import { useEffect, useMemo, useRef } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { getColorFromName, getInitials, getUserImageUrl } from '@/utils/imageUtils';
import { FaComments, FaPaperPlane } from 'react-icons/fa';

export default function ChatShow({ chats = [], activeChat = null }) {
    const { auth } = usePage().props;
    const chatContainerRef = useRef(null);
    const form = useForm({
        message: '',
    });

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [activeChat?.messages]);

    const canSendMessage = useMemo(() => !!activeChat, [activeChat]);

    const submitMessage = (e) => {
        e.preventDefault();
        if (!form.data.message.trim() || !activeChat) {
            return;
        }

        form.post(route('chats.messages.store', activeChat.id), {
            preserveScroll: true,
            onSuccess: () => form.reset('message'),
            onError: () => { },
        });
    };

    const getParticipantAvatar = (participant) => {
        if (!participant) return null;
        const pseudoTeacher =
            participant.role === 'teacher' && participant.teacher_image
                ? { image: participant.teacher_image }
                : null;
        const pseudoUser = {
            role: participant.role,
            image: participant.image,
            teacher: pseudoTeacher,
        };
        return getUserImageUrl(pseudoUser, pseudoTeacher);
    };

    return (
        <DashboardLayout header="المحادثات">
            <Head title="المحادثات" />

            <div className="px-6 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <FaComments className="text-yellow-500" />
                                محادثاتي
                            </h2>
                            <span className="text-sm text-gray-500">{chats.length} محادثة</span>
                        </div>

                        <div className="max-h-[28rem] overflow-y-auto">
                            {chats.length === 0 ? (
                                <div className="p-6 text-center text-gray-500">
                                    لا توجد محادثات بعد. سيتم إنشاء محادثة تلقائياً عند إكمال أي حجز مدفوع.
                                </div>
                            ) : (
                                chats.map((chat) => {
                                    const isActive = activeChat && activeChat.id === chat.id;
                                    const avatar = getParticipantAvatar(chat.other_participant);
                                    const name = chat.other_participant?.name || 'مستخدم';
                                    return (
                                        <Link
                                            key={chat.id}
                                            href={route('chats.show', chat.id)}
                                            className={`flex items-start gap-4 px-5 py-4 transition ${isActive ? 'bg-yellow-50 border-e-4 border-yellow-400' : 'hover:bg-gray-50'
                                                }`}
                                        >
                                            {avatar ? (
                                                <img
                                                    src={avatar}
                                                    alt={name}
                                                    className="w-12 h-12 rounded-full object-cover border-2 border-yellow-400"
                                                />
                                            ) : (
                                                <div
                                                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                                                    style={{
                                                        background: `linear-gradient(135deg, ${getColorFromName(name)})`,
                                                    }}
                                                >
                                                    {getInitials(name)}
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <h3 className="text-sm font-semibold text-gray-900">{name}</h3>
                                                    {chat.last_message_at && (
                                                        <span className="text-xs text-gray-400">
                                                            {new Date(chat.last_message_at).toLocaleTimeString('en-US', {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                                                    {chat.last_message?.message || 'ابدأ المحادثة الآن'}
                                                </p>
                                                {chat.unread_count > 0 && (
                                                    <span className="inline-flex mt-2 items-center justify-center text-xs font-semibold text-white bg-yellow-500 rounded-full h-5 px-2">
                                                        {chat.unread_count}
                                                    </span>
                                                )}
                                            </div>
                                        </Link>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
                        {!activeChat ? (
                            <div className="flex-1 flex flex-col justify-center items-center text-center p-10 text-gray-500">
                                <FaComments className="text-4xl text-yellow-400 mb-4" />
                                <p className="text-lg font-semibold">لا توجد محادثة محددة</p>
                                <p className="text-sm mt-2 text-gray-500">
                                    اختر أحد الحجوزات المدفوعة من القائمة على اليمين لبدء التواصل مع الطرف الآخر.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="px-6 py-4 border-b border-gray-100 flex flex-col gap-1">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {activeChat.other_participant?.name || 'مستخدم'}
                                    </h3>
                                    {activeChat.booking && (
                                        <div className="text-xs text-gray-500 flex flex-wrap items-center gap-2">
                                            <span>الحجز #{activeChat.booking.id}</span>
                                            {activeChat.booking.subject && <span>• {activeChat.booking.subject}</span>}
                                            {activeChat.booking.date && (
                                                <span>
                                                    • {new Date(activeChat.booking.date).toLocaleDateString('en-US')}
                                                </span>
                                            )}
                                            {activeChat.booking.start_time && (
                                                <span>
                                                    • {activeChat.booking.start_time} - {activeChat.booking.end_time}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div
                                    ref={chatContainerRef}
                                    className="flex-1 overflow-y-auto px-6 py-5 space-y-4 bg-gray-50"
                                >
                                    {activeChat.messages?.length === 0 ? (
                                        <div className="text-center text-gray-500 mt-10">
                                            ابدأ المحادثة بالتواصل مع الطرف الآخر حول تفاصيل الحجز.
                                        </div>
                                    ) : (
                                        activeChat.messages.map((message) => {
                                            const isMine = message.is_mine;
                                            const isSystem = message.is_system;
                                            const messageUser = message.user;
                                            const messageName = messageUser?.name || 'نظام';
                                            const messageTeacher =
                                                messageUser?.teacher_image
                                                    ? { image: messageUser.teacher_image }
                                                    : null;
                                            const avatar = messageUser
                                                ? getUserImageUrl(
                                                    {
                                                        role: messageUser.role,
                                                        image: messageUser.image,
                                                        teacher: messageTeacher,
                                                    },
                                                    messageTeacher
                                                )
                                                : null;

                                            return (
                                                <div
                                                    key={message.id}
                                                    className={`flex ${isMine ? 'justify-start lg:justify-end' : 'justify-start'}`}
                                                >
                                                    <div
                                                        className={`max-w-[85%] md:max-w-[70%] px-4 py-3 rounded-2xl shadow-sm ${isSystem
                                                                ? 'bg-white border border-dashed border-yellow-400 text-gray-700 text-center mx-auto'
                                                                : isMine
                                                                    ? 'bg-yellow-500 text-white rounded-br-sm'
                                                                    : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'
                                                            }`}
                                                    >
                                                        {!isSystem && (
                                                            <div className="flex items-center gap-2 mb-1 text-xs opacity-80">
                                                                {messageUser ? (
                                                                    <div className="flex items-center gap-2">
                                                                        {avatar ? (
                                                                            <img
                                                                                src={avatar}
                                                                                alt={messageName}
                                                                                className="w-6 h-6 rounded-full object-cover border border-white/40"
                                                                            />
                                                                        ) : (
                                                                            <div
                                                                                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                                                                                style={{
                                                                                    background: `linear-gradient(135deg, ${getColorFromName(messageName)})`,
                                                                                }}
                                                                            >
                                                                                {getInitials(messageName)}
                                                                            </div>
                                                                        )}
                                                                        <span>{messageName}</span>
                                                                    </div>
                                                                ) : (
                                                                    <span>النظام</span>
                                                                )}
                                                                <span>•</span>
                                                                <span>{message.created_at_human}</span>
                                                            </div>
                                                        )}
                                                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                                            {message.message}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                {canSendMessage && (
                                    <form onSubmit={submitMessage} className="border-t border-gray-100 px-6 py-4 bg-white">
                                        <div className="flex items-end gap-3">
                                            <textarea
                                                value={form.data.message}
                                                onChange={(e) => form.setData('message', e.target.value)}
                                                placeholder="اكتب رسالتك هنا..."
                                                className="flex-1 min-h-[60px] max-h-40 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-y"
                                                rows={2}
                                            />
                                            <button
                                                type="submit"
                                                disabled={form.processing || !form.data.message.trim()}
                                                className="bg-yellow-500 hover:bg-yellow-600 transition text-white px-5 py-3 rounded-xl flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                            >
                                                <FaPaperPlane />
                                                إرسال
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}


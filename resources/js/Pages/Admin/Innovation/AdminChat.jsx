import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaRobot, FaUser, FaSpinner, FaChartLine, FaLightbulb, FaTrashAlt } from 'react-icons/fa';
import axios from 'axios';

const SUGGESTION_CHIPS = [
    { label: 'ملخص الأداء العام', question: 'أعطني ملخصاً عن أداء الطلاب العام ومتوسط المؤشرات' },
    { label: 'أضعف المؤشرات', question: 'ما هي أضعف المؤشرات على مستوى جميع الطلاب وكيف يمكن تحسينها؟' },
    { label: 'الطلاب المتميزون', question: 'من هم الطلاب الأعلى أداءً وما هي تصنيفاتهم؟' },
    { label: 'طلاب يحتاجون اهتماماً', question: 'من هم الطلاب الذين يحتاجون لاهتمام خاص ولماذا؟' },
    { label: 'توزيع التصنيفات', question: 'كيف يتوزع الطلاب على التصنيفات المختلفة (ماسي، بلاتيني، ذهبي...)؟' },
    { label: 'مقارنة المؤشرات', question: 'قارن بين متوسطات المؤشرات الثمانية وحدد أقوى وأضعف مؤشر' },
];

export default function AdminChat() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async (question = null) => {
        const text = question || input.trim();
        if (!text || loading) return;

        const userMsg = { role: 'user', content: text, timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const response = await axios.post(route('admin.innovation.chat.ask'), { question: text });
            const aiMsg = {
                role: 'assistant',
                content: response.data.answer,
                timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            const errorMsg = {
                role: 'assistant',
                content: 'حدث خطأ أثناء معالجة سؤالك. تأكد من اتصال خدمة الذكاء الاصطناعي وحاول مرة أخرى.',
                isError: true,
                timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
            inputRef.current?.focus();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const clearChat = () => {
        setMessages([]);
    };

    return (
        <DashboardLayout header="الوكيل الذكي">
            <Head title="الوكيل الذكي — مساعد الأدمن" />

            <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto" dir="rtl">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 200px)' }}>
                    {/* Header */}
                    <div className="bg-gradient-to-l from-blue-600 to-indigo-600 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white text-lg">
                                <FaRobot />
                            </div>
                            <div>
                                <h2 className="text-white font-bold text-sm">الوكيل الذكي</h2>
                                <p className="text-white/70 text-[11px]">مساعد الأدمن — يحلل بيانات الطلاب ومؤشرات الابتكار</p>
                            </div>
                        </div>
                        {messages.length > 0 && (
                            <button
                                onClick={clearChat}
                                className="text-white/60 hover:text-white/90 transition p-2 rounded-lg hover:bg-white/10"
                                title="مسح المحادثة"
                            >
                                <FaTrashAlt className="text-sm" />
                            </button>
                        )}
                    </div>

                    {/* Messages area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center py-8">
                                <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-3xl mb-4">
                                    <FaRobot />
                                </div>
                                <h3 className="font-bold text-gray-800 mb-1">مرحباً بك في الوكيل الذكي</h3>
                                <p className="text-xs text-gray-400 max-w-sm mb-6">اسألني أي سؤال عن بيانات الطلاب أو مؤشرات الابتكار أو التصنيفات وسأجيبك فوراً.</p>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-lg">
                                    {SUGGESTION_CHIPS.map((chip, i) => (
                                        <button
                                            key={i}
                                            onClick={() => sendMessage(chip.question)}
                                            className="text-right p-3 rounded-xl bg-white border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition text-xs text-gray-600 hover:text-blue-700 font-medium shadow-sm"
                                        >
                                            <FaLightbulb className="text-amber-400 mb-1.5 text-sm" />
                                            {chip.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            messages.map((msg, i) => (
                                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : msg.isError ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                        {msg.role === 'user' ? <FaUser /> : <FaRobot />}
                                    </div>
                                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tl-sm' : msg.isError ? 'bg-red-50 text-red-700 border border-red-100 rounded-tr-sm' : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-tr-sm'}`}>
                                        <div className="whitespace-pre-wrap">{msg.content}</div>
                                        <p className={`text-[10px] mt-2 ${msg.role === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>{msg.timestamp}</p>
                                    </div>
                                </div>
                            ))
                        )}

                        {loading && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 text-sm">
                                    <FaRobot />
                                </div>
                                <div className="bg-white rounded-2xl rounded-tr-sm px-4 py-3 border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <FaSpinner className="animate-spin text-blue-500" />
                                        <span>جاري التحليل...</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input area */}
                    <div className="p-4 border-t border-gray-100 bg-white">
                        <div className="flex items-center gap-3">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="اكتب سؤالك هنا..."
                                disabled={loading}
                                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition disabled:opacity-50 disabled:bg-gray-50"
                                autoFocus
                            />
                            <button
                                onClick={() => sendMessage()}
                                disabled={!input.trim() || loading}
                                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white p-3 rounded-xl transition shadow-sm"
                            >
                                <FaPaperPlane />
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2 text-center">الوكيل يحلل بيانات حقيقية من قاعدة البيانات. لا يخترع معلومات.</p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

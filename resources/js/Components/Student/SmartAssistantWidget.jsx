import { useEffect, useRef, useState } from 'react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { FaRobot, FaTimes, FaPaperPlane, FaSpinner, FaLightbulb } from 'react-icons/fa';
import { useTranslation, useDir } from '@/i18n';
import AgentAttribution from '@/Components/Innovation/AgentAttribution';

const SUGGESTION_KEYS = ['explainOverall', 'explainInnovation', 'howToImprove', 'motivateMe'];

/**
 * Smart Assistant — persistent floating chat widget for the student portal.
 * Mounted once, globally (see app.jsx), so it is available on every page of
 * a student's account regardless of which layout that page uses.
 */
export default function SmartAssistantWidget() {
    const { props } = usePage();
    const user = props?.auth?.user;
    const { t } = useTranslation();
    const dir = useDir();

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen]);

    if (!user || user.role !== 'student') {
        return null;
    }

    const sendMessage = async (question = null) => {
        const text = (question ?? input).trim();
        if (!text || loading) return;

        setMessages((prev) => [...prev, { role: 'user', content: text }]);
        setInput('');
        setLoading(true);

        try {
            const { data } = await axios.post(route('student.assistant.ask'), { question: text });
            setMessages((prev) => [...prev, { role: 'assistant', content: data.answer }]);
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: t('studentAssistant.error'), isError: true },
            ]);
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

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen((v) => !v)}
                aria-label={t(isOpen ? 'common.close' : 'studentAssistant.openLabel')}
                className="fixed bottom-24 start-4 z-[65] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-2xl transition hover:scale-105 md:bottom-6 md:start-6"
            >
                {isOpen ? <FaTimes className="text-xl" /> : <FaRobot className="text-2xl" />}
            </button>

            {isOpen && (
                <div
                    dir={dir}
                    role="dialog"
                    aria-label={t('studentAssistant.title')}
                    className="fixed inset-x-4 bottom-40 z-[65] flex h-[65vh] max-h-[520px] flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl sm:inset-x-auto sm:start-4 sm:w-96 md:bottom-24 md:start-6"
                >
                    <div className="flex items-center justify-between bg-gradient-to-l from-indigo-600 to-purple-600 p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white">
                                <FaRobot />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white">{t('studentAssistant.title')}</h3>
                                <p className="text-[11px] text-white/70">{t('studentAssistant.subtitle')}</p>
                                <AgentAttribution agentKey="student_success" className="mt-1 !bg-white/15 !border-white/25 !text-white hover:!bg-white/25" />
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="p-1 text-white/70 transition hover:text-white"
                            aria-label={t('common.close')}
                        >
                            <FaTimes />
                        </button>
                    </div>

                    <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50/50 p-3">
                        {messages.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center px-2 text-center">
                                <FaRobot className="mb-3 text-3xl text-indigo-400" />
                                <p className="mb-4 text-xs text-gray-500">{t('studentAssistant.welcome')}</p>
                                <div className="grid w-full grid-cols-1 gap-2">
                                    {SUGGESTION_KEYS.map((key) => (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => sendMessage(t(`studentAssistant.chips.${key}`))}
                                            className="flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-3 py-2 text-start text-xs font-medium text-gray-600 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50/40 hover:text-indigo-700"
                                        >
                                            <FaLightbulb className="shrink-0 text-amber-400" />
                                            {t(`studentAssistant.chips.${key}`)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            messages.map((msg, i) => (
                                <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div
                                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs ${
                                            msg.role === 'user'
                                                ? 'bg-indigo-600 text-white'
                                                : msg.isError
                                                  ? 'bg-red-100 text-red-600'
                                                  : 'bg-indigo-100 text-indigo-600'
                                        }`}
                                    >
                                        <FaRobot />
                                    </div>
                                    <div
                                        className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                                            msg.role === 'user'
                                                ? 'rounded-tl-sm bg-indigo-600 text-white'
                                                : msg.isError
                                                  ? 'rounded-tr-sm border border-red-100 bg-red-50 text-red-700'
                                                  : 'rounded-tr-sm border border-gray-100 bg-white text-gray-800 shadow-sm'
                                        }`}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            ))
                        )}

                        {loading && (
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <FaSpinner className="animate-spin text-indigo-500" />
                                {t('studentAssistant.thinking')}
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="border-t border-gray-100 bg-white p-2">
                        <div className="flex items-center gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={loading}
                                placeholder={t('studentAssistant.placeholder')}
                                className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-xs focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-50"
                            />
                            <button
                                type="button"
                                onClick={() => sendMessage()}
                                disabled={!input.trim() || loading}
                                className="rounded-xl bg-indigo-600 p-2.5 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                                aria-label={t('studentAssistant.send')}
                            >
                                <FaPaperPlane className="text-sm" />
                            </button>
                        </div>
                        <p className="mt-1.5 text-center text-[10px] text-gray-400">{t('studentAssistant.disclaimer')}</p>
                    </div>
                </div>
            )}
        </>
    );
}

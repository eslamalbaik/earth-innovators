import { useForm } from '@inertiajs/react';
import StudentPageShell from '@/Components/Innovation/StudentPageShell';
import { useState, useRef } from 'react';

export default function AchievementCreate({ types }) {
    const fileInputRef = useRef(null);
    const [dragActive, setDragActive] = useState(false);
    const [urlInputs, setUrlInputs] = useState(['']);

    const { data, setData, post, processing, errors, transform } = useForm({
        title: '',
        description: '',
        type: 'project',
        category: '',
        date: new Date().toISOString().split('T')[0],
        external_links: [],
        attachments: [],
        urls: [],
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        transform((formData) => ({
            ...formData,
            urls: urlInputs.filter(u => u.trim()),
        }));

        post(route('innovation.achievements.store'), { forceFormData: true });
    };

    const handleFiles = (files) => {
        setData('attachments', [...data.attachments, ...Array.from(files)]);
    };

    const handleDrag = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(e.type === 'dragenter' || e.type === 'dragover'); };
    const handleDrop = (e) => { e.preventDefault(); setDragActive(false); handleFiles(e.dataTransfer.files); };
    const removeFile = (idx) => setData('attachments', data.attachments.filter((_, i) => i !== idx));

    return (
        <StudentPageShell title="إضافة إنجاز جديد" backHref="/innovation/achievements">
            <div className="max-w-3xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">➕ إضافة إنجاز جديد</h1>
                    <p className="text-gray-500 mt-1">سيتم تحليل إنجازك بالذكاء الاصطناعي تلقائياً</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Type Selection */}
                    <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 shadow-lg">
                        <label className="block text-sm font-bold text-gray-700 mb-3">نوع الإنجاز *</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {Object.entries(types).map(([key, label]) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setData('type', key)}
                                    className={`p-3 rounded-xl text-center transition-all border-2 ${
                                        data.type === key
                                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm'
                                            : 'border-gray-200 hover:border-indigo-300 text-gray-600'
                                    }`}
                                >
                                    <span className="text-2xl block mb-1">
                                        {key === 'project' ? '🏗️' : key === 'research' ? '🔬' : key === 'certificate' ? '📜' :
                                         key === 'skill' ? '🎯' : key === 'award' ? '🏅' : key === 'patent' ? '💡' :
                                         key === 'article' ? '📝' : '📦'}
                                    </span>
                                    <span className="text-xs font-medium">{label}</span>
                                </button>
                            ))}
                        </div>
                        {errors.type && <p className="text-red-500 text-sm mt-2">{errors.type}</p>}
                    </div>

                    {/* Title & Description */}
                    <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 shadow-lg space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">عنوان الإنجاز *</label>
                            <input
                                type="text"
                                value={data.title}
                                onChange={e => setData('title', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                placeholder="مثال: تطبيق للذكاء الاصطناعي في التعليم"
                            />
                            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">الوصف</label>
                            <textarea
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                rows={5}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                placeholder="اكتب وصفاً تفصيلياً للإنجاز..."
                            />
                            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">الفئة</label>
                                <input
                                    type="text"
                                    value={data.category}
                                    onChange={e => setData('category', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 transition-all"
                                    placeholder="مثال: تقنية المعلومات"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">التاريخ</label>
                                <input
                                    type="date"
                                    value={data.date}
                                    onChange={e => setData('date', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* File Upload */}
                    <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 shadow-lg">
                        <label className="block text-sm font-bold text-gray-700 mb-3">📎 الملفات الداعمة</label>

                        <div
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                                dragActive
                                    ? 'border-indigo-500 bg-indigo-50'
                                    : 'border-gray-300 hover:border-indigo-400'
                            }`}
                        >
                            <span className="text-4xl block mb-3">📁</span>
                            <p className="text-gray-600 font-medium">اسحب الملفات هنا أو اضغط للرفع</p>
                            <p className="text-sm text-gray-400 mt-1">PDF, Images, DOCX, Videos (حتى 20MB)</p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                onChange={(e) => handleFiles(e.target.files)}
                                className="hidden"
                                accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.mp4,.avi,.mov"
                            />
                        </div>

                        {data.attachments.length > 0 && (
                            <div className="mt-4 space-y-2">
                                {data.attachments.map((file, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-xl">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">
                                                {file.type?.includes('pdf') ? '📄' :
                                                 file.type?.includes('image') ? '🖼️' :
                                                 file.type?.includes('video') ? '🎬' : '📁'}
                                            </span>
                                            <span className="text-sm text-gray-700">{file.name}</span>
                                            <span className="text-xs text-gray-400">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
                                        </div>
                                        <button type="button" onClick={() => removeFile(idx)} className="text-red-400 hover:text-red-600">✕</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* URL Links */}
                    <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 shadow-lg">
                        <label className="block text-sm font-bold text-gray-700 mb-3">🔗 روابط خارجية</label>
                        {urlInputs.map((url, idx) => (
                            <div key={idx} className="flex gap-2 mb-2">
                                <input
                                    type="url"
                                    value={url}
                                    onChange={e => {
                                        const newUrls = [...urlInputs];
                                        newUrls[idx] = e.target.value;
                                        setUrlInputs(newUrls);
                                    }}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 transition-all"
                                    placeholder="https://example.com"
                                    dir="ltr"
                                />
                                {urlInputs.length > 1 && (
                                    <button type="button" onClick={() => setUrlInputs(urlInputs.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600 px-2">✕</button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => setUrlInputs([...urlInputs, ''])}
                            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium mt-1"
                        >
                            + إضافة رابط آخر
                        </button>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                    >
                        {processing ? '⏳ جاري الحفظ...' : '🚀 حفظ وتحليل بالذكاء الاصطناعي'}
                    </button>
                </form>
            </div>
        </StudentPageShell>
    );
}

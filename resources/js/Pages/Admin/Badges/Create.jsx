import DashboardLayout from '@/Layouts/DashboardLayout';
import { useTranslation } from '@/i18n';
import { Head, Link, useForm } from '@inertiajs/react';
import { FaArrowRight, FaSave, FaTimes, FaUpload, FaRobot, FaSpinner } from 'react-icons/fa';
import { useState } from 'react';

const badgeTypeOptions = [
    { value: 'rank_first', key: 'rankFirst' },
    { value: 'rank_second', key: 'rankSecond' },
    { value: 'rank_third', key: 'rankThird' },
    { value: 'excellent_innovator', key: 'excellentInnovator' },
    { value: 'active_participant', key: 'activeParticipant' },
    { value: 'custom', key: 'custom' },
];

export default function AdminBadgesCreate() {
    const { t } = useTranslation();
    const [imagePreview, setImagePreview] = useState(null);
    const [aiIdea, setAiIdea] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        name_ar: '',
        description_ar: '',
        icon: '',
        image: null,
        type: '',
        points_required: 0,
        is_active: true,
    });

    const handleAIGenerate = async () => {
        if (!aiIdea) {
            alert('يرجى إدخال فكرة الشارة أولاً.');
            return;
        }

        setIsGenerating(true);
        try {
            const axios = (await import('axios')).default;
            const response = await axios.post(route('admin.badges.generate'), { idea: aiIdea });
            const result = response.data;

            setData((prev) => ({
                ...prev,
                name: result.name || prev.name,
                name_ar: result.name_ar || prev.name_ar,
                description_ar: result.description_ar || prev.description_ar,
                icon: result.icon || prev.icon,
                type: result.type || prev.type,
                points_required: result.points_required ?? prev.points_required,
            }));

            if (result.image_url) {
                try {
                    const imgRes = await fetch(result.image_url);
                    const blob = await imgRes.blob();
                    const file = new File([blob], 'ai_generated_badge.jpg', { type: blob.type });
                    setData('image', file);
                    const reader = new FileReader();
                    reader.onloadend = () => setImagePreview(reader.result);
                    reader.readAsDataURL(file);
                } catch (imgError) {
                    console.error('Error fetching AI image', imgError);
                }
            }

            if (result.incomplete_fields && result.incomplete_fields.length > 0) {
                alert('تم توليد الشارة. يرجى مراجعة الحقول التالية وإكمالها: ' + result.incomplete_fields.join('، '));
            }
        } catch (error) {
            alert(error.response?.data?.error || 'حدث خطأ أثناء توليد تفاصيل الشارة');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('image', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.badges.store'), {
            forceFormData: true,
        });
    };

    const pageTitle = t('adminBadgesPage.createPageTitle', {
        appName: t('common.appName'),
    });

    return (
        <DashboardLayout header={t('adminBadgesPage.createTitle')}>
            <Head title={pageTitle} />

            <div className="mb-6">
                <Link
                    href={route('admin.badges.index')}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                >
                    <FaArrowRight className="transform rotate-180" />
                    {t('adminBadgesPage.backToList')}
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {t('adminBadgesPage.form.information')}
                </h2>

                <form onSubmit={submit} className="space-y-6" encType="multipart/form-data">
                    {/* مساعد الذكاء الاصطناعي */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100 flex flex-col md:flex-row md:items-center gap-4 justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <FaRobot className="text-blue-600 text-xl" />
                                <h3 className="font-bold text-blue-800 text-base">مساعد الذكاء الاصطناعي للشارات</h3>
                            </div>
                            <p className="text-sm text-blue-600">
                                اكتب فكرة مبسطة وسيقوم المساعد بتوليد اسم الشارة، الوصف، الرمز التعبيري، النوع، عدد النقاط المقترح، وصورة مناسبة.
                            </p>
                        </div>
                        <div className="flex-1 flex gap-2 w-full md:w-auto">
                            <input
                                type="text"
                                value={aiIdea}
                                onChange={(e) => setAiIdea(e.target.value)}
                                placeholder="مثال: شارة لأكثر طالب مشارك في التحديات..."
                                className="flex-1 text-sm rounded-lg border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                            />
                            <button
                                type="button"
                                onClick={handleAIGenerate}
                                disabled={isGenerating || !aiIdea}
                                className="bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition flex justify-center items-center gap-2 whitespace-nowrap"
                            >
                                {isGenerating ? (
                                    <><FaSpinner className="animate-spin" /> جاري التوليد...</>
                                ) : (
                                    <><FaRobot /> توليد التفاصيل</>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('adminBadgesPage.form.nameEnLabel')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                required
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('adminBadgesPage.form.nameArLabel')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.name_ar}
                                onChange={(e) => setData('name_ar', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name_ar ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                required
                            />
                            {errors.name_ar && (
                                <p className="mt-1 text-sm text-red-600">{errors.name_ar}</p>
                            )}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('adminBadgesPage.form.descriptionArLabel')}{' '}
                                <span className="text-gray-500">({t('common.optional')})</span>
                            </label>
                            <textarea
                                value={data.description_ar}
                                onChange={(e) => setData('description_ar', e.target.value)}
                                rows={3}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.description_ar ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                            {errors.description_ar && (
                                <p className="mt-1 text-sm text-red-600">{errors.description_ar}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('adminBadgesPage.form.iconLabel')}{' '}
                                <span className="text-gray-500">({t('common.optional')})</span>
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={data.icon}
                                    onChange={(e) => setData('icon', e.target.value)}
                                    placeholder={t('adminBadgesPage.form.iconPlaceholder')}
                                    className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.icon ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                                <div className="flex items-center px-3 bg-gray-100 rounded-lg border border-gray-300">
                                    {data.icon || '🏅'}
                                </div>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                                {t('adminBadgesPage.form.iconHint')}
                            </p>
                            {errors.icon && (
                                <p className="mt-1 text-sm text-red-600">{errors.icon}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('adminBadgesPage.form.typeLabel')} <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.type ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                required
                            >
                                <option value="">{t('adminBadgesPage.form.typePlaceholder')}</option>
                                {badgeTypeOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {t(`adminBadgesPage.types.${option.key}`)}
                                    </option>
                                ))}
                            </select>
                            {errors.type && (
                                <p className="mt-1 text-sm text-red-600">{errors.type}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('adminBadgesPage.form.pointsRequiredLabel')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={data.points_required}
                                onChange={(e) => setData('points_required', Number.parseInt(e.target.value, 10) || 0)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.points_required ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                required
                            />
                            {errors.points_required && (
                                <p className="mt-1 text-sm text-red-600">{errors.points_required}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('adminBadgesPage.form.statusLabel')}
                            </label>
                            <select
                                value={data.is_active ? '1' : '0'}
                                onChange={(e) => setData('is_active', e.target.value === '1')}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="1">{t('common.active')}</option>
                                <option value="0">{t('common.inactive')}</option>
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('adminBadgesPage.form.imageLabel')}
                            </label>
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <FaUpload className="w-8 h-8 mb-2 text-gray-400" />
                                            <p className="mb-2 text-sm text-gray-500">
                                                <span className="font-semibold">{t('adminBadgesPage.form.uploadAction')}</span>{' '}
                                                {t('adminBadgesPage.form.uploadOrDrag')}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {t('adminBadgesPage.form.uploadFormats')}
                                            </p>
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                        />
                                    </label>
                                </div>
                                {imagePreview && (
                                    <div className="w-32 h-32 border border-gray-300 rounded-lg overflow-hidden">
                                        <img
                                            src={imagePreview}
                                            alt={t('adminBadgesPage.form.previewAlt')}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                            </div>
                            {errors.image && (
                                <p className="mt-1 text-sm text-red-600">{errors.image}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2 bg-[#A3C042] hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center gap-2 disabled:opacity-50"
                        >
                            <FaSave />
                            {processing ? t('common.saving') : t('common.save')}
                        </button>
                        <Link
                            href={route('admin.badges.index')}
                            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg flex items-center gap-2"
                        >
                            <FaTimes />
                            {t('common.cancel')}
                        </Link>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}

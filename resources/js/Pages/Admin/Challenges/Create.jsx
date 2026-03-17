import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FaArrowRight, FaSave, FaTimes, FaImage, FaTrash } from 'react-icons/fa';
import { useState, useRef } from 'react';
import { useTranslation } from '@/i18n';

export default function AdminChallengesCreate({ schools }) {
    const { t, language } = useTranslation();
    const [imagePreview, setImagePreview] = useState(null);
    const imageInputRef = useRef(null);

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        objective: '',
        description: '',
        image: null,
        instructions: '',
        challenge_type: '',
        category: '',
        age_group: '',
        school_id: '',
        start_date: '',
        deadline: '',
        status: 'draft',
        points_reward: 0,
        max_participants: null,
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const maxSize = 5 * 1024 * 1024; // 5 MB
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

            if (file.size > maxSize) {
                alert(t('adminChallengesEditPage.errors.imageTooLarge', { maxMb: 5 }));
                return;
            }

            if (!validTypes.includes(file.type)) {
                alert(t('adminChallengesEditPage.errors.imageTypeNotSupported'));
                return;
            }

            setData('image', file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setData('image', null);
        setImagePreview(null);
        if (imageInputRef.current) {
            imageInputRef.current.value = '';
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.challenges.store'));
    };

    return (
        <DashboardLayout header={t('adminChallengesCreatePage.title')}>
            <Head title={t('adminChallengesCreatePage.pageTitle', { appName: t('common.appName') })} />

            <div dir={language === 'ar' ? 'rtl' : 'ltr'}>
                <div className="mb-6">
                    <Link
                        href={route('admin.challenges.index')}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                    >
                        <FaArrowRight className="transform rotate-180" />
                        {t('adminChallengesEditPage.actions.backToList')}
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('adminChallengesEditPage.sections.challengeInfo')}</h2>

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* العنوان */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('adminChallengesEditPage.fields.title')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.title ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                required
                            />
                            {errors.title && (
                                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                            )}
                        </div>

                        {/* الهدف */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('adminChallengesEditPage.fields.objective')} <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={data.objective}
                                onChange={(e) => setData('objective', e.target.value)}
                                rows={3}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.objective ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                required
                            />
                            {errors.objective && (
                                <p className="mt-1 text-sm text-red-600">{errors.objective}</p>
                            )}
                        </div>

                        {/* الوصف */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('adminChallengesEditPage.fields.description')} <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={4}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.description ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                required
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                            )}
                        </div>

                        {/* صورة التحدي */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('adminChallengesEditPage.fields.imageOptional')}
                            </label>
                            <div>
                                {imagePreview ? (
                                    <div className="relative">
                                        <img
                                            src={imagePreview}
                                            alt={t('adminChallengesEditPage.image.previewAlt')}
                                            className="w-full h-64 object-cover rounded-lg border border-gray-300"
                                        />
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => imageInputRef.current?.click()}
                                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition"
                                    >
                                        <FaImage className="mx-auto text-gray-400 text-4xl mb-2" />
                                        <p className="text-gray-600">{t('adminChallengesEditPage.image.clickToUpload')}</p>
                                        <p className="text-sm text-gray-400 mt-1">{t('adminChallengesEditPage.image.hint', { maxMb: 5 })}</p>
                                    </div>
                                )}
                                <input
                                    ref={imageInputRef}
                                    type="file"
                                    id="image"
                                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </div>
                            {errors.image && (
                                <p className="mt-1 text-sm text-red-600">{errors.image}</p>
                            )}
                        </div>

                        {/* كيفية التنفيذ */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('adminChallengesEditPage.fields.instructions')} <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={data.instructions}
                                onChange={(e) => setData('instructions', e.target.value)}
                                rows={4}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.instructions ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                required
                            />
                            {errors.instructions && (
                                <p className="mt-1 text-sm text-red-600">{errors.instructions}</p>
                            )}
                        </div>

                        {/* نوع التحدي */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('adminChallengesEditPage.fields.challengeType')} <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={data.challenge_type}
                                onChange={(e) => setData('challenge_type', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.challenge_type ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                required
                            >
                                <option value="">{t('common.selectOption')}</option>
                                <option value="cognitive">{t('adminChallengesEditPage.challengeTypes.cognitive')}</option>
                                <option value="applied">{t('adminChallengesEditPage.challengeTypes.applied')}</option>
                                <option value="creative">{t('adminChallengesEditPage.challengeTypes.creative')}</option>
                                <option value="artistic_creative">{t('adminChallengesEditPage.challengeTypes.artisticCreative')}</option>
                                <option value="collaborative">{t('adminChallengesEditPage.challengeTypes.collaborative')}</option>
                                <option value="analytical">{t('adminChallengesEditPage.challengeTypes.analytical')}</option>
                                <option value="technological">{t('adminChallengesEditPage.challengeTypes.technological')}</option>
                                <option value="behavioral">{t('adminChallengesEditPage.challengeTypes.behavioral')}</option>
                                <option value="60_seconds">{t('adminChallengesEditPage.challengeTypes.sixtySeconds')}</option>
                                <option value="mental_math">{t('adminChallengesEditPage.challengeTypes.mentalMath')}</option>
                                <option value="conversions">{t('adminChallengesEditPage.challengeTypes.conversions')}</option>
                                <option value="team_fastest">{t('adminChallengesEditPage.challengeTypes.teamFastest')}</option>
                                <option value="build_problem">{t('adminChallengesEditPage.challengeTypes.buildProblem')}</option>
                                <option value="custom">{t('adminChallengesEditPage.challengeTypes.custom')}</option>
                            </select>
                            {errors.challenge_type && (
                                <p className="mt-1 text-sm text-red-600">{errors.challenge_type}</p>
                            )}
                        </div>

                        {/* الفئة */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('adminChallengesEditPage.fields.category')} <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={data.category}
                                onChange={(e) => setData('category', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.category ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                required
                            >
                                <option value="">{t('common.selectOption')}</option>
                                <option value="science">{t('common.categories.science')}</option>
                                <option value="technology">{t('common.categories.technology')}</option>
                                <option value="engineering">{t('common.categories.engineering')}</option>
                                <option value="mathematics">{t('common.categories.mathematics')}</option>
                                <option value="arts">{t('common.categories.arts')}</option>
                                <option value="other">{t('common.categories.other')}</option>
                            </select>
                            {errors.category && (
                                <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                            )}
                        </div>

                        {/* الفئة العمرية */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('adminChallengesEditPage.fields.ageGroup')} <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={data.age_group}
                                onChange={(e) => setData('age_group', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.age_group ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                required
                            >
                                <option value="">{t('common.selectOption')}</option>
                                <option value="6-9">{t('adminChallengesEditPage.ageGroups.sixToNine')}</option>
                                <option value="10-13">{t('adminChallengesEditPage.ageGroups.tenToThirteen')}</option>
                                <option value="14-17">{t('adminChallengesEditPage.ageGroups.fourteenToSeventeen')}</option>
                                <option value="18+">{t('adminChallengesEditPage.ageGroups.eighteenPlus')}</option>
                            </select>
                            {errors.age_group && (
                                <p className="mt-1 text-sm text-red-600">{errors.age_group}</p>
                            )}
                        </div>

                        {/* المدرسة */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('adminChallengesEditPage.fields.school')}
                            </label>
                            <select
                                value={data.school_id}
                                onChange={(e) => setData('school_id', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.school_id ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            >
                                <option value="">{t('adminChallengesEditPage.placeholders.selectSchool')}</option>
                                {schools.map((school) => (
                                    <option key={school.id} value={school.id}>
                                        {school.name}
                                    </option>
                                ))}
                            </select>
                            {errors.school_id && (
                                <p className="mt-1 text-sm text-red-600">{errors.school_id}</p>
                            )}
                        </div>

                        {/* تاريخ البدء */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('adminChallengesEditPage.fields.startDate')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="datetime-local"
                                value={data.start_date}
                                onChange={(e) => setData('start_date', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.start_date ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                required
                            />
                            {errors.start_date && (
                                <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>
                            )}
                        </div>

                        {/* تاريخ الانتهاء */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('adminChallengesEditPage.fields.deadline')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="datetime-local"
                                value={data.deadline}
                                onChange={(e) => setData('deadline', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.deadline ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                required
                            />
                            {errors.deadline && (
                                <p className="mt-1 text-sm text-red-600">{errors.deadline}</p>
                            )}
                        </div>

                        {/* الحالة */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('common.status')}
                            </label>
                            <select
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.status ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            >
                                <option value="draft">{t('common.draft')}</option>
                                <option value="active">{t('common.active')}</option>
                                <option value="completed">{t('common.completed')}</option>
                                <option value="cancelled">{t('common.cancelled')}</option>
                            </select>
                            {errors.status && (
                                <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                            )}
                        </div>

                        {/* نقاط المكافأة */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('adminChallengesEditPage.fields.pointsReward')}
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={data.points_reward}
                                onChange={(e) => setData('points_reward', parseInt(e.target.value) || 0)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.points_reward ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                            {errors.points_reward && (
                                <p className="mt-1 text-sm text-red-600">{errors.points_reward}</p>
                            )}
                        </div>

                        {/* الحد الأقصى للمشاركين */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('adminChallengesEditPage.fields.maxParticipants')}
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={data.max_participants || ''}
                                onChange={(e) => setData('max_participants', e.target.value ? parseInt(e.target.value) : null)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.max_participants ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder={t('adminChallengesEditPage.placeholders.unlimited')}
                            />
                            {errors.max_participants && (
                                <p className="mt-1 text-sm text-red-600">{errors.max_participants}</p>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2 bg-[#A3C042] hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center gap-2 disabled:opacity-50"
                        >
                            <FaSave />
                            {processing ? t('profilePage.actions.saving') : t('common.save')}
                        </button>
                        <Link
                            href={route('admin.challenges.index')}
                            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg flex items-center gap-2"
                        >
                            <FaTimes />
                            {t('common.cancel')}
                        </Link>
                    </div>
                </form>
            </div>
            </div>
        </DashboardLayout>
    );
}

import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { FaMedal, FaSave } from 'react-icons/fa';
import TextInput from '@/Components/TextInput';
import SelectInput from '@/Components/SelectInput';
import PrimaryButton from '@/Components/PrimaryButton';
import { useState } from 'react';
import { useForwardIcon, useTranslation } from '@/i18n';

export default function CreateBadge({ schools, auth }) {
    const { t } = useTranslation();
    const ForwardIcon = useForwardIcon();
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        name_ar: '',
        description_ar: '',
        icon: '',
        image: null,
        type: 'custom',
        points_required: 0,
        school_id: '',
    });

    const [imagePreview, setImagePreview] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('image', file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/teacher/badges', {
            forceFormData: true,
            onSuccess: () => {
                router.visit('/teacher/badges');
            },
        });
    };

    return (
        <DashboardLayout header={t('teacherBadgeCreatePage.title')}>
            <Head title={t('teacherBadgeCreatePage.pageTitle', { appName: t('common.appName') })} />

            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="mb-6 flex items-center gap-3">
                    <div className="p-3 bg-[#A3C042] rounded-lg">
                        <FaMedal className="text-white text-2xl" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{t('teacherBadgeCreatePage.title')}</h2>
                        <p className="text-gray-600">{t('teacherBadgeCreatePage.subtitle')}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('teacherBadgeCreatePage.nameEnglishLabel')}
                            </label>
                            <TextInput
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="w-full"
                                required
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('teacherBadgeCreatePage.nameArabicLabel')}
                            </label>
                            <TextInput
                                type="text"
                                value={data.name_ar}
                                onChange={(e) => setData('name_ar', e.target.value)}
                                className="w-full"
                                required
                            />
                            {errors.name_ar && <p className="text-red-500 text-sm mt-1">{errors.name_ar}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('teacherBadgeCreatePage.descriptionArabicLabel')} <span className="text-gray-500">({t('teacherBadgeCreatePage.optional')})</span>
                        </label>
                        <textarea
                            value={data.description_ar}
                            onChange={(e) => setData('description_ar', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#A3C042] focus:border-transparent"
                            rows="3"
                            placeholder={t('teacherBadgeCreatePage.descriptionArabicPlaceholder')}
                        />
                        {errors.description_ar && <p className="text-red-500 text-sm mt-1">{errors.description_ar}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('teacherBadgeCreatePage.typeLabel')}
                            </label>
                            <SelectInput
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value)}
                                required
                            >
                                <option value="custom">{t('teacherBadgeCreatePage.types.custom')}</option>
                                <option value="rank_first">{t('teacherBadgeCreatePage.types.rankFirst')}</option>
                                <option value="rank_second">{t('teacherBadgeCreatePage.types.rankSecond')}</option>
                                <option value="rank_third">{t('teacherBadgeCreatePage.types.rankThird')}</option>
                                <option value="excellent_innovator">{t('teacherBadgeCreatePage.types.excellentInnovator')}</option>
                                <option value="active_participant">{t('teacherBadgeCreatePage.types.activeParticipant')}</option>
                            </SelectInput>
                            {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('teacherBadgeCreatePage.pointsRequiredLabel')}
                            </label>
                            <TextInput
                                type="number"
                                value={data.points_required}
                                onChange={(e) => setData('points_required', Number.parseInt(e.target.value, 10) || 0)}
                                className="w-full"
                                min="0"
                                required
                            />
                            {errors.points_required && <p className="text-red-500 text-sm mt-1">{errors.points_required}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('teacherBadgeCreatePage.schoolLabel')}
                        </label>
                        <SelectInput
                            value={data.school_id}
                            onChange={(e) => setData('school_id', e.target.value)}
                            required
                        >
                            <option value="">{t('teacherBadgeCreatePage.schoolPlaceholder')}</option>
                            {schools && schools.map((school) => (
                                <option key={school.id} value={school.id}>
                                    {school.name}
                                </option>
                            ))}
                        </SelectInput>
                        {errors.school_id && <p className="text-red-500 text-sm mt-1">{errors.school_id}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('teacherBadgeCreatePage.iconLabel')} <span className="text-gray-500">({t('teacherBadgeCreatePage.optional')})</span>
                        </label>
                        <div className="flex gap-2 items-center">
                            <TextInput
                                type="text"
                                value={data.icon}
                                onChange={(e) => setData('icon', e.target.value)}
                                className="flex-1"
                                placeholder={t('teacherBadgeCreatePage.iconPlaceholder')}
                            />
                            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg border border-gray-300 text-2xl">
                                {data.icon || '🎨'}
                            </div>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">{t('teacherBadgeCreatePage.iconHint')}</p>
                        {errors.icon && <p className="text-red-500 text-sm mt-1">{errors.icon}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('teacherBadgeCreatePage.imageLabel')}
                        </label>
                        <div className="flex items-center gap-4">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="block w-full text-sm text-gray-500 file:ms-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#A3C042] file:text-white hover:file:bg-primary-600"
                            />
                            {imagePreview && (
                                <img
                                    src={imagePreview}
                                    alt={t('teacherBadgeCreatePage.previewAlt')}
                                    className="w-24 h-24 rounded-lg object-cover border border-gray-300"
                                />
                            )}
                        </div>
                        {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
                    </div>

                    <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() => router.visit('/teacher/badges')}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                        >
                            {t('teacherBadgeCreatePage.cancel')}
                        </button>
                        <PrimaryButton type="submit" disabled={processing} className="flex items-center gap-2">
                            {processing ? (
                                t('teacherBadgeCreatePage.submitting')
                            ) : (
                                <>
                                    <FaSave />
                                    {t('teacherBadgeCreatePage.submit')}
                                    <ForwardIcon />
                                </>
                            )}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}

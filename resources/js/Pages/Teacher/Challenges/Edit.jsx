import DashboardLayout from '../../../Layouts/DashboardLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { FaTrophy, FaSpinner, FaArrowRight, FaImage, FaTrash } from 'react-icons/fa';
import TextInput from '../../../Components/TextInput';
import InputLabel from '../../../Components/InputLabel';
import InputError from '../../../Components/InputError';
import PrimaryButton from '../../../Components/PrimaryButton';
import { useState, useRef, useEffect } from 'react';
import { useTranslation } from '@/i18n';

export default function TeacherChallengeEdit({ auth, challenge }) {
    const { t } = useTranslation();
    const [imagePreview, setImagePreview] = useState(null);
    const [existingImage, setExistingImage] = useState(challenge?.image_url || null);
    const imageInputRef = useRef(null);

    const { data, setData, put, processing, errors } = useForm({
        title: challenge?.title || '',
        objective: challenge?.objective || '',
        description: challenge?.description || '',
        image: null,
        _method: 'PUT',
        instructions: challenge?.instructions || '',
        challenge_type: challenge?.challenge_type || 'cognitive',
        category: challenge?.category || 'mathematics',
        age_group: challenge?.age_group || '10-13',
        start_date: challenge?.start_date ? challenge.start_date.split(' ')[0] : '',
        deadline: challenge?.deadline ? challenge.deadline.split(' ')[0] : '',
        status: challenge?.status || 'draft',
        points_reward: challenge?.points_reward || 0,
        max_participants: challenge?.max_participants || '',
    });

    useEffect(() => {
        if (challenge?.image_url) {
            setExistingImage(challenge.image_url);
        }
    }, [challenge]);

    const challengeTypes = [
        'cognitive',
        'applied',
        'creative',
        'artistic_creative',
        'collaborative',
        'analytical',
        'technological',
        'behavioral',
        '60_seconds',
        'mental_math',
        'conversions',
        'team_fastest',
        'build_problem',
        'custom',
    ];

    const categories = ['science', 'technology', 'engineering', 'mathematics', 'arts', 'other'];
    const ageGroups = ['6-9', '10-13', '14-17', '18+'];

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const maxSize = 5 * 1024 * 1024;
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

        if (file.size > maxSize) {
            alert(t('teacherChallengesCreatePage.errors.imageTooLarge', { maxMb: 5 }));
            return;
        }

        if (!validTypes.includes(file.type)) {
            alert(t('teacherChallengesCreatePage.errors.imageTypeNotSupported'));
            return;
        }

        setData('image', file);
        setImagePreview(URL.createObjectURL(file));
        setExistingImage(null);
    };

    const removeImage = () => {
        setData('image', null);
        setImagePreview(null);
        setExistingImage(null);
        if (imageInputRef.current) {
            imageInputRef.current.value = '';
        }
    };

    const submit = (e) => {
        e.preventDefault();

        const submitData = {
            ...data,
            max_participants: data.max_participants === '' ? null : (data.max_participants ? parseInt(data.max_participants, 10) : null),
            points_reward: parseInt(data.points_reward, 10) || 0,
        };

        Object.keys(submitData).forEach((key) => {
            setData(key, submitData[key]);
        });

        put(`/teacher/challenges/${challenge.id}`);
    };

    return (
        <DashboardLayout
            auth={auth}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{`${t('common.edit')} ${t('common.challenges')}`}</h2>}
        >
            <Head title={`${t('common.edit')} ${t('common.challenges')}`} />

            <div className="py-6">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-4">
                        <Link
                            href="/teacher/challenges"
                            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
                        >
                            <FaArrowRight />
                            {t('teacherChallengesCreatePage.actions.backToChallenges')}
                        </Link>
                    </div>

                    <form onSubmit={submit} className="bg-white shadow-sm rounded-lg p-6 space-y-6">
                        <div>
                            <InputLabel htmlFor="title" value={t('teacherChallengesCreatePage.fields.title')} />
                            <TextInput
                                id="title"
                                type="text"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                className="mt-1 block w-full"
                                required
                            />
                            <InputError message={errors.title} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="objective" value={t('teacherChallengesCreatePage.fields.objective')} />
                            <textarea
                                id="objective"
                                value={data.objective}
                                onChange={(e) => setData('objective', e.target.value)}
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring-[#A3C042]"
                                required
                            />
                            <InputError message={errors.objective} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="description" value={t('teacherChallengesCreatePage.fields.description')} />
                            <textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={4}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring-[#A3C042]"
                                required
                            />
                            <InputError message={errors.description} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="image" value={t('teacherChallengesCreatePage.fields.imageOptional')} />
                            <div className="mt-1">
                                {imagePreview ? (
                                    <div className="relative">
                                        <img
                                            src={imagePreview}
                                            alt={t('teacherChallengesCreatePage.image.previewAlt')}
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
                                ) : existingImage ? (
                                    <div className="relative">
                                        <img
                                            src={existingImage}
                                            alt={t('adminChallengesEditPage.image.currentAlt')}
                                            className="w-full h-64 object-cover rounded-lg border border-gray-300"
                                        />
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                                        >
                                            <FaTrash />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => imageInputRef.current?.click()}
                                            className="absolute bottom-2 right-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-[#A3C042] transition"
                                        >
                                            {t('adminChallengesEditPage.actions.changeImage')}
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => imageInputRef.current?.click()}
                                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-[#A3C042] transition"
                                    >
                                        <FaImage className="mx-auto text-gray-400 text-4xl mb-2" />
                                        <p className="text-gray-600">{t('teacherChallengesCreatePage.image.clickToUpload')}</p>
                                        <p className="text-sm text-gray-400 mt-1">{t('teacherChallengesCreatePage.image.hint', { maxMb: 5 })}</p>
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
                            <InputError message={errors.image} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="instructions" value={t('teacherChallengesCreatePage.fields.instructions')} />
                            <textarea
                                id="instructions"
                                value={data.instructions}
                                onChange={(e) => setData('instructions', e.target.value)}
                                rows={4}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring-[#A3C042]"
                                required
                            />
                            <InputError message={errors.instructions} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="challenge_type" value={t('teacherChallengesCreatePage.fields.challengeType')} />
                            <select
                                id="challenge_type"
                                value={data.challenge_type}
                                onChange={(e) => setData('challenge_type', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring-[#A3C042]"
                                required
                            >
                                {challengeTypes.map((type) => (
                                    <option key={type} value={type}>
                                        {t(`common.challengeTypes.${type}`)}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.challenge_type} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="category" value={t('teacherChallengesCreatePage.fields.category')} />
                            <select
                                id="category"
                                value={data.category}
                                onChange={(e) => setData('category', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring-[#A3C042]"
                                required
                            >
                                {categories.map((category) => (
                                    <option key={category} value={category}>
                                        {t(`common.categories.${category}`)}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.category} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="age_group" value={t('teacherChallengesCreatePage.fields.ageGroup')} />
                            <select
                                id="age_group"
                                value={data.age_group}
                                onChange={(e) => setData('age_group', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring-[#A3C042]"
                                required
                            >
                                {ageGroups.map((age) => (
                                    <option key={age} value={age}>
                                        {t(`common.ageGroups.${age}`)}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.age_group} className="mt-2" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="start_date" value={t('teacherChallengesCreatePage.fields.startDate')} />
                                <TextInput
                                    id="start_date"
                                    type="date"
                                    value={data.start_date}
                                    onChange={(e) => setData('start_date', e.target.value)}
                                    className="mt-1 block w-full"
                                    required
                                />
                                <InputError message={errors.start_date} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="deadline" value={t('teacherChallengesCreatePage.fields.deadline')} />
                                <TextInput
                                    id="deadline"
                                    type="date"
                                    value={data.deadline}
                                    onChange={(e) => setData('deadline', e.target.value)}
                                    className="mt-1 block w-full"
                                    required
                                />
                                <InputError message={errors.deadline} className="mt-2" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="points_reward" value={t('teacherChallengesCreatePage.fields.pointsReward')} />
                                <TextInput
                                    id="points_reward"
                                    type="number"
                                    value={data.points_reward}
                                    onChange={(e) => setData('points_reward', parseInt(e.target.value, 10) || 0)}
                                    className="mt-1 block w-full"
                                    min="0"
                                />
                                <InputError message={errors.points_reward} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="max_participants" value={t('teacherChallengesCreatePage.fields.maxParticipantsOptional')} />
                                <TextInput
                                    id="max_participants"
                                    type="number"
                                    value={data.max_participants}
                                    onChange={(e) => setData('max_participants', e.target.value ? parseInt(e.target.value, 10) : '')}
                                    className="mt-1 block w-full"
                                    min="1"
                                />
                                <InputError message={errors.max_participants} className="mt-2" />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="status" value={t('teacherChallengesCreatePage.fields.status')} />
                            <select
                                id="status"
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring-[#A3C042]"
                            >
                                <option value="draft">{t('common.challengeStatuses.draft')}</option>
                                <option value="active">{t('common.challengeStatuses.active')}</option>
                                <option value="completed">{t('common.challengeStatuses.completed')}</option>
                                <option value="cancelled">{t('common.challengeStatuses.cancelled')}</option>
                            </select>
                            <InputError message={errors.status} className="mt-2" />
                        </div>

                        <div className="flex items-center justify-end gap-4">
                            <PrimaryButton disabled={processing}>
                                {processing ? (
                                    <>
                                        <FaSpinner className="animate-spin ms-2" />
                                        {t('common.saving')}
                                    </>
                                ) : (
                                    <>
                                        <FaTrophy className="ms-2" />
                                        {t('common.saveChanges')}
                                    </>
                                )}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}

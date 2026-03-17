import DashboardLayout from '../../../Layouts/DashboardLayout';
import { Head, useForm } from '@inertiajs/react';
import { FaTrophy, FaSpinner, FaImage, FaTrash } from 'react-icons/fa';
import TextInput from '../../../Components/TextInput';
import InputLabel from '../../../Components/InputLabel';
import InputError from '../../../Components/InputError';
import PrimaryButton from '../../../Components/PrimaryButton';
import { useState, useRef } from 'react';
import { useTranslation } from '@/i18n';

export default function SchoolChallengeCreate({ auth }) {
    const { t } = useTranslation();
    const [imagePreview, setImagePreview] = useState(null);
    const imageInputRef = useRef(null);

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        objective: '',
        description: '',
        image: null,
        instructions: '',
        challenge_type: 'cognitive',
        category: 'mathematics',
        age_group: '10-13',
        difficulty: 'medium',
        start_date: '',
        deadline: '',
        status: 'draft',
        points_reward: 0,
        max_participants: '',
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const maxSize = 5 * 1024 * 1024; // 5 MB
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

            if (file.size > maxSize) {
                alert(t('schoolChallengesCreatePage.errors.imageTooLarge', { maxMb: 5 }));
                return;
            }

            if (!validTypes.includes(file.type)) {
                alert(t('schoolChallengesCreatePage.errors.imageTypeNotSupported'));
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

        // Prepare data - convert empty strings to null for optional fields
        const submitData = {
            ...data,
            max_participants: data.max_participants === '' ? null : (data.max_participants ? parseInt(data.max_participants) : null),
            points_reward: parseInt(data.points_reward) || 0,
        };

        // Update form data
        Object.keys(submitData).forEach(key => {
            setData(key, submitData[key]);
        });

        post('/school/challenges', {
            onSuccess: () => {
            },
            onError: (errors) => {
            },
        });
    };

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

    const difficultyLevels = ['easy', 'medium', 'hard'];

    const categories = ['science', 'technology', 'engineering', 'mathematics', 'arts', 'other'];

    const ageGroups = ['6-9', '10-13', '14-17', '18+'];

    return (
        <DashboardLayout
            auth={auth}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{t('schoolChallengesCreatePage.title')}</h2>}
        >
            <Head title={t('schoolChallengesCreatePage.pageTitle')} />

            <div className="py-6">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <form onSubmit={submit} className="bg-white shadow-sm rounded-lg p-6 space-y-6">
                        {/* Title */}
                        <div>
                            <InputLabel htmlFor="title" value={t('schoolChallengesCreatePage.fields.title')} />
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

                        {/* Objective */}
                        <div>
                            <InputLabel htmlFor="objective" value={t('schoolChallengesCreatePage.fields.objective')} />
                            <textarea
                                id="objective"
                                value={data.objective}
                                onChange={(e) => setData('objective', e.target.value)}
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring-[#A3C042]"
                                required
                                placeholder={t('schoolChallengesCreatePage.placeholders.objectiveExample')}
                            />
                            <InputError message={errors.objective} className="mt-2" />
                        </div>

                        {/* Description */}
                        <div>
                            <InputLabel htmlFor="description" value={t('schoolChallengesCreatePage.fields.description')} />
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

                        {/* Image */}
                        <div>
                            <InputLabel htmlFor="image" value={t('schoolChallengesCreatePage.fields.imageOptional')} />
                            <div className="mt-1">
                                {imagePreview ? (
                                    <div className="relative">
                                        <img
                                            src={imagePreview}
                                            alt={t('schoolChallengesCreatePage.image.previewAlt')}
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
                                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-[#A3C042] transition"
                                    >
                                        <FaImage className="mx-auto text-gray-400 text-4xl mb-2" />
                                        <p className="text-gray-600">{t('schoolChallengesCreatePage.image.clickToUpload')}</p>
                                        <p className="text-sm text-gray-400 mt-1">{t('schoolChallengesCreatePage.image.hint', { maxMb: 5 })}</p>
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

                        {/* Instructions */}
                        <div>
                            <InputLabel htmlFor="instructions" value={t('schoolChallengesCreatePage.fields.instructions')} />
                            <textarea
                                id="instructions"
                                value={data.instructions}
                                onChange={(e) => setData('instructions', e.target.value)}
                                rows={4}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring-[#A3C042]"
                                required
                                placeholder={t('schoolChallengesCreatePage.placeholders.instructionsExample')}
                            />
                            <InputError message={errors.instructions} className="mt-2" />
                        </div>

                        {/* Challenge Type */}
                        <div>
                            <InputLabel htmlFor="challenge_type" value={t('schoolChallengesCreatePage.fields.challengeType')} />
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

                        {/* Category */}
                        <div>
                            <InputLabel htmlFor="category" value={t('schoolChallengesCreatePage.fields.category')} />
                            <select
                                id="category"
                                value={data.category}
                                onChange={(e) => setData('category', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring-[#A3C042]"
                                required
                            >
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {t(`common.categories.${cat}`)}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.category} className="mt-2" />
                        </div>

                        {/* Age Group */}
                        <div>
                            <InputLabel htmlFor="age_group" value={t('schoolChallengesCreatePage.fields.ageGroup')} />
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

                        {/* Difficulty Level */}
                        <div>
                            <InputLabel htmlFor="difficulty" value={t('schoolChallengesCreatePage.fields.difficulty')} />
                            <select
                                id="difficulty"
                                value={data.difficulty}
                                onChange={(e) => setData('difficulty', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring-[#A3C042]"
                            >
                                {difficultyLevels.map((level) => (
                                    <option key={level} value={level}>
                                        {t(`common.difficultyLevels.${level}`)}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.difficulty} className="mt-2" />
                        </div>

                        {/* Points Reward */}
                        <div>
                            <InputLabel htmlFor="points_reward" value={t('schoolChallengesCreatePage.fields.pointsReward')} />
                            <select
                                id="points_reward"
                                value={data.points_reward}
                                onChange={(e) => setData('points_reward', parseInt(e.target.value))}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring-[#A3C042]"
                            >
                                <option value={0}>{t('schoolChallengesCreatePage.pointsOptions', { count: 0 })}</option>
                                <option value={10}>{t('schoolChallengesCreatePage.pointsOptions', { count: 10 })}</option>
                                <option value={20}>{t('schoolChallengesCreatePage.pointsOptions', { count: 20 })}</option>
                                <option value={30}>{t('schoolChallengesCreatePage.pointsOptions', { count: 30 })}</option>
                                <option value={50}>{t('schoolChallengesCreatePage.pointsOptions', { count: 50 })}</option>
                                <option value={100}>{t('schoolChallengesCreatePage.pointsOptions', { count: 100 })}</option>
                            </select>
                            <InputError message={errors.points_reward} className="mt-2" />
                        </div>

                        {/* Date Range */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="start_date" value={t('schoolChallengesCreatePage.fields.startDate')} />
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
                                <InputLabel htmlFor="deadline" value={t('schoolChallengesCreatePage.fields.deadline')} />
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

                        {/* Points and Participants */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="points_reward" value={t('schoolChallengesCreatePage.fields.pointsReward')} />
                                <TextInput
                                    id="points_reward"
                                    type="number"
                                    value={data.points_reward}
                                    onChange={(e) => setData('points_reward', parseInt(e.target.value) || 0)}
                                    className="mt-1 block w-full"
                                    min="0"
                                />
                                <InputError message={errors.points_reward} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="max_participants" value={t('schoolChallengesCreatePage.fields.maxParticipantsOptional')} />
                                <TextInput
                                    id="max_participants"
                                    type="number"
                                    value={data.max_participants}
                                    onChange={(e) => setData('max_participants', e.target.value ? parseInt(e.target.value) : '')}
                                    className="mt-1 block w-full"
                                    min="1"
                                />
                                <InputError message={errors.max_participants} className="mt-2" />
                            </div>
                        </div>

                        {/* Status */}
                        <div>
                            <InputLabel htmlFor="status" value={t('schoolChallengesCreatePage.fields.status')} />
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

                        {/* Submit Button */}
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
                                        {t('schoolChallengesCreatePage.actions.create')}
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


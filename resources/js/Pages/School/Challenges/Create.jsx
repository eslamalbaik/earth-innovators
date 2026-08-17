import DashboardLayout from '../../../Layouts/DashboardLayout';
import { Head, useForm } from '@inertiajs/react';
import { FaTrophy, FaSpinner, FaImage, FaTrash, FaRobot, FaPlus, FaClipboardCheck } from 'react-icons/fa';
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

    const [aiIdea, setAiIdea] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiIncompleteFields, setAiIncompleteFields] = useState([]);

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
        criteria: [],
    });

    const criteriaTotal = data.criteria.reduce((sum, c) => sum + (Number(c.weight) || 0), 0);

    const updateCriterion = (index, field, value) => {
        const next = [...data.criteria];
        next[index] = { ...next[index], [field]: value };
        setData('criteria', next);
    };

    const removeCriterion = (index) => {
        setData('criteria', data.criteria.filter((_, i) => i !== index));
    };

    const addCriterion = () => {
        setData('criteria', [...data.criteria, { name_ar: '', weight: 0 }]);
    };

    const handleAIGenerate = async () => {
        if (!aiIdea) {
            alert(t('common.error') + ": يرجى إدخال فكرة التحدي أولاً.");
            return;
        }

        setIsGenerating(true);
        try {
            const axios = (await import('axios')).default;
            const response = await axios.post('/school/challenges/generate', { idea: aiIdea });
            const result = response.data;

            setData(prev => ({
                ...prev,
                title: result.title || prev.title,
                objective: result.objective || prev.objective,
                description: result.description || prev.description,
                instructions: result.instructions || prev.instructions,
                category: result.category || prev.category,
                criteria: (result.suggested_criteria && result.suggested_criteria.length > 0)
                    ? result.suggested_criteria
                    : prev.criteria,
            }));

            setAiIncompleteFields(result.incomplete_fields || []);

            if (result.image_url) {
                try {
                    const imgRes = await fetch(result.image_url);
                    const blob = await imgRes.blob();
                    const file = new File([blob], 'ai_generated_image.jpg', { type: blob.type });
                    setData('image', file);
                    setImagePreview(URL.createObjectURL(file));
                } catch (imgError) {
                    console.error("Error fetching AI image", imgError);
                }
            }
        } catch (error) {
            alert(error.response?.data?.error || t('common.error') + ': حدث خطأ أثناء توليد تفاصيل التحدي');
        } finally {
            setIsGenerating(false);
        }
    };

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
                        {/* AI Challenge Assistant */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 mb-4 flex flex-col md:flex-row md:items-center gap-4 justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <FaRobot className="text-blue-600 text-xl" />
                                    <h3 className="font-bold text-blue-800 text-base">مساعد الذكاء الاصطناعي للتحديات</h3>
                                </div>
                                <p className="text-sm text-blue-600">
                                    اكتب فكرة مبسطة وسيقوم المساعد بتوليد عنوان احترافي، وصف شامل، تحديد الفئة، صورة غلاف، ومعايير تقييم مبنية على محتوى التحدي.
                                </p>
                            </div>
                            <div className="flex-1 flex gap-2 w-full md:w-auto">
                                <input
                                    type="text"
                                    value={aiIdea}
                                    onChange={(e) => setAiIdea(e.target.value)}
                                    placeholder="مثال: تحدي عن ابتكار حلول لترشيد المياه..."
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

                        {/* معايير التقييم المرتبطة بمحتوى التحدي */}
                        <div className="bg-white rounded-xl p-5 border border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <FaClipboardCheck className="text-[#A3C042]" />
                                    <h3 className="font-bold text-gray-800 text-base">معايير التقييم</h3>
                                </div>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${criteriaTotal === 100 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                    مجموع الأوزان: {criteriaTotal}%
                                </span>
                            </div>

                            {data.criteria.length === 0 ? (
                                <p className="text-sm text-gray-400">لا توجد معايير بعد. استخدم مساعد الذكاء الاصطناعي أعلاه لتوليدها تلقائياً حسب محتوى التحدي، أو أضفها يدوياً.</p>
                            ) : (
                                <div className="space-y-2">
                                    {data.criteria.map((criterion, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={criterion.name_ar}
                                                onChange={(e) => updateCriterion(index, 'name_ar', e.target.value)}
                                                placeholder="اسم المعيار"
                                                className="flex-1 text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={criterion.weight}
                                                onChange={(e) => updateCriterion(index, 'weight', Number.parseFloat(e.target.value) || 0)}
                                                className="w-24 text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                            <span className="text-xs text-gray-400">%</span>
                                            <button
                                                type="button"
                                                onClick={() => removeCriterion(index)}
                                                className="text-red-500 hover:text-red-700 p-2"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={addCriterion}
                                className="mt-3 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            >
                                <FaPlus className="text-xs" /> إضافة معيار
                            </button>
                        </div>

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
                                onChange={(e) => {
                                    setData('objective', e.target.value);
                                    setAiIncompleteFields(prev => prev.filter(f => f !== 'objective'));
                                }}
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring-[#A3C042]"
                                required
                                placeholder={t('schoolChallengesCreatePage.placeholders.objectiveExample')}
                            />
                            {aiIncompleteFields.includes('objective') && (
                                <p className="mt-1 text-sm text-amber-600">
                                    لم يتمكن الذكاء الاصطناعي من توليد هذا الحقل تلقائياً — يرجى تعبئته يدوياً.
                                </p>
                            )}
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
                                onChange={(e) => {
                                    setData('instructions', e.target.value);
                                    setAiIncompleteFields(prev => prev.filter(f => f !== 'instructions'));
                                }}
                                rows={4}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring-[#A3C042]"
                                required
                                placeholder={t('schoolChallengesCreatePage.placeholders.instructionsExample')}
                            />
                            {aiIncompleteFields.includes('instructions') && (
                                <p className="mt-1 text-sm text-amber-600">
                                    لم يتمكن الذكاء الاصطناعي من توليد هذا الحقل تلقائياً — يرجى تعبئته يدوياً.
                                </p>
                            )}
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


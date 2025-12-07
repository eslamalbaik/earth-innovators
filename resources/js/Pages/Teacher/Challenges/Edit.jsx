import DashboardLayout from '../../../Layouts/DashboardLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { FaTrophy, FaSpinner, FaArrowLeft } from 'react-icons/fa';
import TextInput from '../../../Components/TextInput';
import InputLabel from '../../../Components/InputLabel';
import InputError from '../../../Components/InputError';
import PrimaryButton from '../../../Components/PrimaryButton';

export default function TeacherChallengeEdit({ auth, challenge }) {
    const { data, setData, put, processing, errors } = useForm({
        title: challenge?.title || '',
        objective: challenge?.objective || '',
        description: challenge?.description || '',
        instructions: challenge?.instructions || '',
        challenge_type: challenge?.challenge_type || '60_seconds',
        category: challenge?.category || 'mathematics',
        age_group: challenge?.age_group || '10-13',
        start_date: challenge?.start_date ? challenge.start_date.split(' ')[0] : '',
        deadline: challenge?.deadline ? challenge.deadline.split(' ')[0] : '',
        status: challenge?.status || 'draft',
        points_reward: challenge?.points_reward || 0,
        max_participants: challenge?.max_participants || '',
    });

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
        
        put(`/teacher/challenges/${challenge.id}`, {
            onSuccess: () => {
                // Form will redirect on success
            },
            onError: (errors) => {
                console.error('Validation errors:', errors);
            },
        });
    };

    const challengeTypes = [
        { value: '60_seconds', label: 'تحدّي 60 ثانية' },
        { value: 'mental_math', label: 'حلها بدون قلم' },
        { value: 'conversions', label: 'تحدّي التحويلات' },
        { value: 'team_fastest', label: 'تحدّي الفريق الأسرع' },
        { value: 'build_problem', label: 'ابنِ مسألة' },
        { value: 'custom', label: 'تحدّي مخصص' },
    ];

    const categories = [
        { value: 'science', label: 'علوم' },
        { value: 'technology', label: 'تقنية' },
        { value: 'engineering', label: 'هندسة' },
        { value: 'mathematics', label: 'رياضيات' },
        { value: 'arts', label: 'فنون' },
        { value: 'other', label: 'أخرى' },
    ];

    const ageGroups = [
        { value: '6-9', label: '6-9 سنوات' },
        { value: '10-13', label: '10-13 سنة' },
        { value: '14-17', label: '14-17 سنة' },
        { value: '18+', label: '18+ سنة' },
    ];

    return (
        <DashboardLayout
            auth={auth}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">تعديل التحدي</h2>}
        >
            <Head title="تعديل التحدي - لوحة المعلم" />

            <div className="py-6">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-4">
                        <Link
                            href="/teacher/challenges"
                            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
                        >
                            <FaArrowLeft />
                            العودة إلى التحديات
                        </Link>
                    </div>

                    <form onSubmit={submit} className="bg-white shadow-sm rounded-lg p-6 space-y-6">
                        {/* Same form fields as Create */}
                        {/* Title */}
                        <div>
                            <InputLabel htmlFor="title" value="عنوان التحدي *" />
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
                            <InputLabel htmlFor="objective" value="الهدف من التحدي *" />
                            <textarea
                                id="objective"
                                value={data.objective}
                                onChange={(e) => setData('objective', e.target.value)}
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-legacy-green focus:ring-legacy-green"
                                required
                            />
                            <InputError message={errors.objective} className="mt-2" />
                        </div>

                        {/* Description */}
                        <div>
                            <InputLabel htmlFor="description" value="وصف التحدي *" />
                            <textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={4}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-legacy-green focus:ring-legacy-green"
                                required
                            />
                            <InputError message={errors.description} className="mt-2" />
                        </div>

                        {/* Instructions */}
                        <div>
                            <InputLabel htmlFor="instructions" value="كيفية التنفيذ *" />
                            <textarea
                                id="instructions"
                                value={data.instructions}
                                onChange={(e) => setData('instructions', e.target.value)}
                                rows={4}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-legacy-green focus:ring-legacy-green"
                                required
                            />
                            <InputError message={errors.instructions} className="mt-2" />
                        </div>

                        {/* Challenge Type */}
                        <div>
                            <InputLabel htmlFor="challenge_type" value="نوع التحدي *" />
                            <select
                                id="challenge_type"
                                value={data.challenge_type}
                                onChange={(e) => setData('challenge_type', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-legacy-green focus:ring-legacy-green"
                                required
                            >
                                {challengeTypes.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.challenge_type} className="mt-2" />
                        </div>

                        {/* Category */}
                        <div>
                            <InputLabel htmlFor="category" value="الفئة *" />
                            <select
                                id="category"
                                value={data.category}
                                onChange={(e) => setData('category', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-legacy-green focus:ring-legacy-green"
                                required
                            >
                                {categories.map((cat) => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.category} className="mt-2" />
                        </div>

                        {/* Age Group */}
                        <div>
                            <InputLabel htmlFor="age_group" value="الفئة العمرية *" />
                            <select
                                id="age_group"
                                value={data.age_group}
                                onChange={(e) => setData('age_group', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-legacy-green focus:ring-legacy-green"
                                required
                            >
                                {ageGroups.map((age) => (
                                    <option key={age.value} value={age.value}>
                                        {age.label}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.age_group} className="mt-2" />
                        </div>

                        {/* Date Range */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="start_date" value="تاريخ البدء *" />
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
                                <InputLabel htmlFor="deadline" value="تاريخ الانتهاء *" />
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
                                <InputLabel htmlFor="points_reward" value="نقاط المكافأة" />
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
                                <InputLabel htmlFor="max_participants" value="الحد الأقصى للمشاركين (اختياري)" />
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
                            <InputLabel htmlFor="status" value="الحالة" />
                            <select
                                id="status"
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-legacy-green focus:ring-legacy-green"
                            >
                                <option value="draft">مسودة</option>
                                <option value="active">نشط</option>
                                <option value="completed">مكتمل</option>
                                <option value="cancelled">ملغي</option>
                            </select>
                            <InputError message={errors.status} className="mt-2" />
                        </div>

                        {/* Submit Button */}
                        <div className="flex items-center justify-end gap-4">
                            <PrimaryButton disabled={processing}>
                                {processing ? (
                                    <>
                                        <FaSpinner className="animate-spin mr-2" />
                                        جاري الحفظ...
                                    </>
                                ) : (
                                    <>
                                        <FaTrophy className="mr-2" />
                                        حفظ التغييرات
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

